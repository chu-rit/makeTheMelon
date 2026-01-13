// 회전 기능 구현
let isRotating = false;
let rotationAngle = 0;
// isFlipped 변수를 window 객체에 할당하여 전역으로 만듦
window.isFlipped = false; // 화면이 뒤집혔는지 여부
let rotationInterval = null; // rotationInterval 변수 추가

// DOM 요소 참조
document.addEventListener('DOMContentLoaded', () => {
    const rotateButton = document.getElementById('rotate-button');
    rotateButton.addEventListener('click', startRotation);
});

// 회전 시작 함수
function startRotation() {
    if (isRotating) return; // 이미 회전 중이면 무시
    
    isRotating = true;
    
    // 물리 엔진 일시 중지
    if (typeof engine !== 'undefined' && typeof runner !== 'undefined') {
        Matter.Runner.stop(runner);
    }
    
    // 캔버스 컨테이너 참조 (게임 영역만 회전)
    const canvasContainer = document.getElementById('canvas-container');
    
    // 회전 애니메이션 시작
    rotationAngle = 0;
    rotationInterval = setInterval(() => rotateStep(canvasContainer), 16); // 약 60fps
}

// 회전 단계 함수
function rotateStep(canvasContainer) {
    rotationAngle += 2; // 2도씩 회전 (더 부드러운 애니메이션)
    
    // 캔버스 컨테이너 회전
    canvasContainer.style.transform = `rotate(${rotationAngle}deg)`;
    
    // 180도 회전 완료 시 회전 종료
    if (rotationAngle >= 180) {
        endRotation(canvasContainer);
    }
}

// 회전 종료 함수
function endRotation(canvasContainer) {
    clearInterval(rotationInterval);
    
    // 회전 상태 토글
    window.isFlipped = !window.isFlipped;
    
    // 회전 완료 후 최종 상태 설정
    if (window.isFlipped) {
        // 뒤집힌 상태로 설정
        canvasContainer.style.transform = 'rotate(180deg)';
        
        // 게임 라인 위치 조정
        adjustGameElements();
        
        // 중력 방향 반전 (화면 기준으로 위에서 아래로)
        Matter.Engine.clear(engine);
        engine.world.gravity.y = -1; // 중력 방향 반전
        
        // 바닥 재설정
        resetFloor();
        
        // 모든 과일의 속도와 각속도 재설정
        resetFruitsVelocity();
    } else {
        // 원래 상태로 복원
        canvasContainer.style.transform = 'rotate(0deg)';
        
        // 게임 라인 위치 복원
        adjustGameElements();
        
        // 중력 방향 복원
        Matter.Engine.clear(engine);
        engine.world.gravity.y = 1; // 원래 중력 방향
        
        // 바닥 재설정
        resetFloor();
        
        // 모든 과일의 속도와 각속도 재설정
        resetFruitsVelocity();
    }
    
    // 물리 엔진 재시작
    if (typeof engine !== 'undefined' && typeof runner !== 'undefined') {
        Matter.Runner.start(runner, engine);
    }
    
    isRotating = false;
}

// 모든 과일의 속도와 각속도 재설정 함수
function resetFruitsVelocity() {
    // 모든 바디 가져오기
    const bodies = Matter.Composite.allBodies(engine.world);
    
    // 정적이 아닌 바디(과일)만 필터링
    const fruits = bodies.filter(body => !body.isStatic);
    
    // 각 과일의 속도와 각속도 재설정
    fruits.forEach(fruit => {
        // sleeping 상태 해제 (중요: 이렇게 해야 중력을 다시 받음)
        Matter.Sleeping.set(fruit, false);
        
        // 속도 초기화 (약간의 랜덤성 추가)
        Matter.Body.setVelocity(fruit, {
            x: (Math.random() - 0.5) * 0.5, // 약간의 좌우 랜덤 움직임
            y: window.isFlipped ? -0.1 : 0.1 // 중력 방향에 맞게 약간의 초기 속도 부여
        });
        
        // 각속도 초기화 (약간의 랜덤성 추가)
        Matter.Body.setAngularVelocity(fruit, (Math.random() - 0.5) * 0.05);
        
        // 중력에 맞게 과일 각도 조정
        if (window.isFlipped) {
            // 뒤집힌 상태에서는 과일도 180도 회전
            Matter.Body.setAngle(fruit, fruit.angle + Math.PI);
        }
        
        // 강제로 한 번 업데이트하여 중력 적용
        Matter.Body.applyForce(fruit, fruit.position, {
            x: 0,
            y: window.isFlipped ? -0.001 : 0.001 // 중력 방향에 맞는 약한 힘 적용
        });
        
        // 충돌 그룹 재설정 (충돌 감지 재활성화)
        fruit.collisionFilter = {
            category: 0x0001,
            mask: 0xFFFFFFFF,
            group: 0
        };
    });
    
    // 엔진 업데이트 강제 실행 (중력 즉시 적용)
    Matter.Engine.update(engine, 16.67); // 약 60fps에 해당하는 시간
}

// 바닥 재설정 함수
function resetFloor() {
    // 기존 바닥 및 벽 제거
    const bodies = Matter.Composite.allBodies(engine.world);
    const staticBodies = bodies.filter(body => body.isStatic);
    
    // 기존 정적 객체 제거
    staticBodies.forEach(body => {
        Matter.World.remove(engine.world, body);
    });
    
    // 컨테이너 크기
    const containerWidth = document.getElementById('game-container').offsetWidth;
    const containerHeight = document.getElementById('game-container').offsetHeight;
    
    // 벽 공통 옵션
    const wallOptions = {
        isStatic: true,
        render: {
            fillStyle: '#333',
            strokeStyle: '#333',
            lineWidth: 0
        },
        label: 'wall'
    };
    
    // 바닥 옵션
    const groundOptions = {
        isStatic: true,
        render: {
            fillStyle: '#333',
            strokeStyle: '#333',
            lineWidth: 0
        },
        label: 'floor'
    };
    
    // 바닥 및 벽 생성 (화면 방향에 맞게)
    let ground, leftWall, rightWall;
    
    if (window.isFlipped) {
        // 뒤집힌 상태에서는 바닥이 위에 위치
        ground = Matter.Bodies.rectangle(
            containerWidth / 2, 
            20, // 상단에 위치
            containerWidth, 
            40, 
            groundOptions
        );
    } else {
        // 원래 상태에서는 바닥이 아래에 위치
        ground = Matter.Bodies.rectangle(
            containerWidth / 2, 
            containerHeight - 20, // 하단에 위치
            containerWidth, 
            40, 
            groundOptions
        );
    }
    
    // 좌우 벽 생성 (항상 동일)
    leftWall = Matter.Bodies.rectangle(
        0, 
        containerHeight / 2, 
        20, 
        containerHeight, 
        wallOptions
    );
    
    rightWall = Matter.Bodies.rectangle(
        containerWidth, 
        containerHeight / 2, 
        20, 
        containerHeight, 
        wallOptions
    );
    
    // 월드에 추가
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);
}

// 게임 요소 조정 함수
function adjustGameElements() {
    // 대기 중인 과일 컨테이너 위치 조정 (회전하지 않음)
    const waitingFruitContainer = document.getElementById('waiting-fruit-container');
    if (waitingFruitContainer) {
        // 회전하지 않도록 설정 (항상 화면 상단에 위치)
        waitingFruitContainer.style.transform = 'rotate(0deg)';
    }
    
    // 드롭 라인 위치 조정 (회전하지 않음)
    const dropLine = document.querySelector('.drop-line');
    if (dropLine) {
        // 회전하지 않도록 설정 (항상 화면 상단에 위치)
        dropLine.style.transform = 'rotate(0deg)';
        // z-index 조정으로 항상 최상단에 표시
        dropLine.style.zIndex = '20';
    }
    
    // 게임 오버 요소 조정 (회전하지 않음)
    const gameOver = document.getElementById('game-over');
    if (gameOver) {
        gameOver.style.transform = 'translate(-50%, -50%)';
    }
    
    // 점수 표시 요소 조정 (회전하지 않음)
    const score = document.getElementById('score');
    if (score) {
        score.style.transform = 'translateX(-50%)';
    }
    
    // 대기 중인 과일 위치 조정
    updateWaitingFruitPosition();
}

// 대기 중인 과일 위치 조정 함수
function updateWaitingFruitPosition() {
    // 대기 중인 과일 요소 가져오기
    const waitingFruit = document.getElementById('waiting-fruit');
    if (!waitingFruit) return;
    
    // 현재 과일 정보 가져오기
    if (typeof currentFruitNumber === 'undefined' || typeof nextFruitIndex === 'undefined') return;
    
    // 과일 정보 가져오기
    const fruitIndex = nextFruitIndex;
    const fruit = FRUITS[fruitIndex];
    
    // 회전 상태와 관계없이 항상 상단에 위치
    waitingFruit.style.top = `${100 - fruit.radius}px`;
}
