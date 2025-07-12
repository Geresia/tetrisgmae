// DOM
const playground = document.querySelector('.playground ul');
const scoreDisplay = document.querySelector('.score');

// Settings
const GAME_ROWS = 20;
const GAME_COLS = 10;

// Variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

// 게임판을 0/1 배열로 관리
const board = Array.from(
  { length: GAME_ROWS },
  () => Array(GAME_COLS).fill(0)
);

// 블록 모양 정의 (현재는 2×2 정사각 블록만)
const BLOCKS = {
  tree: [
    [[0, 0], [0, 1], [1, 0], [1, 1]],
    [], [], []
  ]
};

// 현재 움직이는 블록 정보
let movingItem = {
  type: 'tree',
  direction: 0,
  top: 0,
  left: 4,   // 가운데서 시작
};

// 초기화: DOM 그리드 생성
function init() {
  tempMovingItem = { ...movingItem };
  for (let i = 0; i < GAME_ROWS; i++) {
    prependNewLine();
  }
}

// 한 줄(ul>li)을 생성해서 playground에 붙이는 함수
function prependNewLine() {
  const li = document.createElement('li');
  const ul = document.createElement('ul');
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement('li');
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}

// 화면에 점수 표시
function showScore() {
  scoreDisplay.innerText = score;
}

// 보드+현재 블록을 모두 그리는 함수
function renderAll() {
  // 1) 기존 렌더링 모두 초기화
  playground.querySelectorAll('li li').forEach(cell => {
    cell.className = '';
  });

  // 2) 보드에 고정된 블록 그리기
  board.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        playground.children[y].children[x].classList.add('seized');
      }
    });
  });

  // 3) 현재 움직이는 블록 그리기
  renderBlocks();
  showScore();
}

// 현재 블록만 그리는 함수
function renderBlocks() {
  const { type, direction, top, left } = tempMovingItem;
  BLOCKS[type][direction].forEach(([rowOffset, colOffset]) => {
    const x = colOffset + left;
    const y = rowOffset + top;
    const rowEl = playground.children[y];
    if (!rowEl) return;
    const cell = rowEl.children[x];
    if (!cell) return;
    cell.classList.add(type);
  });
}

// 충돌 검사: 바닥에 닿았거나 이미 고정된 블록과 겹치는지
function checkCollision() {
  const { type, direction, top, left } = tempMovingItem;
  return BLOCKS[type][direction].some(([rowOffset, colOffset]) => {
    const x = colOffset + left;
    const y = rowOffset + top;
    // 범위 밖이거나 board[y][x]가 1인 경우 충돌
    return (
      x < 0 ||
      x >= GAME_COLS ||
      y >= GAME_ROWS ||
      board[y][x] === 1
    );
  });
}

// 블록을 한 칸 내리는 동작
function moveBlock() {
  tempMovingItem.top += 1;
  if (checkCollision()) {
    // 충돌 시 원위치 → 고정(seize)
    tempMovingItem.top -= 1;
    seizeBlock();
  }
  renderAll();
}

// 블록 고정하고, 한 줄 완성 체크→삭제→점수 반영 후 새 블록 생성
function seizeBlock() {
  const { type, direction, top, left } = tempMovingItem;
  BLOCKS[type][direction].forEach(([rowOffset, colOffset]) => {
    const x = colOffset + left;
    const y = rowOffset + top;
    board[y][x] = 1;
  });
  checkLine();
  generateNewBlock();
}

// 완성된 줄이 있으면 삭제하고 맨 위에 빈 줄 추가, 점수 +100
function checkLine() {
  board.forEach((row, y) => {
    if (row.every(val => val === 1)) {
      board.splice(y, 1);
      board.unshift(Array(GAME_COLS).fill(0));
      score += 100;
    }
  });
}

// 새 블록 시작: 이동 정보 초기화 + 인터벌 재시작
function generateNewBlock() {
  clearInterval(downInterval);
  movingItem = {
    type: 'tree',
    direction: 0,
    top: 0,
    left: 4,
  };
  tempMovingItem = { ...movingItem };
  downInterval = setInterval(moveBlock, duration);
}

// 키보드 화살표로 블록 좌우·하단 이동 제어
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':
      tempMovingItem.left -= 1;
      if (checkCollision()) tempMovingItem.left += 1;
      break;
    case 'ArrowRight':
      tempMovingItem.left += 1;
      if (checkCollision()) tempMovingItem.left -= 1;
      break;
    case 'ArrowDown':
      moveBlock();
      break;
  }
  renderAll();
});

// 게임 시작
init();
generateNewBlock();
