// CANVAS
let canvas
const canvasWidth = 900
const canvasHeight = 600
const canvasCenter = {x: canvasWidth / 2, y: canvasHeight / 2}

// DEFAULT VALUES
const blockSize = 30
const widthInBloks = canvasWidth / blockSize
const HeightInBloks = canvasHeight / blockSize

const INITIAL_SCORE = 0
const INITIAL_APPLE_POS = [10, 10]
const INITIAL_SNAKE_POS = [[6,4], [5,4], [4,4]]
const INITIAL_SNAKE_DIR = "right"
const INITIAL_SNAKE_SPEED = 120

// SNAKE ATTRIBUTS
const snakeColor = "#ff0000"
let snakeSpeed = INITIAL_SNAKE_SPEED 

// APPLE ATTRIBUTS
const appleColor = "#33cc33"
const radius = blockSize / 2

// TEXT ATTRIBUTES
//  == GAME OVER
const gameoverFont = "bold 70px Arial"
const gameoverColor = "#000"
const gameoverColorStroke = "white"
const gameoverText = "GAME OVER"

// == CONTINUE
const continueFont = "italic 15px Arial"
const continueText = "Appuyez sur 'Espace' pour continuer"

// == SCORE
const scoreFont = "bold 100px Arial"
const scoreColor = "rgba(0, 0, 0, 0.5)"
const scorePosition = {x: canvasCenter.x, y: 50}

// ENTITIES
let snakee 
let applee

let score = INITIAL_SCORE 
let ctx // Context du canvas
let timeout


const init = () => {
    canvas = createCanvas()
    document.body.appendChild(canvas)

    ctx = canvas.getContext('2d')
    
    snakee = new Snake([...INITIAL_SNAKE_POS], INITIAL_SNAKE_DIR)
    applee = new Apple([...INITIAL_APPLE_POS])

    refresh()
}

const createCanvas = () => {
    let canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.border = "30px solid gray"
    canvas.style.margin = "50px auto"
    canvas.style.display = "block"
    canvas.style.backgroundColor = "#ddd"

    return canvas
}

const refresh = () => {
    snakee.advance()
    if(snakee.checkCollision()) {
        gameOver()
    } else {
        if (snakee.isEatingApple(applee)) {
            score++
            snakeSpeed = snakeSpeed > 90 ? snakeSpeed - 1 : snakeSpeed  
            snakee.ateApple = true
            do {
                applee.setNewPosition()
            } while (applee.isOnSnake(snakee))
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        drawScore()
        snakee.draw()
        applee.draw()

        timeout = setTimeout(() => {
            refresh()
        }, snakeSpeed);  
    }
}

class Snake {
    constructor (body, direction) {
        this.body = body,
        this.direction = direction
        this.ateApple = false
    }

    // Getter
    get head() {
        return this.body[0];
    }

    get bodyWithoutHead() {
        return this.body.slice(1)
    }

    // Methods
    draw() {
        ctx.save()

        ctx.fillStyle = snakeColor
        for (let i = 0; i < this.body.length; i++) {
            drawBlock(ctx, this.body[i])
        }

        ctx.restore()
    }

    advance() {
        let nextPosition = this.head.slice()
        
        switch(this.direction) {
            case 'left':
                nextPosition[0] -= 1
                break
            case 'right':
                nextPosition[0] += 1
                break
            case 'down':
                nextPosition[1] += 1
                break
            case 'up':
                nextPosition[1] -= 1
                break
            default:
                break
        }

        this.body.unshift(nextPosition)
        
        if (!this.ateApple) this.body.pop()
        else this.ateApple = false
    }

    setDirection(newDirection) {
        let allowedDirections
        switch (this.direction) {
            case "left":
            case "right":
                allowedDirections = ["up", "down"]
                break;
            case "up":
            case "down":
                allowedDirections = ["left", "right"]
                break;
            default:
                throw("Invalid Direction")
            }
        
            if (allowedDirections.indexOf(newDirection) > -1) this.direction = newDirection
    }

    checkCollision() {
        // Collisions
        var wall = false
        var self = false
        // Snake
        const snakeX = this.head[0]
        const snakeY = this.head[1]
        // Canvas
        const minX = 0
        const minY = 0
        const maxX = widthInBloks - 1
        const maxY = HeightInBloks - 1
        // Snake VS Canvas
        var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX
        var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY

        if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) wall = true

        for (let i = 0; i < this.bodyWithoutHead.length; i++) 
            if (snakeX === this.bodyWithoutHead[i][0] && snakeY === this.bodyWithoutHead[i][1]) self = true

        return wall || self
    }

    isEatingApple(appleToEat) {
        const head = this.body[0]
        return head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]
    }
}

class Apple {
    constructor (position) {
        this.position = position
    }

    // GETTERS
    get x() {
        return this.position[0]
    }

    get y() {
        return this.position[1]
    }

    draw() {
        ctx.save()

        ctx.fillStyle = appleColor
        ctx.beginPath()
        ctx.arc(this.x * blockSize + radius,
                this.y * blockSize + radius,
                radius,
                0,
                Math.PI * 2,
                true)
        ctx.fill()
        
        ctx.restore()
    }

    setNewPosition() {
        const newX = Math.round(Math.random() * (widthInBloks - 1))
        const newY = Math.round(Math.random() * (HeightInBloks - 1))
        
        this.position = [newX, newY]
    }

    isOnSnake(snakeToCheck) {
        const snakeBody = snakeToCheck.body
        for (let i = 0; i < snakeBody.length; i++) {
            if (this.x === snakeBody[i][0] && this.y === snakeBody[i][1]) return true
        }

        return false
    }
}

const drawBlock = (ctx, position) => {
    return ctx.fillRect(
        position[0] * blockSize,
        position[1] * blockSize,
        blockSize,
        blockSize)
}

const gameOver = () => {
    ctx.save()

    ctx.font = gameoverFont
    ctx.fillStyle = gameoverColor
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.strokeStyle = gameoverColorStroke
    ctx.lineWidth = 5

    ctx.strokeText(gameoverText, canvasCenter.x, canvasCenter.y - 180)
    ctx.fillText(gameoverText, canvasCenter.x, canvasCenter.y - 180)

    ctx.font = continueFont
    ctx.strokeText(continueText, canvasCenter.x, canvasCenter.y - 120)
    ctx.fillText(continueText, canvasCenter.x, canvasCenter.y - 120)

    ctx.restore()
    return
}

const restart = () => {
    snakee = new Snake([...INITIAL_SNAKE_POS], INITIAL_SNAKE_DIR)
    applee = new Apple([...INITIAL_APPLE_POS])
    score = INITIAL_SCORE
    clearTimeout(timeout)
    
    console.log(snakee);
    refresh() 
}

const drawScore = () => {
    ctx.save()

    ctx.font = scoreFont
    ctx.fillStyle = scoreColor
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(score.toString(), scorePosition.x , scorePosition.y)

    ctx.restore()  
}

document.onkeydown = (e) => {
    const key = e.code
    let newDirection

    switch (key) {
        case "ArrowUp":
            newDirection = "up"
            break;
        case "ArrowDown":
            newDirection = "down"
            break;
        case "ArrowRight":
            newDirection = "right"
            break;
        case "ArrowLeft":
            newDirection = "left"
            break;
        case "Space":
            restart()
            return
        default:
            break;
    }

    snakee.setDirection(newDirection)
}

init()