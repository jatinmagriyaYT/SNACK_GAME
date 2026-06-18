const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start')
const modal = document.querySelector('.modal')
const startGameModal = document.querySelector(".start-game")
const gameOverModal = document.querySelector(".game-over")
const restartButton = document.querySelector(".btn-restart")
const continueBtn = document.querySelector("#continueBtn")
const p_score = document.querySelector('#score')
const h_Score = document.querySelector("#high-score")
const t_Element = document.querySelector("#time")
const pauseBtn = document.querySelector("#pauseBtn")
const blockHeight = 30
const blockWidth = 30
const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)
const blocks = [];

let snake = [
    {
        x: 1, y: 3
    }
];
let direction = "right";
let intervalID = null;
let timerIntervalID = null;

// Multiple foods array - Each food can be consumed and relocated independently
let foods = [];
const FOOD_COUNT = 10; // Number of foods on board
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let timeElement = `00:00`;
let isPaused = false; // Pause state

// Game continue feature - Store snake history (last 50 states)
let snakeHistory = [];
let directionHistory = []; // Store direction history
const HISTORY_SIZE = 50;
const CONTINUE_PENALTY_SCORE = 10; // Points deducted when continue
const CONTINUE_PENALTY_TAIL = 10; // Tail segments removed when continue
const CONTINUE_BACK_STEPS = 5; // How many steps to go back
let gameOverDirection = "right"; // Store direction at game over

// Touch gesture variables for mobile support
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

h_Score.innerHTML = highScore

// ============================================================
// FUNCTION: Get all available empty blocks (not occupied by snake or other foods)
// ============================================================
function getAvailableBlocks() {
    const availableBlocks = [];
    
    // Loop through all blocks
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Check if block is not occupied by snake
            const isSnakeBody = snake.some(segment => segment.x === row && segment.y === col);
            
            // Check if block is not occupied by existing foods
            const isFoodBlock = foods.some(food => food.x === row && food.y === col);
            
            if (!isSnakeBody && !isFoodBlock) {
                availableBlocks.push({ x: row, y: col });
            }
        }
    }
    
    return availableBlocks;
}

// ============================================================
// FUNCTION: Generate multiple foods at different locations
// ============================================================
function generateMultipleFoods() {
    // Clear all previous foods from board
    foods.forEach(food => {
        if (blocks[`${food.x}-${food.y}`]) {
            blocks[`${food.x}-${food.y}`].classList.remove("food");
        }
    });
    
    foods = [];
    
    // Generate FOOD_COUNT number of foods
    for (let i = 0; i < FOOD_COUNT; i++) {
        const availableBlocks = getAvailableBlocks();
        
        // If no blocks available, stop generating more foods
        if (availableBlocks.length === 0) {
            break;
        }
        
        // Pick random available block
        const randomIndex = Math.floor(Math.random() * availableBlocks.length);
        const newFood = availableBlocks[randomIndex];
        
        foods.push(newFood);
        
        // Display food on board
        if (blocks[`${newFood.x}-${newFood.y}`]) {
            blocks[`${newFood.x}-${newFood.y}`].classList.add("food");
        }
    }
}

// ============================================================
// FUNCTION: Relocate a single food to a new random location
// ============================================================
function relocateFood(foodIndex) {
    // Remove old food from board
    if (blocks[`${foods[foodIndex].x}-${foods[foodIndex].y}`]) {
        blocks[`${foods[foodIndex].x}-${foods[foodIndex].y}`].classList.remove("food");
    }
    
    // Get available blocks
    const availableBlocks = getAvailableBlocks();
    
    if (availableBlocks.length === 0) {
        // No space available, remove this food
        foods.splice(foodIndex, 1);
        return;
    }
    
    // Pick random available block
    const randomIndex = Math.floor(Math.random() * availableBlocks.length);
    foods[foodIndex] = availableBlocks[randomIndex];
    
    // Display food at new location
    if (blocks[`${foods[foodIndex].x}-${foods[foodIndex].y}`]) {
        blocks[`${foods[foodIndex].x}-${foods[foodIndex].y}`].classList.add("food");
    }
}

// ============================================================
// FUNCTION: Check if snake head collides with any food
// ============================================================
function checkFoodCollision(head) {
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        if (head.x === food.x && head.y === food.y) {
            // Add head to snake using unshift() - grow the snake
            snake.unshift(head);
            
            // Increment score
            score += 1;
            p_score.innerHTML = score;
            
            // Relocate only the consumed food to a new position
            relocateFood(i);
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore.toString());
                h_Score.innerHTML = highScore;
            }
            
            return true;
        }
    }
    return false;
}

// Create game board grid with all blocks
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div')
        block.classList.add("box")
        board.appendChild(block)
        // block.innerText = `${row}-${col}`
        blocks[`${row}-${col}`] = block
    }
}

// Render logic 
function render() {
    let head = null

    // Calculate new head position
    if (direction === "left") {
        head = { x: snake[0].x, y: snake[0].y - 1 }
    }
    else if (direction === "right") {
        head = { x: snake[0].x, y: snake[0].y + 1 }
    }
    else if (direction === "up") {
        head = { x: snake[0].x - 1, y: snake[0].y }
    }
    else if (direction === "down") {
        head = { x: snake[0].x + 1, y: snake[0].y }
    }

    // Wall collision logic
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalID)
        clearInterval(timerIntervalID)
        
        // Store direction for continue feature
        gameOverDirection = direction;

        modal.style.display = "flex"
        startGameModal.style.display = "none"
        gameOverModal.style.display = "flex"
        return;
    }

    // Self collision 
    const selfCollision = snake.some(segment => segment.x === head.x && segment.y === head.y)
    if (selfCollision) {
        clearInterval(intervalID)
        clearInterval(timerIntervalID)
        
        // Store direction for continue feature
        gameOverDirection = direction;
        
        modal.style.display = "flex"
        startGameModal.style.display = "none"
        gameOverModal.style.display = "flex"
        return;
    }

    // Store tail segment before moving (so we can clear it)
    const tailSegment = snake[snake.length - 1];

    // Check food collision - this will unshift head if food consumed
    const foodConsumed = checkFoodCollision(head);

    // If no food consumed, move snake normally (unshift head, pop tail)
    if (!foodConsumed) {
        snake.unshift(head);
        snake.pop();
    }

    // Clear the tail segment's classes (it's been removed from snake array)
    if (tailSegment && blocks[`${tailSegment.x}-${tailSegment.y}`]) {
        blocks[`${tailSegment.x}-${tailSegment.y}`].classList.remove("fill");
        blocks[`${tailSegment.x}-${tailSegment.y}`].classList.remove("head");
    }

    // Remove all classes from all snake segments first
    snake.forEach(segment => {
        const block = blocks[`${segment.x}-${segment.y}`];
        if (block) {
            block.classList.remove("fill");
            block.classList.remove("head");
        }
    });

    // Add correct classes to all current snake segments
    snake.forEach((segment, idx) => {
        const block = blocks[`${segment.x}-${segment.y}`];
        if (block) {
            if (idx === 0) {
                // Only head - apply head color only
                block.classList.add("head");  // head decoration 
            } else {
                // Body segments - apply body color only
                block.classList.add("fill");
            }
        }
    });

    // Display all foods on board
    foods.forEach(food => {
        if (blocks[`${food.x}-${food.y}`]) {
            blocks[`${food.x}-${food.y}`].classList.add("food");
        }
    });

    // Store current snake state in history for continue feature
    snakeHistory.push(JSON.parse(JSON.stringify(snake)));
    directionHistory.push(direction); // Store current direction
    if (snakeHistory.length > HISTORY_SIZE) {
        snakeHistory.shift(); // Remove oldest entry if history exceeds limit
        directionHistory.shift();
    }
};

// Render timing logic 
const renderInterval = () => {
    intervalID = setInterval(() => {
        render()
    }, 200);
}

// Start button logic 

startButton.addEventListener("click", () => {
    modal.style.display = "none"
    pauseBtn.style.display = "block"; // Show pause button
    pauseBtn.innerText = "⏸ Pause"; // Reset button text
    isPaused = false; // Reset pause state
    snakeHistory = []; // Reset history for continue feature
    directionHistory = []; // Reset direction history
    direction = "right"; // Reset direction
    gameOverDirection = "right"; // Reset game over direction
    generateMultipleFoods(); // Generate multiple foods at different locations
    renderInterval();
    time();
    addTouchGestureListeners(); // Enable touch gestures for mobile
})



//Timer logic 

function time() {
    timerIntervalID = setInterval(() => {
        let [min, sec] = timeElement.split(":").map(Number)
        if (sec == 59) {
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }
        timeElement = `${min} : ${sec}`
        t_Element.innerHTML = timeElement;
    }, 1000)
}

// ============================================================
// FUNCTION: Toggle pause/unpause game
// ============================================================
function togglePause() {
    if (isPaused) {
        // Unpause - Resume game
        isPaused = false;
        pauseBtn.innerText = "⏸ Pause";
        renderInterval(); // Restart render loop
        // Restart timer from current time
        timerIntervalID = setInterval(() => {
            let [min, sec] = timeElement.split(":").map(Number);
            if (sec == 59) {
                min += 1;
                sec = 0;
            } else {
                sec += 1;
            }
            timeElement = `${min} : ${sec}`;
            t_Element.innerHTML = timeElement;
        }, 1000);
    } else {
        // Pause - Stop game
        isPaused = true;
        pauseBtn.innerText = "▶ Resume";
        clearInterval(intervalID); // Stop render
        clearInterval(timerIntervalID); // Stop timer
    }
}

// Pause button event listener
pauseBtn.addEventListener("click", togglePause);

// Hide pause button initially
// pauseBtn.style.display = "none";

// ============================================================
// FUNCTION: Continue game from game over with penalties
// ============================================================
function continueGame() {
    // Check if we have enough history to go back
    if (snakeHistory.length < CONTINUE_BACK_STEPS) {
        alert("Cannot continue - not enough game history!");
        return;
    }

    // Restore snake to state from CONTINUE_BACK_STEPS ago
    const historyIndex = snakeHistory.length - CONTINUE_BACK_STEPS;
    snake = JSON.parse(JSON.stringify(snakeHistory[historyIndex]));
    direction = directionHistory[historyIndex]; // Restore direction
    gameOverDirection = direction; // Update game over direction

    // Remove snake history forward from current position
    snakeHistory = snakeHistory.slice(0, historyIndex + 1);
    directionHistory = directionHistory.slice(0, historyIndex + 1);

    // ============================================================
    // COMPLETE CLEAR: Remove ALL classes from ALL blocks
    // ============================================================
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const block = blocks[`${row}-${col}`];
            if (block) {
                block.classList.remove("fill");
                block.classList.remove("head");
                block.classList.remove("food");
            }
        }
    }

    // Remove tail segments (penalty)
    let tailRemoveCount = CONTINUE_PENALTY_TAIL;
    while (tailRemoveCount > 0 && snake.length > 1) {
        snake.pop();
        tailRemoveCount--;
    }

    // Deduct score penalty (but don't go below 0)
    score = Math.max(0, score - CONTINUE_PENALTY_SCORE);
    p_score.innerHTML = score;

    // Redraw the restored snake on board
    snake.forEach((segment, idx) => {
        const block = blocks[`${segment.x}-${segment.y}`];
        if (block) {
            if (idx === 0) {
                block.classList.add("head");
            } else {
                block.classList.add("fill");
            }
        }
    });

    // Redraw foods on board
    foods.forEach(food => {
        const block = blocks[`${food.x}-${food.y}`];
        if (block) {
            block.classList.add("food");
        }
    });

    // Close game over modal
    modal.style.display = "none";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "none";

    // Show pause button
    pauseBtn.style.display = "block";
    pauseBtn.innerText = "⏸ Pause";
    isPaused = false;

    // ============================================================
    // 3 SECOND COUNTDOWN TIMER BEFORE GAME STARTS
    // ============================================================
    let countdownSeconds = 3;
    const countdownElement = document.createElement("div");
    countdownElement.id = "countdownTimer";
    countdownElement.style.position = "fixed";
    countdownElement.style.top = "50%";
    countdownElement.style.left = "50%";
    countdownElement.style.transform = "translate(-50%, -50%)";
    countdownElement.style.fontSize = "3rem";
    countdownElement.style.fontWeight = "bold";
    countdownElement.style.color = "#ffff00";
    countdownElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    countdownElement.style.padding = "30px 50px";
    countdownElement.style.borderRadius = "10px";
    countdownElement.style.zIndex = "1000";
    countdownElement.style.textAlign = "center";
    countdownElement.innerText = countdownSeconds;
    document.body.appendChild(countdownElement);

    // Start countdown
    const countdownInterval = setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds > 0) {
            countdownElement.innerText = countdownSeconds;
        } else {
            // Countdown finished - start game
            clearInterval(countdownInterval);
            document.body.removeChild(countdownElement);
            
            // Start game rendering and timer
            renderInterval();
            time();
            addTouchGestureListeners();
        }
    }, 1000);
}

// Continue button event listener
continueBtn.addEventListener("click", continueGame);

// Restart game logic

restartButton.addEventListener("click", restartGame)

function restartGame() {
    // Clear all foods from board
    foods.forEach(food => {
        if (blocks[`${food.x}-${food.y}`]) {
            blocks[`${food.x}-${food.y}`].classList.remove("food");
        }
    });
    
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
        blocks[`${segment.x}-${segment.y}`].classList.remove("head")
    })

    modal.style.display = "none"
    pauseBtn.style.display = "block"; // Show pause button for new game
    pauseBtn.innerText = "⏸ Pause"; // Reset button text
    direction = "right"
    snake = [{ x: 1, y: 3 }]
    foods = [];
    score = 0
    p_score.innerHTML = score
    clearInterval(intervalID)
    clearInterval(timerIntervalID)
    timeElement = "00:00"
    t_Element.innerHTML = timeElement
    isPaused = false; // Reset pause state    snakeHistory = []; // Reset history for continue feature
    generateMultipleFoods(); // Generate multiple foods for new game
    renderInterval();
    time();
    addTouchGestureListeners(); // Re-enable touch gestures
}

addEventListener("keydown", (event) => {

    if (event.key === "ArrowUp" && direction !== "down") {
        direction = "up"
    }
    else if (event.key === "ArrowDown" && direction !== "up") {
        direction = "down"
    }
    else if (event.key === "ArrowRight" && direction !== "left") {
        direction = "right"
    }
    else if (event.key === "ArrowLeft" && direction !== "right") {
        direction = "left"
    }
})

// ============================================================
// FUNCTION: Handle touch start event for mobile swipe detection
// ============================================================
function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    // Prevent default browser behavior (pull-to-refresh)
    event.preventDefault();
}

// ============================================================
// FUNCTION: Handle touch end event and detect swipe direction
// ============================================================
function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    // Prevent default browser behavior
    event.preventDefault();
    
    handleSwipe();
}

// ============================================================
// FUNCTION: Detect swipe direction based on touch coordinates
// ============================================================
function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance to register as swipe
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > swipeThreshold && direction !== "right") {
            // Swiped left
            direction = "left";
        } else if (diffX < -swipeThreshold && direction !== "left") {
            // Swiped right
            direction = "right";
        }
    }
    // Vertical swipe
    else {
        if (diffY > swipeThreshold && direction !== "down") {
            // Swiped up
            direction = "up";
        } else if (diffY < -swipeThreshold && direction !== "up") {
            // Swiped down
            direction = "down";
        }
    }
}

// ============================================================
// FUNCTION: Add touch event listeners for mobile devices
// ============================================================
function addTouchGestureListeners() {
    board.addEventListener("touchstart", handleTouchStart, false);
    board.addEventListener("touchend", handleTouchEnd, false);
}

// ============================================================
// FUNCTION: Remove touch event listeners when game ends
// ============================================================
function removeTouchGestureListeners() {
    board.removeEventListener("touchstart", handleTouchStart);
    board.removeEventListener("touchend", handleTouchEnd);
}