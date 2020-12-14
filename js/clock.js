export class Clock {
  constructor(selector) {
    this._control = document.querySelector(selector);
    this._min = Number.parseInt(this._control.getAttribute('min'));
    this._max = Number.parseInt(this._control.getAttribute('max'));
    this._currentSpeed = this.controlValue();
    this._lastTimestamp = 0;
    this.callback = null;
    this.tick = this.tick.bind(this);
    this._paused = false;
    window.requestAnimationFrame(this.tick);
  }

  set callback(value) {
    this._callback = value || (() => { });
  }

  controlValue() {
    return Number.parseInt(this._control.value);
  }

  pause() {
    this._paused = true;
  }

  get paused() {
    return this._paused;
  }

  resume() {
    this._paused = false;
  }

  tick(ts) {
    if (this._paused) {
      return window.requestAnimationFrame(this.tick);;
    }
    if ((Math.floor(ts) % 15) === 0) {
      this._currentSpeed = this.controlValue();
    }
    const delta = ts - this._lastTimestamp;
    if (delta >= this._max - this._currentSpeed + this._min) {
      this._callback(ts);
      this._lastTimestamp = ts;
    }
    window.requestAnimationFrame(this.tick);
  }
}
