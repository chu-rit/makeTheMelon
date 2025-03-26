document.addEventListener('DOMContentLoaded', () => {
    // 게임 초기화 및 렌더링
    render();
    initGame();
    createWall();

    // 이벤트 위임을 사용하여 클릭 및 터치 이벤트 처리
    container.addEventListener('click', handleInteraction);
    container.addEventListener('touchend', handleInteraction);

    // 마우스 이동 이벤트 처리 (디바운싱 제거)
    document.addEventListener('mousemove', (e) => {
        handleMouseMove(e); // 디바운싱 제거
    });

    // 터치 이동 이벤트 처리 (디바운싱 적용)
    let touchMoveTimer;
    document.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 스크롤 방지
        clearTimeout(touchMoveTimer);
        touchMoveTimer = setTimeout(() => handleTouchMove(e), 10);
    }, { passive: false });

    // 충돌 이벤트 감지 (스로틀링 적용)
    let lastCollisionCheck = 0;
    Events.on(engine, 'collisionStart', (event) => {
        if (isGameOver) return;
        
        const now = Date.now();
        if (now - lastCollisionCheck > 50) { // 50ms 간격으로 제한
            lastCollisionCheck = now;
            checkFruitGroups();
        }
    });

    // 게임 오버 체크 (프레임 최적화)
    let gameOverCheckCounter = 0;
    Events.on(engine, 'afterUpdate', () => {
        if (isGameOver) return;
        
        // 모든 프레임에서 체크하지 않고 10프레임마다 체크
        gameOverCheckCounter++;
        if (gameOverCheckCounter >= 10) {
            gameOverCheckCounter = 0;
            checkGameOver();
        }
    });
    
    // 다시 시작 버튼 이벤트 리스너
    restartButton.addEventListener('click', initGame);
});

// 상호작용 핸들러 (클릭 및 터치)
function handleInteraction() {
    if (canDropFruit) {
        dropFruit(mouseX);
    }
}

// 마우스 이동 핸들러
function handleMouseMove(e) {
    const rect = container.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right) {
        updateMousePosition(e.clientX - rect.left);
    }
}

// 터치 이동 핸들러
function handleTouchMove(e) {
    if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        
        if (touch.clientX >= rect.left && touch.clientX <= rect.right) {
            updateMousePosition(touch.clientX - rect.left);
        }
    }
}

// 마우스/터치 위치 업데이트 (공통 함수)
function updateMousePosition(x) {
    mouseX = Math.max(40, Math.min(x, containerWidth - 40));
    
    if (canDropFruit) {
        updateWaitingFruit();
    }
}

// 게임 오버 체크 함수
function checkGameOver() {
    const bodies = Composite.allBodies(engine.world);
    const fruits = bodies.filter(body => body.fruitIndex !== undefined);
    
    for (let i = 0; i < fruits.length; i++) {
        const fruit = fruits[i];
        
        // 과일이 상단에 있고 움직임이 거의 없는 경우
        if (fruit.position.y < 120 && 
            Math.abs(fruit.velocity.y) < 0.05 && 
            fruit.position.x > 30 && 
            fruit.position.x < containerWidth - 30) {
            
            if (!fruit.stableTime) {
                fruit.stableTime = Date.now();
            } else if (Date.now() - fruit.stableTime > 5000) { // 5초 이상 상단에 머물러 있으면 게임 오버
                // 주변에 다른 과일이 있는지 확인
                let hasNearbyFruits = false;
                const fruitRadius = FRUITS[fruit.fruitIndex].radius;
                
                for (let j = 0; j < fruits.length; j++) {
                    if (fruits[j].id === fruit.id) continue;
                    
                    const dx = fruits[j].position.x - fruit.position.x;
                    const dy = fruits[j].position.y - fruit.position.y;
                    const distanceSquared = dx * dx + dy * dy;
                    
                    if (distanceSquared < (fruitRadius * 3) * (fruitRadius * 3)) {
                        hasNearbyFruits = true;
                        break;
                    }
                }
                
                if (!hasNearbyFruits) {
                    isGameOver = true;
                    gameOverElement.style.display = 'block';
                    restartButton.style.display = 'block';
                    return;
                } else {
                    // 주변에 과일이 있으면 안정 시간 초기화
                    fruit.stableTime = Date.now();
                }
            }
        } else {
            fruit.stableTime = null;
        }
    }
}

// 모바일 디바이스에서 확대/축소 방지 (이벤트 위임 사용)
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// 더블 탭 확대 방지 (최적화)
const DOUBLE_TAP_DELAY = 500;
let lastTapTime = 0;

document.addEventListener('touchend', (e) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
        e.preventDefault();
    }
    
    lastTapTime = currentTime;
}, { passive: false });

// 렌더링 함수 (최적화)
function render() {
    // 렌더러 설정 객체
    const renderOptions = {
        width: containerWidth,
        height: containerHeight,
        wireframes: false,
        background: '#fff',
        pixelRatio: window.devicePixelRatio || 1,
        // 불필요한 디버그 옵션 비활성화
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
    };

    // 렌더러 생성 및 실행
    const render = Render.create({
        element: canvasContainer,
        engine: engine,
        options: renderOptions
    });

    Render.run(render);
    
    // 물리 엔진 실행
    const runner = Runner.create();
    Runner.run(runner, engine);
}

// 게임 초기화 함수 (최적화)
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
    scoreElement.textContent = `점수: ${score}`;
    
    // 게임 오버 상태 초기화
    isGameOver = false;
    gameOverElement.style.display = 'none';
    restartButton.style.display = 'none';
    
    // 대기 과일 초기화 - 확률 분포 적용
    waitingFruitNumber = getRandomNumber();
    nextFruitIndex = 0; // 항상 체리(인덱스 0)로 설정
    updateWaitingFruit();
    
    // 드롭 가능 상태로 설정
    canDropFruit = true;
}

// 확률 분포에 따른 랜덤 숫자 생성 (1-9)
// 1~3: 40%, 4~6: 40%, 7~9: 20% 확률 분포
function getRandomNumber() {
    // 확률에 따른 범위 결정
    const rand = Math.random();
    let rangeMin, rangeMax;
    
    if (rand < 0.4) {
        // 40% 확률로 1-3 범위
        rangeMin = 1;
        rangeMax = 3;
    } else if (rand < 0.8) {
        // 40% 확률로 4-6 범위
        rangeMin = 4;
        rangeMax = 6;
    } else {
        // 20% 확률로 7-9 범위
        rangeMin = 7;
        rangeMax = 9;
    }
    
    // 선택된 범위 내에서 랜덤 숫자 생성
    return Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
}

// 벽 생성 함수 (최적화)
function createWall() {
    // 벽 공통 옵션
    const wallOptions = {
        isStatic: true,
        render: {
            visible: true,
            fillStyle: 'transparent',
            strokeStyle: '#333',
            lineWidth: 1
        }
    };

    // 바닥 벽 (다른 스타일)
    const groundOptions = {
        ...wallOptions,
        render: {
            ...wallOptions.render,
            fillStyle: '#f0f0f0'
        }
    };

    // 벽 생성
    const ground = Bodies.rectangle(containerWidth / 2, containerHeight, containerWidth, 20, groundOptions);
    const leftWall = Bodies.rectangle(0, containerHeight / 2, 10, containerHeight, wallOptions);
    const rightWall = Bodies.rectangle(containerWidth, containerHeight / 2, 10, containerHeight, wallOptions);

    // 한 번에 월드에 추가
    World.add(engine.world, [ground, leftWall, rightWall]);
}