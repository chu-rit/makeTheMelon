import Phaser from 'phaser';
import fruitConfigs from './fruitConfigs';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // 이미지나 에셋 로드 시 사용
  }

  createFruitTextures() {
    const fruitDrawers = [
      null, // 레벨 0
      this.drawCherry.bind(this),
      this.drawStrawberry.bind(this),
      this.drawGrape.bind(this),
      this.drawOrange.bind(this),
      this.drawPersimmon.bind(this),
      this.drawApple.bind(this),
      this.drawPear.bind(this),
      this.drawPeach.bind(this),
      this.drawPineapple.bind(this),
      this.drawMelon.bind(this),
      this.drawWatermelon.bind(this)
    ];

    fruitDrawers.forEach((drawer, index) => {
      if (drawer) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        drawer(canvas, 400);
        
        const texture = this.textures.createCanvas(`fruit_${index}`, canvas.width, canvas.height);
        const ctx = texture.getContext();
        ctx.drawImage(canvas, 0, 0);
        texture.refresh();
      }
    });
  }

  drawCherry(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 몸통 (물리 엔진 크기에 맞게 꽉 채움, 테두리 클리핑 방지를 위해 약간 작게 그림)
    const bodyRadius = radius - 2;
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, bodyRadius);
    gradient.addColorStop(0, '#FF5E5E');
    gradient.addColorStop(1, '#D60000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, bodyRadius, 0, Math.PI * 2);
    ctx.fill();

    // 테두리 추가 (클리핑 없이 꽉 채우기 위해 4px 선 사용: 198 + 2 = 200)
    ctx.strokeStyle = '#D60000';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 꼭지 부분 (부드러운 곡선)
    ctx.strokeStyle = '#4A2B12';
    ctx.lineWidth = size * 0.05;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(radius, radius * 0.3);
    ctx.quadraticCurveTo(radius * 1.1, radius * 0.1, radius * 1.3, radius * 0.2);
    ctx.stroke();

    // 잎사귀 (아기자기한 포인트)
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(radius * 1.15, radius * 0.2, size * 0.1, size * 0.05, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 광택 (반짝이는 느낌)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(radius * 0.7, radius * 0.7, size * 0.15, size * 0.1, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 작은 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // 귀여운 눈 (훨씬 더 크게)
    ctx.fillStyle = '#4A2B12';
    ctx.beginPath();
    ctx.arc(radius * 0.75, radius * 0.95, size * 0.09, 0, Math.PI * 2); // 왼쪽 눈
    ctx.arc(radius * 1.25, radius * 0.95, size * 0.09, 0, Math.PI * 2); // 오른쪽 눈
    ctx.fill();

    // 눈 하이라이트 (비례해서 키움)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(radius * 0.7, radius * 0.9, size * 0.035, 0, Math.PI * 2);
    ctx.arc(radius * 1.2, radius * 0.9, size * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // 귀여운 입 (더 굵고 크게)
    ctx.strokeStyle = '#4A2B12';
    ctx.lineWidth = size * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(radius, radius * 1.0, size * 0.15, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // 볼터치 (더 크고 투명하게)
    ctx.fillStyle = 'rgba(255, 105, 180, 0.6)';
    ctx.beginPath();
    ctx.ellipse(radius * 0.6, radius * 1.15, size * 0.12, size * 0.07, 0, 0, Math.PI * 2);
    ctx.ellipse(radius * 1.4, radius * 1.15, size * 0.12, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawStrawberry(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 1, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#FF6699');
    gradient.addColorStop(1, '#CC0033');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(radius, radius * 1.1, radius * 0.7, radius * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFD700';
    const seeds = [[radius * 0.6, radius * 0.7], [radius, radius * 0.6], [radius * 1.4, radius * 0.7], [radius * 0.7, radius * 1.1], [radius * 1.3, radius * 1.1], [radius, radius * 1.4]];
    seeds.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(radius * 0.7, radius * 0.3, radius * 0.15, radius * 0.3, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(radius, radius * 0.2, radius * 0.15, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(radius * 1.3, radius * 0.3, radius * 0.15, radius * 0.3, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(radius * 0.7, radius * 0.9, radius * 0.15, radius * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGrape(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(radius, radius * 0.15);
    ctx.lineTo(radius, radius * 0.45);
    ctx.stroke();
    
    const grapes = [[radius, radius * 0.6, radius * 0.35], [radius * 0.55, radius * 0.95, radius * 0.3], [radius * 1.45, radius * 0.95, radius * 0.3], [radius * 0.7, radius * 1.4, radius * 0.25], [radius * 1.3, radius * 1.4, radius * 0.25]];
    
    grapes.forEach(([x, y, r]) => {
      const gradientGrape = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
      gradientGrape.addColorStop(0, '#BB33FF');
      gradientGrape.addColorStop(1, '#660099');
      ctx.fillStyle = gradientGrape;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    grapes.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawOrange(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.7, radius * 0.7, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#FFB84D');
    gradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 140, 0, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(radius + Math.cos(angle) * radius * 0.9, radius + Math.sin(angle) * radius * 0.9);
      ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPersimmon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#FF9933');
    gradient.addColorStop(1, '#CC6600');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(radius, radius * 0.2, radius * 0.15, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawApple(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#FF6666');
    gradient.addColorStop(1, '#CC0000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#990000';
    ctx.beginPath();
    ctx.arc(radius, radius * 0.15, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(radius, radius * 0.15);
    ctx.lineTo(radius, radius * 0.35);
    ctx.stroke();
    
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(radius * 1.2, radius * 0.3, radius * 0.2, radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPear(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 1, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#D4E157');
    gradient.addColorStop(1, '#9CCC65');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(radius, radius * 1.1, radius * 0.7, radius * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(radius, radius * 0.3, radius * 0.4, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(radius, radius * 0.1, radius * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.8, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPeach(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#FFB6C1');
    gradient.addColorStop(1, '#FF69B4');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(radius, radius * 0.1);
    ctx.quadraticCurveTo(radius * 0.7, radius, radius, radius * 1.9);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPineapple(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.85);
    gradient.addColorStop(0, '#FFE680');
    gradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const x = radius * 0.3 + (i * radius * 0.25);
        const y = radius * 0.3 + (j * radius * 0.25);
        ctx.strokeRect(x, y, radius * 0.2, radius * 0.2);
      }
    }
    
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      ctx.save();
      ctx.translate(radius, radius * 0.1);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -radius * 0.4, radius * 0.15, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMelon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#90EE90');
    gradient.addColorStop(1, '#32CD32');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(50, 205, 50, 0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(radius + Math.cos(angle) * radius * 0.9, radius + Math.sin(angle) * radius * 0.9);
      ctx.stroke();
    }
    
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      const r = radius * (0.3 * i);
      ctx.arc(radius, radius, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWatermelon(canvas, size) {
    const ctx = canvas.getContext('2d');
    const radius = size / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
    gradient.addColorStop(0, '#228B22');
    gradient.addColorStop(1, '#006400');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.8)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(radius * 0.2, radius * (0.2 + i * 0.15));
      ctx.quadraticCurveTo(radius, radius * (0.2 + i * 0.15), radius * 1.8, radius * (0.2 + i * 0.15));
      ctx.stroke();
    }
    
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(radius, radius, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    const seeds = [[radius * 0.7, radius * 0.7], [radius * 1.3, radius * 0.7], [radius, radius * 1.1], [radius * 0.8, radius * 0.9], [radius * 1.2, radius * 0.9]];
    seeds.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, radius * 0.08, radius * 0.12, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  create() {
    const { width, height } = this.scale;

    // 과일 텍스처 생성
    this.createFruitTextures();

    // 1. 밝고 화사한 파스텔톤 배경
    const background = this.add.graphics();
    background.fillGradientStyle(0xfff5e1, 0xfff5e1, 0xffe4d1, 0xffe4d1, 1); // 부드러운 크림/살구톤
    background.fillRect(0, 0, width, height);

    // Matter.js 월드 경계 설정
    this.matter.world.setBounds(0, 0, width, height);

    // 2. 따뜻한 느낌의 나무색 벽과 바닥
    const wallColor = 0x8d6e63; // 부드러운 갈색
    const wallThickness = 38;
    
    const createStyledWall = (x, y, w, h, label) => {
      const wall = this.add.rectangle(x, y, w, h, wallColor);
      this.matter.add.gameObject(wall, { isStatic: true, label });
      
      // 상단 테두리 포인트
      const line = this.add.graphics();
      line.lineStyle(2, 0x5d4037, 0.8);
      line.strokeRect(x - w / 2, y - h / 2, w, h);
      return wall;
    };

    // 바닥
    createStyledWall(width / 2, height - (wallThickness / 2), width, wallThickness, 'floor');
    // 왼쪽 벽
    createStyledWall(wallThickness / 2, height / 2, wallThickness, height, 'leftWall');
    // 오른쪽 벽
    createStyledWall(width - (wallThickness / 2), height / 2, wallThickness, height, 'rightWall');

    // [테스트용] 중간 바닥 - 테스트 후 주석 해제하여 제거
    // createStyledWall(width / 2, 600, width, wallThickness, 'testFloor');

    // 3. UI: 따뜻한 톤의 점수 텍스트
    this.score = 0;
    this.scoreText = this.add.text(40, 40, '0', {
      fontSize: '48px',
      color: '#5d4037',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });

    // 게임오버 선 표시 (미리보기 과일 아래)
    // 미리보기 과일 중심: y=100, 레벨 1 반지름=50 → 게임오버 라인 y=150
    const gameOverLineY = 100 + fruitConfigs[1].radius;
    
    const gameOverLine = this.add.graphics();
    gameOverLine.lineStyle(3, 0xff0000, 0.8);
    gameOverLine.beginPath();
    gameOverLine.moveTo(0, gameOverLineY);
    gameOverLine.lineTo(width, gameOverLineY);
    gameOverLine.strokePath();
    gameOverLine.setDepth(5);
    this.gameOverLineY = gameOverLineY;

    this.fruits = [];
    this.fruitConfigs = fruitConfigs;

    // 1. 8각형 정점 생성 함수
    this.getOctagonPoints = (radius) => {
      const sides = 8;
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - (Math.PI / 8);
        points.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
      }
      return points;
    };

    // 2. 대기 과일 관련 상태
    this.previewLevel = 1; // 미리보기 과일의 레벨
    this.previewNumber = this.getRandomNumberForLevel(1); // 미리보기 과일의 숫자
    this.maxFruitLevel = 1; // 현재 게임에 있는 최대 레벨
    this.minDropLevel = 1; // 떨어트릴 과일의 최소 레벨
    this.maxDropLevel = 1; // 떨어트릴 과일의 최대 레벨
    this.levelCheckTimer = 0; // 레벨 체크 타이머

    // 3. 미리보기 과일 생성
    this.previewGraphics = this.add.graphics();
    this.previewText = this.add.text(0, 0, '', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    });
    this.previewText.setOrigin(0.5, 0.5);
    this.previewText.setDepth(15);

    this.gameOverTimer = 0;
    this.isGameOver = false;
    this.gameOverWarning = false; // 게임오버 경고 상태
    this.gameOverWarningTimer = 0; // 게임오버 경고 타이머 (5초)
    this.lastLoggedSecond = -1; // 마지막으로 로그한 초
    this.canDrop = true;
    this.dropCooldown = 0;
    this.mergeCooldown = 0; // 합치기 쿨다운

    // 초기값 설정
    this.lastPointerX = this.scale.width / 2;
    this.previewX = this.scale.width / 2;
    this.previewY = 100;

    // window pointermove 이벤트로 마우스/터치 추적
    window.addEventListener('pointermove', (e) => {
      const canvas = this.game.canvas;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0) {
        const scaleX = this.scale.width / rect.width;
        this.lastPointerX = (e.clientX - rect.left) * scaleX;
      }
    });

    // 터치 아웃 이벤트로 과일 떨어뜨리기
    this.input.on('pointerup', () => {
      // 게임오버 경고 중이거나 게임오버 상태면 과일 떨어트리기 금지
      if (this.isGameOver || this.gameOverWarning) {
        return;
      }
      
      if (this.canDrop) {
        this.dropFruit();
        this.canDrop = false;
        this.dropCooldown = 500; // 0.5초
      }
    });
  }

  dropFruit() {
    // 미리보기에 표시된 과일을 떨어트림
    const dropLevel = this.previewLevel;
    const dropNumber = this.previewNumber;
    const fruitConfig = this.fruitConfigs[dropLevel];
    const radius = fruitConfig.radius;
    const dropX = this.previewX;
    const dropY = this.previewY;

    // 스프라이트 기반 과일 생성
    const fruit = this.add.sprite(dropX, dropY, `fruit_${dropLevel}`);
    fruit.setScale(radius / 200); // 텍스처 크기(400)의 절반인 200을 기준으로 스케일 조정
    fruit.setOrigin(0.5, 0.5);

    // Matter.js 물리 적용 (원형 바디 사용, 반지름을 정확히 설정)
    const Body = Phaser.Physics.Matter.Matter.Body;
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    
    this.matter.add.gameObject(fruit, {
      label: `fruit_${dropLevel}`,
      fruitLevel: dropLevel,
      shape: 'circle',
      circleRadius: radius
    });
    
    // 바디의 반지름을 정확히 설정
    if (fruit.body) {
      fruit.body.circleRadius = radius;
      // 바디 재설정 (slop을 0으로 설정하여 물리 엔진과의 유격을 최소화)
      const newBody = Bodies.circle(dropX, dropY, radius, {
        friction: 0.5,
        restitution: 0.2,
        density: 0.001,
        slop: 0
      });
      fruit.setExistingBody(newBody);
    }
    
    // 초기 속도 설정 (느리게 시작)
    Body.setVelocity(fruit.body, { x: 0, y: 0.5 });
    
    // 중력 강화 (가속도 빠르게)
    fruit.body.gravityScale = 3;

    // 과일 정보 저장
    fruit.radius = radius;
    fruit.level = dropLevel;
    fruit.fruitNumber = dropNumber;
    fruit.initialX = dropX;
    fruit.initialY = dropY;
    this.fruits.push(fruit);

    // 과일 숫자 텍스트 추가
    const fruitText = this.add.text(dropX, dropY, dropNumber, {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    });
    fruitText.setOrigin(0.5, 0.5);
    fruitText.setDepth(10);
    fruit.fruitText = fruitText;

    // 미리보기 과일 숨기기
    if (this.previewSprite) {
      this.previewSprite.setVisible(false);
    }
    this.previewText.setVisible(false);

    // 새로운 미리보기 과일 생성 (범위에서 랜덤하게 선택)
    this.previewLevel = Phaser.Math.Between(this.minDropLevel, this.maxDropLevel);
    this.previewNumber = this.getRandomNumberForLevel(this.previewLevel);

    // 0.5초 후에 미리보기 과일 다시 표시
    this.time.delayedCall(500, () => {
      if (this.previewSprite) {
        this.previewSprite.setVisible(true);
      }
      this.previewText.setVisible(true);
    });
  }

  getRandomNumberForLevel(level) {
    const fruitConfig = this.fruitConfigs[level];
    if (!fruitConfig) return 1;
    
    const minNumber = fruitConfig.minNumber;
    const maxNumber = fruitConfig.maxNumber;
    return Phaser.Math.Between(minNumber, maxNumber);
  }

  updateMaxFruitLevel() {
    // 현재 게임에 있는 최대 레벨 찾기
    let newMaxLevel = 1; // 최소 레벨은 1
    this.fruits.forEach(fruit => {
      if (fruit.level > newMaxLevel) {
        newMaxLevel = fruit.level;
      }
    });

    // 최대 레벨이 변경되었으면 떨어트릴 과일 레벨 업데이트
    if (newMaxLevel !== this.maxFruitLevel) {
      this.maxFruitLevel = newMaxLevel;
      this.updateDropFruitLevel();
    }
  }

  updateDropFruitLevel() {
    // 최대 레벨이 3 이상이면, 레벨 1 ~ 최대 레벨 - 2 범위의 과일 떨어트리기
    // 최대 레벨이 1 또는 2이면, 레벨 1의 과일만 떨어트리기
    const newMinLevel = 1;
    const newMaxLevel = Math.max(1, this.maxFruitLevel - 2);
    
    if (newMinLevel !== this.minDropLevel || newMaxLevel !== this.maxDropLevel) {
      this.minDropLevel = newMinLevel;
      this.maxDropLevel = newMaxLevel;
      this.currentNumber = this.getRandomNumberForLevel(this.minDropLevel);
      console.log(`떨어트릴 과일 레벨 범위 변경: ${newMinLevel}~${newMaxLevel} (최대 레벨: ${this.maxFruitLevel})`);
    }
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 드롭 쿨다운 처리
    if (!this.canDrop && this.dropCooldown > 0) {
      this.dropCooldown -= delta;
      if (this.dropCooldown <= 0) {
        this.canDrop = true;
      }
    }

    // 합치기 쿨다운 처리
    if (this.mergeCooldown > 0) {
      this.mergeCooldown -= delta;
    }

    // 최대 레벨 주기적 체크 (0.5초마다)
    this.levelCheckTimer -= delta;
    if (this.levelCheckTimer <= 0) {
      this.updateMaxFruitLevel();
      this.levelCheckTimer = 500; // 0.5초마다 체크
    }

    // 마우스 포인터 x좌표 추적 (기본값: 게임 중앙)
    let pointerX = this.lastPointerX !== undefined ? this.lastPointerX : this.scale.width / 2;
    
    // 게임 캔버스 범위 내에 있는지 확인
    if (pointerX < 0) pointerX = 0;
    if (pointerX > this.scale.width) pointerX = this.scale.width;
    
    const fixedY = 100;

    // 미리보기 과일 업데이트 (쿨다운 중이 아닐 때만)
    if (this.canDrop) {
      // previewLevel이 유효한 범위인지 확인
      const fruitConfig = this.fruitConfigs[this.previewLevel];
      
      if (fruitConfig && fruitConfig.radius > 0) {
        const radius = fruitConfig.radius;
        
        // 미리보기 x좌표 계산 (벽을 넘어가지 않도록)
        // 8각형의 최대 x 오프셋은 radius * cos(0) = radius
        const minX = radius + 38; // 왼쪽 벽 두께 고려
        const maxX = this.scale.width - radius - 38; // 오른쪽 벽 두께 고려
        const adjustedX = Phaser.Math.Clamp(pointerX, minX, maxX);
        
        this.updatePreview(adjustedX, fixedY);
        // 미리보기 위치 저장
        this.previewX = adjustedX;
        this.previewY = fixedY;
      }
    } else {
      this.previewGraphics.clear();
      this.previewText.setText('');
    }

    // 떨어진 과일의 텍스트 위치 동기화
    this.fruits.forEach(fruit => {
      if (fruit.fruitText) {
        // 텍스트 위치 업데이트
        fruit.fruitText.setPosition(fruit.x, fruit.y);
      }
    });

    // 과일 합치기 체크 (쿨다운이 끝난 후에만)
    if (this.mergeCooldown <= 0) {
      this.checkAndMergeFruits();
    }

    // 게임오버 조건 확인 (과일이 게임오버 선을 넘었는지 확인)
    this.checkGameOver();
  }

  checkGameOver() {
    // 게임오버 선: 미리보기 과일 아래
    const gameOverLine = this.gameOverLineY;

    // 게임오버 경고 상태에서 타이머 감소
    if (this.gameOverWarning) {
      this.gameOverWarningTimer -= 16; // 약 60fps 기준
      
      if (this.gameOverWarningTimer <= 0) {
        // 5초 경과 후 게임오버
        this.triggerGameOver();
        return;
      }

      // 3초, 2초, 1초 남았을 때만 콘솔 로그 (1번씩만)
      const remainingSeconds = Math.ceil(this.gameOverWarningTimer / 1000);
      if (remainingSeconds !== this.lastLoggedSecond) {
        if (remainingSeconds === 3 || remainingSeconds === 2 || remainingSeconds === 1) {
          console.log('게임오버까지 ' + remainingSeconds + '초 남음');
          this.lastLoggedSecond = remainingSeconds;
        }
      }
    }

    // 라인을 넘긴 과일이 있는지 확인
    let hasOverLine = false;
    for (let fruit of this.fruits) {
      // 과일의 상단 경계(중심 - 반지름)가 게임오버 선을 넘었으면
      if (fruit.y - fruit.radius < gameOverLine) {
        hasOverLine = true;
        break;
      }
    }

    // 라인을 넘긴 과일이 있으면 경고 상태 시작
    if (hasOverLine && !this.gameOverWarning) {
      this.gameOverWarning = true;
      this.gameOverWarningTimer = 5000; // 5초
      this.canDrop = false; // 새로운 과일 떨어트리기 금지
    }

    // 라인을 넘긴 과일이 없으면 경고 상태 해제
    if (!hasOverLine && this.gameOverWarning) {
      this.gameOverWarning = false;
      this.gameOverWarningTimer = 0;
      this.canDrop = true; // 새로운 과일 떨어트리기 허용
    }
  }

  triggerGameOver() {
    if (this.isGameOver) return; // 이미 게임오버 상태면 무시

    this.isGameOver = true;
    console.log('게임오버! 최종 점수:', this.score);

    // 어두운 배경 표시
    const darkBackground = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7);
    darkBackground.setDepth(99);

    // 게임오버 텍스트 표시
    const gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'GAME OVER', {
      fontSize: '80px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
    });
    gameOverText.setOrigin(0.5, 0.5);
    gameOverText.setDepth(100);

    // 최종 점수 표시
    const finalScoreText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, '점수: ' + this.score, {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
    });
    finalScoreText.setOrigin(0.5, 0.5);
    finalScoreText.setDepth(100);

    // 재시작 버튼 표시
    const restartButtonX = this.scale.width / 2;
    const restartButtonY = this.scale.height / 2 + 150;
    const buttonWidth = 200;
    const buttonHeight = 60;

    // 버튼 배경
    const restartButtonBg = this.add.rectangle(restartButtonX, restartButtonY, buttonWidth, buttonHeight, 0x4CAF50);
    restartButtonBg.setDepth(100);

    // 버튼 텍스트
    const restartButtonText = this.add.text(restartButtonX, restartButtonY, '재시작', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
    });
    restartButtonText.setOrigin(0.5, 0.5);
    restartButtonText.setDepth(101);

    // 버튼 클릭 이벤트
    restartButtonBg.setInteractive();
    restartButtonBg.on('pointerover', () => {
      restartButtonBg.setFillStyle(0x45a049);
    });
    restartButtonBg.on('pointerout', () => {
      restartButtonBg.setFillStyle(0x4CAF50);
    });
    restartButtonBg.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  checkAndMergeFruits() {
    const fruitsToRemove = [];
    let merged = true;

    // 합쳐질 과일이 없을 때까지 반복
    while (merged) {
      merged = false;
      
      // 모든 가능한 인접 그룹 찾기
      const allGroups = this.findAllAdjacentGroups(fruitsToRemove);

      for (let group of allGroups) {
        if (group.length < 2) continue;

        // 그룹의 숫자 합 계산
        const sum = group.reduce((acc, f) => acc + f.fruitNumber, 0);

        // 합이 10이면 합치기
        if (sum === 10) {
          const newLevel = group[0].level + 1;
          
          // 점수 계산
          let scoreToAdd;
          if (group[0].level === 1) {
            scoreToAdd = group.length;
          } else {
            scoreToAdd = group.length * group[0].level;
          }
          
          console.log(`합치기: ${group.map(f => f.fruitNumber).join('+')} = ${sum}, 레벨: ${group[0].level} → ${newLevel}, 점수: +${scoreToAdd}`);
          
          // 첫 번째 과일 위치에서 새 과일 생성
          const newX = group[0].x;
          const newY = group[0].y;

          // 인접한 과일들 제거
          group.forEach(f => {
            if (f.fruitGraphics) f.fruitGraphics.destroy();
            if (f.fruitText) f.fruitText.destroy();
            f.destroy();
            fruitsToRemove.push(f);
          });

          // 새 과일 생성 (합쳐진 과일 갯수 전달)
          this.createMergedFruit(newX, newY, newLevel, group.length);
          
          // 모든 과일의 sleep 상태 해제 (중력 재적용)
          const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
          this.fruits.forEach(fruit => {
            if (fruit.body) {
              Sleeping.set(fruit.body, false);
            }
          });
          
          // 합치기 쿨다운 설정 (2초)
          this.mergeCooldown = 2000;
          
          merged = true;
          break; // 다시 처음부터 체크
        }
      }
    }

    // 제거할 과일들 배열에서 삭제
    this.fruits = this.fruits.filter(f => !fruitsToRemove.includes(f));
  }

  findAllAdjacentGroups(fruitsToRemove) {
    const groups = [];
    const processed = new Set();

    for (let fruit of this.fruits) {
      if (fruitsToRemove.includes(fruit) || processed.has(fruit)) continue;

      // 같은 레벨의 모든 인접한 과일들을 BFS로 찾기
      const fullGroup = this.findAdjacentGroup(fruit, fruitsToRemove);
      
      if (fullGroup.length > 0) {
        // 전체 그룹 추가
        groups.push(fullGroup);
        
        // 전체 그룹의 모든 연속 부분 그룹도 추가
        for (let i = 0; i < fullGroup.length; i++) {
          for (let j = i + 2; j <= fullGroup.length; j++) {
            const subGroup = fullGroup.slice(i, j);
            groups.push(subGroup);
          }
        }
        
        fullGroup.forEach(f => processed.add(f));
      }
    }

    return groups;
  }

  findAdjacentGroup(startFruit, fruitsToRemove) {
    const group = [startFruit];
    const queue = [startFruit];
    const visited = new Set([startFruit]);

    while (queue.length > 0) {
      const currentFruit = queue.shift();

      // 같은 레벨의 모든 과일 중 인접한 것 찾기
      for (let fruit of this.fruits) {
        if (visited.has(fruit) || fruitsToRemove.includes(fruit)) continue;
        if (fruit.level !== currentFruit.level) continue;

        // 인접한지 확인
        if (this.isAdjacent(currentFruit, fruit)) {
          visited.add(fruit);
          group.push(fruit);
          queue.push(fruit);
        }
      }
    }

    return group;
  }

  isAdjacent(fruit1, fruit2) {
    const distance = Phaser.Math.Distance.Between(fruit1.x, fruit1.y, fruit2.x, fruit2.y);
    const minDistance = fruit1.radius + fruit2.radius + 2; // 약간의 여유만 유지
    return distance < minDistance;
  }

  createMergedFruit(x, y, level, mergedCount = 1) {
    if (level >= this.fruitConfigs.length) return; // 최대 레벨 초과 방지

    const fruitConfig = this.fruitConfigs[level];
    const radius = fruitConfig.radius;
    const newNumber = this.getRandomNumberForLevel(level);

    // 스프라이트 기반 과일 생성
    const fruit = this.add.sprite(x, y, `fruit_${level}`);
    fruit.setScale(radius / 200);
    fruit.setOrigin(0.5, 0.5);

    // Matter.js 물리 적용 (원형 바디 사용, 반지름을 정확히 설정)
    const Body = Phaser.Physics.Matter.Matter.Body;
    const Bodies = Phaser.Physics.Matter.Matter.Bodies;
    const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
    
    this.matter.add.gameObject(fruit, {
      label: `fruit_${level}`,
      fruitLevel: level,
      shape: 'circle',
      circleRadius: radius
    });
    
    // 바디의 반지름을 정확히 설정
    if (fruit.body) {
      fruit.body.circleRadius = radius;
      // 바디 재설정 (slop을 0으로 설정하여 물리 엔진과의 유격을 최소화)
      const newBody = Bodies.circle(x, y, radius, {
        friction: 0.5,
        restitution: 0.2,
        density: 0.001,
        slop: 0
      });
      fruit.setExistingBody(newBody);
    }
    
    // 중력 적용을 위해 sleeping 상태 해제
    Sleeping.set(fruit.body, false);

    // 과일 정보 저장
    fruit.radius = radius;
    fruit.level = level;
    fruit.fruitNumber = newNumber;
    fruit.initialX = x;
    fruit.initialY = y;
    this.fruits.push(fruit);

    // 과일 숫자 텍스트 추가
    const fruitText = this.add.text(x, y, newNumber, {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    });
    fruitText.setOrigin(0.5, 0.5);
    fruitText.setDepth(10);
    fruit.fruitText = fruitText;

    // 점수 추가 (합쳐진 과일 갯수 * 레벨)
    // 1레벨: 합쳐진 과일 갯수만큼
    // 2레벨 이상: 합쳐진 과일 갯수 * 레벨
    let scoreToAdd;
    if (level === 1) {
      scoreToAdd = mergedCount;
    } else {
      scoreToAdd = mergedCount * level;
    }
    this.score += scoreToAdd;
    this.scoreText.setText(this.score);

    // 합쳐지는 이펙트 추가
    this.createMergeEffect(x, y, fruitConfig.color, radius);
  }

  createMergeEffect(x, y, color, radius) {
    // 파티클 이펙트 생성
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      
      const particle = this.add.circle(x, y, 4, color);
      particle.setDepth(15);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * (radius + 40),
        y: y + Math.sin(angle) * (radius + 40),
        alpha: 0,
        duration: 600,
        ease: 'Power2.easeOut',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 중심 원형 펄스 이펙트
    const pulseCircle = this.add.circle(x, y, radius * 0.8, color);
    pulseCircle.setAlpha(0.6);
    pulseCircle.setDepth(14);
    
    this.tweens.add({
      targets: pulseCircle,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => {
        pulseCircle.destroy();
      }
    });

    // 충격파 이펙트 (여러 개의 확장하는 원)
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 80, () => {
        const shockwave = this.add.circle(x, y, radius * 0.3, 0xffffff);
        shockwave.setAlpha(0.8);
        shockwave.setDepth(13);
        shockwave.setStrokeStyle(3, color);
        
        this.tweens.add({
          targets: shockwave,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 600,
          ease: 'Quad.easeOut',
          onComplete: () => {
            shockwave.destroy();
          }
        });
      });
    }

    // 새 과일 텍스트만 스케일 애니메이션 (물리 바디는 건드리지 않음)
    const lastFruit = this.fruits[this.fruits.length - 1];
    if (lastFruit && lastFruit.fruitText) {
      lastFruit.fruitText.setScale(0.7);
      
      this.tweens.add({
        targets: lastFruit.fruitText,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
  }

  updatePreview(mouseX, mouseY) {
    const fruitConfig = this.fruitConfigs[this.previewLevel];
    const radius = fruitConfig.radius;

    // 미리보기 그래픽 초기화
    this.previewGraphics.clear();

    // 게임오버 경고 중이면 투명도 처리
    let alpha = 1;
    if (this.gameOverWarning) {
      alpha = 0.5; // 투명도 처리
    }

    // 스프라이트 기반 미리보기 (텍스처 사용)
    if (!this.previewSprite) {
      this.previewSprite = this.add.sprite(mouseX, mouseY, `fruit_${this.previewLevel}`);
      this.previewSprite.setOrigin(0.5, 0.5);
      this.previewSprite.setDepth(5);
      this.previewSpriteRotation = 0;
    } else {
      // 기존 스프라이트 업데이트
      this.previewSprite.setTexture(`fruit_${this.previewLevel}`);
      this.previewSprite.setPosition(mouseX, mouseY);
    }
    
    this.previewSprite.setScale(radius / 200);
    this.previewSprite.setAlpha(alpha);
    
    // 회전 애니메이션 (천천히 회전)
    this.previewSpriteRotation = (this.previewSpriteRotation + 0.02) % (Math.PI * 2);
    this.previewSprite.setRotation(this.previewSpriteRotation);

    // 숫자 텍스트 업데이트
    this.previewText.setText(this.previewNumber);
    this.previewText.setPosition(mouseX, mouseY);
    this.previewText.setAlpha(alpha);
  }
}
