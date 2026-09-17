var tasks = [createTask('Load Users'), createTask('Load Posts'), createTask('Load Comments')];

expectedEl.textContent = expectedLoopOutput
  .map(function (line, i) {
    return i + 1 + ': ' + line;
  })
  .join('\n');

document.getElementById('runLoopDemoBtn').addEventListener('click', async function () {
  var captured = [];
  actualEl.textContent = 'Running...';
  await new Promise(function (resolve) {
    eventLoopDemo(function (msg) {
      captured.push(msg);
      log('[demo] ' + msg);
    });
    setTimeout(resolve, 250);
  });
  actualEl.textContent = captured
    .map(function (line, i) {
      return i + 1 + ': ' + line;
    })
    .join('\n');
  log('Event loop demo finished. Microtasks ran before tasks.');
});

document.getElementById('runSequentialBtn').addEventListener('click', function () {
  runSequential(tasks);
});
document.getElementById('runConcurrentBtn').addEventListener('click', function () {
  runConcurrent(tasks);
});

renderCards(tasks, function (i) {
  executeTask(tasks, i);
});
