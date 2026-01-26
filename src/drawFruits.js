// Phaser 기반 과일 그리기 함수들

// 동적 표정 애니메이션을 위한 저장소
const fruitAnimations = new Map();

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
    drawWatermelon,
    drawBomb
  ];

  function createTexture(scene, key, drawer, param = 9) {
    // 이미 텍스처가 존재하면 제거하고 다시 생성
    if (scene.textures.exists(key)) {
      scene.textures.remove(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    
    try {
      // param이 문자열(애니메이션 타입)이면 그대로 전달, 아니면 숫자로 전달
      if (typeof param === 'string') {
        drawer(canvas, 400, param);
      } else {
        drawer(canvas, 400, param);
      }

      const texture = scene.textures.createCanvas(key, canvas.width, canvas.height);
      if (texture) {
        const ctx = texture.getContext();
        ctx.drawImage(canvas, 0, 0);
        texture.refresh();
      } else {
        console.error(`텍스처 생성 실패: ${key} - texture가 null`);
      }
    } catch (error) {
      console.error(`텍스처 생성 실패: ${key}`, error);
      // 실패하면 기본 텍스처로 대체
      try {
        drawer(canvas, 400, 'normal');
        const texture = scene.textures.createCanvas(key, canvas.width, canvas.height);
        if (texture) {
          const ctx = texture.getContext();
          ctx.drawImage(canvas, 0, 0);
          texture.refresh();
        }
      } catch (fallbackError) {
        console.error(`기본 텍스처 생성도 실패: ${key}`, fallbackError);
      }
    }
  }

  fruitDrawers.forEach((drawer, index) => {
    if (drawer) {
      if (index === 12) {
        // 1. 기본 텍스처 (fruit_12) - 가장 평온한 상태 (숫자 9)
        createTexture(scene, `fruit_${index}`, drawer, 9);

        // 2. 카운트다운별 텍스처 (fruit_bomb_0 ~ fruit_bomb_9)
        // 0은 폭발 직전 (가장 화난 상태)
        for (let i = 0; i <= 9; i++) {
          createTexture(scene, `fruit_bomb_${i}`, drawer, i);
        }
      } else {
        // 일반 과일
        createTexture(scene, `fruit_${index}`, drawer);
        
        // 표정 애니메이션을 위한 추가 텍스처 (깜빡임과 무서운 표정)
        createTexture(scene, `fruit_${index}_blink`, drawer, 'blink');
        createTexture(scene, `fruit_${index}_scared`, drawer, 'scared');
      }
    }
  });
}

// 동적 표정 그리기 함수
function drawFruitFaceAnimated(ctx, x, y, radius, animation = 'normal') {
  if (animation === 'scared') {
    // 무서운 표정
    drawScaredFace(ctx, x, y, radius, 0.8);
  } else if (animation === 'blink') {
    // 눈 깜빡임 - 눈만 감고 입은 그대로
    ctx.fillStyle = '#331A00';
    const eyeSize = radius * 0.28; 
    const eyeOffset = radius * 0.35; 
    const eyeY = y - radius * 0.1;
    
    // 눈만 깜빡임
    ctx.beginPath();
    ctx.ellipse(x - eyeOffset, eyeY, eyeSize, eyeSize * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(x + eyeOffset, eyeY, eyeSize, eyeSize * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 입은 일반 표정과 동일하게 유지
    ctx.strokeStyle = '#331A00';
    ctx.lineWidth = radius * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.12, radius * 0.35, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // 볼도 일반 표정과 동일하게 유지
    ctx.fillStyle = 'rgba(255, 120, 180, 0.75)'; 
    const blushW = radius * 0.28;
    const blushH = radius * 0.15;
    const blushY = y + radius * 0.28;
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.55, blushY, blushW, blushH, 0, 0, Math.PI * 2);
    ctx.ellipse(x + radius * 0.55, blushY, blushW, blushH, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 일반 표정
    drawFruitFace(ctx, x, y, radius);
  }
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

function drawScaredFace(ctx, x, y, radius, fearLevel = 0.8) {
  // 더 완화된 찡그린 표정
  
  // 1. 눈 (삐죽거린 정도 더 줄임)
  ctx.fillStyle = '#331A00';
  const eyeSize = radius * 0.26; // 더 작은 눈
  const eyeOffset = radius * 0.35;
  const eyeY = y - radius * 0.03; // 눈 위치 약간 위로
  
  // 왼쪽 눈 (삐죽거린 정도 더 줄임)
  ctx.beginPath();
  ctx.moveTo(x - eyeOffset - eyeSize * 0.7, eyeY);
  ctx.quadraticCurveTo(x - eyeOffset, eyeY - eyeSize * 0.1, x - eyeOffset + eyeSize * 0.7, eyeY);
  ctx.fill();
  
  // 오른쪽 눈 (삐죽거린 정도 더 줄임)
  ctx.beginPath();
  ctx.moveTo(x + eyeOffset - eyeSize * 0.7, eyeY);
  ctx.quadraticCurveTo(x + eyeOffset, eyeY - eyeSize * 0.1, x + eyeOffset + eyeSize * 0.7, eyeY);
  ctx.fill();
  
  // 2. 눈썹 (더 완화된 각도)
  ctx.strokeStyle = '#331A00';
  ctx.lineWidth = radius * 0.03; // 더 얇은 눈썹
  ctx.lineCap = 'round';
  
  // 왼쪽 눈썹
  ctx.beginPath();
  ctx.moveTo(x - eyeOffset - eyeSize * 0.5, eyeY - eyeSize * 0.3);
  ctx.lineTo(x - eyeOffset + eyeSize * 0.5, eyeY - eyeSize * 0.15);
  ctx.stroke();
  
  // 오른쪽 눈썹
  ctx.beginPath();
  ctx.moveTo(x + eyeOffset - eyeSize * 0.5, eyeY - eyeSize * 0.15);
  ctx.lineTo(x + eyeOffset + eyeSize * 0.5, eyeY - eyeSize * 0.3);
  ctx.stroke();
  
  // 3. 입 (더 완화된 삐짐)
  ctx.strokeStyle = '#331A00';
  ctx.lineWidth = radius * 0.04; // 더 얇은 입술
  ctx.lineCap = 'round';
  ctx.beginPath();
  
  // 약간 삐진 입 (더 완화된 ∧ 모양)
  const mouthWidth = radius * 0.3;
  const mouthY = y + radius * 0.18;
  const mouthHeight = radius * 0.02; // 더 작은 높이
  
  ctx.moveTo(x - mouthWidth, mouthY + mouthHeight);
  ctx.lineTo(x, mouthY - mouthHeight);
  ctx.lineTo(x + mouthWidth, mouthY + mouthHeight);
  ctx.stroke();
  
  // 4. 아주 약간의 주름 (거의 보이지 않을 정도)
  ctx.strokeStyle = 'rgba(51, 26, 0, 0.1)'; // 거의 투명한 주름
  ctx.lineWidth = radius * 0.015; // 아주 얇은 주름
  
  // 이마 주름 (아주 짧게)
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.2, y - radius * 0.18);
  ctx.lineTo(x - radius * 0.12, y - radius * 0.1);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x + radius * 0.2, y - radius * 0.18);
  ctx.lineTo(x + radius * 0.12, y - radius * 0.1);
  ctx.stroke();
}

function drawAngryFace(ctx, x, y, radius, angerLevel = 0) {
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FFFFFF';
  
  // angerLevel: 0 (무표정/평온) ~ 1 (극대노)
  
  // 1. 눈 (눈썹에 눌린 반달 눈)
  const eyeOffset = radius * 0.35; 
  const eyeY = y + radius * 0.00; // 눈을 훨씬 더 아래로 이동 (0.15 -> 0.25)
  const eyeSize = radius * 0.25;
  
  // 레벨 0일 땐 회전 없음(동그란 눈), 레벨 1일 땐 0.6라디안(날카로운 눈)
  const eyeRotate = angerLevel * 0.6; 
  // 레벨 0일 땐 원형(1.0), 레벨 1일 땐 찌그러짐(0.6)
  const eyeScaleY = 1.0 - (angerLevel * 0.4); 

  // 왼쪽 눈
  ctx.save();
  ctx.translate(x - eyeOffset, eyeY);
  ctx.rotate(eyeRotate);
  ctx.scale(1, eyeScaleY);
  ctx.beginPath();
  ctx.arc(0, 0, eyeSize, Math.PI, 0, true);
  ctx.fill();
  ctx.restore();

  // 오른쪽 눈
  ctx.save();
  ctx.translate(x + eyeOffset, eyeY);
  ctx.rotate(-eyeRotate);
  ctx.scale(1, eyeScaleY);
  ctx.beginPath();
  ctx.arc(0, 0, eyeSize, Math.PI, 0, true);
  ctx.fill();
  ctx.restore();

  // 2. 눈썹
  ctx.lineWidth = radius * 0.15; 
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  
  // 미간 간격: 평온할 땐 넓고(1.8), 화날 땐 좁음(0.3) - 1단계에서 눈썹이 합쳐지지 않도록 간격 더 증가
  const browGap = eyeSize * (1.8 - angerLevel * 1.5); 
  
  // 눈썹 중심 높이: 평온할 땐 눈 위(-0.5), 화날 땐 눈 아래로 덮침(0.5)
  // eyeSize 기준 상대 좌표 사용 - 눈썹은 원래 위치(y 기준) 유지
  const browBaseY = y - radius * 0.05; // 눈썹은 원래 위치 유지
  const browCenterYOffset = -0.5 + (angerLevel * 1.0); 
  const browOuterYOffset = -0.5 - (angerLevel * 0.3); // 바깥쪽은 화날수록 살짝 올라감(치켜뜸)

  // 왼쪽 눈썹
  // 바깥 -> 안쪽
  ctx.moveTo(x - eyeOffset - eyeSize * 1.0, browBaseY + eyeSize * browOuterYOffset);
  ctx.lineTo(x - browGap * 0.5, browBaseY + eyeSize * browCenterYOffset);
  
  // 오른쪽 눈썹
  // 안쪽 -> 바깥
  ctx.moveTo(x + browGap * 0.5, browBaseY + eyeSize * browCenterYOffset);
  ctx.lineTo(x + eyeOffset + eyeSize * 1.0, browBaseY + eyeSize * browOuterYOffset);
  
  ctx.stroke();

  // 3. 입
  ctx.lineWidth = radius * 0.08;
  ctx.beginPath();
  
  const mouthY = y + radius * 0.45;
  const mouthW = radius * 0.35;
  
  if (angerLevel < 0.2) {
    // 평온할 땐 일자 입 혹은 살짝 둥근 입
    ctx.moveTo(x - mouthW * 0.8, mouthY);
    ctx.lineTo(x + mouthW * 0.8, mouthY);
  } else {
    // 화날수록 삐죽거리는 정도(굴곡) 심화
    const mouthCurve = radius * (angerLevel * 0.4); 
    ctx.moveTo(x - mouthW, mouthY + mouthCurve);
    ctx.quadraticCurveTo(x, mouthY - mouthCurve, x + mouthW, mouthY + mouthCurve);
  }
  ctx.stroke();  
}

function drawCherry(canvas, size, animation = 'normal') {
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

  // 동적 표정 그리기
  drawFruitFaceAnimated(ctx, cx, cy, bodyRadius, animation);
}

function drawGrape(canvas, size, animation = 'normal') {
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

  // 3. 꼭지 (강조됨 - 두껍고 튼튼하게)
  ctx.strokeStyle = '#4A3728'; // 진한 나무색
  ctx.lineWidth = size * 0.08; // 두께 2배 증가 (0.04 -> 0.08)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  
  const stemStartY = cy - bodyRadius * 0.85;
  const stemEndY = cy - bodyRadius * 1.3; // 길이 증가
  
  // 메인 줄기 (약간의 곡선)
  ctx.moveTo(cx, stemStartY);
  ctx.quadraticCurveTo(cx + 5, stemStartY - 20, cx - 5, stemEndY);
  ctx.stroke();

  // 꼭지 끝부분 단면 (입체감)
  ctx.fillStyle = '#6D4C41';
  ctx.beginPath();
  ctx.ellipse(cx - 5, stemEndY, size * 0.04, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. 잎사귀 및 덩굴손 제거됨

  // 5. 하이라이트
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(cx - bodyRadius * 0.3, cy - bodyRadius * 0.45, bodyRadius * 0.15, bodyRadius * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFaceAnimated(ctx, cx, cy, bodyRadius, animation);
}

function drawStrawberry(canvas, size, animation = 'normal') {
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
  
  // 잎 (이미지 참고: 5갈래 둥근 별/꽃 모양 + 머리카락 느낌)
  ctx.fillStyle = '#006400'; // DarkGreen
  ctx.strokeStyle = '#004d00';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.save();
  ctx.translate(radius, radius * 0.15); // 꼭지 위치
  
  // 약간 기울여서 자연스럽게
  ctx.rotate(-0.2); 

  const numPetals = 5;
  const innerRadius = radius * 0.15; // 안쪽도 약간 키움
  const outerRadius = radius * 0.55; // 크기 대폭 확대 (머리처럼 덮이게)

  ctx.beginPath();
  for (let i = 0; i < numPetals * 2; i++) {
    const angle = (Math.PI * i) / numPetals - Math.PI / 2;
    // 짝수 인덱스는 바깥쪽 점(잎 끝), 홀수 인덱스는 안쪽 점(잎 사이)
    const r = (i % 2 === 0) ? outerRadius : innerRadius;
    
    const currX = Math.cos(angle) * r;
    const currY = Math.sin(angle) * r;
    
    if (i === 0) {
      ctx.moveTo(currX, currY);
    } else {
      // 머리카락처럼 부드럽게 이어지도록 곡선 사용
      const prevAngle = (Math.PI * (i - 1)) / numPetals - Math.PI / 2;
      const prevR = ((i - 1) % 2 === 0) ? outerRadius : innerRadius;
      const prevX = Math.cos(prevAngle) * prevR;
      const prevY = Math.sin(prevAngle) * prevR;
      
      // 제어점 계산 (둥글게 부풀리기)
      // 바깥쪽으로 나갈 때는 볼록하게, 안쪽으로 들어올 때는 오목하게
      const cpAngle = (prevAngle + angle) / 2;
      // 잎사귀 끝부분을 둥글고 통통하게 (머리카락 볼륨감)
      let cpR;
      if (i % 2 !== 0) { 
        // 바깥 -> 안쪽 (잎의 옆면): 약간 볼록하게
        cpR = (prevR + r) * 0.6; 
      } else {
        // 안쪽 -> 바깥 (잎의 옆면): 약간 오목하게
        cpR = (prevR + r) * 0.6;
      }
      
      const cpX = Math.cos(cpAngle) * cpR;
      const cpY = Math.sin(cpAngle) * cpR;
      
      ctx.quadraticCurveTo(cpX, cpY, currX, currY);
    }
  }
  // 마지막 점 연결
  const firstAngle = -Math.PI / 2;
  const firstX = Math.cos(firstAngle) * outerRadius;
  const firstY = Math.sin(firstAngle) * outerRadius;
  const lastAngle = (Math.PI * (numPetals * 2 - 1)) / numPetals - Math.PI / 2;
  const cpAngleEnd = (lastAngle + firstAngle + Math.PI*2) / 2; // 각도 보정
  // 마지막 연결 부드럽게
  const cpR_End = (innerRadius + outerRadius) * 0.6;
  const cpX_End = Math.cos(lastAngle + Math.PI/(numPetals*2)) * cpR_End; 
  const cpY_End = Math.sin(lastAngle + Math.PI/(numPetals*2)) * cpR_End;
  
  ctx.quadraticCurveTo(cpX_End, cpY_End, firstX, firstY);

  ctx.closePath();
  
  // 입체감을 위한 그림자
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  
  ctx.fill();
  ctx.shadowBlur = 0; // 그림자 초기화
  ctx.shadowOffsetY = 0;
  ctx.stroke();
  
  // 꼭지 중앙 (줄기 연결부)
  ctx.fillStyle = '#004d00';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  // 짧은 줄기 (귀여움 포인트 - 약간 더 굵게)
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#006400';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(5, -12, 12, -18);
  ctx.stroke();

  ctx.restore();
  
  // 광택 (머리 위에 하이라이트)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(radius - radius * 0.3, radius * 0.15, radius * 0.15, radius * 0.08, -0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // 얼굴 광택
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(radius * 0.7, radius * 0.7, radius * 0.15, radius * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  drawFruitFaceAnimated(ctx, radius, radius * 1.0, radius * 0.85, animation); // 표정 위치 및 크기 조정
}


function drawOrange(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius, radius * 0.9, animation);
}

function drawPersimmon(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius * 1.05, radius * 0.9, animation);
}

function drawApple(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius, radius * 0.9, animation);
}

function drawPear(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius * 0.8, radius * 0.7, animation);
}

function drawPeach(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius, radius * 0.9, animation);
}

function drawPineapple(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius, radius * 0.9, animation);
}

function drawMelon(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius, radius * 0.9, animation);
}

function drawWatermelon(canvas, size, animation = 'normal') {
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

  drawFruitFaceAnimated(ctx, radius, radius, radius * 0.7, animation);
}

function drawBomb(canvas, size, timerValue = 9) {
  const ctx = canvas.getContext('2d');
  const radius = size / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. 스케일 및 위치 조정
  ctx.translate(radius, radius);
  ctx.scale(0.75, 0.75); // 스케일 유지 (물리 바디 크기 일치)
  ctx.translate(-radius, -radius);
  
  // 2. 몸통 (매끈한 검은 폭탄 과일)
  const gradient = ctx.createRadialGradient(radius * 0.3, radius * 0.3, 0, radius, radius, radius);
  gradient.addColorStop(0, '#666666'); // 밝은 회색 하이라이트
  gradient.addColorStop(0.3, '#333333'); 
  gradient.addColorStop(1, '#000000'); // 완전 검은색
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // 3. 심지 (Wick) - timerValue에 따라 길이 변화
  // timerValue: 9(최대 길이) ~ 1(최소 길이)
  // 최소 길이여도 약간은 보여야 함
  const maxWickLen = 100;
  const minWickLen = 20;
  const wickProgress = Math.max(0, Math.min(1, (timerValue - 1) / 8)); // 0 ~ 1
  const wickLength = minWickLen + wickProgress * (maxWickLen - minWickLen);
  
  const stemY = radius - radius * 0.95;
  
  // 심지 그리기 (베지어 곡선으로 꼬불거리게)
  ctx.strokeStyle = '#D2B48C'; // Tan 색상 (심지)
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(radius, stemY);
  
  // 심지 끝점 계산 (단순화된 곡선)
  // 길이가 길수록 더 꼬불거림
  const cp1x = radius + 20;
  const cp1y = stemY - wickLength * 0.5;
  const cp2x = radius - 20;
  const cp2y = stemY - wickLength;
  const endX = radius + (wickLength > 60 ? 10 : 0); // 긴 심지는 약간 옆으로
  const endY = stemY - wickLength;
  
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.stroke();

  // 4. 불꽃 (심지 끝에 달림)
  // 불꽃은 항상 그림
  const flameSize = 15 + Math.random() * 5; // 약간의 크기 변화
  
  // 불꽃 외곽 (노랑)
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(endX, endY, flameSize, 0, Math.PI * 2);
  ctx.fill();
  
  // 불꽃 중간 (주황)
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.arc(endX, endY + 2, flameSize * 0.7, 0, Math.PI * 2);
  ctx.fill();
  
  // 불꽃 심 (빨강)
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(endX, endY + 4, flameSize * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 꼭지 연결부 (금속 캡)
  ctx.fillStyle = '#555555';
  ctx.beginPath();
  ctx.fillRect(radius - 12, stemY - 5, 24, 15);
  
  // 5. 광택 (매끈한 질감)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.ellipse(radius * 0.6, radius * 0.6, radius * 0.3, radius * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // 6. 화남 단계 계산
  // 5 이상일 땐 무표정(0), 5 미만부터 급격히 화남
  let angerLevel = 0;
  if (timerValue < 5) {
    // 4.9 -> 0.025 ... 1.0 -> 1.0
    angerLevel = (5 - timerValue) / 4;
    angerLevel = Math.max(0, Math.min(1, angerLevel));
  }

  // 7. 얼굴 (아기자기함의 핵심)
  drawAngryFace(ctx, radius, radius, radius * 0.7, angerLevel);
  
  // 8. 화남 단계 표현 (이마에 붉은색 터치)
  if (angerLevel > 0) {
    const angerAlpha = angerLevel * 0.8; // 최대 0.8 투명도 (더 진하게)
    
    // 이마 부분 그라데이션
    const angerGrad = ctx.createRadialGradient(radius, radius * 0.6, 0, radius, radius * 0.6, radius * 0.6);
    angerGrad.addColorStop(0, `rgba(255, 0, 0, ${angerAlpha})`);
    angerGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = angerGrad;
    ctx.beginPath();
    // 얼굴 위쪽 중심으로 붉은 기운
    ctx.arc(radius, radius * 0.6, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // 빠직 마크 (💢) 추가 - 막바지(2 이하)에 표시
    if (timerValue <= 2) {
      // 위치 및 크기 설정
      const markX = radius + radius * 0.45; // 조금 더 바깥쪽으로
      const markY = radius - radius * 0.45;
      const size = 25; // 크기 줄임 (50 -> 35)
      
      // 마크 그리기 함수 (재사용)
      const drawVeinMark = (ctx, x, y, s) => {
        // 4개 사각형이 합쳐져 하나인 것처럼 보이고 바깥이 훨씬 더 잘리도록 함
        const rectSize = s * 0.9;
        const spacing = s * 1.0; // 간격 더 벌림 (0.8 -> 1.0)
        const expand = s * 0.2;
        
        // 전체를 하나의 클리핑 영역으로 설정 (훨씬 더 작게 만들어 더 많이 잘리게)
        ctx.save();
        ctx.beginPath();
        // 전체를 감싸는 원형 클리핑 영역 (훨씬 더 작게)
        ctx.arc(x, y, spacing + rectSize/2 + expand * 0.2, 0, Math.PI * 2);
        ctx.clip();
        
        // 4개 사각형을 그리기 (서로 겹치게)
        ctx.beginPath();
        
        // 좌상 둥근 사각형
        ctx.roundRect(
          x - spacing - rectSize/2 - expand, 
          y - spacing - rectSize/2 - expand, 
          rectSize + expand * 2, 
          rectSize + expand * 2, 
          (rectSize + expand * 2) * 0.3
        );
        
        // 우상 둥근 사각형
        ctx.roundRect(
          x + spacing - rectSize/2 - expand, 
          y - spacing - rectSize/2 - expand, 
          rectSize + expand * 2, 
          rectSize + expand * 2, 
          (rectSize + expand * 2) * 0.3
        );
        
        // 좌하 둥근 사각형
        ctx.roundRect(
          x - spacing - rectSize/2 - expand, 
          y + spacing - rectSize/2 - expand, 
          rectSize + expand * 2, 
          rectSize + expand * 2, 
          (rectSize + expand * 2) * 0.3
        );
        
        // 우하 둥근 사각형
        ctx.roundRect(
          x + spacing - rectSize/2 - expand, 
          y + spacing - rectSize/2 - expand, 
          rectSize + expand * 2, 
          rectSize + expand * 2, 
          (rectSize + expand * 2) * 0.3
        );
        
        ctx.stroke();
        ctx.restore();
      };

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 2. 메인 빨간색
      ctx.shadowBlur = 0; // 그림자 제거 (깔끔하게)
      ctx.strokeStyle = '#FF0000'; // 밝은 빨강
      ctx.lineWidth = 5; // 테두리보다 얇게
      drawVeinMark(ctx, markX, markY, size);
      
      // 카운트가 1일 때 반대쪽 이마에 빠직 마크 하나 더 추가
      if (timerValue === 1) {
        const secondMarkX = radius - radius * 0.45; // 반대쪽 (왼쪽)
        const secondMarkY = radius - radius * 0.35; // 살짝 아래로 조절 (0.45 -> 0.35)
        const secondSize = size * 0.8; // 약간 더 작게
        drawVeinMark(ctx, secondMarkX, secondMarkY, secondSize);
      }
    }
  }
}

// ...
