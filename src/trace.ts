import ImportedTracer = require("worker-loader!./tracer");

export function run() {
  const gridSize = 128;
  const size = gridSize * Math.floor(600 / gridSize) * 2;

  const threads = 4;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  canvas.style.transform = "scale(0.5, 0.5)";
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

  const queue = new Queue(threads, ImportedTracer);

  const startTime = Date.now();

  const imageBuffers: Uint8ClampedArray[] = [];
  const grids = size / gridSize;

  const channels = 4;
  for (let x = 0; x < grids; x++) {
    for (let y = 0; y < grids; y++) {
      const i = y * grids + x;

      imageBuffers[i] = new Uint8ClampedArray(gridSize * gridSize * channels);
    }
  }

  function tick() {
    const time = Date.now();

    const imageDatas = [];
    for (let x = 0; x < grids; x++) {
      for (let y = 0; y < grids; y++) {
        const i = y * grids + x;

        const imageBuffer = imageBuffers[i];

        queue
          .enqueue(x * grids + y, async worker => {
            ctx.fillStyle = "red";
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
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
                  imageDatas.push({ x, y, data });
                  ctx.putImageData(data, x * gridSize, y * gridSize);

                  imageBuffers[i] = e.data;

                  resolve();
                } else if (e.data.type === "progress") {
                  ctx.fillStyle = "green";
                  ctx.fillRect(
                    x * gridSize,
                    y * gridSize,
                    gridSize * e.data.progress,
                    gridSize
                  );
                }
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
    }
    const start = performance.now();

    queue.run().then(() => {
      console.log("Tick run in %s ms", (performance.now() - start).toFixed(2));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          for (let { x, y, data } of imageDatas) {
            //ctx.putImageData(data, x * gridSize, y * gridSize);
          }
          //tick()
        });
      });
    });
  }
  tick();

  document.body.appendChild(canvas);
}
