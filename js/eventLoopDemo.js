var expectedLoopOutput = [
  'sync start',
  'async start',
  'sync end',
  'promise 1',
  'promise 2',
  'async after await',
  'timeout 0ms',
  'timeout 100ms',
];

async function asyncWork(capture) {
  capture('async start');
  await Promise.resolve(); 
  capture('async after await');
}

function eventLoopDemo(capture) {
  capture('sync start');
  setTimeout(function () {
    capture('timeout 0ms');
  }, 0);
  setTimeout(function () {
    capture('timeout 100ms');
  }, 100);
  Promise.resolve().then(function () {
    capture('promise 1');
  });
  Promise.resolve().then(function () {
    capture('promise 2');
  });
  asyncWork(capture);
  capture('sync end');
}
