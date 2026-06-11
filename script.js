const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start')
const modal = document.querySelector('.modal')
const startGameModal = document.querySelector(".start-game")
const gameOverModal = document.querySelector(".game-over")
const restartButton = document.querySelector(".btn-restart")
const p_score = document.querySelector('#score')
const h_Score = document.querySelector("#high-score")
const t_Element = document.querySelector("#time")
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
let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let timeElement = `00:00`;

h_Score.innerHTML = highScore

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div')
        block.classList.add("box")
        board.appendChild(block)
        // block.innerText = `${row}-${col}`
        blocks[`${row}-${col}`] = block
    }
}


function render() {

    let head = null

    blocks[`${food.x}-${food.y}`].classList.add("food");

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


    // Wall collesion logic
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalID)
        clearInterval(timerIntervalID)

        modal.style.display = "flex"
        startGameModal.style.display = "none"
        gameOverModal.style.display = "flex"
        return;
    }

    //Food consume logic
    if (head.x == food.x && head.y == food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
        blocks[`${food.x}-${food.y}`].classList.add("food");
        snake.unshift(head)

        score += 1;
        p_score.innerHTML = score

        if (score > highScore) {
            highScore = score
            localStorage.setItem("highScore", highScore.toString());
            h_Score.innerHTML = highScore
        }
    }

    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
    });

    snake.unshift(head);
    snake.pop();


    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill")
    });
}

startButton.addEventListener("click", () => {
    modal.style.display = "none"
    intervalID = setInterval(() => {
        render()
    }, 200);

    time();
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
        timeElement = `${min}. : ${sec}`
        t_Element.innerHTML = timeElement;
    }, 1000)
}


// Restart game logic

restartButton.addEventListener("click", restartGame)

function restartGame() {

    blocks[`${food.x}-${food.y}`].classList.remove("food")
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")
    })

    modal.style.display = "none"
    direction = "right"
    snake = [{ x: 1, y: 3 }]
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
    score = 0
    p_score.innerHTML = score

    clearInterval(timerIntervalID)
    timeElement = "00:00"
    t_Element.innerHTML = timeElement

    intervalID = setInterval(() => {
        render()
    }, 200);

}

addEventListener("keydown", (event) => {

    if (event.key === "ArrowUp") {
        direction = "up"
    }
    else if (event.key === "ArrowDown") {
        direction = "down"
    }
    else if (event.key === "ArrowRight") {
        direction = "right"
    }
    else if (event.key === "ArrowLeft") {
        direction = "left"
    }
})