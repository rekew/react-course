import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'icons')

const BACKGROUND = [24, 24, 27, 255]
const FOREGROUND = [255, 255, 255, 255]

function createCanvas(size) {
  const pixels = new Uint8Array(size * size * 4)
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = BACKGROUND[0]
    pixels[i + 1] = BACKGROUND[1]
    pixels[i + 2] = BACKGROUND[2]
    pixels[i + 3] = BACKGROUND[3]
  }
  return pixels
}

function blend(pixels, index, color, coverage) {
  if (coverage <= 0) return
  const alpha = Math.min(1, coverage)
  const dstAlpha = pixels[index + 3] / 255
  const outAlpha = alpha + dstAlpha * (1 - alpha)
  if (outAlpha === 0) return

  for (let channel = 0; channel < 3; channel += 1) {
    const dst = pixels[index + channel]
    pixels[index + channel] = Math.round(
      (color[channel] * alpha + dst * dstAlpha * (1 - alpha)) / outAlpha,
    )
  }
  pixels[index + 3] = Math.round(outAlpha * 255)
}

function fillRoundedRect(pixels, size, { x, y, width, height, radius, color }) {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const halfWidth = width / 2
  const halfHeight = height / 2
  const innerRadius = Math.max(0, radius)

  const minX = Math.max(0, Math.floor(x - 1))
  const maxX = Math.min(size - 1, Math.ceil(x + width + 1))
  const minY = Math.max(0, Math.floor(y - 1))
  const maxY = Math.min(size - 1, Math.ceil(y + height + 1))

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const qx = Math.abs(px + 0.5 - centerX) - (halfWidth - innerRadius)
      const qy = Math.abs(py + 0.5 - centerY) - (halfHeight - innerRadius)
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
      const inside = Math.min(Math.max(qx, qy), 0)
      const distance = outside + inside - innerRadius
      const coverage = Math.min(1, Math.max(0, 0.5 - distance))
      blend(pixels, (py * size + px) * 4, color, coverage)
    }
  }
}

function fillCircle(pixels, size, { centerX, centerY, radius, color }) {
  const minX = Math.max(0, Math.floor(centerX - radius - 1))
  const maxX = Math.min(size - 1, Math.ceil(centerX + radius + 1))
  const minY = Math.max(0, Math.floor(centerY - radius - 1))
  const maxY = Math.min(size - 1, Math.ceil(centerY + radius + 1))

  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const distance = Math.hypot(
        px + 0.5 - centerX,
        py + 0.5 - centerY,
      ) - radius
      const coverage = Math.min(1, Math.max(0, 0.5 - distance))
      blend(pixels, (py * size + px) * 4, color, coverage)
    }
  }
}

function renderIcon(size, { maskable = false } = {}) {
  const pixels = createCanvas(size)
  const cardSize = size * (maskable ? 0.44 : 0.46)
  const cardX = (size - cardSize) / 2
  const cardY = (size - cardSize) / 2 - size * 0.01
  const cardRadius = size * 0.075

  fillRoundedRect(pixels, size, {
    x: cardX,
    y: cardY,
    width: cardSize,
    height: cardSize,
    radius: cardRadius,
    color: FOREGROUND,
  })

  const barHeight = size * 0.042
  const barRadius = barHeight / 2
  const barX = cardX + cardSize * 0.18
  const barGap = size * 0.062
  const firstBarY = cardY + cardSize * 0.27
  const barWidths = [0.64, 0.44, 0.54]

  barWidths.forEach((ratio, index) => {
    fillRoundedRect(pixels, size, {
      x: barX,
      y: firstBarY + index * barGap,
      width: cardSize * ratio,
      height: barHeight,
      radius: barRadius,
      color: BACKGROUND,
    })
  })

  fillCircle(pixels, size, {
    centerX: cardX + cardSize * 0.73,
    centerY: cardY + cardSize * 0.78,
    radius: size * 0.035,
    color: BACKGROUND,
  })

  return pixels
}

const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let value = n
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[n] = value >>> 0
  }
  return table
})()

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  chunk.write(type, 4, 4, 'ascii')
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length)
  return chunk
}

function encodePng(size, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  header[10] = 0
  header[11] = 0
  header[12] = 0

  const rowLength = size * 4
  const raw = Buffer.alloc((rowLength + 1) * size)
  for (let row = 0; row < size; row += 1) {
    raw[row * (rowLength + 1)] = 0
    Buffer.from(pixels.buffer, row * rowLength, rowLength).copy(
      raw,
      row * (rowLength + 1) + 1,
    )
  }

  return Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const outputs = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-512-maskable.png', size: 512, maskable: true },
]

mkdirSync(OUT_DIR, { recursive: true })

for (const { file, size, maskable } of outputs) {
  const pixels = renderIcon(size, { maskable })
  writeFileSync(join(OUT_DIR, file), encodePng(size, pixels))
  console.log(`wrote public/icons/${file} (${size}x${size})`)
}
