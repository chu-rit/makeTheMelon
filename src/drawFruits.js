// Phaser 기반 과일 그리기 함수들

export function createFruitTextures(scene) {
  const fruitDrawers = [
    null, // 레벨 0 (사용 안함)
    drawCherry,
    drawStrawberry,
    drawGrape,
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

function drawCherry(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 줄기
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.15);
  ctx.lineTo(radius, radius * 0.55);
  ctx.stroke();
  
  // 왼쪽 체리
  const gradient1 = ctx.createRadialGradient(radius * 0.55, radius * 0.75, 0, radius * 0.55, radius * 0.75, radius * 0.35);
  gradient1.addColorStop(0, '#FF6666');
  gradient1.addColorStop(1, '#CC0000');
  ctx.fillStyle = gradient1;
  ctx.beginPath();
  ctx.arc(radius * 0.55, radius * 0.75, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // 오른쪽 체리
  const gradient2 = ctx.createRadialGradient(radius * 1.45, radius * 0.75, 0, radius * 1.45, radius * 0.75, radius * 0.35);
  gradient2.addColorStop(0, '#FF6666');
  gradient2.addColorStop(1, '#CC0000');
  ctx.fillStyle = gradient2;
  ctx.beginPath();
  ctx.arc(radius * 1.45, radius * 0.75, radius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(radius * 0.45, radius * 0.65, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(radius * 1.55, radius * 0.65, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();
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
}

function drawGrape(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 줄기
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.15);
  ctx.lineTo(radius, radius * 0.45);
  ctx.stroke();
  
  // 포도 알갱이들
  const grapes = [
    [radius, radius * 0.6, radius * 0.35],
    [radius * 0.55, radius * 0.95, radius * 0.3],
    [radius * 1.45, radius * 0.95, radius * 0.3],
    [radius * 0.7, radius * 1.4, radius * 0.25],
    [radius * 1.3, radius * 1.4, radius * 0.25]
  ];
  
  grapes.forEach(([x, y, r]) => {
    const gradientGrape = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    gradientGrape.addColorStop(0, '#BB33FF');
    gradientGrape.addColorStop(1, '#660099');
    ctx.fillStyle = gradientGrape;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  grapes.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
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
}
