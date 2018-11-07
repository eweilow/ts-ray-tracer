declare module "worker-loader!./*.worker.ts" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export = WebpackWorker;
  //export default function(): Worker;
}
