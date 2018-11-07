export type Color = [number, number, number];

export class Texture {
  constructor(private data: Color[][]) {}

  get(x: number, y: number): Color {
    if (x < 0) {
      x -= 1;
    }
    if (y < 0) {
      y -= 1;
    }

    const i = Math.floor(Math.abs(x)) % this.data[0].length;
    const j = Math.floor(Math.abs(y)) % this.data[1].length;
    return this.data[i][j];
  }
}
