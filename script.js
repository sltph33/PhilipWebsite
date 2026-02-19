const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = ['#d60a2e', '#0057b8', '#00a859', '#ffcf00', '#f57f17', '#8e24aa', '#00acc1'];

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
];

let grid;
let active;
let score;
let gameOver;
let dropCounter;
let lastTime;

function createGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomBrick() {
  const index = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[index],
    color: COLORS[index],
    x: Math.floor(COLS / 2) - 1,
    y: 0,
  };
}

function drawStud(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

  context.strokeStyle = '#1d1d1d';
  context.lineWidth = 2;
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

  const centerX = x * BLOCK_SIZE + BLOCK_SIZE / 2;
  const centerY = y * BLOCK_SIZE + BLOCK_SIZE / 2;
  context.beginPath();
  context.arc(centerX, centerY, BLOCK_SIZE * 0.18, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255,255,255,0.55)';
  context.fill();
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x]) {
        drawStud(x, y, grid[y][x]);
      }
    }
  }

  active.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawStud(active.x + x, active.y + y, active.color);
      }
    });
  });
}

function collide(testX = active.x, testY = active.y, testShape = active.shape) {
  for (let y = 0; y < testShape.length; y++) {
    for (let x = 0; x < testShape[y].length; x++) {
      if (!testShape[y][x]) continue;
      const newX = testX + x;
      const newY = testY + y;

      if (newX < 0 || newX >= COLS || newY >= ROWS) {
        return true;
      }
      if (newY >= 0 && grid[newY][newX]) {
        return true;
      }
    }
  }
  return false;
}

function merge() {
  active.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        grid[active.y + y][active.x + x] = active.color;
      }
    });
  });
}

function clearLines() {
  let lines = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (grid[y].every((cell) => cell)) {
      grid.splice(y, 1);
      grid.unshift(Array(COLS).fill(0));
      lines++;
      y++;
    }
  }
  if (lines > 0) {
    score += lines * 100;
    scoreElement.textContent = score;
  }
}

function rotate(shape) {
  return shape[0].map((_, index) => shape.map((row) => row[index]).reverse());
}

function drop() {
  if (!collide(active.x, active.y + 1)) {
    active.y++;
    return;
  }

  merge();
  clearLines();
  active = randomBrick();

  if (collide()) {
    gameOver = true;
    alert(`Game over! Final score: ${score}`);
  }
}

function update(time = 0) {
  if (gameOver) return;

  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > 700) {
    drop();
    dropCounter = 0;
  }

  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', (event) => {
  if (gameOver) return;

  if (event.key === 'ArrowLeft' && !collide(active.x - 1, active.y)) {
    active.x--;
  } else if (event.key === 'ArrowRight' && !collide(active.x + 1, active.y)) {
    active.x++;
  } else if (event.key === 'ArrowDown') {
    drop();
  } else if (event.key === 'ArrowUp') {
    const rotated = rotate(active.shape);
    if (!collide(active.x, active.y, rotated)) {
      active.shape = rotated;
    }
  }
  draw();
});

function startGame() {
  grid = createGrid();
  active = randomBrick();
  score = 0;
  gameOver = false;
  dropCounter = 0;
  lastTime = 0;
  scoreElement.textContent = score;
  draw();
  requestAnimationFrame(update);
}

restartBtn.addEventListener('click', startGame);
startGame();
