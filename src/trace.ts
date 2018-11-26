import ImportedTracer = require("./worker/index.worker.ts");

export function run() {
  const scale = 8;
  const gridSize = 64;
  const size = gridSize * Math.floor(600 / gridSize) * scale;

  const threads = 4;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  canvas.style.transform = `scale(${1 / scale}, ${1 / scale})`;
  canvas.style.transformOrigin = "top left";

  const ctx = canvas.getContext("2d");

  const randomNumbers = [];
  for (let i = 0; i < 10000; i++) {
    randomNumbers.push(Math.random());
  }

  class Queue<T extends Worker> {
    public readonly threads: T[];
    public readonly freeThreads: T[];
    public readonly queue: ((worker: T) => Promise<void>)[];

    constructor(threads: number, c: { new (): T }) {
      this.threads = [];
      this.freeThreads = [];
      this.queue = [];
      for (let i = 0; i < threads; i++) {
        const thread = new c();
        this.threads.push(thread);
        this.freeThreads.push(thread);
      }
    }

    public async runImmediately(callback: (worker: T) => Promise<void>) {
      if (this.queue.length > 0) {
        await this.runImmediately(this.queue.shift());
      }
    }

    public async enqueue(
      index: number,
      callback: (worker: T) => Promise<void>
    ) {
      this.queue.push(callback);
    }

    public async bootThread(thread: T) {
      if (this.queue.length === 0) return;

      while (this.queue.length > 0) {
        const callback = this.queue.shift();
        await callback(thread);
      }
    }

    public async runOnAllThreads() {
      const promises: Promise<void>[] = [];

      while (this.queue.length > 0 && this.freeThreads.length > 0) {
        const thread = this.freeThreads.shift();
        promises.push(this.bootThread(thread));
      }
      await Promise.all(promises);
    }

    public async run() {
      while (this.queue.length > 0) {
        await this.runOnAllThreads();
      }
      console.log("done");
    }
  }

  const queue = new Queue(threads, ImportedTracer as any);

  const startTime = Date.now();

  const imageDatas: Array<ImageData> = [];
  const imageBuffers: Uint8ClampedArray[] = [];
  const progress: Float64Array = new Float64Array(gridSize * gridSize);
  const grids = size / gridSize;

  const channels = 4;
  for (let x = 0; x < grids; x++) {
    for (let y = 0; y < grids; y++) {
      const i = y * grids + x;

      imageDatas.push(null);
      imageBuffers[i] = new Uint8ClampedArray(gridSize * gridSize * channels);
    }
  }

  const changedParts = new Set<number>();
  let queued = false;
  function render() {
    queued = false;
    for (let x = 0; x < grids; x++) {
      for (let y = 0; y < grids; y++) {
        const i = y * grids + x;

        if (!changedParts.has(i)) {
          continue;
        }

        if (progress[i] >= 1) {
          ctx.putImageData(imageDatas[i], x * gridSize, y * gridSize);
        } else {
          ctx.fillStyle = "red";
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
          ctx.fillStyle = "green";
          ctx.fillRect(
            x * gridSize,
            y * gridSize,
            Math.round(gridSize * progress[i]),
            gridSize
          );
        }
      }
    }
    changedParts.clear();
  }

  function enqueueRender(i: number) {
    changedParts.add(i);
    if (!queued) {
      queued = true;
      requestAnimationFrame(render);
    }
  }

  function tick() {
    const time = Date.now();

    const indices = [];
    for (let x = 0; x < grids; x++) {
      for (let y = 0; y < grids; y++) {
        const i = y * grids + x;

        const dist = Math.pow(x - grids / 2, 2) + Math.pow(y - grids / 2, 2);
        indices.push([x, y, i, Math.sqrt(dist)]);
      }
    }

    indices.sort((a, b) => a[3] - b[3]);

    for (const [x, y, i] of indices) {
      const imageBuffer = imageBuffers[i];

      queue
        .enqueue(i, async worker => {
          progress[i] = 0;
          enqueueRender(i);
          return new Promise<void>((resolve, reject) => {
            const listener = e => {
              if (e.data.type === "done") {
                worker.removeEventListener("message", listener);
                worker.removeEventListener("error", errorListener);

                const data = new ImageData(
                  e.data.imageData,
                  gridSize,
                  gridSize
                );
                imageDatas[i] = data;
                imageBuffers[i] = e.data;
                progress[i] = 1;

                resolve();
              } else if (e.data.type === "progress") {
                progress[i] = e.data.progress;
              }
              enqueueRender(i);
            };

            const errorListener = e => {
              worker.removeEventListener("message", listener);
              worker.removeEventListener("error", errorListener);
            };

            worker.addEventListener("message", listener);
            worker.addEventListener("error", errorListener);

            worker.postMessage([
              randomNumbers,
              imageBuffer,
              x * gridSize,
              y * gridSize,
              gridSize,
              size,
              size,
              time - startTime
            ]);
          });
        })
        .catch(err => console.error(err));
    }
    const start = performance.now();

    queue.run().then(() => {
      console.log("Tick run in %s ms", (performance.now() - start).toFixed(2));
    });
  }
  tick();

  document.body.appendChild(canvas);
}
