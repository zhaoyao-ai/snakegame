document.addEventListener('DOMContentLoaded', () => {
    // 获取画布和上下文
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // 游戏参数
    const gridSize = 20; // 网格大小
    const tileCount = canvas.width / gridSize; // 网格数量
    let speed = 7; // 游戏速度
    let initialSpeed = speed; // 初始速度
    
    // 蛇的初始位置和速度
    let snake = [
        {x: 10, y: 10}
    ];
    let velocityX = 0;
    let velocityY = 0;
    
    // 食物位置
    let foodX = 5;
    let foodY = 5;
    
    // 游戏状态
    let gameStarted = false;
    let gameOver = false;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    
    // 更新分数显示
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    highScoreElement.textContent = highScore;
    
    // 按钮和控制元素
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    // 按钮和控制事件监听
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', restartGame);
    
    // 速度滑块事件监听
    speedSlider.addEventListener('input', function() {
        speed = parseInt(this.value);
        speedValue.textContent = speed;
    });
    
    // 确保速度滑块初始值与代码中的速度一致
    speedSlider.value = speed;
    speedValue.textContent = speed;
    
    // 键盘事件监听
    document.addEventListener('keydown', changeDirection);
    
    // 触摸屏幕滑动事件（移动端支持）
    let touchStartX, touchStartY;
    canvas.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', function(e) {
        if (!touchStartX || !touchStartY) {
            return;
        }
        
        let touchEndX = e.touches[0].clientX;
        let touchEndY = e.touches[0].clientY;
        
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        // 判断滑动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平方向滑动
            if (dx > 0 && velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            } else if (dx < 0 && velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
        } else {
            // 垂直方向滑动
            if (dy > 0 && velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            } else if (dy < 0 && velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
        }
        
        touchStartX = null;
        touchStartY = null;
        e.preventDefault();
    }, false);
    
    // 游戏主循环
    function gameLoop() {
        if (gameOver) {
            return;
        }
        
        if (!gameStarted) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        setTimeout(() => {
            clearCanvas();
            drawFood();
            moveSnake();
            drawSnake();
            checkCollision();
            requestAnimationFrame(gameLoop);
        }, 1000 / speed);
    }
    
    // 开始游戏
    function startGame() {
        if (!gameStarted && !gameOver) {
            gameStarted = true;
            startBtn.disabled = true;
            // 初始方向向右
            velocityX = 1;
            velocityY = 0;
        }
    }
    
    // 重新开始游戏
    function restartGame() {
        snake = [{x: 10, y: 10}];
        velocityX = 0;
        velocityY = 0;
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        gameStarted = false;
        gameOver = false;
        score = 0;
        scoreElement.textContent = score;
        startBtn.disabled = false;
        
        // 重置速度到用户当前设置的速度
        speed = parseInt(speedSlider.value);
        speedValue.textContent = speed;
        
        clearCanvas();
        drawSnake();
        drawFood();
    }
    
    // 清除画布
    function clearCanvas() {
        ctx.fillStyle = '#e8f5e9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // 绘制蛇
    function drawSnake() {
        ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < snake.length; i++) {
            let part = snake[i];
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // 绘制蛇头
        if (snake.length > 0) {
            ctx.fillStyle = '#388E3C';
            ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
        }
    }
    
    // 绘制食物
    function drawFood() {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(
            foodX * gridSize + gridSize / 2,
            foodY * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // 移动蛇
    function moveSnake() {
        // 创建新的蛇头
        const head = {x: snake[0].x + velocityX, y: snake[0].y + velocityY};
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === foodX && head.y === foodY) {
            // 增加分数
            score += 10;
            scoreElement.textContent = score;
            
            // 更新最高分
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // 生成新的食物
            generateFood();
            
            // 根据用户设置决定是否自动增加游戏速度
            // 如果用户已经设置了较高的速度，则不再自动增加
            if (score % 50 === 0 && speed < parseInt(speedSlider.max)) {
                // 只有当当前速度小于用户设置的速度上限时才增加
                speed = Math.min(parseInt(speedSlider.max), speed + 1);
                speedSlider.value = speed;
                speedValue.textContent = speed;
            }
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }
    }
    
    // 改变方向
    function changeDirection(event) {
        // 如果游戏未开始，按方向键开始游戏
        if (!gameStarted && !gameOver && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
            event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            gameStarted = true;
            startBtn.disabled = true;
        }
        
        // 根据按键改变方向
        switch (event.key) {
            case 'ArrowUp':
                if (velocityY !== 1) { // 防止直接反向移动
                    velocityX = 0;
                    velocityY = -1;
                }
                break;
            case 'ArrowDown':
                if (velocityY !== -1) {
                    velocityX = 0;
                    velocityY = 1;
                }
                break;
            case 'ArrowLeft':
                if (velocityX !== 1) {
                    velocityX = -1;
                    velocityY = 0;
                }
                break;
            case 'ArrowRight':
                if (velocityX !== -1) {
                    velocityX = 1;
                    velocityY = 0;
                }
                break;
        }
    }
    
    // 生成食物
    function generateFood() {
        // 随机生成食物位置
        let newFoodX, newFoodY;
        let foodOnSnake;
        
        do {
            foodOnSnake = false;
            newFoodX = Math.floor(Math.random() * tileCount);
            newFoodY = Math.floor(Math.random() * tileCount);
            
            // 检查食物是否生成在蛇身上
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFoodX && snake[i].y === newFoodY) {
                    foodOnSnake = true;
                    break;
                }
            }
        } while (foodOnSnake);
        
        foodX = newFoodX;
        foodY = newFoodY;
    }
    
    // 检查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver = true;
            showGameOver();
            return;
        }
        
        // 检查是否撞到自己
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                showGameOver();
                return;
            }
        }
    }
    
    // 显示游戏结束
    function showGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px Arial';
        ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // 初始化游戏
    function init() {
        clearCanvas();
        drawSnake();
        generateFood();
        drawFood();
        gameLoop();
    }
    
    // 启动游戏
    init();
});