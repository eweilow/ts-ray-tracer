import { Texture } from "./texture";

export namespace Textures {
  export const checkers = new Texture([
    [[0.2, 0.2, 0.2], [1.0, 1.0, 1.0]],
    [[1.0, 1.0, 1.0], [0.2, 0.2, 0.2]]
  ]);
}
