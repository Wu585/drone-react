import Tooltip from "./Tooltip";
import type {TooltipOptions} from "./Tooltip";

type MouseTooltipOptions = TooltipOptions;

class MouseTooltip extends Tooltip {
  private _handler: Cesium.ScreenSpaceEventHandler;
  private _destroyed = false;

  constructor(viewer: any, options: MouseTooltipOptions = {}) {
    super(viewer, options);
    this._handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.enabled = true;
    this.showAt(new Cesium.Cartesian2(0, 0), this.content);
  }

  get destroyed() {
    return this._destroyed;
  }

  /**
   * 显示tooltip
   */
  show() {
    if (this._destroyed) return;
    super.show();
    this._handler.setInputAction((movement: any) => {
      const {endPosition} = movement;
      if (endPosition) {
        const ray = this._viewer.camera.getPickRay(endPosition);
        if (!ray) return;
        const cartesian = this._viewer.scene.globe.pick(
          ray,
          this._viewer.scene,
        );
        if (cartesian) this._updateWindowCoord(endPosition);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  /**
   * 隐藏tooltip
   */
  hide() {
    if (this._destroyed) return;
    super.hide();
    this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  destroy() {
    this.enabled = false;
    if (!this._handler.isDestroyed()) {
      this._handler.destroy();
    }
    this._destroyed = true;
  }
}

export default MouseTooltip;
