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

      // 숫자가 잘 보이도록 중앙에 어두운 그라데이션 추가
      const shadowCtx = canvas.getContext('2d');
      shadowCtx.setTransform(1, 0, 0, 1, 0, 0); // 컨텍스트 변환 초기화
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const bgRadius = canvas.width * 0.3; // 텍스처 크기의 30%

      const textBgGradient = shadowCtx.createRadialGradient(cx, cy, 0, cx, cy, bgRadius);
      textBgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)'); // 중앙은 반투명 검정
      textBgGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.1)');
      textBgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // 가장자리는 투명

      shadowCtx.fillStyle = textBgGradient;
      shadowCtx.beginPath();
      shadowCtx.arc(cx, cy, bgRadius, 0, Math.PI * 2);
      shadowCtx.fill();
      
      const texture = scene.textures.createCanvas(`fruit_${index}`, canvas.width, canvas.height);
      const ctx = texture.getContext();
      ctx.drawImage(canvas, 0, 0);
      texture.refresh();
    }
  });
}

function drawFruitFace(ctx, x, y, radius) {
  // 이미지와 가장 흡사한 아기자기한 비율의 표정
  
  // 1. 적당히 크고 초롱초롱한 눈
  ctx.fillStyle = '#331A00';
  const eyeSize = radius * 0.28; 
  const eyeOffset = radius * 0.35; 
  const eyeY = y - radius * 0.1;
  
  ctx.beginPath();
  ctx.arc(x - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2); // 왼쪽 눈
  ctx.arc(x + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2); // 오른쪽 눈
  ctx.fill();

  // 2. 선명한 눈 하이라이트 (이미지 스타일)
  ctx.fillStyle = 'white';
  const shineSize = eyeSize * 0.45;
  ctx.beginPath();
  ctx.arc(x - eyeOffset - eyeSize * 0.1, eyeY - eyeSize * 0.2, shineSize, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset - eyeSize * 0.1, eyeY - eyeSize * 0.2, shineSize, 0, Math.PI * 2);
  ctx.fill();

  // 3. 작고 귀여운 미소 입
  ctx.strokeStyle = '#331A00';
  ctx.lineWidth = radius * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.12, radius * 0.35, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // 4. 강조된 핑크빛 볼터치
  ctx.fillStyle = 'rgba(255, 120, 180, 0.75)'; 
  const blushW = radius * 0.28;
  const blushH = radius * 0.15;
  const blushY = y + radius * 0.28;
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.55, blushY, blushW, blushH, 0, 0, Math.PI * 2);
  ctx.ellipse(x + radius * 0.55, blushY, blushW, blushH, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCherry(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 몸통 크기를 물리 바디와 일치시키기 (0.85 비율 유지, 스케일링 제거)
  // MainScene에서 radius / 170 으로 스케일링하므로, 여기서 반지름 170(0.85)으로 그리면 딱 맞음
  const bodyRadius = radius * 0.85; 
  const cy = radius; 
  const cx = radius;
  
  // 1. 캔디 같은 젤리 질감의 밝은 빨강
  const gradient = ctx.createRadialGradient(cx - bodyRadius * 0.3, cy - bodyRadius * 0.3, 0, cx, cy, bodyRadius);
  gradient.addColorStop(0, '#FF9EAA'); // 더 밝은 핑크 하이라이트
  gradient.addColorStop(0.4, '#FF4D6D'); // 메인 컬러
  gradient.addColorStop(1, '#C9184A'); // 그림자
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, bodyRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. 이너 글로우
  const innerGlow = ctx.createRadialGradient(cx, cy, bodyRadius * 0.7, cx, cy, bodyRadius);
  innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
  innerGlow.addColorStop(1, 'rgba(200, 0, 0, 0.2)');
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, bodyRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3. 둥글둥글한 꼭지 (몸통 안쪽에서 시작해서 위로)
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  
  const stemStartY = cy - bodyRadius * 0.8; // 몸통 안쪽에서 시작
  const stemEndY = cy - bodyRadius * 1.1; // 캔버스 밖으로 나가지 않게 조심
  
  ctx.moveTo(cx, stemStartY);
  ctx.quadraticCurveTo(cx - 5, stemStartY - 10, cx + 5, stemEndY);
  ctx.stroke();

  // 4. 하트 모양의 통통한 잎사귀 (몸통에 가깝게 붙임)
  ctx.fillStyle = '#80ED99'; // 밝은 민트그린
  ctx.strokeStyle = '#57CC99';
  ctx.lineWidth = 3;
  
  const leafX = cx + 5;
  const leafY = stemEndY + 5;
  const leafSize = bodyRadius * 0.4; // 잎사귀 크기 약간 축소

  ctx.beginPath();
  // 하트 모양 그리기
  ctx.moveTo(leafX, leafY);
  ctx.bezierCurveTo(
    leafX + leafSize, leafY - leafSize * 0.5, 
    leafX + leafSize, leafY + leafSize * 0.5, 
    leafX, leafY + leafSize
  );
  ctx.bezierCurveTo(
    leafX - leafSize, leafY + leafSize * 0.5, 
    leafX - leafSize, leafY - leafSize * 0.5, 
    leafX, leafY
  );
  ctx.fill();
  ctx.stroke();
  
  // 5. 젤리 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  // 호환성을 위해 roundRect 대신 ellipse 사용
  ctx.ellipse(cx - bodyRadius * 0.3, cy - bodyRadius * 0.45, bodyRadius * 0.15, bodyRadius * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(cx + bodyRadius * 0.4, cy + bodyRadius * 0.4, bodyRadius * 0.1, bodyRadius * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, cx, cy, bodyRadius);
}

function drawGrape(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 체리와 동일한 비율 적용 (0.85 비율 유지, 스케일링 제거)
  const bodyRadius = radius * 0.85; 
  const cy = radius; 
  const cx = radius;
  
  // 1. 젤리 질감의 포도 (보라색)
  const gradient = ctx.createRadialGradient(cx - bodyRadius * 0.3, cy - bodyRadius * 0.3, 0, cx, cy, bodyRadius);
  gradient.addColorStop(0, '#E0AAFF'); // 라일락 하이라이트
  gradient.addColorStop(0.4, '#9D4EDD'); // 메인 퍼플
  gradient.addColorStop(1, '#5A189A'); // 딥 퍼플 쉐도우
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, bodyRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. 이너 글로우
  const innerGlow = ctx.createRadialGradient(cx, cy, bodyRadius * 0.7, cx, cy, bodyRadius);
  innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
  innerGlow.addColorStop(1, 'rgba(50, 0, 100, 0.2)');
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, bodyRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3. 꼭지
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  
  const stemStartY = cy - bodyRadius * 0.85;
  const stemEndY = cy - bodyRadius * 1.15;
  
  ctx.moveTo(cx, stemStartY);
  ctx.quadraticCurveTo(cx + 5, stemStartY - 15, cx - 10, stemEndY);
  ctx.stroke();

  // 4. 포도 잎사귀 (넓고 뾰족한 3갈래 잎)
  ctx.fillStyle = '#80ED99';
  ctx.strokeStyle = '#57CC99';
  ctx.lineWidth = 2;
  
  const leafCenterX = cx - 15;
  const leafCenterY = stemEndY + 10;
  
  ctx.save();
  ctx.translate(leafCenterX, leafCenterY);
  ctx.rotate(-Math.PI / 6); // 약간 기울임
  
  ctx.beginPath();
  // 3갈래 잎 그리기
  ctx.moveTo(0, 0);
  // 왼쪽 잎
  ctx.quadraticCurveTo(-20, -10, -30, -5); 
  ctx.quadraticCurveTo(-35, 10, -15, 15);
  // 중앙 잎
  ctx.quadraticCurveTo(-5, 30, 0, 40);
  ctx.quadraticCurveTo(5, 30, 15, 15);
  // 오른쪽 잎
  ctx.quadraticCurveTo(35, 10, 30, -5);
  ctx.quadraticCurveTo(20, -10, 0, 0);
  
  ctx.fill();
  ctx.stroke();
  
  // 잎맥
  ctx.strokeStyle = '#3CB371'; // 조금 더 진한 색
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-20, 5); // 왼쪽
  ctx.moveTo(0, 0); ctx.lineTo(0, 25);  // 중앙
  ctx.moveTo(0, 0); ctx.lineTo(20, 5);  // 오른쪽
  ctx.stroke();
  
  ctx.restore();
  
  // 5. 덩굴손 (포도 특징)
  ctx.strokeStyle = '#80ED99';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 10, stemEndY + 20);
  ctx.bezierCurveTo(cx - 30, stemEndY + 20, cx - 30, stemEndY + 50, cx - 10, stemEndY + 40); // 꼬불
  ctx.stroke();

  // 6. 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(cx - bodyRadius * 0.3, cy - bodyRadius * 0.45, bodyRadius * 0.15, bodyRadius * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, cx, cy, bodyRadius);
}

function drawStrawberry(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (완벽한 원형 베이스)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.9, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#FF6699');
  gradient.addColorStop(1, '#CC0033');
  ctx.fillStyle = gradient;
  
  // 원형을 기본으로 하고 아래쪽만 살짝 뾰족하게 변형
  ctx.beginPath();
  // 상단 반원
  ctx.arc(radius, radius, radius * 0.95, Math.PI, 0);
  // 하단 뾰족한 부분 (부드럽게 연결)
  ctx.bezierCurveTo(radius + radius * 0.95, radius + radius * 0.6, radius + radius * 0.4, radius + radius * 0.95, radius, radius + radius * 1.05);
  ctx.bezierCurveTo(radius - radius * 0.4, radius + radius * 0.95, radius - radius * 0.95, radius + radius * 0.6, radius - radius * 0.95, radius);
  ctx.fill();
  
  // 씨 (배치 수정)
  const seeds = [
    [radius * 0.5, radius * 0.5], [radius, radius * 0.4], [radius * 1.5, radius * 0.5],
    [radius * 0.3, radius * 0.9], [radius * 0.75, radius * 0.9], [radius * 1.25, radius * 0.9], [radius * 1.7, radius * 0.9],
    [radius * 0.5, radius * 1.3], [radius * 1.0, radius * 1.3], [radius * 1.5, radius * 1.3],
    [radius, radius * 1.6]
  ];
  
  seeds.forEach(([x, y]) => {
    // 씨앗 구멍 (어두운 색)
    ctx.fillStyle = '#990000';
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.07, radius * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 씨앗 알맹이 (노란색)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, radius * 0.04, radius * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 씨앗 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x - 2, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // 잎 (조금 더 넓게 퍼지도록 수정)
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  // 중앙 잎
  ctx.moveTo(radius, radius * 0.15);
  ctx.quadraticCurveTo(radius * 0.9, radius * 0.35, radius, radius * 0.45);
  ctx.quadraticCurveTo(radius * 1.1, radius * 0.35, radius, radius * 0.15);
  
  // 왼쪽 잎들
  ctx.moveTo(radius, radius * 0.15);
  ctx.quadraticCurveTo(radius * 0.6, radius * 0.25, radius * 0.35, radius * 0.45); // 더 넓게
  ctx.quadraticCurveTo(radius * 0.7, radius * 0.2, radius, radius * 0.15);
  
  // 오른쪽 잎들
  ctx.moveTo(radius, radius * 0.15);
  ctx.quadraticCurveTo(radius * 1.4, radius * 0.25, radius * 1.65, radius * 0.45); // 더 넓게
  ctx.quadraticCurveTo(radius * 1.3, radius * 0.2, radius, radius * 0.15);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(radius * 0.7, radius * 0.7, radius * 0.15, radius * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius * 1.0, radius * 0.85); // 표정 위치 및 크기 조정
}


function drawOrange(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 1. 껍질 (외곽)
  const gradient = ctx.createRadialGradient(radius * 0.7, radius * 0.7, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#FFA500');
  gradient.addColorStop(1, '#FF8C00');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 2. 모공 질감 (껍질 표면)
  ctx.fillStyle = 'rgba(200, 100, 0, 0.3)';
  for(let i=0; i<100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.9;
    const x = radius + Math.cos(angle) * r;
    const y = radius + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. 단면 느낌 (속살) - 약간 안쪽으로
  const innerRadius = radius * 0.85;
  
  // 과육 배경
  ctx.fillStyle = '#FFD700'; // 밝은 오렌지
  ctx.beginPath();
  ctx.arc(radius, radius, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // 과육 섹션 (알갱이 느낌 추가)
  ctx.fillStyle = '#FFA500'; // 진한 오렌지
  for (let i = 0; i < 8; i++) {
    const startAngle = (Math.PI * 2 * i) / 8 + 0.05;
    const endAngle = (Math.PI * 2 * (i + 1)) / 8 - 0.05;
    
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, innerRadius * 0.95, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    
    // 과육 알갱이 패턴
    ctx.save();
    ctx.clip(); // 현재 섹션 영역만 그리기
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for(let j=0; j<20; j++) {
      const rx = radius + (Math.random() - 0.5) * innerRadius * 1.5;
      const ry = radius + (Math.random() - 0.5) * innerRadius * 1.5;
      ctx.beginPath();
      ctx.arc(rx, ry, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  // 중앙 심지
  ctx.fillStyle = '#FFDEAD';
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.05, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawPersimmon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (거의 완벽한 원형)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#FFA07A'); // LightSalmon
  gradient.addColorStop(1, '#FF4500'); // OrangeRed
  ctx.fillStyle = gradient;
  ctx.beginPath();
  // 0.95 x 0.95 원형으로 그리기 (물리 바디와 일치)
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 4갈래 잎사귀 꼭지 (감의 특징)
  ctx.fillStyle = '#556B2F'; // DarkOliveGreen
  for(let i=0; i<4; i++) {
    const angle = (Math.PI / 2) * i;
    ctx.save();
    ctx.translate(radius, radius * 0.2); // 약간 위쪽
    ctx.rotate(angle);
    ctx.beginPath();
    // 잎 하나 그리기 (마름모꼴)
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(radius * 0.15, radius * 0.15, 0, radius * 0.35);
    ctx.quadraticCurveTo(-radius * 0.15, radius * 0.15, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  
  // 꼭지 중앙
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(radius, radius * 0.2, radius * 0.05, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(radius * 0.6, radius * 0.6, radius * 0.2, radius * 0.15, -0.5, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius * 1.05, radius * 0.9);
}

function drawApple(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (꽉 차게)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#FF6666');
  gradient.addColorStop(1, '#CC0000');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 사과 점박이 (자연스러운 질감)
  ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
  for(let i=0; i<60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.85;
    const x = radius + Math.cos(angle) * r;
    const y = radius + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 움푹 들어간 부분
  ctx.fillStyle = '#990000';
  ctx.beginPath();
  ctx.arc(radius, radius * 0.15, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // 줄기
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.15);
  ctx.lineTo(radius, radius * 0.3);
  ctx.stroke();
  
  // 잎
  ctx.fillStyle = '#228B22';
  ctx.beginPath();
  ctx.ellipse(radius * 1.2, radius * 0.25, radius * 0.25, radius * 0.35, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  
  // 잎맥
  ctx.strokeStyle = '#1a5e1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(radius * 1.05, radius * 0.35); // 줄기 쪽
  ctx.quadraticCurveTo(radius * 1.2, radius * 0.25, radius * 1.35, radius * 0.15); // 잎 끝 쪽
  ctx.stroke();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawPear(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (배 모양 - 꽉 차게)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 1, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#D4E157');
  gradient.addColorStop(1, '#9CCC65');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  // 거의 원형에 가깝게 (0.94 x 0.96)
  ctx.ellipse(radius, radius, radius * 0.94, radius * 0.96, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 목 부분 (위치 조정 및 너비 확대)
  ctx.beginPath();
  ctx.ellipse(radius, radius * 0.25, radius * 0.6, radius * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 배 점박이 (사과보다 조금 더 진한 녹갈색)
  ctx.fillStyle = 'rgba(100, 120, 50, 0.2)';
  for(let i=0; i<50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.8;
    // 배 모양에 맞춰 대략적으로 배치 (단순 원형 분포)
    const x = radius + Math.cos(angle) * r;
    const y = radius + Math.sin(angle) * r + (Math.random() * 20); // 약간 아래로 처지게
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 꼭지
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(radius, radius * 0.05, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.8, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius * 0.8, radius * 0.7);
}

function drawPeach(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (꽉 차게)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#FFB6C1');
  gradient.addColorStop(1, '#FF69B4');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 복숭아 솜털 느낌 (아주 미세한 점들)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for(let i=0; i<300; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.95;
    const x = radius + Math.cos(angle) * r;
    const y = radius + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.rect(x, y, 1, 1);
    ctx.fill();
  }
  
  // 중앙 골 (부드럽게)
  ctx.shadowColor = 'rgba(200, 50, 100, 0.5)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(255, 105, 180, 0.5)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(radius, radius * 0.05);
  ctx.quadraticCurveTo(radius * 0.6, radius, radius, radius * 1.95);
  ctx.stroke();
  ctx.shadowBlur = 0; // 쉐도우 초기화
  
  // 잎사귀 추가 (복숭아 포인트)
  ctx.fillStyle = '#6B8E23';
  ctx.beginPath();
  ctx.ellipse(radius * 1.1, radius * 0.15, radius * 0.15, radius * 0.25, Math.PI / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택 (부드럽게)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawPineapple(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (꽉 차게)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#FFE680');
  gradient.addColorStop(1, '#DAA520'); // GoldenRod
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 파인애플 다이아몬드 패턴 (돌기 질감)
  ctx.fillStyle = 'rgba(218, 165, 32, 0.5)'; // 돌기 그림자
  ctx.strokeStyle = '#B8860B'; // DarkGoldenRod
  ctx.lineWidth = 1.5;
  
  const cols = 7;
  const rows = 7;
  const cellSize = radius * 0.35;
  
  // 회전된 격자 그리기 (다이아몬드 효과)
  ctx.save();
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.clip(); // 원형으로 클리핑

  for (let i = -2; i < cols + 2; i++) {
    for (let j = -2; j < rows + 2; j++) {
      const x = (i * cellSize) + (j % 2 === 0 ? 0 : cellSize/2);
      const y = j * cellSize * 0.85; // 약간 납작하게
      
      // 중심점 기준으로 위치 조정
      const drawX = x + radius * 0.1; 
      const drawY = y + radius * 0.1;

      // 돌기 묘사
      ctx.beginPath();
      ctx.moveTo(drawX, drawY - cellSize * 0.4);
      ctx.lineTo(drawX + cellSize * 0.5, drawY);
      ctx.lineTo(drawX, drawY + cellSize * 0.4);
      ctx.lineTo(drawX - cellSize * 0.5, drawY);
      ctx.closePath();
      ctx.stroke();
      
      // 돌기 중앙 점
      ctx.beginPath();
      ctx.arc(drawX, drawY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  
  // 잎 (뾰족하고 풍성하게 위로 솟음)
  ctx.fillStyle = '#228B22';
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI / 6) * (i - 3); // 부채꼴 펼침
    ctx.save();
    ctx.translate(radius, radius * 0.15);
    ctx.rotate(angle);
    ctx.beginPath();
    // 뾰족한 잎
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(radius * 0.1, -radius * 0.25, 0, -radius * 0.5);
    ctx.quadraticCurveTo(-radius * 0.1, -radius * 0.25, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawMelon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 몸통 (꽉 차게)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#98FB98'); // PaleGreen
  gradient.addColorStop(1, '#3CB371'); // MediumSeaGreen
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 그물 패턴 (더 자연스럽고 불규칙하게)
  ctx.strokeStyle = 'rgba(240, 255, 240, 0.6)'; // 밝은 색 네트
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  // 세로줄 (약간 휘어지게)
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    // 베지어 곡선으로 약간의 굴곡 추가
    const cpX = radius + Math.cos(angle + 0.2) * radius * 0.5;
    const cpY = radius + Math.sin(angle + 0.2) * radius * 0.5;
    const endX = radius + Math.cos(angle) * radius * 0.95;
    const endY = radius + Math.sin(angle) * radius * 0.95;
    
    ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    ctx.stroke();
  }
  
  // 가로줄 (불규칙한 연결선)
  for (let i = 1; i < 4; i++) {
    const r = radius * (0.25 * i);
    ctx.beginPath();
    // 완전한 원보다는 약간 울퉁불퉁한 느낌
    for (let j = 0; j <= 16; j++) {
      const angle = (Math.PI * 2 * j) / 16;
      const variation = Math.random() * 10 - 5;
      const x = radius + Math.cos(angle) * (r + variation);
      const y = radius + Math.sin(angle) * (r + variation);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  
  // T자 꼭지 (멜론의 특징)
  ctx.fillStyle = '#8FBC8F'; // DarkSeaGreen (마른 느낌)
  ctx.strokeStyle = '#556B2F';
  ctx.lineWidth = 4;
  
  // T자 세로 기둥
  ctx.beginPath();
  ctx.moveTo(radius, radius - radius * 0.95);
  ctx.lineTo(radius, radius - radius * 1.15); // 위로 뻗음
  ctx.stroke();
  
  // T자 가로 기둥
  ctx.beginPath();
  ctx.moveTo(radius - 20, radius - radius * 1.15);
  ctx.lineTo(radius + 20, radius - radius * 1.15);
  ctx.stroke();
  
  // 꼭지 연결부
  ctx.beginPath();
  ctx.arc(radius, radius - radius * 0.9, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.9);
}

function drawWatermelon(canvas, size) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 물리 바디 크기 일치 (0.95 -> 0.85)
  ctx.translate(radius, radius);
  ctx.scale(0.9, 0.9);
  ctx.translate(-radius, -radius);
  
  // 외부 (진한 초록색 바탕)
  const gradient = ctx.createRadialGradient(radius * 0.8, radius * 0.8, 0, radius, radius, radius * 0.95);
  gradient.addColorStop(0, '#3CB371'); // MediumSeaGreen
  gradient.addColorStop(1, '#006400'); // DarkGreen
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();
  
  // 지그재그 줄무늬 (검은/진한 초록)
  ctx.strokeStyle = 'rgba(0, 40, 0, 0.8)';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const numStripes = 7;
  for (let i = 0; i < numStripes; i++) {
    // 위에서 아래로 내려오는 줄무늬
    const startX = radius + (i - numStripes/2) * (radius * 0.5);
    const startY = radius * 0.1;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // 지그재그 그리며 내려가기
    let currentX = startX;
    let currentY = startY;
    const zigZagHeight = 30;
    const zigZagWidth = 15;
    
    while(currentY < radius * 1.9) {
      currentY += zigZagHeight;
      currentX += zigZagWidth;
      
      // 원 안쪽으로만 렌더링되도록 좌표 보정 (클리핑 대신 간단한 처리)
      const dist = Math.sqrt((currentX - radius)**2 + (currentY - radius)**2);
      if (dist < radius * 0.95) {
        ctx.lineTo(currentX, currentY);
      } else {
        ctx.moveTo(currentX, currentY); // 끊어서 그리기
      }
      
      currentY += zigZagHeight;
      currentX -= zigZagWidth;
      
      const dist2 = Math.sqrt((currentX - radius)**2 + (currentY - radius)**2);
      if (dist2 < radius * 0.95) {
        ctx.lineTo(currentX, currentY);
      } else {
        ctx.moveTo(currentX, currentY);
      }
    }
    ctx.stroke();
  }
  
  // 내부 (빨간색 - 자른 면, 약간 비스듬하게)
  ctx.fillStyle = '#FF4500'; // OrangeRed
  ctx.beginPath();
  ctx.ellipse(radius, radius, radius * 0.7, radius * 0.65, -0.2, 0, Math.PI * 2); 
  ctx.fill();
  
  // 속살 테두리 (흰색/연두색)
  ctx.strokeStyle = '#90EE90'; // LightGreen
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // 씨 (더 많이, 불규칙하게)
  ctx.fillStyle = '#000000';
  for(let i=0; i<12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * radius * 0.5;
    const x = radius + Math.cos(angle) * r;
    const y = radius + Math.sin(angle) * r;
    
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 0.04, radius * 0.06, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(radius * 0.6, radius * 0.6, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFace(ctx, radius, radius, radius * 0.7);
}
