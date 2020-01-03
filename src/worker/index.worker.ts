import { ctx } from "./context";
import { setRandomNumbers } from "./random";
import { rayData, RayData, RayStride } from "./tracing";
import { renderPixel } from "./tracing/render";

let cancelled = false;
function render(e: MessageEvent) {
  if (e.data === "cancel") {
    cancelled = true;
    return;
  }
  if (cancelled) {
    return;
  }

  let [rnd, img, cx, cy, cellSize, width, height, time] = e.data;
  setRandomNumbers(rnd);
  const imageData = img as Uint8ClampedArray;

  let lastProgress = Date.now();

  for (let x = 0; x < cellSize; x++) {
    const px = cx + x;

    if (Date.now() - lastProgress > 10) {
      if (cancelled) {
        return;
      }
      lastProgress = Date.now();
      ctx.postMessage({
        type: "progress",
        progress: x / cellSize
      });
    }
    for (let y = 0; y < cellSize; y++) {
      const py = cy + y;

      const i = y * cellSize + x;

      renderPixel(imageData, rayData, width, height, x, y, px, py, i);
      // const color = Ray.trace(raydata, stride, 64, 0);

      if (false) {
        const offset = 0;
        const f = Math.sqrt(rayData[RayStride * offset + RayData.Dist]);
        const depth = f / 30;
        imageData[i * 4 + 0] = Math.floor(depth * 255);
        imageData[i * 4 + 1] = Math.floor(depth * 255);
        imageData[i * 4 + 2] = Math.floor(depth * 255);
        imageData[i * 4 + 3] = 255;
      } else {
        imageData[i * 4 + 0] = Math.floor(
          rayData[RayStride * 0 + RayData.R] * 255
        );
        imageData[i * 4 + 1] = Math.floor(
          rayData[RayStride * 0 + RayData.G] * 255
        );
        imageData[i * 4 + 2] = Math.floor(
          rayData[RayStride * 0 + RayData.B] * 255
        );
        imageData[i * 4 + 3] = 255;
      }
    }
  }
  if (cancelled) {
    return;
  }
  ctx.postMessage({ type: "done", imageData });
}
ctx.addEventListener("message", render);
