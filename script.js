const board = document.querySelector('.board');
const blockHeight = 30
const blockWidth = 30

const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)

const blocks = [];
const snack = [
    {
        x:1 , y:3
    }
];
let direction = "right";
let intervalID = null ;
// for(let i = 0 ; i < rows * cols ; i++){
//     const block = document.createElement('div')
//     block.classList.add("box")
//     board.appendChild(block)
// }



for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div')
        block.classList.add("box")
        board.appendChild(block)
        // block.innerText = `${row}-${col}`
        blocks[`${row}-${col}`] = block
    }
}


function render(){
    snack.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill")                  
    });
}

intervalID = setInterval(()=>{
    let head = null
    if (direction === "left"){
        head = { x : snack[0].x , y : snack[0].y - 1}
    }
    else if (direction === "right"){
        head = { x : snack[0].x , y : snack[0].y + 1}
    }
    else if (direction === "up"){
        head = { x : snack[0].x - 1 , y : snack[0].y}
    }
    else if (direction === "down"){
        head = {x : snack[0].x + 1 , y : snack[0].y}
    }

    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y > cols){
        alert("Game over !")
        clearInterval(intervalID)
    }

    snack.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill")                  
    });

    snack.unshift(head);
    snack.pop();

    render()
},200);


// ArrowLeft
// script.js:67 ArrowUp
// script.js:67 ArrowDown
// script.js:67 ArrowRight


addEventListener("keydown", (event) => {
    
    if (event.key === "ArrowUp"){
        direction ="up"
    }
    else if (event.key === "ArrowDown"){
        direction = "down"
    }
    else if (event.key === "ArrowRight"){
        direction = "right"
    }
    else if (event.key === "ArrowLeft"){
        direction = "left"
    }
})