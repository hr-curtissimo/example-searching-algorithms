import { Point } from './geometry.js';
import { ClosedPath } from './path-based.js';

export class TravelingSalesmanSimulation {
  constructor(numberOfPoints, heuristic, poolSize = 1) {
    this._numberOfPoints = numberOfPoints;
    this._heuristic = heuristic;
    this._poolSize = poolSize;

    this.points = [];
    for (let i = 0; i < numberOfPoints; i += 1) {
      this.points.push(new Point(Math.random(), Math.random()));
    }
    this.currentPaths = [];
    for (let i = 0; i < this._poolSize; i += 1) {
      const startState = TravelingSalesmanSimulation.generateRandomPath(this.points.length);
      this.currentPaths.push(new ClosedPath(this.points, startState));
    }
    this.currentPath = this.currentPaths[0];
    this.comparisons = 0;
  }

  decide() {
    const currents = this.currentPaths.map(x => x.lengthSquared);
    const proposals = this.proposedPaths.map(x => x.lengthSquared);
    const changes = this._heuristic.evaluate(currents, proposals);
    let accepted = [];
    for (let i = 0; i < this._poolSize; i += 1) {
      if (changes[0][i]) {
        accepted.push(this.currentPaths[i]);
      }
    }
    for (let i = 0; i < this._poolSize; i += 1) {
      if (changes[1][i]) {
        accepted.push(this.proposedPaths[i]);
      }
    }
    accepted.sort((x, y) => x.lengthSquared < y.lengthSquared ? -1 : x.lengthSquared > y.lengthSquared ? 1 : 0);
    this.currentPaths = accepted;
    this.currentPath = accepted[0];
    for (let i = 1; i < this._poolSize; i += 1) {
      if (this.currentPath.lengthSquared > this.currentPaths[i].lengthSquared) {
        this.currentPath = this.currentPaths[i];
      }
    }
    this.proposedPaths = null;
    this.proposedPath = null;
    this.comparisons += 1;
  }

  get done() {
    return this._heuristic.done;
  }

  breed() {
    const proposedPaths = [];
    for (let i = 0; i < this._poolSize; i += 1) {
      let len = this._numberOfPoints;
      const parent1 = this.currentPaths[Math.floor(Math.random() * this._poolSize)];
      const parent2 = this.currentPaths[Math.floor(Math.random() * this._poolSize)];
      let left = 0;
      let right = 0;
      while (Math.abs(left - right) < 2 || (left === len - 1 && right === 0)) {
        left = Math.floor(Math.random() * len);
        right = Math.floor(Math.random() * len);
      }
      const proposedPath = new Int16Array(len);
      proposedPath.fill(-1);
      const upper = left < right ? right : right + len;
      for (let i = left; i < upper; i += 1) {
        proposedPath[i % len] = parent1.path[i % len];
      }
      left += len;
      for (let i = 0, j = 0; i < len; i += 1) {
        if (proposedPath[i] === -1) {
          while (j < len && proposedPath.includes(parent2.path[j])) {
            j += 1;
          }
          proposedPath[i] = parent2.path[j];
        }
      }

      while (Math.random() < this._heuristic.mutationProbability) {
        const spot = Math.floor(Math.random() * len);
        const tmp = proposedPath[spot];
        proposedPath[spot] = proposedPath[(spot + 1) % len];
        proposedPath[(spot + 1) % len] = tmp;
      }

      proposedPaths.push(new ClosedPath(this.points, proposedPath));
    }
    return proposedPaths;
  }

  reversePath() {
    let len = this._numberOfPoints;
    let left = 0;
    let right = 0;
    while (Math.abs(left - right) < 2 || (left === len - 1 && right === 0)) {
      left = Math.floor(Math.random() * len);
      right = Math.floor(Math.random() * len);
    }
    const span = left < right
      ? Math.floor((right - left + 1) / 2)
      : Math.floor((len - left + right + 2) / 2);
    const proposedPath = new Int16Array(this.currentPath.path);
    if (left < right) {
      for (let i = 0; i < span; i += 1) {
        const tmp = proposedPath[right - i];
        proposedPath[right - i] = proposedPath[left + i];
        proposedPath[left + i] = tmp;
      }
    } else {
      for (let i = 0; i < span; i += 1) {
        const l = (left + i) % len;
        const r = (len + right - i) % len;
        const tmp = proposedPath[l];
        proposedPath[l] = proposedPath[r];
        proposedPath[r] = tmp;
      }
    }
    return [new ClosedPath(this.points, proposedPath)];
  }

  swapTwoNodes() {
    let len = this.points.length;
    let left = 0;
    let right = 0;
    while (Math.abs(left - right) < 2 || (left === len - 1 && right === 0)) {
      left = Math.floor(Math.random() * len);
      right = Math.floor(Math.random() * len);
    }
    const proposedPath = new Int16Array(this.currentPath.path);
    const tmp = proposedPath[left];
    proposedPath[left] = proposedPath[right];
    proposedPath[right] = tmp;
    return [new ClosedPath(this.points, proposedPath)];
  }

  propose() {
    this.proposedPaths = this[this.strategy]();
    this.proposedPath = this.proposedPaths[0];
  }

  /**
   * Generate a random path of point indexes using the Durstenfeld variant of
   * the Fisher-Yates Shuffle.
   * @param {int} size
   */
  static generateRandomPath(size) {
    const path = new Int16Array(size);
    for (let i = 0; i < size; i += 1) {
      const j = Math.floor(Math.random() * (i + 1));
      if (j !== i) {
        path[i] = path[j];
      }
      path[j] = i;
    }
    return path;
  }
}
