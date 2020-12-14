import { Clock } from './clock.js';
import { CanvasNodeRenderer } from './path-based.js';
import { CanvasTemperatureRenderer, MinimizingSimulatedAnnealing } from './simulated-annealing.js';
import { TravelingSalesmanSimulation } from './traveling-salesman-simulation.js';

function integer(selector) {
  return Number.parseInt(document.querySelector(selector).value);
}

function float(selector) {
  return Number.parseFloat(document.querySelector(selector).value);
}

window.addEventListener('DOMContentLoaded', () => {
  const nodeRenderer = new CanvasNodeRenderer('#canvas-surface');
  const tempRenderer = new CanvasTemperatureRenderer('#canvas-surface');
  const clock = new Clock('#speed');
  const strategyChooserElement = document.querySelector('#strategy');
  const hideComparisonsElement = document.querySelector('#hide-comparisons');

  document
    .querySelector('#customization-form')
    .addEventListener('submit', e => {
      e.preventDefault();
      const numberOfPoints = integer('#number-of-points');
      const startTemp = float('#start-temp');
      const endTemp = float('#end-temp');
      const iterationsPerRound = integer('#number-of-iterations');
      const decay = float('#decay');

      const heuristic = new MinimizingSimulatedAnnealing(startTemp, endTemp, iterationsPerRound, decay);
      const simulation = new TravelingSalesmanSimulation(numberOfPoints, heuristic);
      simulation.strategy = strategyChooserElement.options[strategyChooserElement.selectedIndex].value;
      simulation.hideComparisons = hideComparisonsElement.checked;
      nodeRenderer.render(simulation);

      let inPropose = true;
      clock.callback = () => {
        if (inPropose) {
          simulation.propose();
          nodeRenderer.hideComparisons = hideComparisonsElement.checked;
          nodeRenderer.render(simulation);
          tempRenderer.render(heuristic.temperature);
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
