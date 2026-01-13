// GLOBAL VARIABLES
const container = document.getElementById('game-container');
const canvasContainer = document.getElementById('canvas-container');
const waitingFruitElement = document.getElementById('waiting-fruit');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

// 게임 상태 변수
let score = 0;
let nextFruitIndex = 0;
let currentFruit = null;
let canDropFruit = true;
let isGameOver = false;
let mouseX = 0;
let waitingFruitNumber = 0;
// 숫자 변수 정의
let currentFruitNumber = 0; // 현재 떨어질 숫자
let nextFruitNumber = 0; // 다음에 떨어질 숫자

// 물리 엔진 모듈
const { Engine, Render, Runner, Bodies, Body, Events, World, Composite } = Matter;

// 엔진 생성 및 최적화 설정
const engine = Engine.create({
    enableSleeping: true,
    constraintIterations: 4,
    positionIterations: 8,
    velocityIterations: 8,
});
engine.world.gravity.y = 1.5;

// 러너 생성 및 시작
const runner = Runner.create();
Runner.run(runner, engine);