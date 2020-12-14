import { Clock } from './clock.js';
import { CanvasNodeRenderer } from './path-based.js';
import { MinimizingGeneticAlgorithm } from './genetic-algorithm.js';
import { TravelingSalesmanSimulation } from './traveling-salesman-simulation.js';

function integer(selector) {
  return Number.parseInt(document.querySelector(selector).value);
}

function float(selector) {
  return Number.parseFloat(document.querySelector(selector).value);
}

window.addEventListener('DOMContentLoaded', () => {
  const nodeRenderer = new CanvasNodeRenderer('#canvas-surface');
  const clock = new Clock('#speed');
  const strategyChooserElement = document.querySelector('#strategy');

  document
    .querySelector('#customization-form')
    .addEventListener('submit', e => {
      e.preventDefault();
      const numberOfPoints = integer('#number-of-points');
      const poolSize = integer('#pool-size');
      const numberOfTrials = integer('#number-of-trials');
      const mutationProbability = float('#mutation-probability');

      const heuristic = new MinimizingGeneticAlgorithm(numberOfTrials, mutationProbability);
      const simulation = new TravelingSalesmanSimulation(numberOfPoints, heuristic, poolSize);
      simulation.strategy = strategyChooserElement[strategyChooserElement.selectedIndex].value;
      nodeRenderer.hideComparisons = true;
      nodeRenderer.render(simulation);

      let inPropose = true;
      clock.callback = () => {
        if (inPropose) {
          simulation.propose();
          nodeRenderer.render(simulation);
        } else {
          simulation.decide();
        }
        inPropose = !inPropose;
        if (simulation.done) {
          nodeRenderer.render(simulation);
          clock.callback = null;
        }
      };
      if (clock.paused) {
        document.querySelector('#pause').innerHTML = 'Pause';
      }
      clock.resume();
    });

  document
    .querySelector('#pause')
    .addEventListener('click', function () {
      if (clock.paused) {
        this.innerHTML = 'Pause';
        clock.resume();
      } else {
        this.innerHTML = 'Resume';
        clock.pause();
      }
    });
});
