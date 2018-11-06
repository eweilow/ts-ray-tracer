const ctx: Worker = self as any;

type Color = [number, number, number];

class Texture {
  constructor(private data: Color[][]) {}

  get(x: number, y: number): Color {
    const i = Math.floor(x) % this.data[0].length;
    const j = Math.floor(y) % this.data[1].length;
    return this.data[i][j];
  }
}

const floorTexture = new Texture([
  [[0.2, 0.2, 0.2], [1.0, 1.0, 1.0]],
  [[1.0, 1.0, 1.0], [0.2, 0.2, 0.2]]
]);

class Ray {
  static floorTexture(x: number, y: number) {
    return floorTexture.get(x, y);
  }

  static planeLevel = -3;

  static intersectPlane(raydata: number[], stride: number): number[] {
    const pz = Ray.planeLevel;

    const z = raydata[stride + 2];
    const dz = raydata[stride + 5];

    const f = (pz - z) / dz;

    if (f >= 0) {
      const x = raydata[stride + 0];
      const y = raydata[stride + 1];

      const ix = x + f * raydata[stride + 3];
      const iy = y + f * raydata[stride + 4];
      const iz = Ray.planeLevel;
      return [
        (ix - x) * (ix - x) + (iy - y) * (iy - y) + (iz - z) * (iz - z),
        ix,
        iy,
        iz + 0.001,
        0,
        0,
        1
      ];
    }
    return null;
  }

  static spheres = [
    [15, 0, 0, 5, 0],
    [13, -7, -2, 0.5, 1],
    [13, -5, -2, 0.25, 1]
  ];

  static intersectASphere(
    raydata: number[],
    stride: number,
    sphereData: number[]
  ): number[] {
    const [sx, sy, sz, r, brightness] = sphereData;

    const x = raydata[stride + 0];
    const y = raydata[stride + 1];
    const z = raydata[stride + 2];

    const dx = raydata[stride + 3];
    const dy = raydata[stride + 4];
    const dz = raydata[stride + 5];

    const distX = sx - x;
    const distY = sy - y;
    const distZ = sz - z;

    const dLength = dx * dx + dy * dy + dz * dz;

    const projDot = (distX * dx + distY * dy + distZ * dz) / dLength;

    if (projDot < 0) return null;

    const projLx = dx * projDot;
    const projLy = dy * projDot;
    const projLz = dz * projDot;

    const hx = projLx - distX;
    const hy = projLy - distY;
    const hz = projLz - distZ;

    const hSquare = hx * hx + hy * hy + hz * hz;

    if (hSquare <= r * r) {
      const tSquare = r * r - hSquare;
      const t = Math.sqrt(tSquare);
      const h = Math.sqrt(hSquare);

      const ix = sx + hx - (dx * t) / Math.sqrt(dLength);
      const iy = sy + hy - (dy * t) / Math.sqrt(dLength);
      const iz = sz + hz - (dz * t) / Math.sqrt(dLength);

      let rx = ix - sx;
      let ry = iy - sy;
      let rz = iz - sz;

      const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
      rx /= rLength;
      ry /= rLength;
      rz /= rLength;
      return [
        (ix - x) * (ix - x) + (iy - y) * (iy - y) + (iz - z) * (iz - z),
        ix + rx * 0.001,
        iy + ry * 0.001,
        iz + rz * 0.001,
        rx,
        ry,
        rz,
        brightness
      ];
    }

    return null;
  }

  static intersectSphere(raydata: number[], stride: number): number[] {
    const spheres = Ray.spheres
      .map(el => Ray.intersectASphere(raydata, stride, el))
      .filter(el => el !== null);
    if (spheres.length === 0) return null;

    spheres.sort((a, b) => a[0] - b[0]);
    return spheres[0];
  }

  static dot(
    vectorA: number[],
    strideA: number,
    vectorB: number[],
    strideB: number
  ) {
    return (
      vectorA[strideA + 0] * vectorB[strideB + 0] +
      vectorA[strideA + 1] * vectorB[strideB + 1] +
      vectorA[strideA + 2] * vectorB[strideB + 2]
    );
  }

  static refract(
    raydata: number[],
    directionStride: number,
    inflectionPoint: number[],
    inflectionStride: number
  ): number[] {
    const reflect = -Ray.dot(raydata, 3, inflectionPoint, inflectionStride + 3);

    const eta = 1.45;

    const k = 1 - eta * eta * (1 - reflect * reflect);
    if (k < 0) return raydata;

    let rx =
      eta * raydata[3] -
      (eta * reflect + Math.sqrt(k)) * inflectionPoint[inflectionStride + 3];
    let ry =
      eta * raydata[4] -
      (eta * reflect + Math.sqrt(k)) * inflectionPoint[inflectionStride + 4];
    let rz =
      eta * raydata[5] -
      (eta * reflect + Math.sqrt(k)) * inflectionPoint[inflectionStride + 5];
    const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
    rx /= rLength;
    ry /= rLength;
    rz /= rLength;

    return [
      inflectionPoint[inflectionStride + 0] + rx * 0.001,
      inflectionPoint[inflectionStride + 1] + ry * 0.001,
      inflectionPoint[inflectionStride + 2] + rz * 0.001,
      rx,
      ry,
      rz
    ];
  }

  static reflect(
    raydata: number[],
    directionStride: number,
    inflectionPoint: number[],
    inflectionStride: number
  ): number[] {
    const reflect = Ray.dot(raydata, 3, inflectionPoint, inflectionStride + 3);

    let rx = raydata[3] - 2 * reflect * inflectionPoint[inflectionStride + 3];
    let ry = raydata[4] - 2 * reflect * inflectionPoint[inflectionStride + 4];
    let rz = raydata[5] - 2 * reflect * inflectionPoint[inflectionStride + 5];
    const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
    rx /= rLength;
    ry /= rLength;
    rz /= rLength;

    return [
      inflectionPoint[inflectionStride + 0] + rx * 0.001,
      inflectionPoint[inflectionStride + 1] + ry * 0.001,
      inflectionPoint[inflectionStride + 2] + rz * 0.001,
      rx,
      ry,
      rz
    ];
  }

  static sky(raydata: number[], stride: number): number[] {
    const brightness = 1;

    const dot = Math.max(0, Ray.dot([0, 0, 1], 0, raydata, stride + 3));

    const top = Math.pow(Math.max(0, dot), 2);
    return [
      brightness * 0.15 * (1 - top) + brightness * (179 / 255) * top,
      brightness * (90 / 255) * (1 - top) + brightness * (230 / 255) * top,
      brightness * (135 / 255) * (1 - top) + brightness * 1.0 * top
    ];
  }

  static fresnel(
    gloss: number,
    diffuseLighting: number[],
    colA: number[],
    colB: number[],
    dot: number,
    minColA: number = 0
  ): number[] {
    dot = dot * gloss + (1 - gloss);
    return [
      dot * colA[0] * diffuseLighting[0] + (1 - dot) * colB[0],
      dot * colA[1] * diffuseLighting[1] + (1 - dot) * colB[1],
      dot * colA[2] * diffuseLighting[2] + (1 - dot) * colB[2]
    ];
  }

  static perturbate(
    inflectionPoint: number[],
    inflectionStride: number,
    seed: number = 0
  ): number[] {
    let rx;
    let ry;
    let rz;

    const directional = 0;

    let steps = 0;
    do {
      rx =
        randomNumbers[(seed * (steps * 297 + seed)) % randomNumbers.length] *
          2 -
        1;
      ry =
        randomNumbers[(seed * (steps * 7 + seed + 1)) % randomNumbers.length] *
          2 -
        1;
      rz =
        randomNumbers[(seed * (steps * 19 + seed + 2)) % randomNumbers.length] *
          2 -
        1;
    } while (
      ++steps <= 5 &&
      Ray.dot(inflectionPoint, inflectionStride + 3, [rx, ry, rz], 0) <= 0
    );

    rx = inflectionPoint[inflectionStride + 3] + rx * (1 - directional);
    ry = inflectionPoint[inflectionStride + 4] + ry * (1 - directional);
    rz = inflectionPoint[inflectionStride + 5] + rz * (1 - directional);

    const rLength = Math.sqrt(rx * rx + ry * ry + rz * rz);
    rx /= rLength;
    ry /= rLength;
    rz /= rLength;
    return [
      inflectionPoint[inflectionStride + 0],
      inflectionPoint[inflectionStride + 1],
      inflectionPoint[inflectionStride + 2],
      rx,
      ry,
      rz
    ];
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
      const perturbated = Ray.perturbate(
        inflectionPoint,
        inflectionStride,
        i * 14
      );
      const planeIntersection = Ray.intersectPlane(perturbated, 0);
      const sphereIntersection = Ray.intersectSphere(perturbated, 0);

      if (
        planeIntersection !== null &&
        (sphereIntersection === null ||
          sphereIntersection[0] > planeIntersection[0])
      ) {
        const dot = Math.abs(Ray.dot(inflectionPoint, 4, planeIntersection, 4));

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
        const diffuse = Ray.sky(inflectionPoint, inflectionStride);
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
    if (runSteps >= maxSteps) return Ray.sky(raydata, stride);

    const planeIntersection = Ray.intersectPlane(raydata, stride);
    const sphereIntersection = Ray.intersectSphere(raydata, stride);

    if (
      planeIntersection !== null &&
      (sphereIntersection === null ||
        sphereIntersection[0] > planeIntersection[0])
    ) {
      const dot = Math.abs(Ray.dot(raydata, 3, planeIntersection, 4));

      const diffuse = Ray.floorTexture(
        planeIntersection[1],
        planeIntersection[2]
      );
      const diffuseLighting = diffusePass
        ? Ray.diffuseTrace(planeIntersection, 1, 5, 0)
        : [0, 0, 0];
      const checkers = Ray.floorTexture(
        planeIntersection[1],
        planeIntersection[2]
      );

      const traced = Ray.trace(
        Ray.reflect(raydata, 3, planeIntersection, 1),
        0,
        maxSteps,
        runSteps + 1,
        diffusePass
      );

      return Ray.fresnel(
        0.2 * checkers[0],
        diffuseLighting,
        diffuse,
        traced,
        dot
      );
    }

    if (
      sphereIntersection !== null &&
      (planeIntersection === null ||
        planeIntersection[0] > sphereIntersection[0])
    ) {
      const dot = Math.abs(Ray.dot(raydata, 3, sphereIntersection, 4));
      const diffuse = [1, 0, 0];
      const checkers = Ray.floorTexture(
        sphereIntersection[2] * 4,
        sphereIntersection[3] * 4
      );

      const reflected = Ray.reflect(raydata, 3, sphereIntersection, 1);
      const diffuseLighting = diffusePass
        ? Ray.diffuseTrace(sphereIntersection, 1, 5, 0)
        : [0, 0, 0];

      const traced = Ray.trace(
        reflected,
        0,
        maxSteps,
        runSteps + 1,
        diffusePass
      );

      return Ray.fresnel(
        0.1 * checkers[0],
        diffuseLighting,
        diffuse,
        traced,
        dot
      ).map(el => el + sphereIntersection[7]);
    }

    return Ray.sky(raydata, stride);
  }
}

class Projector {
  public readonly fov: number;

  public readonly leftTop: number[];
  public readonly rightTop: number[];
  public readonly leftBottom: number[];
  public readonly rightBottom: number[];

  constructor(fov: number, rotationX: number, rotationY: number) {
    this.fov = (Math.PI / 180) * fov;

    this.leftTop = this.point(
      -this.fov / 2 + rotationX,
      this.fov / 2 + rotationY
    );
    this.rightTop = this.point(
      this.fov / 2 + rotationX,
      this.fov / 2 + rotationY
    );
    this.leftBottom = this.point(
      -this.fov / 2 + rotationX,
      -this.fov / 2 + rotationY
    );
    this.rightBottom = this.point(
      this.fov / 2 + rotationX,
      -this.fov / 2 + rotationY
    );
  }

  static interpolate(a: number, b: number, fac: number): number {
    return a + (b - a) * Math.max(0, Math.min(1, fac));
  }

  static interpolatePoint(a: number[], b: number[], fac: number): number[] {
    return [
      Projector.interpolate(a[0], b[0], fac),
      Projector.interpolate(a[1], b[1], fac),
      Projector.interpolate(a[2], b[2], fac)
    ];
  }

  point(rotationX: number, rotationY: number): number[] {
    return [
      Math.cos(rotationX) * Math.cos(rotationY),
      Math.sin(rotationX) * Math.cos(rotationY),
      Math.cos(rotationX) * Math.sin(rotationY)
    ];
  }

  project(
    raydata: number[],
    stride: number,
    px: number,
    py: number,
    width: number,
    height: number
  ): void {
    const facX = px / width;
    const facY = py / height;

    const top = Projector.interpolatePoint(this.leftTop, this.rightTop, facX);
    const bottom = Projector.interpolatePoint(
      this.leftBottom,
      this.rightBottom,
      facX
    );

    const direction = Projector.interpolatePoint(top, bottom, facY);

    const p = Math.sqrt(
      direction[0] * direction[0] +
        direction[1] * direction[1] +
        direction[2] * direction[2]
    );

    raydata[stride + 0] = 0;
    raydata[stride + 1] = 0;
    raydata[stride + 2] = 0;
    raydata[stride + 3] = direction[0] / p;
    raydata[stride + 4] = direction[1] / p;
    raydata[stride + 5] = direction[2] / p;
    /*
    raydata[stride] = 0;
    raydata[stride+1] = 0;
    raydata[stride+2] = 0;
    raydata[stride+3] = dt * Math.cos(radX) * Math.cos(radY);
    raydata[stride+4] = dt * Math.sin(radX) * Math.cos(radY);
    raydata[stride+5] = dt * Math.sin(radY);
    */
  }
}

const projector = new Projector(70, 0, -0.1);

let randomNumbers = [];

function render(e) {
  const dt = 1;

  let [rnd, img, cx, cy, cellSize, width, height, time] = e.data;
  randomNumbers = rnd;
  const imageData = img as Uint8ClampedArray;

  const fov = (Math.PI / 180) * 180;

  const raydata = [0, 0, 0, 0, 0, 0];

  const channels = 4;
  const pixels = cellSize * cellSize;

  let lastProgress = Date.now();

  for (let x = 0; x < cellSize; x++) {
    const px = cx + x;

    for (let y = 0; y < cellSize; y++) {
      const py = cy + y;

      const i = y * cellSize + x;

      if (Date.now() - lastProgress > 100) {
        ctx.postMessage({
          type: "progress",
          progress: i / (cellSize * cellSize)
        });
        lastProgress = Date.now();
      }
      const stride = 0;

      projector.project(raydata, 0, px, py, width, height);
      const color = Ray.trace(raydata, stride, 5, 0);

      imageData[i * 4 + 0] = Math.floor(color[0] * 255);
      imageData[i * 4 + 1] = Math.floor(color[1] * 255);
      imageData[i * 4 + 2] = Math.floor(color[2] * 255);
      imageData[i * 4 + 3] = 255; // Math.sin(Math.sqrt(dx*dx + dy*dy) * 0.1) * 255;
    }
  }
  ctx.postMessage({ type: "done", imageData });
}
ctx.addEventListener("message", render);
