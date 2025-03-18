// 물리 엔진 설정
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events,
    World = Matter.World,
    Composite = Matter.Composite;

    // 엔진 생성
const engine = Engine.create({
    enableSleeping: true, // 움직임이 없는 물체는 '잠자기' 상태로 전환하여 성능 향상
    constraintIterations: 4, // 제약 조건 반복 횟수 증가
    positionIterations: 8, // 위치 계산 반복 횟수 증가
    velocityIterations: 8, // 속도 계산 반복 횟수 증가
});
engine.world.gravity.y = 1; // 중력 조정
engine.world.gravity.scale = 0.001; // 중력 스케일 조정

// 게임 설정
const container = document.getElementById('game-container');
const canvasContainer = document.getElementById('canvas-container');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;
let score = 0;
let isGameOver = false;
let mouseX = containerWidth / 2;
let waitingFruitElement = null;

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

// 충돌 이벤트 감지
Events.on(engine, 'collisionStart', function(event) {
    if (isGameOver) return;
    
    // 충돌이 발생하면 즉시 과일 그룹 확인
    checkFruitGroups();
});

// 주기적으로 모든 과일 그룹 확인 (0.1초마다)
// setInterval(checkFruitGroups, 100);

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

// 로딩 완료시
document.addEventListener('DOMContentLoaded', function(e){
    initGame(); // 게임 준비
    updateNextFruit();
    createWall();
})

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
    nextFruitIndex = 0; // 항상 체리(인덱스 0)만 선택
    waitingFruitNumber = Math.floor(Math.random() * 9) + 1; // 새로운 대기 과일에 대한 랜덤 숫자 할당
    
    // 드롭 가능 상태로 설정
    canDropFruit = true;

    // 대기 중인 과일 설정
    waitingFruitElement = document.getElementById('waiting-fruit');
    updateWaitingFruit();
}
