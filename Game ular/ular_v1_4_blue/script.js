// script.js — versi fix: suara & game over dinding aktif
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let score = 0;
let game = null;
let gameOver = false;

// ====== SOUND ======
const eatSound = document.getElementById("eatSound");
const hitSound = document.getElementById("hitSound");
const gameOverSound = document.getElementById("gameOverSound");
const bgMusic = document.getElementById("bgMusic");

// ====== SNAKE ======
let snake = [{ x: 9 * box, y: 10 * box }];
let currentDir = null;
let nextDir = null;

// ====== FOOD ======
let food = {
  x: Math.floor(Math.random() * 19 + 1) * box,
  y: Math.floor(Math.random() * 19 + 1) * box,
};

// ====== INPUT ======
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "arrowleft" || k === "a") requestDir("LEFT");
  if (k === "arrowup" || k === "w") requestDir("UP");
  if (k === "arrowright" || k === "d") requestDir("RIGHT");
  if (k === "arrowdown" || k === "s") requestDir("DOWN");
});

function requestDir(dir) {
  if (isOpposite(dir, currentDir)) return;
  nextDir = dir;
}

function isOpposite(a, b) {
  if (!a || !b) return false;
  return (
    (a === "LEFT" && b === "RIGHT") ||
    (a === "RIGHT" && b === "LEFT") ||
    (a === "UP" && b === "DOWN") ||
    (a === "DOWN" && b === "UP")
  );
}

// ====== COLLISION BODY ======
function collision(head, array) {
  return array.some((segment) => head.x === segment.x && head.y === segment.y);
}

// ====== DRAW LOOP ======
function draw() {
  // update direction
  if (nextDir) {
    if (!(snake.length > 1 && isOpposite(nextDir, currentDir))) {
      currentDir = nextDir;
    }
    nextDir = null;
  }

  if (!currentDir) {
    renderEverything();
    return;
  }

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (currentDir === "LEFT") headX -= box;
  if (currentDir === "UP") headY -= box;
  if (currentDir === "RIGHT") headX += box;
  if (currentDir === "DOWN") headY += box;

  // ====== CEK TABRAK DINDING ======
  if (
    headX < 0 ||
    headX >= canvas.width ||
    headY < 0 ||
    headY >= canvas.height
  ) {
    hitSound.play();
    gameOverSound.play();
    gameOver = true;
    clearInterval(game);
    game = null;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    renderEverything();
    return;
  }

  const newHead = { x: headX, y: headY };

  // ====== CEK TABRAK TUBUH ======
  if (collision(newHead, snake)) {
    hitSound.play();
    gameOverSound.play();
    gameOver = true;
    clearInterval(game);
    game = null;
    bgMusic.pause();
    bgMusic.currentTime = 0;
    renderEverything();
    return;
  }

  // ====== GERAK & MAKAN ======
  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    eatSound.play();
    score++;
    document.getElementById("score").innerText = score;
    placeFood();
  } else {
    snake.pop();
  }

  renderEverything();
}

// ====== GAMBAR ULAR & MAKANAN ======
function renderEverything() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // makanan
  ctx.fillStyle = "#facc15";
  ctx.fillRect(food.x, food.y, box, box);

  // ular
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#1e3a8a" : "#3b82f6";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "#60a5fa";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }
}

function placeFood() {
  let fx, fy;
  do {
    fx = Math.floor(Math.random() * (canvas.width / box)) * box;
    fy = Math.floor(Math.random() * (canvas.height / box)) * box;
  } while (snake.some((s) => s.x === fx && s.y === fy));
  food.x = fx;
  food.y = fy;
}

// ====== BUTTONS ======
document.getElementById("startBtn").addEventListener("click", () => {
  if (!game && !gameOver) {
    if (!currentDir) currentDir = "RIGHT";
    game = setInterval(draw, 100);
    bgMusic.volume = 0.35;
    bgMusic.loop = true;
    bgMusic.play().catch(() => {});
  }
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  if (game) {
    clearInterval(game);
    game = null;
    bgMusic.pause();
  } else if (!gameOver) {
    game = setInterval(draw, 100);
    bgMusic.play().catch(() => {});
  }
});

document.getElementById("restartBtn").addEventListener("click", () => {
  clearInterval(game);
  game = null;
  gameOver = false;
  score = 0;
  document.getElementById("score").innerText = score;
  snake = [{ x: 9 * box, y: 10 * box }];
  currentDir = null;
  nextDir = null;
  placeFood();
  bgMusic.pause();
  bgMusic.currentTime = 0;
  renderEverything();
});

// ====== INIT ======
renderEverything();
