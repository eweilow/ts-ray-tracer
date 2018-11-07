import { Textures } from "./textures";
import { ctx } from "./context";
import { Plane } from "./primitives/plane";
import { Sphere } from "./primitives/sphere";
import { dot } from "./math/dot";
import { reflect } from "./math/reflect";
import { fresnel } from "./math/fresnel";
import { sky } from "./primitives/sky";
import { Projector } from "./projector";
import { perturbate } from "./math/perturbate";
import { setRandomNumbers } from "./random";

const plane = new Plane(-3);
const spheres = [
  new Sphere(13, 0, 0, 5, 0),
  new Sphere(13, -7, -2, 0.5, 1),
  new Sphere(13, -5, -2, 0.25, 1)
];

class Ray {
  static intersectSphere(raydata: number[], stride: number): number[] {
    const intersectedSpheres = spheres
      .map(el => el.intersect(raydata, stride))
      .filter(el => el !== null);
    if (intersectedSpheres.length === 0) return null;

    intersectedSpheres.sort((a, b) => a[0] - b[0]);
    return intersectedSpheres[0];
  }

  static diffuseTrace(
    inflectionPoint: number[],
    inflectionStride: number,
    maxSteps: number,
    runSteps: number = 0
  ): number[] {
    if (runSteps >= maxSteps) return [0, 0, 0];

    const collected = [0, 0, 0];
    const steps = runSteps === 0 ? 250 : Math.max(1, 15 - runSteps * 5);

    for (let i = 0; i < steps; i++) {
      const perturbated = perturbate(inflectionPoint, inflectionStride, i * 14);
      const planeIntersection = plane.intersect(perturbated, 0);
      const sphereIntersection = Ray.intersectSphere(perturbated, 0);

      if (
        planeIntersection !== null &&
        (sphereIntersection === null ||
          sphereIntersection[0] > planeIntersection[0])
      ) {
        const diffuse = Ray.trace(planeIntersection, 1, maxSteps, 0, false);
        collected[0] += diffuse[0];
        collected[1] += diffuse[1];
        collected[2] += diffuse[2];
      }
      if (
        sphereIntersection !== null &&
        (planeIntersection === null ||
          planeIntersection[0] > sphereIntersection[0])
      ) {
        const diffuse = Ray.trace(sphereIntersection, 1, maxSteps, 0, false);
        collected[0] += diffuse[0] + sphereIntersection[7];
        collected[1] += diffuse[1] + sphereIntersection[7];
        collected[2] += diffuse[2] + sphereIntersection[7];
      }
      if (planeIntersection === null && sphereIntersection === null) {
        const diffuse = sky(inflectionPoint, inflectionStride);
        collected[0] += diffuse[0];
        collected[1] += diffuse[1];
        collected[2] += diffuse[2];
      }
    }
    return [collected[0] / steps, collected[1] / steps, collected[2] / steps];
  }

  static trace(
    raydata: number[],
    stride: number,
    maxSteps: number,
    runSteps: number = 0,
    diffusePass: boolean = true
  ): number[] {
    if (runSteps >= maxSteps) return sky(raydata, stride);

    const planeIntersection = plane.intersect(raydata, stride);
    const sphereIntersection = Ray.intersectSphere(raydata, stride);

    if (
      planeIntersection !== null &&
      (sphereIntersection === null ||
        sphereIntersection[0] > planeIntersection[0])
    ) {
      const dotProduct = Math.abs(dot(raydata, 3, planeIntersection, 4));

      const checkers = Textures.checkers.get(
        planeIntersection[1],
        planeIntersection[2]
      );
      const diffuseLighting = diffusePass
        ? Ray.diffuseTrace(planeIntersection, 1, maxSteps, runSteps + 1)
        : [0, 0, 0];

      const traced = Ray.trace(
        reflect(raydata, 3, planeIntersection, 1),
        0,
        maxSteps,
        runSteps + 1,
        diffusePass
      );

      return fresnel(
        0.2 * checkers[0],
        diffuseLighting,
        checkers,
        traced,
        dotProduct
      );
    }

    if (
      sphereIntersection !== null &&
      (planeIntersection === null ||
        planeIntersection[0] > sphereIntersection[0])
    ) {
      const dotProduct = Math.abs(dot(raydata, 3, sphereIntersection, 4));
      const diffuse = [1, 0, 0];
      const checkers = Textures.checkers.get(
        sphereIntersection[2] * 4,
        sphereIntersection[3] * 4
      );

      const reflected = reflect(raydata, 3, sphereIntersection, 1);
      const diffuseLighting = diffusePass
        ? Ray.diffuseTrace(sphereIntersection, 1, maxSteps, runSteps + 1)
        : [0, 0, 0];

      const traced = Ray.trace(
        reflected,
        0,
        maxSteps,
        runSteps + 1,
        diffusePass
      );

      return fresnel(
        0.1 * checkers[0],
        diffuseLighting,
        diffuse,
        traced,
        dotProduct
      ).map(el => el + sphereIntersection[7]);
    }

    return sky(raydata, stride);
  }
}

const projector = new Projector(70, 0, -0.1);

function render(e) {
  let [rnd, img, cx, cy, cellSize, width, height, time] = e.data;
  setRandomNumbers(rnd);
  const imageData = img as Uint8ClampedArray;
  const raydata = [0, 0, 0, 0, 0, 0];

  let lastProgress = Date.now();

  for (let x = 0; x < cellSize; x++) {
    const px = cx + x;

    if (Date.now() - lastProgress > 10) {
      lastProgress = Date.now();
      ctx.postMessage({
        type: "progress",
        progress: x / cellSize
      });
    }
    for (let y = 0; y < cellSize; y++) {
      const py = cy + y;

      const i = y * cellSize + x;
      const stride = 0;

      projector.project(raydata, 0, px, py, width, height);
      const color = Ray.trace(raydata, stride, 32, 0);

      imageData[i * 4 + 0] = Math.floor(color[0] * 255);
      imageData[i * 4 + 1] = Math.floor(color[1] * 255);
      imageData[i * 4 + 2] = Math.floor(color[2] * 255);
      imageData[i * 4 + 3] = 255; // Math.sin(Math.sqrt(dx*dx + dy*dy) * 0.1) * 255;
    }
  }
  ctx.postMessage({ type: "done", imageData });
}
ctx.addEventListener("message", render);
