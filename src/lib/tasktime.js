/**
 * Pause an asynchrnous function for a given time
 *
 * @param {*} time milliseconds to wait
 */
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

/**
 * Call async method repeatedly
 *
 * It works quite similar to setInterval, however it waits for the called function to resolve prior to scheduling the next one.
 *
 * It is useful for when a function should be called periodically, but not necessarily in a given rate. So if the system is under load, the rate can go down.
 * @param {*} repeat_func
 * @param {*} time
 */
const call_periodic = async (repeat_func, time) => {
  for (;;) {
    await delay(time);
    await repeat_func();
  }
};

export { delay, call_periodic };
