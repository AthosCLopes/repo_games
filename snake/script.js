const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
const score1 = document.getElementById("score") 
const state1 = document.getElementById("state")
const best1 = document.getElementById("snake-best")

const CELL = 24
const COLS = canvas.width / CELL // 480 / 24 = 20
const ROWS = canvas.height / CELL 
const TICKS_MS = 110 // A cobra se move 1 céula a cada 110ms 

const STATES = {
    READY: "PRONTO",
    PLAYING: "JOGANDO",
    PAUSED: "PAUSE",
    OVER: "GAME OVER"
}

// const player = {x: 40, y: 160, w: 32, h: 32, vx: 120}

let state = STATES.READY
let snake = []
let dir = {x: 1, y: 0}
let nextDir = {x: 1, y: 0}
let food = {x: 10, y: 10}
let score = 0
let acc = 0 // Acumulador de tempo
let last = 0 // Marca a posição do quadro anterior
let best = localStorage.getItem("snake-best") || 0

function reset () {
    const midX = Math.floor(COLS/2)
    const midY = Math.floor(ROWS/2)

    snake = [
        { x: midX, y: midY }, 
        { x: midX- 1, y: midY },
        { x: midX- 2, y: midY },
    ]

    dir = { x: 1, y: 0 }
    nextDir = { x: 1, y: 0 }

    state = STATES.READY
    state1 = textContent = state

    score = 0
    score1 = textContent = score
}

function spawnApple () {
    do {
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        }
    } while (snake.some((s) => s.x === food.x && s.y === food.y)) 
        // Função some() retorna true se algum segmento da Snake
        // ocupar determinada célula
}

function setDirection (x, y) {
    if (dir.x + x === 0) 
        return
    nextDir = { x, y }
}

window.addEventListener("keydown", (e) => {
    const key = e.key.toLocaleLowerCase()

    if (key === "arrowup" || key === "w")
        setDirection(0, -1)
    if (key === "arrowdown" || key === "s")
        setDirection(0, 1)
    if (key === "arrowleft" || key === "a")
        setDirection(-1, 0)
    if (key === "arrowright" || key === "d")
        setDirection(1, 0)
    if (key === "r")
        reset()
    if (key === " " ) {/*Altera PLAYING  - PAUSEED e sai de READY*/}
})

function update (dt) {
    player.x += player.vx * dt
    // Bateu na parede esquerda ou direita? Inverte o sinal do vx

    if (player.x < 0 || player.x + player.w > canvas.width) {
        player.vx *= -1  
    }
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#4ade80"
    ctx.fillRect(player.x, player.y, player.h, player.w)

    ctx.fillStyle = "#fff"
    ctx.fillRect(player.x, player.y, player.h, player.w)

    ctx.fillText("O DeltaTime - dt independe da taxa de quadros", 12, 20)
}

function loop (ts) {
    if (!last) {
        last = ts
    }

    const dt = Math.min(0.05, (ts - last)/1000) // 1ms = 1s /1000
    update(dt)
    draw()
    requestAnimationFrame(loop)
}

requestAnimationFrame(loop) // Responsável por executar o primeiro disparo