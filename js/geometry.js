export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  scale(bounds) {
    this.hasBeenScaled = true;
    this.x = Math.round((this.x * (bounds.right - bounds.left)) + bounds.left);
    this.y = Math.round((this.y * (bounds.bottom - bounds.top)) + bounds.top);
    this.scale = () => { return [this.x, this.y] };
    return this.scale();
  }
}

export class Size {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

export class Rectangle {
  constructor(left, top, right, bottom) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
}
