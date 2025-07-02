interface Position {
  x: number;
  y: number;
}

class Tooltip {
  private _div: HTMLDivElement;
  private _title: HTMLDivElement;
  public message: string;

  constructor(frameDiv: HTMLDivElement) {
    this._div = document.createElement("div");
    this._div.className = "twipsy right";

    const arrow = document.createElement("div");
    arrow.className = "twipsy-arrow";
    this._div.appendChild(arrow);

    this._title = document.createElement("div");
    this._title.className = "twipsy-inner";
    this._div.appendChild(this._title);

    this.message = "";

    // add to frame div and display coordinates
    frameDiv.appendChild(this._div);

    this._div.onmousemove = (evt: MouseEvent) => {
      this.showAt({x: evt.clientX, y: evt.clientY}, this.message);
    };
  }

  public setVisible(visible: boolean): void {
    this._div.style.display = visible ? "block" : "none";
  }

  public showAt(position: Position, message: string): void {
    if (position && message) {
      this.setVisible(true);
      this._title.innerHTML = message;
      this._div.style.left = position.x + 10 + "px";
      this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
      this.message = message;
    }
  }
}

export function createTooltip(frameDiv: HTMLDivElement): Tooltip {
  return new Tooltip(frameDiv);
}
