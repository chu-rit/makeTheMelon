document.addEventListener('DOMContentLoaded', () => {
    render(); //랜더링
    initGame(); // 게임 초기화
    createWall();

    container.addEventListener('click', function(e) {
        if (canDropFruit) {
            dropFruit(mouseX);
        }
    });

    // 터치 이벤트로 과일 드롭
    container.addEventListener('touchend', function(e) {
        if (canDropFruit) {
            dropFruit(mouseX);
        }
    });

    // 마우스 이벤트
    document.addEventListener('mousemove', function(e) {
        // 마우스 위치 계산 및 제한
        const rect = container.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
            mouseX = e.clientX - rect.left;
            mouseX = Math.max(40, Math.min(mouseX, containerWidth - 40));
            
            // 대기 중인 과일 위치 업데이트
            if (canDropFruit) {
                updateWaitingFruit();
            }
        }
    });

    // 터치 이벤트 추가
    document.addEventListener('touchmove', function(e) {
        // 스크롤 방지
        e.preventDefault();
        
        // 터치 위치 계산 및 제한
        if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            const rect = container.getBoundingClientRect();
            
            if (touch.clientX >= rect.left && touch.clientX <= rect.right) {
                mouseX = touch.clientX - rect.left;
                mouseX = Math.max(40, Math.min(mouseX, containerWidth - 40));
                
                // 대기 중인 과일 위치 업데이트
                if (canDropFruit) {
                    updateWaitingFruit();
                }
            }
        }
    }, { passive: false });

    // 충돌 이벤트 감지
    Events.on(engine, 'collisionStart', function(event) {
        if (isGameOver) return;
        
        // 충돌이 발생하면 즉시 과일 그룹 확인
        checkFruitGroups();
    });

    // 게임 오버 체크
    Events.on(engine, 'afterUpdate', function() {
        if (isGameOver) return;
        
        const bodies = Composite.allBodies(engine.world);
        const fruits = bodies.filter(body => body.fruitIndex !== undefined);
        
        // 과일이 상단에 오래 머물러 있는지 확인
        for (let i = 0; i < fruits.length; i++) {
            const fruit = fruits[i];
            
            // 과일이 상단에 있고 움직임이 거의 없는 경우
            if (fruit.position.y < 120 && Math.abs(fruit.velocity.y) < 0.05 && fruit.position.x > 30 && fruit.position.x < containerWidth - 30) {
                if (!fruit.stableTime) {
                    fruit.stableTime = Date.now();
                } else if (Date.now() - fruit.stableTime > 5000) { // 5초 이상 상단에 머물러 있으면 게임 오버
                    // 추가 검증: 주변에 다른 과일이 있는지 확인
                    let nearbyFruits = 0;
                    for (let j = 0; j < fruits.length; j++) {
                        const otherFruit = fruits[j];
                        if (otherFruit.id !== fruit.id) {
                            const dx = otherFruit.position.x - fruit.position.x;
                            const dy = otherFruit.position.y - fruit.position.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            // 과일의 반지름을 이용해 거리 계산
                            const fruitRadius = FRUITS[fruit.fruitIndex].radius;
                            if (distance < fruitRadius * 3) {
                                nearbyFruits++;
                            }
                        }
                    }
                    
                    // 주변에 과일이 없으면 게임오버
                    if (nearbyFruits < 1) {
                        isGameOver = true;
                        document.getElementById('game-over').style.display = 'block';
                        document.getElementById('restart-button').style.display = 'block';
                        break;
                    } else {
                        // 주변에 과일이 있으면 안정 시간 초기화
                        fruit.stableTime = Date.now();
                    }
                }
            } else {
                fruit.stableTime = null;
            }
        }
    });
    
    // 다시 시작 버튼 이벤트 리스너
    document.getElementById('restart-button').addEventListener('click', function() {
        initGame();
    });
    
});

// 모바일 디바이스에서 확대/축소 방지
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// 더블 탭 확대 방지
let lastTapTime = 0;
document.addEventListener('touchend', function(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
    }
    lastTapTime = currentTime;
}, { passive: false });

// 렌더링 함수
function render() {
    // 렌더러 생성
    const render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: {
            width: containerWidth,
            height: containerHeight,
            wireframes: false,
            background: '#fff',
            pixelRatio: window.devicePixelRatio,
            showSleeping: false,
            showDebug: false,
            showBroadphase: false,
            showBounds: false,
            showVelocity: false,
            showCollisions: false,
            showSeparations: false,
            showAxes: false,
            showPositions: false,
            showAngleIndicator: false,
            showIds: false,
            showShadows: false,
            showVertexNumbers: false,
            showConvexHulls: false,
            showInternalEdges: false,
            showMousePosition: false
        }
    });

    // 렌더러 실행
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
}

// 게임 초기화 함수
function initGame() {
    // 기존 과일 모두 제거
    const bodies = Composite.allBodies(engine.world);
    bodies.forEach(body => {
        if (body.fruitIndex !== undefined) {
            // 텍스트 요소 제거
            if (body.textId) {
                const text = document.getElementById(body.textId);
                if (text) text.remove();
            }
            World.remove(engine.world, body);
        }
    });

    // 점수 초기화
    score = 0;
    document.getElementById('score').textContent = `점수: ${score}`;
    
    // 게임 오버 상태 초기화
    isGameOver = false;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('restart-button').style.display = 'none';
    
    // 대기 과일 초기화
    waitingFruitNumber = Math.floor(Math.random() * 9) + 1; // 랜덤 숫자 생성
    while(waitingFruitNumber == 1) { // 체리와 다른 숫자 생성
        waitingFruitNumber = Math.floor(Math.random() * 9) + 1;
    }
    nextFruitIndex = 0; // 항상 체리(인덱스 0)로 설정
    updateWaitingFruit();
    
    // 드롭 가능 상태로 설정
    canDropFruit = true;
}

// 벽 생성 함수
function createWall() {
    // 벽 생성
    const wallOptions = {
        isStatic: true,
        render: {
            visible: true,
            fillStyle: 'transparent',
            strokeStyle: '#333',
            lineWidth: 1
        }
    };

    const ground = Bodies.rectangle(containerWidth / 2, containerHeight, containerWidth, 20, {
        ...wallOptions,
        render: {
            ...wallOptions.render,
            fillStyle: '#f0f0f0'
        }
    });
    const leftWall = Bodies.rectangle(0, containerHeight / 2, 10, containerHeight, wallOptions);
    const rightWall = Bodies.rectangle(containerWidth, containerHeight / 2, 10, containerHeight, wallOptions);

    World.add(engine.world, [ground, leftWall, rightWall]);
}