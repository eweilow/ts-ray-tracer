export abstract class Primitive {
  abstract intersect(raydata: number[], stride: number): number[];
}
