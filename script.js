const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

// x, y ---> Posicionar o objeto
// r ---> Raio do círculo
// vx ---> Define a velocidade horizontal
// vy ---> Define a velocidade vertical

const player = {x: 40, y: 160, r: 16, vx: 120, vy: 90}

let last = 0 // Marca a posição do quadro anterior

function update (dt) {
    player.x += player.vx * dt
    player.y += player.vy * dt

    // Bateu na parede esquerda ou direita? Inverte o sinal do vx
    if (player.x - player.r < 0 || player.x + player.r > canvas.width) {
        player.vx *= -1
    }

    // Bateu em cima ou embaixo? Inverte o sinal do vy
    if (player.y - player.r < 0 || player.y + player.r > canvas.height) {
        player.vy *= -1
    }
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#4ade80"
    ctx.beginPath()
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#fff"
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

// eu uso dt porque assim o movimento fica na mesma velocidade
// em qualquer FPS, sem ele a bola andaria mais rápido ou mais
// devagar dependendo da tela

requestAnimationFrame(loop) // Responsável por executar o primeiro disparo