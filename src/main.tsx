import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "normalize.css";
import "./index.css";
import "./video-js.css";

window.Cesium = SuperMap3D;

window.getPosition = function () {
  const {position, heading, pitch, roll} = viewer.camera;
  const {x, y, z} = position;
  // return `${x},${y},${z},${heading},${pitch},${roll}`;
  return {x, y, z, heading, pitch, roll};
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App/>
);
