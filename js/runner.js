
async function executeTask(tasks, i) {
  var task = tasks[i];
  setStatus(i, 'Loading...', 'loading');
  var start = performance.now();
  try {
    var result = await task.run();
    var ms = Math.round(performance.now() - start);
    setStatus(i, result, 'completed');
    ui[i].time.textContent = ms + ' ms';
    log(result + ' in ' + ms + ' ms');
    return { status: 'fulfilled', value: result, ms: ms };
  } catch (err) {
    var failMs = Math.round(performance.now() - start);
    setStatus(i, err.message, 'failed');
    ui[i].time.textContent = failMs + ' ms';
    log(err.message + ' after ' + failMs + ' ms');
    return { status: 'rejected', reason: err.message, ms: failMs };
  } finally {
    ui[i].count.textContent = task.getCount();
  }
}

async function runSequential(tasks) {
  log('--- Sequential: await one by one ---');
  var start = performance.now();
  for (var i = 0; i < tasks.length; i++) {
    await executeTask(tasks, i);
  }
  var total = Math.round(performance.now() - start);
  benchmarkEl.textContent = 'Sequential total: ' + total + ' ms (≈ sum of delays). See Log for details.';
  log('Sequential total: ' + total + ' ms');
  return total;
}

async function runConcurrent(tasks) {
  log('--- Concurrent: Promise.allSettled ---');
  var start = performance.now();
  await Promise.allSettled(
    tasks.map(function (_, i) {
      return executeTask(tasks, i);
    })
  );
  var total = Math.round(performance.now() - start);
  benchmarkEl.textContent = 'Concurrent total: ' + total + ' ms (≈ max delay, not sum). See Log for details.';
  log('All tasks finished');
  log('Concurrent total: ' + total + ' ms');
  return total;
}
