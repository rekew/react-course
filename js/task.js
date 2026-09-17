function createTask(name) {
  let count = 0;

  function run() {
    count++;
    const delay = 500 + Math.random() * 1500;
    const willFail = Math.random() < 0.3;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (willFail) reject(new Error(name + ' Failed'));
        else resolve(name + ' Completed');
      }, delay);
    });
  }

  function getCount() {
    return count;
  }

  function reset() {
    count = 0;
  }

  return { name, run, getCount, reset };
}
