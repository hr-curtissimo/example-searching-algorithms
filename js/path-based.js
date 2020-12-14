import { Point, Rectangle, Size } from './geometry.js';

export class ClosedPath {
  constructor(points, path) {
    this._points = points;
    this.path = path;
  }

  diff(other) {
    const { path } = other;
    const diff = new Int16Array(path.length);
    diff.fill(-1);
    for (let i = 0; i < path.length; i += 1) {
      if (path[i] !== this.path[i]) {
        if (i === 0) {
          diff[diff.length - 1] = path[path.length - 1];
          diff[0] = path[0];
          diff[1] = path[1];
        } else if (i === path.length - 1) {
          diff[diff.length - 2] = path[path.length - 2];
          diff[diff.length - 1] = path[path.length - 1];
          diff[0] = path[0];
        } else {
          diff[i - 1] = path[i - 1];
          diff[i] = path[i];
          diff[i + 1] = path[i + 1];
        }
      }
    }
    return diff;
  }

  get lengthSquared() {
    if (!this._cachedLength && this._points[0].hasBeenScaled) {
      this._cachedLength = this._lengthSquared();
    }
    return this._cachedLength;
  }

  _lengthSquared() {
    let sum = 0;
    const pathLength = this.path.length;
    for (let i = 0; i < pathLength; i += 1) {
      const from = this._points[this.path[i]];
      const to = this._points[this.path[(i + 1) % pathLength]];
      sum += Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2);
    }
    return sum;
  }
}

export class CanvasNodeRenderer {
  constructor(selector) {
    this._element = document.querySelector(selector);
    this._backgroundColor = window.getComputedStyle(this._element.parentElement).backgroundColor;
    this._context = this._element.getContext('2d', { alpha: false });
    this._size = new Size(this._element.clientHeight, this._element.clientWidth);
    this._bounds = new Rectangle(25, 20, this._size.width - 5, this._size.height - 5);
    this.clearSurface();

    const measure = this._context.measureText('# comparisons: 1000000000');
    this._textPosition = new Point(this._size.width - measure.width, Math.ceil(measure.actualBoundingBoxAscent + 5));
  }

  clearSurface() {
    this._context.fillStyle = this._backgroundColor;
    this._context.fillRect(0, 0, this._size.width, this._size.height);
  }

  render(simulation) {
    const { points, currentPath, proposedPath } = simulation;
    const { path: underPath } = currentPath;
    this.clearSurface();
    this._renderPath('#FFFFFF33', 1, underPath, points);
    if (proposedPath && !this.hideComparisons) {
      this._renderPath('#99990099', 2, proposedPath.diff(currentPath), points);
      this._renderPath('#9999FF99', 2, currentPath.diff(proposedPath), points);
    }

    this._context.fillStyle = '#FFFFFF';
    for (let i = 0; i < points.length; i += 1) {
      this._context.beginPath();
      const [x, y] = points[i].scale(this._bounds);
      this._context.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI);
      this._context.fill();
    }

    this._context.fillText(`# comparisons: ${simulation.comparisons}`, this._textPosition.x, this._textPosition.y);
  }

  _renderPath(lineColor, lineWidth, path, points) {
    this._context.beginPath();
    this._context.strokeStyle = lineColor;
    this._context.lineWidth = lineWidth;
    for (let i = 0; i <= path.length; i += 1) {
      if (i === 0) {
        const nodeIndex = path[0];
        if (nodeIndex === -1) {
          continue;
        }
        const [x, y] = points[nodeIndex].scale(this._bounds);
        this._context.moveTo(x, y);
      } else if (i === path.length) {
        const nodeIndex = path[0];
        if (nodeIndex === -1) {
          continue;
        }
        const [x, y] = points[nodeIndex].scale(this._bounds);
        this._context.lineTo(x, y);
      } else {
        const nodeIndex = path[i];
        if (nodeIndex === -1) {
          continue;
        }
        const [x, y] = points[nodeIndex].scale(this._bounds);
        this._context.lineTo(x, y);
      }
    }
    this._context.stroke();
  }
}
