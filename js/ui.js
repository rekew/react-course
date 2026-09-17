// Task cards rendering + per-card UI state.
var ui = [];

function renderCards(tasks, onRun) {
  tasksEl.innerHTML = '';
  ui.length = 0;

  tasks.forEach(function (task) {
    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<h3>' + task.name + '</h3>' +
      '<div>Status: <span class="status pending">Pending</span></div>' +
      '<div class="meta">Runs: <span class="count">0</span> | Time: <span class="time">-</span></div>' +
      '<div class="card-buttons"><button class="run">Run</button><button class="reset">Reset</button></div>';
    tasksEl.appendChild(card);

    var state = {
      status: card.querySelector('.status'),
      count: card.querySelector('.count'),
      time: card.querySelector('.time'),
      runBtn: card.querySelector('.run'),
      resetBtn: card.querySelector('.reset'),
    };
    ui.push(state);

    state.runBtn.addEventListener('click', function () {
      onRun(tasks.indexOf(task));
    });
    state.resetBtn.addEventListener('click', function () {
      task.reset();
      state.count.textContent = task.getCount();
      state.status.textContent = 'Pending';
      state.status.className = 'status pending';
      state.time.textContent = '-';
      log(task.name + ' counter reset');
    });
  });
}

function setStatus(i, text, cls) {
  ui[i].status.textContent = text;
  ui[i].status.className = 'status ' + cls;
}
