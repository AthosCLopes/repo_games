const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")
const scoreEl = document.getElementById("score")
const livesEl = document.getElementById("lives")
const wavesEl = document.getElementById("wave")

const KEYS = {}

class Player {
    constructor() {
        this.w = 36
        this.h = 28
        this.x = canvas.width / 2 - 18
        this.y = canvas.height - 56
        this.speed = 280
        this.cooldown = 0;
    }

    update(dt) {

    }
}

class Bullet {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.h = 14
        this.w = 6
        this.speed = 420
        this.dead = false
    }
}

class Enemy {
    constructor(x, y, speed) {
        this.x = x
        this.y = y
        this.speed = speed
        this.dead = false
        this.h = 28 
        this.w = 28
    }

    update (dt) {
        
    }

    draw () {

    }
}

function draw () {

}

let player, bullets, enemies, score, lives, waves, last, gameOver, pause, spawnTime  

function startGame () {

}

function update (dt) {

}

function syncHud () {

}

function spawnWave (dt) {
    
}