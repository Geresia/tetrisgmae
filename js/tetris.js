// — 설정 값 —
const ROWS = 20;
const COLS = 10;
const DROP_INTERVAL = 500;  // ms

// — DOM 참조 —
const playground = document.querySelector('.playground ul');
const scoreEl    = document.querySelector('.score');

let board;         // 2D 배열
let current;       // 현재 블록 상대 좌표
let pos;           // {row, col}
let score;
let gameInterval;

// — 초기화 함수 —
function init() {
  // 보드 배열 초기화
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  // DOM 그리드 생성
  for (let r = 0; r < ROWS; r++) {
    const row = document.createElement('li');
    for (let c = 0; c < COLS; c++) {
      row.appendChild(document.createElement('li'));
    }
    playground.appendChild(row);
  }
  // 점수 초기화
  score = 0;
  scoreEl.innerText = `Score: ${score}`;
  // 첫 블록 생성 & 자동 낙하
  spawnBlock();
  gameInterval = setInterval(drop, DROP_INTERVAL);
  document.addEventListener('keydown', handleKey);
}

// — O 블록 스폰 —
function spawnBlock() {
  current = [
    [0, 0], [0, 1],
    [1, 0], [1, 1]
  ];
  pos = { row: 0, col: Math.floor((COLS - 2) / 2) };
  if (isCollision(pos.row, pos.col)) {
    clearInterval(gameInterval);
    alert('게임 오버! 최종 점수: ' + score);
    return;
  }
  render();
}

// — 충돌 검사 —
function isCollision(r, c) {
  return current.some(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;
    // 좌우 벽/바닥 충돌
    if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
    // 고정 블록 충돌
    if (nr >= 0 && board[nr][nc] === 1) return true;
    return false;
  });
}

// — 한 칸 낙하 —
function drop() {
  pos.row++;
  if (isCollision(pos.row, pos.col)) {
    pos.row--;
    fixBlock();
    clearLines();
    spawnBlock();
    return;
  }
  render();
}

// — 블록 고정 —
function fixBlock() {
  current.forEach(([dr, dc]) => {
    const rr = pos.row + dr;
    const cc = pos.col + dc;
    if (rr >= 0) board[rr][cc] = 1;
  });
}

// — 줄 삭제 & 점수 +1 —
function clearLines() {
  let lines = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every(v => v === 1)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(0));
      lines++;
    }
  }
  if (lines > 0) {
    score += lines;
    scoreEl.innerText = `Score: ${score}`;
  }
}

// — 화면 렌더 —
function render() {
  // 1) 모든 셀 초기화
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = playground.children[r].children[c];
      cell.className = board[r][c] ? 'fixed' : '';
    }
  }
  // 2) 현재 블록
  current.forEach(([dr, dc]) => {
    const rr = pos.row + dr;
    const cc = pos.col + dc;
    if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
      playground.children[rr].children[cc]
                .classList.add('moving');
    }
  });
}

// — 도형 정의 (회전 없이 단일 방향) —
const PIECES = {
  I: [[0,1],[1,1],[2,1],[3,1]],
  J: [[0,0],[1,0],[2,0],[2,1]],
  L: [[0,1],[1,1],[2,1],[2,0]],
  O: [[0,0],[0,1],[1,0],[1,1]],
  S: [[0,1],[0,2],[1,0],[1,1]],
  T: [[0,1],[1,0],[1,1],[1,2]],
  Z: [[0,0],[0,1],[1,1],[1,2]]
};

// — 기존 변수 선언 등 생략 …

// — spawnBlock() 수정 —  
function spawnBlock() {
  // 1) 랜덤 도형 선택
  const types = Object.keys(PIECES);
  current = PIECES[ types[Math.floor(Math.random() * types.length)] ];
  // 2) 시작 위치(가로 중앙)
  pos = {
    row: 0,
    col: Math.floor((COLS - 4) / 2)  // 넉넉히 중앙(3)로 설정
  };
  // 3) 스폰 즉시 충돌 검사 → 게임 오버
  if (isCollision(pos.row, pos.col)) {
    clearInterval(gameInterval);
    alert('게임 오버! 최종 점수: ' + score);
    return;
  }
  // 4) 화면에 그리기
  render();
}

// — 키 입력 제어 —
function handleKey(e) {
  switch (e.key) {
    case 'ArrowLeft':
      if (!isCollision(pos.row, pos.col - 1)) {
        pos.col--; render();
      }
      break;
    case 'ArrowRight':
      if (!isCollision(pos.row, pos.col + 1)) {
        pos.col++; render();
      }
      break;
    case 'ArrowDown':
      drop();
      break;
  }
}

// — 시작 —
window.addEventListener('DOMContentLoaded', init);
