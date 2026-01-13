import Phaser from 'phaser';
import fruitConfigs from './fruitConfigs';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // 이미지나 에셋 로드 시 사용
  }

  create() {
    const { width, height } = this.scale;

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
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
    });
    this.previewText.setOrigin(0.5, 0.5);

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

    // 8각형 과일 생성 (graphics 사용)
    const fruitGraphics = this.add.graphics();
    fruitGraphics.fillStyle(fruitConfig.color, 1);
    const octagonPoints = this.getOctagonPoints(radius);
    fruitGraphics.beginPath();
    fruitGraphics.moveTo(dropX + octagonPoints[0].x, dropY + octagonPoints[0].y);
    for (let i = 1; i < octagonPoints.length; i++) {
      fruitGraphics.lineTo(dropX + octagonPoints[i].x, dropY + octagonPoints[i].y);
    }
    fruitGraphics.closePath();
    fruitGraphics.fillPath();

    // 8각형 테두리
    fruitGraphics.lineStyle(2, 0x000000, 0.3);
    fruitGraphics.beginPath();
    fruitGraphics.moveTo(dropX + octagonPoints[0].x, dropY + octagonPoints[0].y);
    for (let i = 1; i < octagonPoints.length; i++) {
      fruitGraphics.lineTo(dropX + octagonPoints[i].x, dropY + octagonPoints[i].y);
    }
    fruitGraphics.closePath();
    fruitGraphics.strokePath();

    // 물리 적용을 위한 8각형 바디 생성
    const fruit = this.add.polygon(dropX, dropY, octagonPoints, 0x000000, 0);
    fruit.setOrigin(0.5, 0.5);

    // Matter.js 물리 적용 (정확한 8각형 정점 사용)
    const Vertices = Phaser.Physics.Matter.Matter.Vertices;
    const Body = Phaser.Physics.Matter.Matter.Body;
    
    // 정점을 절대 좌표로 변환
    const absolutePoints = octagonPoints.map(p => ({ x: dropX + p.x, y: dropY + p.y }));
    
    // 커스텀 바디 생성
    const customBody = Body.create({
      vertices: absolutePoints,
      friction: 0.5,
      restitution: 0.2
    });
    
    this.matter.add.gameObject(fruit, {
      label: `fruit_${dropLevel}`,
      fruitLevel: dropLevel
    });
    
    // 바디 교체
    fruit.setExistingBody(customBody);

    // 과일 정보 저장
    fruit.radius = radius;
    fruit.level = dropLevel;
    fruit.fruitNumber = dropNumber;
    fruit.fruitGraphics = fruitGraphics;
    fruit.initialX = dropX; // 생성 시점의 x 좌표 저장
    fruit.initialY = dropY; // 생성 시점의 y 좌표 저장
    this.fruits.push(fruit);

    // 과일 숫자 텍스트 추가 (미리보기와 동일한 위치에서 시작)
    const fruitText = this.add.text(dropX, dropY, dropNumber, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
    });
    fruitText.setOrigin(0.5, 0.5);
    fruitText.setDepth(10);
    fruit.fruitText = fruitText;

    // 새로운 미리보기 과일 생성 (범위에서 랜덤하게 선택)
    this.previewLevel = Phaser.Math.Between(this.minDropLevel, this.maxDropLevel);
    this.previewNumber = this.getRandomNumberForLevel(this.previewLevel);
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

    // 떨어진 과일의 그래픽과 텍스트 위치 동기화
    this.fruits.forEach(fruit => {
      if (fruit.fruitGraphics) {
        // graphics 위치 업데이트 (생성 시점의 좌표 기준으로 물리 위치 반영)
        const deltaX = fruit.x - fruit.initialX;
        const deltaY = fruit.y - fruit.initialY;
        fruit.fruitGraphics.setPosition(deltaX, deltaY);
      }
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

    // 8각형 과일 생성 (graphics 사용)
    const fruitGraphics = this.add.graphics();
    fruitGraphics.fillStyle(fruitConfig.color, 1);
    const octagonPoints = this.getOctagonPoints(radius);
    fruitGraphics.beginPath();
    fruitGraphics.moveTo(x + octagonPoints[0].x, y + octagonPoints[0].y);
    for (let i = 1; i < octagonPoints.length; i++) {
      fruitGraphics.lineTo(x + octagonPoints[i].x, y + octagonPoints[i].y);
    }
    fruitGraphics.closePath();
    fruitGraphics.fillPath();

    // 8각형 테두리
    fruitGraphics.lineStyle(2, 0x000000, 0.3);
    fruitGraphics.beginPath();
    fruitGraphics.moveTo(x + octagonPoints[0].x, y + octagonPoints[0].y);
    for (let i = 1; i < octagonPoints.length; i++) {
      fruitGraphics.lineTo(x + octagonPoints[i].x, y + octagonPoints[i].y);
    }
    fruitGraphics.closePath();
    fruitGraphics.strokePath();

    // 물리 적용을 위한 8각형 바디 생성
    const fruit = this.add.polygon(x, y, octagonPoints, 0x000000, 0);
    fruit.setOrigin(0.5, 0.5);

    // Matter.js 물리 적용 (정확한 8각형 정점 사용)
    const Body = Phaser.Physics.Matter.Matter.Body;
    const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
    
    // 정점을 절대 좌표로 변환
    const absolutePoints = octagonPoints.map(p => ({ x: x + p.x, y: y + p.y }));
    
    // 커스텀 바디 생성
    const customBody = Body.create({
      vertices: absolutePoints,
      friction: 0.5,
      restitution: 0.2
    });
    
    this.matter.add.gameObject(fruit, {
      label: `fruit_${level}`,
      fruitLevel: level
    });
    
    // 바디 교체
    fruit.setExistingBody(customBody);
    
    // 중력 적용을 위해 sleeping 상태 해제
    Sleeping.set(fruit.body, false);

    // 과일 정보 저장
    fruit.radius = radius;
    fruit.level = level;
    fruit.fruitNumber = newNumber;
    fruit.fruitGraphics = fruitGraphics;
    fruit.initialX = x;
    fruit.initialY = y;
    this.fruits.push(fruit);

    // 과일 숫자 텍스트 추가
    const fruitText = this.add.text(x, y, newNumber, {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
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
  }

  updatePreview(mouseX, mouseY) {
    const fruitConfig = this.fruitConfigs[this.previewLevel];
    const radius = fruitConfig.radius;

    // 미리보기 그래픽 초기화
    this.previewGraphics.clear();

    // 게임오버 경고 중이면 흑백 처리, 아니면 원래 색상
    let fillColor = fruitConfig.color;
    if (this.gameOverWarning) {
      fillColor = 0x888888; // 흑백 처리
    }

    // 8각형 그리기
    this.previewGraphics.fillStyle(fillColor, 1);
    const octagonPoints = this.getOctagonPoints(radius);
    this.previewGraphics.beginPath();
    this.previewGraphics.moveTo(mouseX + octagonPoints[0].x, mouseY + octagonPoints[0].y);
    for (let i = 1; i < octagonPoints.length; i++) {
      this.previewGraphics.lineTo(mouseX + octagonPoints[i].x, mouseY + octagonPoints[i].y);
    }
    this.previewGraphics.closePath();
    this.previewGraphics.fillPath();

    // 8각형 테두리
    this.previewGraphics.lineStyle(2, 0x000000, 0.3);
    this.previewGraphics.beginPath();
    this.previewGraphics.moveTo(mouseX + octagonPoints[0].x, mouseY + octagonPoints[0].y);
    for (let i = 1; i < octagonPoints.length; i++) {
      this.previewGraphics.lineTo(mouseX + octagonPoints[i].x, mouseY + octagonPoints[i].y);
    }
    this.previewGraphics.closePath();
    this.previewGraphics.strokePath();

    // 숫자 텍스트 업데이트
    this.previewText.setText(this.previewNumber);
    this.previewText.setPosition(mouseX, mouseY);
  }
}
