export class Projector {
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
  }
}
