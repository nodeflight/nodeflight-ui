export default class TaskQueue {
  constructor() {
    this.queue = [];
  }

  run(func) {
    var resolve, reject;
    var promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.queue.push({ func, resolve, reject });
    // Only explicitly start if there is no tasks else left
    if (this.queue.length == 1) {
      this._do_run();
    }
    return promise;
  }

  _do_run() {
    this.queue[0].func().then(
      (value) => {
        const { func, resolve } = this.queue.shift();
        // If current promise is finished, start the next one if available
        if (this.queue.length > 0) {
          this._do_run();
        }
        resolve(value);
      },
      (error) => {
        const { func, reject } = this.queue.shift();
        // If current promise is finished, start the next one if available
        if (this.queue.length > 0) {
          this._do_run();
        }
        reject(error);
      }
    );
  }
}
