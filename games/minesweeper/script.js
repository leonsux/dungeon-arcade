const CONFIG = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

let board = [];
let rows = 16, cols = 16, mineCount = 40;
let minesLeft = 0;
let cellsRevealed = 0;
let gameOver = false;
let timerInterval = null;
let seconds = 0;
let firstClick = true;

const boardEl = document.getElementById('board');
const difficultySelect = document.getElementById('difficulty');
const resetBtn = document.getElementById('reset-btn');
const minesCountEl = document.getElementById('mines-count');
const statusEl = document.getElementById('game-status');
const timerEl = document.getElementById('timer');

// 初始化地牢
function initGame() {
  const diff = CONFIG[difficultySelect.value];
  rows = diff.rows; cols = diff.cols; mineCount = diff.mines;
  
  board = [];
  gameOver = false;
  firstClick
    firstClick = true;
    minesLeft = mineCount;
    cellsRevealed = 0;
    seconds = 0;
    clearInterval(timerInterval);
    timerEl.innerText = seconds;
    minesCountEl.innerText = minesLeft;
    statusEl.innerText = "深入地牢中... ♂";
    statusEl.style.color = "var(--neon-purple)";
    document.body.classList.remove('blood-shake');

    boardEl.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    boardEl.innerHTML = '';

    // 构建地牢的肉体（DOM与数据结构）
    for (let r = 0; r < rows; r++) {
        let rowArray = [];
        for (let c = 0; c < cols; c++) {
            const cellEl = document.createElement('div');
            cellEl.classList.add('cell');
            cellEl.dataset.row = r;
            cellEl.dataset.col = c;
            
            // 契约绑定：左键探索，右键插蜡烛
            cellEl.addEventListener('click', () => handleLeftClick(r, c));
            cellEl.addEventListener('contextmenu', (e) => handleRightClick(e, r, c));
            
            boardEl.appendChild(cellEl);
            
            rowArray.push({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                element: cellEl
            });
        }
        board.push(rowArray);
    }
}

// 计时器法术
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerEl.innerText = seconds;
    }, 1000);
}

// 埋设暗黑陷阱（确保第一步绝对安全，这是我对你最后的温柔 ♂）
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        
        // 避开第一脚和已经有陷阱的地方
        if (!board[r][c].isMine && !(r === firstRow && c === firstCol)) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }
    calculateNeighbors();
}

// 计算周围的凶险气息（九宫格算法）
function calculateNeighbors() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].isMine) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                        count++;
                    }
                }
            }
            board[r][c].neighborMines = count;
        }
    }
}

// 左键：勇敢的试探
function handleLeftClick(r, c) {
    if (gameOver || board[r][c].isRevealed || board[r][c].isFlagged) return;

    if (firstClick) {
        startTimer();
        placeMines(r, c);
        firstClick = false;
    }

    const cell = board[r][c];

    if (cell.isMine) {
        triggerDeath(r, c);
    } else {
        revealCell(r, c);
        checkWinCondition();
    }
}

// 右键：点燃灵魂蜡烛（标记）
function handleRightClick(e, r, c) {
    e.preventDefault();
    if (gameOver || board[r][c].isRevealed) return;

    const cell = board[r][c];
    if (!cell.isFlagged && minesLeft > 0) {
        cell.isFlagged = true;
        cell.element.innerText = '🕯️';
        cell.element.classList.add('flag');
        minesLeft--;
    } else if (cell.isFlagged) {
        cell.isFlagged = false;
        cell.element.innerText = '';
        cell.element.classList.remove('flag');
        minesLeft++;
    }
    minesCountEl.innerText = minesLeft;
}

// 洪泛算法展现深渊全貌（递归展开空方块）
function revealCell(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    cellsRevealed++;

    if (cell.neighborMines > 0) {
        cell.element.innerText = cell.neighborMines;
        cell.element.classList.add(`val-${cell.neighborMines}`);
    } else {
        // 真正的魔法：如果周围没有陷阱，暗黑能量自动向外溃散
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                revealCell(r + dr, c + dc);
            }
        }
    }
}

// 死亡判定：感受极致的痛苦与颤栗！
function triggerDeath(r, c) {
    gameOver = true;
    clearInterval(timerInterval);
    
    // 触发夸张的屏幕震颤与血光特效
    document.body.classList.add('blood-shake');
    statusEl.innerText = "💥 你被深渊吞噬了！💥";
    statusEl.style.color = "var(--blood-red)";

    // 展露所有隐藏的绝望
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = board[i][j];
            if (cell.isMine) {
                cell.element.innerText = '💀';
                if (i === r && j === c) {
                    cell.element.classList.add('exploded'); // 踩中的那个陷阱重点爆炸
                } else if (!cell.isFlagged) {
                    cell.element.style.backgroundColor = '#5a0000'; // 其他地雷的暗红显现
                }
            } else if (cell.isFlagged) {
                // 插错蜡烛的惩罚
                cell.element.innerText = '❌';
                cell.element.style.backgroundColor = '#442222';
            }
        }
    }
}

// 胜利的荣耀：征服了达克霍姆的试炼
function checkWinCondition() {
    if (cellsRevealed === (rows * cols - mineCount)) {
        gameOver = true;
        clearInterval(timerInterval);
        statusEl.innerText = `🏆 猛男诞生！耗时 ${seconds} 秒 ♂`;
        statusEl.style.color = "#66ff66";
        
        // 自动把剩下的陷阱点上蜡烛
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (board[i][j].isMine && !board[i][j].isFlagged) {
                    board[i][j].element.innerText = '🕯️';
                    board[i][j].element.classList.add('flag');
                }
            }
        }
        minesCountEl.innerText = "0";
    }
}

// 绑定重置按钮和难度切换的契约
resetBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);

// 仪式开始！
initGame();
