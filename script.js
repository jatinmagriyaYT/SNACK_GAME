const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start')
const modal = document.querySelector('.modal')
const infos = document.querySelector('.infos')// by jatin 

const blockHeight = 30
const blockWidth = 30

const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)

const blocks = [];
const snake = [
    {
        x: 1, y: 3
    }
];

const p_score = document.querySelector('#score') // by jatin 
let direction = "right";
let intervalID = null;
let food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
let score = 0; // by jatin 

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

    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        alert("Game over !")
        clearInterval(intervalID)
    }

    if (head.x == food.x && head.y == food.y) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) }
        blocks[`${food.x}-${food.y}`].classList.add("food");
        snake.unshift(head)
        score += 1;// by jatin 
        p_score.innerHTML = score// by jatin 
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

// intervalID = setInterval(()=>{
//     render()
// },200);


startButton.addEventListener("click", () => {
    modal.style.display = "none"
    intervalID = setInterval(() => {
        render()
    }, 200);
})

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