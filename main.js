// GLOBAL VARIABLES
const container = document.getElementById('game-container');
const canvasContainer = document.getElementById('canvas-container');
const waitingFruitElement = document.getElementById('waiting-fruit');
const containerWidth = container.clientWidth;
const containerHeight = container.clientHeight;

let score = 0; // 점수
let nextFruitIndex = 0; // 과알 제한값
let currentFruit = null; // 현재 과일
let canDropFruit = true; // 과일 드롭 가능
let isGameOver = false; // 게임 종료
let mouseX = 0; // 마우스 X 좌표
let waitingFruitNumber = 0; // 대기 중인 과일의 숫자


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
engine.world.gravity.y = 1.5; // 중력 약간 증가