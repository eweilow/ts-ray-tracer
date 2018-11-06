declare module "worker-loader!./tracer" {
  class WebpackWorker extends Worker {
      constructor();
  }
  export = WebpackWorker;
  //export default function(): Worker;
}