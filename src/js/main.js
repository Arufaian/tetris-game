import "../css/style.css";
import * as tetrominoes from "./tetrominoes";

const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const row = 20;
const col = 10;
const sq = 20;
const VACANT = "#131842";

// draw a square

function drawSqure(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * sq, y * sq, sq, sq);

  ctx.strokeStyle = "#FBF6E2";
  ctx.strokeRect(x * sq, y * sq, sq, sq);
}

// create the board
let board = [];
for (let r = 0; r < row; r++) {
  board[r] = [];

  for (let c = 0; c < col; c++) {
    board[r][c] = VACANT;
  }
}

// draw the board
function drawBoard() {
  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      drawSqure(c, r, board[r][c]);
    }
  }
}

drawBoard();

// the piece and their color

const PIECES = [
  [tetrominoes.Z, "#B31312"],
  [tetrominoes.S, "#219C90"],
  [tetrominoes.T, "#E9B824"],
  [tetrominoes.O, "#5CD2E6"],
  [tetrominoes.L, "#3D246C"],
  [tetrominoes.I, "#A084E8"],
  [tetrominoes.J, "#F86F03"],
];

// generate random piece

function randomPiece() {
  let r = Math.floor(Math.random() * PIECES.length);
  return new piece(PIECES[r][0], PIECES[r][1]);
}
let p = randomPiece();

// object piece
function piece(tetromino, color) {
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoNumber = 0;
  this.activeTetromino = tetromino[this.tetrominoNumber];

  //   control coordinate the piece
  this.x = 0;
  this.y = 0;
}

// fill function
piece.prototype.fill = function (color) {
  for (let r = 0; r < this.activeTetromino.length; r++) {
    for (let c = 0; c < this.activeTetromino.length; c++) {
      if (this.activeTetromino[r][c]) {
        drawSqure(this.x + c, this.y + r, color);
      }
    }
  }
};

// draw piece to the board
piece.prototype.draw = function () {
  this.fill(this.color);
};

// undraw a piece
piece.prototype.unDraw = function () {
  this.fill(VACANT);
};

p.draw();

// move down the pieces
piece.prototype.moveDown = function () {
  if (!this.collition(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // we lock the piece and generate the new one
    p = randomPiece();
    this.lock();
  }
};

// move right the pieces
piece.prototype.moveRight = function () {
  if (!this.collition(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  } else {
  }
};

// move left the pieces
piece.prototype.moveLeft = function () {
  if (!this.collition(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  } else {
  }
};

// rotate the piece
piece.prototype.rotate = function () {
  const nextPattern =
    this.tetromino[(this.tetrominoNumber + 1) % this.tetromino.length];

  let kick = 0;

  // Cek jika rotasi langsung tanpa pergeseran sudah memungkinkan
  if (!this.collition(0, 0, nextPattern)) {
    // Jika tidak ada tabrakan, lanjutkan rotasi tanpa geser
    this.applyRotation(nextPattern);
    return;
  }

  // Jika mepet ke dinding kiri atau kanan, tentukan apakah perlu geser
  const isTouchingLeft = this.x < 0;
  const isTouchingRight = this.x + nextPattern[0].length > col;

  if (isTouchingLeft) {
    kick = 1; // Geser ke kanan
  } else if (isTouchingRight) {
    kick = -1; // Geser ke kiri
  }

  // Coba geser satu kali dengan kick
  if (!this.collition(kick, 0, nextPattern)) {
    this.x += kick;
    this.applyRotation(nextPattern);
  } else {
    console.log("Rotation failed due to collision after adjusting.");
  }
};

// Fungsi untuk menerapkan rotasi
piece.prototype.applyRotation = function (nextPattern) {
  this.unDraw();
  this.tetrominoNumber = (this.tetrominoNumber + 1) % this.tetromino.length;
  this.activeTetromino = nextPattern;
  this.draw();
};

// remove full rows
function removeFullRows() {
  for (let r = 0; r < row; r++) {
    if (board[r].every((cell) => cell !== VACANT)) {
      for (let y = r; y > 0; y--) {
        board[y] = [...board[y - 1]]; // Geser baris ke bawah
      }
      board[0] = Array(col).fill(VACANT); // Isi baris teratas
    }
  }
  // Gambar ulang papan setelah perubahan
  drawBoard();
}

// function lock
piece.prototype.lock = function () {
  for (let r = 0; r < this.activeTetromino.length; r++) {
    for (let c = 0; c < this.activeTetromino[r].length; c++) {
      if (!this.activeTetromino[r][c]) continue;

      let newX = this.x + c;
      let newY = this.y + r;

      console.log(newY);

      // Cek apakah tetromino sudah mencapai batas atas papan
      if (newY <= 0) {
        alert("Game Over! Anda telah kalah.");
        gameOver = true; // Set status game over
        return; // Hentikan eksekusi lebih lanjut
      }

      if (newY < row && newX >= 0 && newX < col) {
        board[newY][newX] = this.color; // Kunci tetromino di papan
      }
    }
  }

  // Hapus baris penuh
  removeFullRows();

  // Hasilkan tetromino baru jika permainan belum berakhir
  if (!gameOver) {
    p = randomPiece();
  }
};

// collision  function
piece.prototype.collition = function (xOffset, yOffset, piece) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      // Skip square kosong (0)
      if (!piece[r][c]) {
        continue;
      }

      // Koordinat baru setelah pergerakan
      const newX = this.x + c + xOffset;
      const newY = this.y + r + yOffset;

      // Cek jika posisi di luar batas papan
      if (newX < 0 || newX >= col || newY >= row) {
        return true;
      }

      // Lewati baris di atas papan
      if (newY < 0) {
        return true;
      }

      // Cek jika ada kotak yang sudah terisi di papan
      if (board[newY][newX] !== VACANT) {
        return true;
      }
    }
  }

  // Tidak ada tabrakan
  return false;
};

// CONTROL the piece
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft") {
    p.moveLeft();
    dropStart = Date.now();
  } else if (e.key === "ArrowUp") {
    p.rotate();
    dropStart = Date.now();
  } else if (e.key === "ArrowRight") {
    p.moveRight();
    dropStart = Date.now();
  } else if (e.key === "ArrowDown") {
    p.moveDown();
    dropStart = Date.now();
  }
});

// drop the piece every 1 sec
let dropStart = Date.now();
let gameOver = false;
function drop() {
  if (gameOver) {
    restartGame();
    return;
  } // Jika game over, hentikan eksekusi

  let now = Date.now();
  let delta = now - dropStart;

  if (delta > 1000) {
    p.unDraw();
    p.moveDown();
    dropStart = Date.now();
  }

  // Jalankan drop() lagi jika permainan belum berakhir
  requestAnimationFrame(drop);
}

drop();

// restart game
function restartGame() {
  location.reload();
}
