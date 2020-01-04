import { render } from "react-dom";
import { App } from "./app";
import { createElement } from "react";

let el: any;
function start() {
  el = document.querySelector("#react");
  if (el == null) {
    el = document.createElement("div");
    el.id = "react";
    document.body.appendChild(el);
  }
  render(createElement(App), el);
}

if (document?.readyState === "complete") {
  start();
} else {
  window.addEventListener("load", () => {
    start();
  });
}
