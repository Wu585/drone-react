import Widget from "@/lib/cesium/Widget.ts";
import DomUtil from "@/lib/cesium/DomUtil.ts";

export type TooltipOptions = {
  offset?: [number, number];
  content?: string | Element;
};
class Tooltip extends Widget {
  private _offset: [number, number];
  private _content: string | Element;
  /**
   * Cesium tooptip
   * @param viewer
   */
  constructor(viewer: any, options: TooltipOptions = {}) {
    console.log('viewer====');
    console.log(viewer);
    super(viewer, DomUtil.create('div', 'cesium-tool-tip'));
    this._offset = options.offset ?? [0, 0];
    this._content = options.content ?? '';
  }

  set content(val: string | Element) {
    if (!this.enabled) this.enabled = true;
    this._content = val;
    this.setContent(val);
    this.show();
  }

  get content() {
    return this._content;
  }

  /**
   *
   * @param {Cartesian2} windowCoord
   */
  protected _updateWindowCoord(windowCoord: any) {
    const x = windowCoord.x + 20 + this._offset[0];
    const y = windowCoord.y - this._wrapper.offsetHeight / 2 + this._offset[1];
    this._wrapper.style.cssText = `
    visibility:visible;
    z-index:1;
    transform:translate3d(${Math.round(x)}px,${Math.round(y)}px, 0);
    `;
  }

  /**
   * @param windowPosition
   * @param content
   * @returns {Tooltip}
   */
  showAt(windowPosition: any, content: string | Element): Tooltip {
    if (!this._enabled) {
      return this;
    }
    if (windowPosition) this._updateWindowCoord(windowPosition);
    this.setContent(content);
    return this;
  }
}

export default Tooltip;
