export class MinimizingGeneticAlgorithm {
  constructor(numberOfTrials, mutationProbability) {
    this._numberOfTrials = numberOfTrials;
    this._currentTrial = 0;
    this.mutationProbability = mutationProbability;
  }

  evaluate(currents, proposals) {
    this._currentTrial += 1;
    const c = MinimizingGeneticAlgorithm.sortWithIndexes(currents);
    const p = MinimizingGeneticAlgorithm.sortWithIndexes(proposals);
    const results = [new Array(c.length), new Array(p.length)];
    for (let i = 0; i < c.length; i += 1) {
      results[0][i] = false;
    }
    for (let j = 0; j < p.length; j += 1) {
      results[1][j] = false;
    }

    for (let i = 0, j = 0, k = 0; k < c.length; k += 1) {
      if (c[i][0] < p[j][0]) {
        results[0][c[i][1]] = true;
        i += 1;
      } else if (c[i][0] > p[j][0]) {
        results[1][p[j][1]] = true;
        j += 1;
      } else {
        results[1][p[j][1]] = true;
        j += 1;
        i += 1;
      }
    }
    return results;
  }

  get done() {
    return this._currentTrial >= this._numberOfTrials;
  }

  static sortWithIndexes(a) {
    const result = [];
    for (let i = 0; i < a.length; i += 1) {
      result.push([a[i], i]);
    }
    result.sort((x, y) => x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0);
    return result;
  }
}
