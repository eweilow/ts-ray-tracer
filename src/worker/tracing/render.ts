import { beginTrace } from ".";
import { Projector } from "../projector";

const projector = new Projector(90, 0, 0);

export function renderPixel(
  imageData: Uint8ClampedArray,
  rayData: Float32Array,
  width: number,
  height: number,
  cellX: number,
  cellY: number,
  pixelX: number,
  pixelY: number,
  index: number
) {
  rayData.fill(0);
  projector.project(rayData, 0, pixelX, pixelY, width, height);
  beginTrace(rayData);
}
