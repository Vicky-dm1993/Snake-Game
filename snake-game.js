// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const startMessageElement = document.getElementById('startMessage');

// Game constants
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const GRID_COUNT = CANVAS_SIZE / GRID_SIZE;

// Game variables
let gameRunning = false;
let gameStarted = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = 150; // milliseconds between moves

// Snake object
let snake = [
    { x: 10, y: 10 }
];

// Direction vectors
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

// Food object
let food = generateFood();

// Initialize high score display
highScoreElement.textContent = highScore;

// Event listeners for controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    if (!gameStarted && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                        e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                        e.key === 'w' || e.key === 's' || e.key === 'a' || e.key === 'd')) {
        startGame();
    }
    
    if (gameRunning) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                if (direction.y === 0) {
                    nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
            case 's':
                if (direction.y === 0) {
                    nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
            case 'a':
                if (direction.x === 0) {
                    nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
            case 'd':
                if (direction.x === 0) {
                    nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    if (!gameRunning && gameStarted && e.key === ' ') {
        restartGame();
    }
    
    e.preventDefault();
}

function startGame() {
    gameStarted = true;
    gameRunning = true;
    startMessageElement.style.display = 'none';
    direction = { x: 1, y: 0 }; // Start moving right
    nextDirection = { x: 1, y: 0 };
    gameLoop();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_COUNT),
            y: Math.floor(Math.random() * GRID_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

function moveSnake() {
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        food = generateFood();
        
        // Increase speed slightly as score increases
        if (score % 50 === 0 && gameSpeed > 80) {
            gameSpeed -= 5;
        }
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Draw head with gradient
            const gradient = ctx.createLinearGradient(
                segment.x * GRID_SIZE, segment.y * GRID_SIZE,
                (segment.x + 1) * GRID_SIZE, (segment.y + 1) * GRID_SIZE
            );
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(1, '#00cc00');
            ctx.fillStyle = gradient;
        } else {
            // Draw body with slightly different color
            ctx.fillStyle = index % 2 === 0 ? '#00dd00' : '#00bb00';
        }
        
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
        
        // Add border to segments
        ctx.strokeStyle = '#008800';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );
    });
    
    // Draw eyes on the head
    if (snake.length > 0) {
        const head = snake[0];
        ctx.fillStyle = '#ffffff';
        
        // Eye positions based on direction
        let eye1X, eye1Y, eye2X, eye2Y;
        
        if (direction.x === 1) { // Moving right
            eye1X = head.x * GRID_SIZE + 14;
            eye1Y = head.y * GRID_SIZE + 6;
            eye2X = head.x * GRID_SIZE + 14;
            eye2Y = head.y * GRID_SIZE + 14;
        } else if (direction.x === -1) { // Moving left
            eye1X = head.x * GRID_SIZE + 6;
            eye1Y = head.y * GRID_SIZE + 6;
            eye2X = head.x * GRID_SIZE + 6;
            eye2Y = head.y * GRID_SIZE + 14;
        } else if (direction.y === -1) { // Moving up
            eye1X = head.x * GRID_SIZE + 6;
            eye1Y = head.y * GRID_SIZE + 6;
            eye2X = head.x * GRID_SIZE + 14;
            eye2Y = head.y * GRID_SIZE + 6;
        } else if (direction.y === 1) { // Moving down
            eye1X = head.x * GRID_SIZE + 6;
            eye1Y = head.y * GRID_SIZE + 14;
            eye2X = head.x * GRID_SIZE + 14;
            eye2Y = head.y * GRID_SIZE + 14;
        }
        
        // Draw eyes
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 2, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFood() {
    // Draw food with pulsing effect
    const time = Date.now() * 0.005;
    const pulse = Math.sin(time) * 0.1 + 0.9;
    const size = GRID_SIZE * pulse;
    const offset = (GRID_SIZE - size) / 2;
    
    // Create radial gradient for food
    const gradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        0,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        size / 2
    );
    gradient.addColorStop(0, '#ff4444');
    gradient.addColorStop(0.7, '#ff0000');
    gradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        size / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 3,
        food.y * GRID_SIZE + GRID_SIZE / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GRID_COUNT; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
    }
}

function gameOver() {
    gameRunning = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    gameOverElement.style.display = 'block';
}

function restartGame() {
    gameRunning = true;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 150;
    
    // Reset snake
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    // Generate new food
    food = generateFood();
    
    gameOverElement.style.display = 'none';
    gameLoop();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    drawGrid();
    
    // Draw game elements
    drawFood();
    drawSnake();
}

function gameLoop() {
    if (!gameRunning) return;
    
    moveSnake();
    draw();
    
    setTimeout(gameLoop, gameSpeed);
}

// Initial draw
draw();
