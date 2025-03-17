// Matter.js 모듈
const { Engine, World, Bodies, Body, Events, Composite, Runner } = Matter;

// 게임 변수
const container = document.getElementById('game-container');
const containerWidth = 400;
const containerHeight = 600;
const waitingFruitElement = document.getElementById('waiting-fruit');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let nextFruitIndex = 0;
let canDropFruit = true;
let isGameOver = false;
let mouseX = containerWidth / 2;
let fruits = [];
let walls = [];
let fruitLabels = {};
let nextFruitNumber = 0;

// 캔버스 설정
canvas.width = containerWidth;
canvas.height = containerHeight;

// 엔진 생성
const engine = Engine.create({
    positionIterations: 8,
    velocityIterations: 8
});

// 중력 설정 (낮은 값으로 조정)
engine.gravity.y = 1.0;

// 충돌 처리 설정 - 작은 충돌은 무시
const MIN_COLLISION_FORCE = 0.1; // 최소 충돌 힘 임계값

// 러너 생성
const runner = Runner.create();

// 시간 스케일 설정 (낮은 값으로 조정)
engine.timing.timeScale = 0.8;