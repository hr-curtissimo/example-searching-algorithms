let startTemperature;
let numberOfPoints;
let numberOfIterations;
let currentDistanceElement;
let newDistanceElement;
let probabilityElement;
let shouldSwapElement;
let temperatureElement;
let deltaElement;
let currentDistance;
let newDistance;
let speed = 500;
let time;
let iteration;
let endTemp;
let ctx;
let points = [];
let edges = [];
const MIN_X = 5;
const MAX_X = 795;
const MIN_Y = 5;
const MAX_Y = 395;

/**
 *
 * @param {number[]} arr
 */
function buildRandomPath() {
  edges = [];
  for (let i = 0; i < numberOfPoints; i += 1) {
    edges.push(i);
  }

  const path = [];
  let currentNode = 0;
  edges.splice(0, 1);
  while (edges.length > 0) {
    const nextNode = Math.floor(Math.random() * edges.length);
    path.push(edges[nextNode]);
    currentNode = edges[nextNode];
    edges.splice(nextNode, 1);
  }
  path.push(0);
  edges = path;
}

function probability(delta) {
  return Math.exp(delta / schedule(time));
}

function schedule(t) {
  return startTemperature / (Math.log2(1 + t) + 1);
}

function distance(from, to) {
  return Math.sqrt(Math.pow(from[0] - to[0], 2) + Math.pow(from[1] - to[1], 2));
}

function totalDistance(edges, points) {
  let total = 0;
  for (let i = 0; i < edges.length - 1; i += 1) {
    const from = points[edges[i]];
    const to = points[edges[i + 1]];
    total += distance(from, to);
  }
  total += distance(points[edges[edges.length - 1]], points[edges[0]]);
  return total;
}

function draw() {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, MAX_X + MIN_X, MAX_Y + MIN_Y);

  for (let point of points) {
    drawPoint(point, '#666666');
  }
  for (let i = 0; i < edges.length - 1; i += 1) {
    const from = points[edges[i]];
    const to = points[edges[i + 1]];
    drawLine(from, to, '#666666');
  }
  drawLine(points[edges[edges.length - 1]], points[edges[0]], '#666666');
}

function drawLine(from, to, color, width = 1) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.stroke();
}

function drawPoint(point, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(point[0], point[1], 5, 5, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function disableRunButton() {
  document
    .querySelector('#run')
    .disabled = true;
  document
    .querySelector('#run')
    .classList
    .add('disabled');
  document
    .querySelector('#run')
    .classList
    .remove('button-primary');
}

function enableRunButton() {
  document
    .querySelector('#run')
    .disabled = false;
  document
    .querySelector('#run')
    .classList
    .remove('disabled');
  document
    .querySelector('#run')
    .classList
    .add('button-primary');
}

function run() {
  iteration = 0;
  time = 0;
  startTemperature = Number.parseInt(document.querySelector('#start-temp').value);
  numberOfPoints = Number.parseInt(document.querySelector('#number-of-points').value);
  numberOfIterations = Number.parseInt(document.querySelector('#number-of-iterations').value);
  endTemp = Number.parseInt(document.querySelector('#end-temp').value);
  points = [];
  for (let i = 0; i < numberOfPoints; i += 1) {
    const x = Math.floor(Math.random() * (MAX_X - MIN_X)) + MIN_X;
    const y = Math.floor(Math.random() * (MAX_Y - MIN_Y)) + MIN_Y;
    points.push([x, y]);
  }

  buildRandomPath();

  currentDistance = totalDistance(edges, points);

  draw();

  iterate();
}

function report(n) {
  return Math.round(n * 100) / 100;
}

function iterate() {
  if (schedule(time) < endTemp) {
    return;
  }
  currentDistanceElement.innerHTML = report(currentDistance);
  iteration += 1;
  if (iteration === numberOfIterations) {
    time += 1;
    iteration = 0;
  }
  temperatureElement.innerHTML = report(schedule(time));
  setTimeout(chooseNodes, 0);
}

function chooseNodes() {
  let node1 = Math.floor(Math.random() * points.length);
  let node2 = Math.floor(Math.random() * points.length);
  while (Math.abs(node1 - node2) <= 2) {
    node1 = Math.floor(Math.random() * points.length);
    node2 = Math.floor(Math.random() * points.length);
  }
  if (node1 > node2) {
    while (node1 < edges.length) {
      edges.unshift(edges.pop());
      node1 += 1;
      node2 += 1;
    }
    node1 = 0;
  }

  const newEdges = [...edges];
  for (let i = 0; i < Math.floor((node2 - node1) / 2); i += 1) {
    let s = newEdges[node1 + i + 1];
    newEdges[node1 + i + 1] = newEdges[node2 - i - 1];
    newEdges[node2 - i - 1] = s;
  }

  // if (iteration === 0) {
  drawPoint(points[edges[node1]], 'red');
  drawPoint(points[edges[node2]], 'red');
  for (let i = node1; i < node2; i += 1) {
    drawLine(points[edges[i]], points[edges[i + 1]], 'red', 4);
  }
  for (let i = node1; i < node2; i += 1) {
    drawLine(points[newEdges[i]], points[newEdges[i + 1]], 'yellow', 2);
  }
  // }
  newDistance = totalDistance(newEdges, points);
  newDistanceElement.innerHTML = report(newDistance);

  deltaElement.innerHTML = report(currentDistance - newDistance);

  const p = probability(newDistance - currentDistance);
  const threshold = Math.random();
  probabilityElement.innerHTML = Math.min(Math.floor(p * 100), 100) + '% > ' + Math.floor(threshold * 100) + '%';

  if (newDistance < currentDistance) {
    shouldSwapElement.innerHTML = 'Lower distance';
  } else if (p <= threshold) {
    shouldSwapElement.innerHTML = 'Probability';
  } else {
    shouldSwapElement.innerHTML = 'No';
  }

  setTimeout(() => {
    if (schedule(time) < 0.001) { return; }
    if (p >= threshold || newDistance < currentDistance) {
      currentDistance = newDistance;
      edges = newEdges;
    }
    // if (iteration === 0) { draw(); }
    draw();
    iterate();
  }, speed);
}

function init() {
  document
    .querySelector('#customization-form')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      this.checkValidity() && run();
    });
  document
    .querySelector('#speed')
    .addEventListener('change', function () {
      speed = 1000 - Number.parseInt(this.value);
    })
  currentDistanceElement = document.querySelector('#current-distance');
  newDistanceElement = document.querySelector('#new-distance');
  probabilityElement = document.querySelector('#probability');
  shouldSwapElement = document.querySelector('#should-swap');
  temperatureElement = document.querySelector('#temperature');
  deltaElement = document.querySelector('#delta');

  const map = document.querySelector('#map');
  map.setAttribute('width', (MAX_X + MIN_X) + 'px');
  map.setAttribute('height', (MAX_Y + MIN_Y) + 'px');
  ctx = map.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 400, 800);

  setTimeout(run, 0);
}

window.addEventListener('DOMContentLoaded', init);
