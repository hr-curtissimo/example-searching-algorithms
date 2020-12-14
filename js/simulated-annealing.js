import { Size } from './geometry.js';

export class CanvasTemperatureRenderer {
  constructor(selector) {
    this._element = document.querySelector(selector);
    this._backgroundColor = window.getComputedStyle(this._element.parentElement).backgroundColor;
    this._context = this._element.getContext('2d', { alpha: false });
    this._size = new Size(this._element.clientHeight, this._element.clientWidth);
  }

  render(value) {
    this._context.fillStyle = '#FF000099';
    const height = Math.floor(this._size.height * value);
    const top = this._size.height - height;
    this._context.fillRect(0, top, 20, height);
    this._context.fillStyle = '#FFFFFF';
    this._context.fillText(`temp: ${value.toString().substr(0, 6)}`, 5, this._size.height - 5);
  }
}

export class MinimizingSimulatedAnnealing {
  constructor(startTemp, endTemp, iterationsPerRound, decay) {
    this._startTemp = startTemp;
    this._endTemp = endTemp;
    this._iterationsPerRound = iterationsPerRound;
    this._currentTemp = this._startTemp;
    this._currentIteration = 0;
    this._decay = decay;
  }

  get done() {
    return this._currentTemp < this._endTemp;
  }

  get temperature() {
    return this._currentTemp;
  }

  evaluate(currents, proposals) {
    const current = currents[0];
    const proposed = proposals[0];
    if (this._currentIteration === this._iterationsPerRound) {
      this._currentIteration = 0;
      this._changeTemp();
    }
    this._currentIteration += 1;

    const probability = Math.exp((current - proposed) / current / this._currentTemp);
    const bound = Math.random();

    return proposed < current || probability > bound ? [[false], [true]] : [[false], [true]];
  }

  _changeTemp() {
    this._currentTemp = this._decay * this._currentTemp;
  }
}
