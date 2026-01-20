// Phaser 기반 과일 그리기 함수들

export function createFruitTextures(scene) {
  const fruitDrawers = [
    null, // 레벨 0 (사용 안함)
    drawCherry,
    drawGrape,
    drawStrawberry,
    drawOrange,
    drawPersimmon,
    drawApple,
    drawPear,
    drawPeach,
    drawPineapple,
    drawMelon,
    drawWatermelon
  ];

  fruitDrawers.forEach((drawer, index) => {
    if (drawer) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      drawer(canvas, 400);
      
      const texture = scene.textures.createCanvas(`fruit_${index}`, canvas.width, canvas.height);
      const ctx = texture.getContext();
      ctx.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  });
}

function drawFruitFace(ctx, x, y, radius) {
  // 공통 귀여운 표정 그리기 함수 (크고 아기자기하게)
  
  // 1. 아주 큰 눈
  ctx.fillStyle = '#331A00';
  const eyeSize = radius * 0.3;
  const eyeOffset = radius * 0.35;
  const eyeY = y - radius * 0.05;
  
  ctx.beginPath();
  ctx.arc(x - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2); // 왼쪽 눈
  ctx.arc(x + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2); // 오른쪽 눈
  ctx.fill();

  // 2. 눈 하이라이트 (초롱초롱하게)
  ctx.fillStyle = 'white';
  const shineSize = eyeSize * 0.45;
  ctx.beginPath();
  ctx.arc(x - eyeOffset - eyeSize * 0.2, eyeY - eyeSize * 0.2, shineSize, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset - eyeSize * 0.2, eyeY - eyeSize * 0.2, shineSize, 0, Math.PI * 2);
  ctx.fill();

  // 3. 큼직하고 귀여운 입
  ctx.strokeStyle = '#331A00';
  ctx.lineWidth = radius * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.2, radius * 0.45, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // 4. 발그레한 볼터치
  ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
  const blushW = radius * 0.35;
  const blushH = radius * 0.18;
  const blushY = y + radius * 0.35;
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.65, blushY, blushW, blushH, 0, 0, Math.PI * 2);
  ctx.ellipse(x + radius * 0.65, blushY, blushW, blushH, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCherry(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통 (물리 엔진의 원형 바디에 맞게 단일 원으로 구성)
  const bodyRadius = radius - 10; // 테두리와 광택을 위한 여유 공간
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, bodyRadius);
  gradient.addColorStop(0, '#FF5E5E');
  gradient.addColorStop(1, '#D60000');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, bodyRadius, 0, Math.PI * 2);
  ctx.fill();

  // 테두리
  ctx.strokeStyle = '#B30000';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // 꼭지/줄기
  ctx.strokeStyle = '#4A2B12';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(radius, radius - bodyRadius + 5);
  ctx.quadraticCurveTo(radius + 20, radius - bodyRadius - 30, radius + 40, radius - bodyRadius - 10);
  ctx.stroke();

  // 잎사귀
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(radius + 30, radius - bodyRadius - 20, size * 0.08, size * 0.04, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  
  // 메인 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(radius - bodyRadius * 0.4, radius - bodyRadius * 0.4, bodyRadius * 0.3, bodyRadius * 0.15, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // 작은 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(radius - bodyRadius * 0.5, radius - bodyRadius * 0.5, bodyRadius * 0.08, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, bodyRadius);
}

function drawStrawberry(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 1, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#FF6699');
  gradient.addColorStop(1, '#CC0033');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(radius, radius * 1.1, radius * 0.7, radius * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 씨
  ctx.fillStyle = '#FFD700';
  const seeds = [
    [radius * 0.6, radius * 0.7],
    [radius, radius * 0.6],
    [radius * 1.4, radius * 0.7],
    [radius * 0.7, radius * 1.1],
    [radius * 1.3, radius * 1.1],
    [radius, radius * 1.4]
  ];
  seeds.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.08, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 잎
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
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(radius * 0.7, radius * 0.9, radius * 0.15, radius * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius * 1.0, radius * 0.7);
}

function drawGrape(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 포도 알갱이들 (3개로 구성하여 송이 느낌)
  const grapePositions = [
    { x: radius * 0.7, y: radius * 1.2, r: radius * 0.4 }, // 왼쪽 아래
    { x: radius * 1.3, y: radius * 1.2, r: radius * 0.4 }, // 오른쪽 아래
    { x: radius, y: radius * 0.8, r: radius * 0.6 }        // 중앙 메인 (얼굴이 들어갈 부분)
  ];
  
  // 알갱이 그리기
  grapePositions.forEach((pos, index) => {
    const gradient = ctx.createRadialGradient(pos.x - pos.r * 0.2, pos.y - pos.r * 0.2, 0, pos.x, pos.y, pos.r);
    gradient.addColorStop(0, '#BB33FF');
    gradient.addColorStop(1, '#660099');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
    ctx.fill();

    // 메인이 아닌 알갱이에도 가벼운 광택
    if (index < 2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(pos.x - pos.r * 0.3, pos.y - pos.r * 0.3, pos.r * 0.4, pos.r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 메인 알갱이(인덱스 2)에 체리와 동일한 스타일 적용
  const main = grapePositions[2];
  
  // 줄기
  ctx.strokeStyle = '#4A2B12';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(main.x, main.y - main.r * 0.8);
  ctx.quadraticCurveTo(main.x * 1.1, main.y - main.r * 1.5, main.x * 1.3, main.y - main.r * 1.3);
  ctx.stroke();

  // 잎사귀
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.ellipse(main.x * 1.15, main.y - main.r * 1.3, size * 0.1, size * 0.05, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // 메인 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(main.x - main.r * 0.4, main.y - main.r * 0.4, main.r * 0.5, main.r * 0.3, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, main.x, main.y, main.r);
}

function drawOrange(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.7, radius * 0.7, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#FFB84D');
  gradient.addColorStop(1, '#FF8C00');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  
  // 오렌지 섹션 라인
  ctx.strokeStyle = 'rgba(255, 140, 0, 0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.lineTo(radius + Math.cos(angle) * radius * 0.9, radius + Math.sin(angle) * radius * 0.9);
    ctx.stroke();
  }
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawPersimmon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#FF9933');
  gradient.addColorStop(1, '#CC6600');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  
  // 꼭지
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(radius, radius * 0.2, radius * 0.15, radius * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawApple(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#FF6666');
  gradient.addColorStop(1, '#CC0000');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  
  // 움푹 들어간 부분
  ctx.fillStyle = '#990000';
  ctx.beginPath();
  ctx.arc(radius, radius * 0.15, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // 줄기
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.15);
  ctx.lineTo(radius, radius * 0.35);
  ctx.stroke();
  
  // 잎
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(radius * 1.2, radius * 0.3, radius * 0.2, radius * 0.3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawPear(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통 (배 모양)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 1, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#D4E157');
  gradient.addColorStop(1, '#9CCC65');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(radius, radius * 1.1, radius * 0.7, radius * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 목 부분
  ctx.beginPath();
  ctx.ellipse(radius, radius * 0.3, radius * 0.4, radius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 꼭지
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(radius, radius * 0.1, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.8, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius * 0.8, radius * 0.7);
}

function drawPeach(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#FFB6C1');
  gradient.addColorStop(1, '#FF69B4');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  
  // 중앙 라인
  ctx.strokeStyle = 'rgba(255, 105, 180, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.1);
  ctx.quadraticCurveTo(radius * 0.7, radius, radius, radius * 1.9);
  ctx.stroke();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawPineapple(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.85);
  gradient.addColorStop(0, '#FFE680');
  gradient.addColorStop(1, '#FFD700');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.85, 0, Math.PI * 2);
  ctx.fill();
  
  // 격자 패턴
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      const x = radius * 0.3 + (i * radius * 0.25);
      const y = radius * 0.3 + (j * radius * 0.25);
      ctx.strokeRect(x, y, radius * 0.2, radius * 0.2);
    }
  }
  
  // 잎
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
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.85);
}

function drawMelon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#90EE90');
  gradient.addColorStop(1, '#32CD32');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  
  // 그물 패턴
  ctx.strokeStyle = 'rgba(50, 205, 50, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.lineTo(radius + Math.cos(angle) * radius * 0.9, radius + Math.sin(angle) * radius * 0.9);
    ctx.stroke();
  }
  
  // 곡선 그물
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    const r = radius * (0.3 * i);
    ctx.arc(radius, radius, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawWatermelon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 외부 (초록색)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.9);
  gradient.addColorStop(0, '#228B22');
  gradient.addColorStop(1, '#006400');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();
  
  // 줄무늬
  ctx.strokeStyle = 'rgba(0, 100, 0, 0.8)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(radius * 0.2, radius * (0.2 + i * 0.15));
    ctx.quadraticCurveTo(radius, radius * (0.2 + i * 0.15), radius * 1.8, radius * (0.2 + i * 0.15));
    ctx.stroke();
  }
  
  // 내부 (빨간색 - 자른 면)
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // 씨
  ctx.fillStyle = '#000000';
  const seeds = [
    [radius * 0.7, radius * 0.7],
    [radius * 1.3, radius * 0.7],
    [radius, radius * 1.1],
    [radius * 0.8, radius * 0.9],
    [radius * 1.2, radius * 0.9]
  ];
  seeds.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.08, radius * 0.12, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.6);
}
