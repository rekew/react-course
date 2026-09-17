# Homework — JavaScript Runtime and Async

Vanilla HTML/CSS/JS demo for Closures, Call Stack, Promises, async/await, Event Loop, Tasks and Microtasks.

Open `index.html` in a browser. No build step.

## How closure keeps the task counter private

`createTask(name)` declares `let count = 0` inside the factory and returns `{ run, getCount, reset }`.
Only those three functions close over `count`. Nothing else can read or write it — no `task.count` property exists.
Each call to `createTask` creates a fresh lexical environment, so `Load Users`, `Load Posts`, `Load Comments` have independent counters.

## How the call stack works (example)

Clicking `Run Concurrent` pushes the click handler onto the call stack, which calls `runConcurrent()`, which calls `executeTask(i)` for each task.
`executeTask` is `async`, so `await task.run()` suspends that frame and pops it off the stack, letting the UI stay responsive.
When the `setTimeout` fires later, its callback is pushed onto the stack, settles the Promise, and the awaiting continuation resumes. LIFO: handlers run to completion before the next queue item runs.

## How JavaScript can continue while setTimeout is waiting

`setTimeout` is a browser/Node API, not part of the JS engine. Calling it registers a timer and returns immediately.
The single JS thread keeps running other code. When the timer expires, the callback is placed on the Task (macro) Queue, and the Event Loop pushes it onto the call stack once the stack is empty.

## Event Loop demo: predicted vs actual

Demo in `js/eventLoopDemo.js` (`eventLoopDemo` + `asyncWork`) contains `console.log`-style captures, 2 timers, 2 `Promise.then`, 1 async function.

Predicted (also shown in UI):
```
1: sync start
2: async start
3: sync end
4: promise 1
5: promise 2
6: async after await
7: timeout 0ms
8: timeout 100ms
```

Actual: same order. Reason: `Call Stack → Microtask Queue → Task Queue → Event Loop`:
1. Sync code runs first (`sync start`, `async start`, `sync end`).
2. Microtasks (`promise 1`, `promise 2`, `async after await` in FIFO order) drain before any timer.
3. Tasks/macrotasks (`timeout 0ms`, then `timeout 100ms`) run last via the Event Loop.

## Tasks vs microtasks

- Microtasks: `Promise.then`, `queueMicrotask`, `async` continuations. Run after the current stack, before the next task, and can starve rendering if chained forever.
- Tasks (macrotasks): `setTimeout`, `setInterval`, I/O, UI events. One task per loop turn, then all queued microtasks, then render, then next task.

## Handling multiple Promises and errors

- Per-task: `try/catch` around `await task.run()` in `executeTask()` → UI shows `Completed` or `Failed`.
- Concurrent (`runConcurrent`): `Promise.allSettled(...)` so one rejection does not cancel others; `"All tasks finished"` logs only after every Promise settles.
- (`Promise.all` would reject fast on the first failure — wrong here.)

## Sequential vs concurrent

```js
await task1.run(); await task2.run(); await task3.run(); // sequential
await Promise.allSettled([task1.run(), task2.run(), task3.run()]); // concurrent
```

- Sequential total ≈ sum of delays (e.g. 3 × ~1250ms ≈ 3750ms).
- Concurrent total ≈ max delay (e.g. ~2000ms max).
- Reason: sequential waits for each timer before starting the next; concurrent starts all timers together and waits once. Use the `Run Sequential` / `Run Concurrent` buttons to compare measured times.
