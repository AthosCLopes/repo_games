/**
 * Breakout Bits — colisão bola/raquete/tijolos.
 * Conceitos: vetor velocidade, reflexão, grid de tijolos, níveis.
 */

//Passo 1 — Mundo contínuo
const canvas = document.getElementById("blocos");
const ctx = canvas.getContext("2d");

const paddle = { w: 86, h: 12, x: 197, y: 530, speed: 420 };
const ball = { x: 240, y: 500, r: 7, vx: 180, vy: -300, launched: false };
let bricks = [];
let score = 0;
let lives = 3;
let running = false;
const keys = {};

/* ECONOMIA DE PONTOS
 * Fileira 0 (topo) = 50, depois 40, 30, 20, 10.
 *
 * Frase de design: "o jogador arrisca a bola no topo porque a pirâmide
 * só deixa chegar lá por um corredor estreito no meio: a bola precisa
 * entrar por baixo, quicar entre as paredes de tijolos e voltar sem
 * passar da raquete. Quanto mais difícil de alcançar, mais paga."
 */
const ROW_POINTS = [50, 40, 30, 20, 10];
const ROW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
const ARMOR_COLOR = "#9ca3af"; // cinza: tijolo blindado antes do 1º hit

/* LAYOUT AUTORAL — pirâmide oca com corredor central
 * "#" = tijolo normal (1 hit)
 * "A" = tijolo blindado (2 hits, muda de cor no primeiro impacto)
 * "." = vazio
 * Total: 16 tijolos vivos no começo.
 */
const LEVEL = [
    "...AA...", // 50 pts — o topo é blindado: risco máximo, recompensa máxima
    "..####..", // 40
    ".##..##.", // 30 — o buraco no centro vira o corredor
    "##....##", // 20
    "#......#", // 10
];

//Passo 2 — Construir os tijolos a partir do desenho do nível
function buildBricks() {
    bricks = [];
    for (let row = 0; row < LEVEL.length; row++) {
        for (let col = 0; col < LEVEL[row].length; col++) {
            const cell = LEVEL[row][col];
            if (cell === ".") continue;
            const armored = cell === "A";
            bricks.push({
                x: 16 + col * 58,
                y: 40 + row * 28,
                w: 52,
                h: 20,
                color: armored ? ARMOR_COLOR : ROW_COLORS[row],
                rowColor: ROW_COLORS[row],
                points: ROW_POINTS[row],
                hp: armored ? 2 : 1,
                alive: true,
            });
        }
    }
}

/* Passo 3 — Controle da raquete
Duas formas ao mesmo tempo: teclado (setas / A D)*/
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space") {
        e.preventDefault();
        if (lives > 0) {
            running = true;
            ball.launched = true;
        }
    }
    if (e.key.toLowerCase() === "r") reset();
});
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

/* ... e mouse sobre o canvas. O mouse costuma ser mais
preciso no Breakout.  */
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    paddle.x = (e.clientX - rect.left) * scaleX - paddle.w / 2;
    paddle.x = Math.max(8, Math.min(canvas.width - paddle.w - 8, paddle.x));
});

function resetBall() {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - 14;
    ball.vx = 180 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -300;
    ball.launched = false;
}

function reset() {
    score = 0;
    lives = 3;
    running = false;
    buildBricks();
    resetBall();
}

//Passo 7 — Colisão com tijolo (círculo contra retângulo)
// Retorna null se não houver colisão, ou o eixo de menor penetração ("x" ou "y").
function collideBrick(b) {
    const left = ball.x + ball.r - b.x;
    const right = b.x + b.w - (ball.x - ball.r);
    const top = ball.y + ball.r - b.y;
    const bottom = b.y + b.h - (ball.y - ball.r);
    if (left <= 0 || right <= 0 || top <= 0 || bottom <= 0) return null;
    const minX = Math.min(left, right);
    const minY = Math.min(top, bottom);
    return minX < minY ? "x" : "y";
}

function update(dt) {
    if (keys["arrowleft"] || keys["a"]) paddle.x -= paddle.speed * dt;
    if (keys["arrowright"] || keys["d"]) paddle.x += paddle.speed * dt;
    paddle.x = Math.max(8, Math.min(canvas.width - paddle.w - 8, paddle.x));

    /*Passo 4 — Lançar a bola
    Enquanto launched é false, a bola cola no centro da raquete. Espaço arma o disparo. Isso evita a bola cair antes
    de o jogador estar pronto. */
    if (!ball.launched) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - 14;
        return; // não integra física ainda
    }
    if (!running) return;

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Paredes (corrige a posição para a bola não ficar presa na borda)
    if (ball.x < ball.r) {
        ball.x = ball.r;
        ball.vx = Math.abs(ball.vx);
    } else if (ball.x > canvas.width - ball.r) {
        ball.x = canvas.width - ball.r;
        ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y < ball.r) {
        ball.y = ball.r;
        ball.vy = Math.abs(ball.vy);
    }

    if (ball.y > canvas.height) {
        lives -= 1;
        if (lives <= 0) {
            running = false;
            return;
        }
        resetBall();
        return;
    }

    /* Passo 6 — Quicar na raquete com ângulo
    Se a bola bate no centro da raquete, sobe reta. Se bate na ponta, sai inclinada. Pode ser descrito como um
    fator hit entre −1 e 1. */
    if (
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.w &&
        ball.vy > 0 // só quando a bola ESTÁ DESCENDO
    ) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hit * 260;
        ball.vy = -Math.abs(ball.vy); // garante que sobe
        ball.y = paddle.y - ball.r;   // evita colar na raquete
    }

    //Passo 7 — Colisão com tijolo (apenas um por frame)
    for (const b of bricks) {
        if (!b.alive) continue;
        const axis = collideBrick(b);
        if (!axis) continue;

        // Reflexão: inverte só o eixo em que a bola mais penetrou
        if (axis === "x") ball.vx *= -1;
        else ball.vy *= -1;

        // Tijolo blindado: cada hit tira 1 HP; no primeiro, muda de cor
        b.hp -= 1;
        if (b.hp <= 0) {
            b.alive = false;
            score += b.points;
        } else {
            b.color = b.rowColor;
        }
        break;
    }

    if (bricks.every((b) => !b.alive)) {
        buildBricks();
        resetBall();
    }
}

//Passo 8 — Desenhando os elementos a raquete e a bola
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.beginPath();
    ctx.fillStyle = "#f8fafc";
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
    });
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "16px Arial";
    ctx.fillText("Pontos " + score + "   Vidas " + lives, 16, 24);
    if (!ball.launched && lives > 0) {
        ctx.textAlign = "center";
        ctx.fillText("ESPAÇO para lançar", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
    }
    if (lives <= 0) {
        ctx.textAlign = "center";
        ctx.font = "bold 28px Arial";
        ctx.fillText(
            "GAME OVER — R reinicia",
            canvas.width / 2,
            canvas.height / 2,
        );
        ctx.textAlign = "left";
    }
}

let last = 0;
function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}
reset();
requestAnimationFrame(loop);