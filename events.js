// 게임 시작
window.onload = function() {
    initGame();
    
    // 과일 라벨 업데이트 간격 설정
    setInterval(() => {
        updateFruitLabels(); // 라벨 업데이트
        checkFruitMerging(); // 과일 합치기 검사
    }, 1000 / 60); // 약 60fps
    
    // 게임오버 체크 간격 설정
    setInterval(() => {
        checkGameOver();
    }, 1000);
};

// 벽 생성
function createWalls() {
    // 바닥
    const floor = Bodies.rectangle(containerWidth / 2, containerHeight, containerWidth, 50, { 
        isStatic: true,
        friction: 0.1
    });
    
    // 왼쪽 벽
    const leftWall = Bodies.rectangle(0, containerHeight / 2, 50, containerHeight, { 
        isStatic: true,
        friction: 0.1
    });
    
    // 오른쪽 벽
    const rightWall = Bodies.rectangle(containerWidth, containerHeight / 2, 50, containerHeight, { 
        isStatic: true,
        friction: 0.1
    });
    
    walls = [floor, leftWall, rightWall];
    World.add(engine.world, walls);
}

// 충돌 이벤트 설정
function setupCollisionEvents() {
    Events.on(engine, 'collisionStart', (event) => {
        const pairs = event.pairs;
        
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            const bodyA = pair.bodyA;
            const bodyB = pair.bodyB;
            
            // 충돌 힘 계산
            const collisionForce = Math.abs(bodyA.force.x) + Math.abs(bodyA.force.y) + Math.abs(bodyB.force.x) + Math.abs(bodyB.force.y);
            
            // 충돌 힘 임계값보다 작은 충돌은 무시
            if (collisionForce < MIN_COLLISION_FORCE) {
                continue;
            }
        }
    });
}

// 바디 제거
function removeBody(body) {
    World.remove(engine.world, body);
    
    if (body.isFruit) {
        const index = fruits.indexOf(body);
        if (index > -1) {
            fruits.splice(index, 1);
        }
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 마우스 이동
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        
        if (canDropFruit) {
            const fruit = FRUITS[nextFruitIndex];
            waitingFruitElement.style.left = `${mouseX - fruit.circleRadius}px`;
        }
    });
    
    // 클릭
    container.addEventListener('click', (e) => {
        dropFruit();
    });
    
    // 게임 재시작 버튼
    document.getElementById('restart-button').addEventListener('click', () => {
        resetGame();
    });
}

// 게임오버 체크
function checkGameOver() {
    if (isGameOver) return;
    
    const lineY = 120;
    
    for (let i = 0; i < fruits.length; i++) {
        const fruit = fruits[i];
        
        const isSleeping = fruit.speed < 0.1;
        const isAboveLine = fruit.position.y < lineY;
        
        if (isSleeping && isAboveLine) {
            gameOver();
            return;
        }
    }
}

// 게임 오버
function gameOver() {
    isGameOver = true;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'flex';
    
    Runner.stop(runner);
}

// 게임 리셋
function resetGame() {
    document.getElementById('game-over').style.display = 'none';
    
    score = 0;
    document.getElementById('score').textContent = score;
    isGameOver = false;
    nextFruitIndex = 0;
    canDropFruit = true;
    fruits = [];
    
    if (runner.enabled) {
        Runner.stop(runner);
    }
    
    World.clear(engine.world);
    Engine.clear(engine);
    
    createWalls();
    setupEventListeners();
    setupCollisionEvents();
    
    // 다음 과일 미리보기 초기화
    generateNextPreviewFruit();
    updateNextFruit();
    
    Runner.run(runner, engine);
}

// 게임 초기화
function initGame() {
    // 게임 상태 초기화
    score = 0;
    document.getElementById('score').textContent = score;
    isGameOver = false;
    nextFruitIndex = 0;
    canDropFruit = true;
    fruits = [];
    
    // 게임 오버 화면 숨기기
    document.getElementById('game-over').style.display = 'none';
    
    // 벽 생성 및 이벤트 설정
    createWalls();
    setupEventListeners();
    setupCollisionEvents();
    
    // 다음 과일 미리보기 초기화
    generateNextPreviewFruit();
    updateNextFruit();
    
    // 게임 실행
    Runner.run(runner, engine);
    render();
}

// 게임 렌더링
function render() {
    // 캔버스 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 벽 그리기
    ctx.fillStyle = '#cccccc';
    for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        const vertices = wall.vertices;
        
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        
        for (let j = 1; j < vertices.length; j++) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    // 과일 그리기
    for (let i = 0; i < engine.world.bodies.length; i++) {
        const body = engine.world.bodies[i];
        if (body.label === 'fruit') {
            const fruitData = FRUITS[body.fruitIndex];
            
            // 과일 원 그리기
            ctx.beginPath();
            ctx.arc(body.position.x, body.position.y, fruitData.circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = fruitData.color;
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // 참고: 숫자는 HTML 라벨로 표시하므로 여기서는 그리지 않음
        }
    }
    
    requestAnimationFrame(render);
}