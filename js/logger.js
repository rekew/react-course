var logEl = document.getElementById('log');
var benchmarkEl = document.getElementById('benchmarkResult');
var tasksEl = document.getElementById('tasks');
var expectedEl = document.getElementById('expectedOutput');
var actualEl = document.getElementById('actualOutput');

function log(msg) {
  logEl.textContent += msg + '\n';
  console.log(msg);
}
