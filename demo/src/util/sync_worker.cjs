// @ts-check

const v8 = await import("v8");
const { Worker, workerData, parentPort } = await import("worker_threads");

const INT32_BYTES = 4;

/**
 * @param {string} filename
 * @param {number} bufferSize
 * @returns (inputData?: any) => any
 */
export async function createSyncFn(filename, bufferSize = 64 * 1024) {
  const sharedBuffer = new SharedArrayBuffer(bufferSize);
  const semaphore = new Int32Array(sharedBuffer);
  const worker = new Worker(filename, { workerData: { sharedBuffer } });
  //console.log('worker', worker)
  worker.on("error", (e) => {
    console.error(e);
    throw e;
  });

  await new Promise((res) => worker.on("online", res)); // worker online
  await new Promise((res) => worker.on("message", res)); // worker is ready

  return (inputData = {}) => {
    worker.postMessage(inputData);
    Atomics.wait(semaphore, 0, 0);
    let length = semaphore[0];
    let didThrow = false;
    if (length < 0) {
      didThrow = true;
      length *= -1;
    }
    const data = v8.deserialize(Buffer.from(sharedBuffer, INT32_BYTES, length));
    semaphore[0] = 0;
    if (didThrow) {
      throw data;
    }
    return data;
  };
}

/**
 * @param {(inputData: any) => Promise<any>} workerAsyncFn
 * @returns void
 */
export async function runAsWorker(workerAsyncFn) {
  const { sharedBuffer } = workerData;
  if (!parentPort) {
    throw new Error("runAsWroker can only be called from within a worker!");
  }
  parentPort.postMessage("started"); // send worker is ready
  parentPort.addListener("message", async (inputData) => {
    let data,
      didThrow = false;
    try {
      data = await workerAsyncFn(inputData);
    } catch (e) {
      data = e;
      didThrow = true;
    }
    notifyParent(sharedBuffer, data, didThrow);
  });
}

/**
 * @param {SharedArrayBuffer} sharedBuffer
 * @param {any} data
 * @param {boolean} didThrow
 * @returns void
 */
function notifyParent(sharedBuffer, data, didThrow) {
  const buf = v8.serialize(data);
  buf.copy(Buffer.from(sharedBuffer), INT32_BYTES);
  const semaphore = new Int32Array(sharedBuffer);
  Atomics.store(semaphore, 0, didThrow ? -buf.length : buf.length);
  Atomics.notify(semaphore, 0);
}
