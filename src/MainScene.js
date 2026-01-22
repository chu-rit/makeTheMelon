import Phaser from 'phaser';
import fruitConfigs from './fruitConfigs';
import { createFruitTextures } from './drawFruits';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    // 이미지나 에셋 로드 시 사용
  }

  createFruitTextures() {
    createFruitTextures(this);
  }

  create() {
    const { width, height } = this.scale;

    this.fruits = [];
    this.fruitConfigs = fruitConfigs;

    // 과일 텍스처 생성
    this.createFruitTextures();

    // 1. 밝고 화사한 파스텔톤 배경
    const background = this.add.graphics();
    background.fillGradientStyle(0xfff5e1, 0xfff5e1, 0xffe4d1, 0xffe4d1, 1); // 부드러운 크림/살구톤
    background.fillRect(0, 0, width, height);

    // Matter.js 월드 경계 설정
    this.matter.world.setBounds(0, 0, width, height);

    // 2. 아기자기한 파스텔톤 벽과 바닥
    const wallBaseColor = 0xffe4e1; // 미스티 로즈 (부드러운 분홍)
    const wallBorderColor = 0xffb6c1; // 라이트 핑크
    const wallThickness = 100; // 벽 두께 대폭 강화 (40 -> 100) - 터널링 방지
    
    const createStyledWall = (x, y, w, h, label) => {
      const graphics = this.add.graphics();
      
      // 벽 본체 (둥근 느낌을 위해 Graphics 사용)
      graphics.fillStyle(wallBaseColor, 1);
      graphics.fillRoundedRect(x - w / 2, y - h / 2, w, h, 15);
      
      // 테두리
      graphics.lineStyle(4, wallBorderColor, 1);
      graphics.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 15);
      
      // 아기자기한 도트 패턴 추가
      graphics.fillStyle(0xffffff, 0.3);
      const dotSize = 4;
      const spacing = 20;
      for (let px = x - w / 2 + 10; px < x + w / 2 - 10; px += spacing) {
        for (let py = y - h / 2 + 10; py < y + h / 2 - 10; py += spacing) {
          graphics.fillCircle(px, py, dotSize);
        }
      }

      // Matter.js 물리 바디 설정 (투명한 사각형을 바디로 사용)
      const wallBody = this.add.rectangle(x, y, w, h, 0x000000, 0);
      this.matter.add.gameObject(wallBody, { isStatic: true, label });
      
      return graphics;
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

    // 4. 폭탄 버튼 (우측 상단)
    const bombBtnX = width - 60;
    const bombBtnY = 60;
    const bombBtnRadius = 35;

    const bombBtn = this.add.container(bombBtnX, bombBtnY);
    bombBtn.setDepth(20);

    // 버튼 배경
    const bombBtnBg = this.add.graphics();
    bombBtnBg.fillStyle(0x333333, 0.8);
    bombBtnBg.fillCircle(0, 0, bombBtnRadius);
    bombBtnBg.lineStyle(3, 0xffd700, 1); // 금색 테두리
    bombBtnBg.strokeCircle(0, 0, bombBtnRadius);
    bombBtn.add(bombBtnBg);

    // 폭탄 아이콘 (최대숫자 9일 때의 폭탄 텍스처 사용)
    const bombIcon = this.add.sprite(0, 0, 'fruit_bomb_9');
    bombIcon.setScale(0.3); // 아이콘 크기
    bombBtn.add(bombIcon);

    // 버튼 라벨 (BOMB)
    const bombLabel = this.add.text(0, 45, 'BOMB', {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    bombBtn.add(bombLabel);

    // 인터랙션
    // Zone을 원형으로 설정하여 터치 영역을 더 정확하게 만듦
    const bombBtnZone = this.add.zone(0, 0, bombBtnRadius * 2, bombBtnRadius * 2)
      .setInteractive(new Phaser.Geom.Circle(bombBtnRadius, bombBtnRadius, bombBtnRadius * 1.2), Phaser.Geom.Circle.Contains); // 터치 영역 1.2배 확대
    bombBtn.add(bombBtnZone);

    bombBtnZone.on('pointerdown', (pointer, localX, localY, event) => {
      // 이벤트 전파 방지
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }

      // 게임오버 상태거나 드롭 불가능할 때 무시
      if (this.isGameOver || this.gameOverWarning || !this.canDrop) return;

      // 이미 폭탄 모드라면 무시 (중복 클릭 방지)
      if (this.isDraggingBomb) return;

      // 폭탄 모드로 전환 및 드래그 시작
      this.isDraggingBomb = true;
      // 현재 미리보기 숫자를 폭탄 타이머 초기값으로 가져옴
      this.bombInitialCount = this.previewNumber;
      // 폭탄은 배열의 마지막 요소
      const bombLevel = this.fruitConfigs.length - 1;
      this.previewLevel = bombLevel;
      // previewNumber는 그대로 유지 (미리보기 숫자와 떨어트리는 숫자를 일치시키기 위해)
      
      // 터치 위치로 포인터 즉시 업데이트
      this.lastPointerX = pointer.x;
      
      // 미리보기 갱신
      this.updatePreview(pointer.x, this.previewY);
      
      // 버튼 클릭 효과
      this.tweens.add({
        targets: bombBtn,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true
      });
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
    this.previewSprite = null; // 스프라이트 변수 초기화 (재시작 시 에러 방지)
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
    this.isDraggingBomb = false; // 폭탄 버튼을 눌러서 드래그 중인지 확인

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
    this.input.on('pointerup', (pointer, currentlyOver) => {
      // 게임오버 경고 중이거나 게임오버 상태면 과일 떨어트리기 금지
      if (this.isGameOver || this.gameOverWarning) {
        this.isDraggingBomb = false; // 상태 초기화
        return;
      }

      // 폭탄 드래그 중이었다면 무조건 드롭 (UI 위여도 상관없음)
      if (this.isDraggingBomb) {
        if (this.canDrop) {
          this.dropFruit();
          this.canDrop = false;
          this.dropCooldown = 500; // 0.5초
          
          // 다음 과일은 다시 일반 과일로 랜덤 생성
          this.previewLevel = Phaser.Math.Between(this.minDropLevel, this.maxDropLevel);
          this.previewNumber = this.getRandomNumberForLevel(this.previewLevel);
        }
        this.isDraggingBomb = false;
        return;
      }
      
      // 일반 드롭: UI 요소 위가 아닐 때만
      if (currentlyOver.length > 0) return;
      
      if (this.canDrop) {
        this.dropFruit();
        this.canDrop = false;
        this.dropCooldown = 500; // 0.5초
      }
    });

    // 4. 충돌 감지 (폭탄 폭발용)
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 게임 오브젝트가 연결된 바디인지 확인
        if (!bodyA.gameObject || !bodyB.gameObject) return;

        const fruitA = bodyA.gameObject;
        const fruitB = bodyB.gameObject;

        // 둘 중 하나가 폭탄인지 확인 (벽이나 바닥과 부딪혀도 폭발)
        const isBombA = fruitA.level !== undefined && this.fruitConfigs[fruitA.level] && this.fruitConfigs[fruitA.level].isBomb;
        const isBombB = fruitB.level !== undefined && this.fruitConfigs[fruitB.level] && this.fruitConfigs[fruitB.level].isBomb;

        // 충돌 시 폭발 로직 제거 (시한폭탄으로 변경됨)
        /*
        if (isBombA && !fruitA.isExploded) {
          fruitA.isExploded = true;
          this.explodeBomb(fruitA);
        }
        
        if (isBombB && !fruitB.isExploded) {
          fruitB.isExploded = true;
          this.explodeBomb(fruitB);
        }
        */
      });
    });
  }

  explodeBomb(bomb) {
    if (!bomb || !bomb.scene) return;

    const x = bomb.x;
    const y = bomb.y;
    const blastRadius = 800; // 화면 전체 커버
    const blastPower = 0.35; // 폭발 힘 적절하게 조절 (0.2 -> 0.35)

    // 이펙트
    this.createExplosionEffect(x, y);

    // 카메라 쉐이크
    this.cameras.main.shake(500, 0.05);

    // 주변 과일 밀어내기
    this.fruits.forEach(fruit => {
      if (fruit === bomb || !fruit.body) return;
      
      const dist = Phaser.Math.Distance.Between(x, y, fruit.x, fruit.y);
      if (dist < blastRadius) {
        // 먼저 자는 객체 깨우기
        if (fruit.body.isSleeping) {
          const Sleeping = Phaser.Physics.Matter.Matter.Sleeping;
          Sleeping.set(fruit.body, false);
          fruit.body.isSleeping = false;
        }

        const angle = Phaser.Math.Angle.Between(x, y, fruit.x, fruit.y);
        // 거리에 반비례한 힘
        const distanceFactor = (1 - dist / blastRadius);
        // 질량을 고려한 힘 계산
        const forceMagnitude = fruit.body.mass * blastPower * distanceFactor;
        
        let dirX = Math.cos(angle);
        let dirY = Math.sin(angle);

        // 위로 튀어오르는 힘 억제 (상향 벡터 감쇠)
        if (dirY < 0) {
          dirY *= 0.03; // 위로 향하는 힘을 3%로 줄임 (8% -> 3%)
        }
        
        // Matter.js 힘 적용
        this.matter.body.applyForce(fruit.body, fruit.body.position, {
          x: dirX * forceMagnitude,
          y: dirY * forceMagnitude
        });
        
        // 회전력 추가
        this.matter.body.setAngularVelocity(fruit.body, (Math.random() - 0.5) * 0.2);
      }
    });

    // 폭탄 제거 (fruits 배열에서 제거)
    this.fruits = this.fruits.filter(f => f !== bomb);
    if (bomb.fruitText) bomb.fruitText.destroy();
    bomb.destroy();
  }

  createExplosionEffect(x, y) {
    // 1. 섬광
    const flash = this.add.circle(x, y, 150, 0xffffff); // 섬광 크기 증가
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      scale: 8, // 스케일 증가
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    // 2. 쾅! 텍스트
    const bangText = this.add.text(x, y, 'BOOM!', {
      fontSize: '80px', // 폰트 크기 증가
      color: '#ff0000',
      fontFamily: 'Arial Black',
      stroke: '#ffffff',
      strokeThickness: 8
    }).setOrigin(0.5);
    bangText.setDepth(51);

    this.tweens.add({
      targets: bangText,
      scale: { from: 0.5, to: 2.0 }, // 텍스트 확대 효과 강화
      alpha: 0,
      y: y - 80,
      angle: { from: -10, to: 10 },
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => bangText.destroy()
    });

    // 3. 충격파 링
    const shockwave = this.add.circle(x, y, 10, 0xffffff, 0);
    shockwave.setStrokeStyle(10, 0xffa500); // 선 두께 증가
    shockwave.setDepth(49);
    
    this.tweens.add({
      targets: shockwave,
      radius: 800, // 충격파 반경 대폭 증가
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => shockwave.destroy()
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
    let textureKey = `fruit_${dropLevel}`;
    if (this.fruitConfigs[dropLevel].isBomb) {
      textureKey = `fruit_bomb_${dropNumber}`;
    }
    const fruit = this.add.sprite(dropX, dropY, textureKey);
    
    // 폭탄 과일은 텍스처 내 여백이 많으므로(스케일 0.75) 더 크게 확대해야 물리 바디와 일치함
    // 일반 과일: radius / 170 (텍스처 내 반지름 약 170px 기준)
    // 폭탄 과일: radius / 142.5 (텍스처 내 반지름 190 * 0.75 = 142.5px 기준)
    if (this.fruitConfigs[dropLevel].isBomb) {
      fruit.setScale(radius / 142.5);
    } else {
      fruit.setScale(radius / 170);
    }
    
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

    // 현재 과일 개수 로깅
    console.log(`현재 과일 개수: ${this.fruits.length}`);

    // 과일 숫자 텍스트 추가
    const config = this.fruitConfigs[dropLevel];
    
    // 텍스트 설정
    let textContent = dropNumber.toString();
    let textStyle = {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    };

    // 폭탄일 경우 타이머 텍스트 스타일 적용
    if (config.isBomb) {
      // 폭탄 타이머 설정 - 미리보기 숫자를 그대로 사용
      fruit.bombTimer = this.previewNumber; // 미리보기 숫자를 그대로 타이머로 사용
      textContent = `${fruit.bombTimer}`; // '3' 형식 (단일 숫자)
      
      textStyle = {
        fontSize: '42px', // 이전 미리보기 과일과 동일한 크기
        color: '#ffffff', // 흰색 (이전 미리보기 과일과 동일)
        fontFamily: 'Arial Black', // Arial Black 폰트 (이전 미리보기 과일과 동일)
        fontWeight: 'bold',
        stroke: '#ff4444', // 빨간색 테두리 (이전 미리보기 과일과 동일)
        strokeThickness: 6, // 테두리 두께 (이전 미리보기 과일과 동일)
        shadow: { color: '#000000', blur: 4, fill: true, stroke: true, offsetX: 2, offsetY: 2 } // 그림자 효과 (이전 미리보기 과일과 동일)
      };
    }

    const fruitText = this.add.text(dropX, dropY, textContent, textStyle);
    fruitText.setOrigin(0.5, 0.5);
    fruitText.setDepth(10);
    fruit.fruitText = fruitText;

    // 턴 진행 로직: 기존에 있는 모든 폭탄의 타이머 감소
    const bombsToExplode = [];
    
    this.fruits.forEach(existingFruit => {
      // 방금 떨어진 과일은 제외
      if (existingFruit === fruit) return;
      
      // 이미 터진 폭탄 제외
      if (existingFruit.isExploded) return;

      const fConfig = this.fruitConfigs[existingFruit.level];
      
      // 폭탄이고 타이머가 있다면
      if (fConfig && fConfig.isBomb && existingFruit.bombTimer !== undefined) {
        existingFruit.bombTimer -= 1;
        
        // 텍스트 업데이트
        if (existingFruit.fruitText) {
          existingFruit.fruitText.setText(`${existingFruit.bombTimer}`);
        }
        
        // 텍스처 업데이트 (심지 길이 및 표정 변화 반영)
        if (existingFruit.bombTimer >= 0) {
          existingFruit.setTexture(`fruit_bomb_${existingFruit.bombTimer}`);
        }
        
        // 0이 되면 폭발 대기
        if (existingFruit.bombTimer <= 0) {
          bombsToExplode.push(existingFruit);
        }
      }
    });

    // 타이머가 다 된 폭탄 폭발 (약간의 지연을 주어 순차적 느낌?)
    // 즉시 폭발해도 됨
    bombsToExplode.forEach(bomb => {
      bomb.isExploded = true;
      this.explodeBomb(bomb);
    });

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
      // 폭탄은 최대 레벨 계산에서 제외
      const config = this.fruitConfigs[fruit.level];
      if (config && !config.isBomb && fruit.level > newMaxLevel) {
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
    // 최대 레벨까지의 모든 과일을 떨어트릴 수 있음
    const newMinLevel = 1;
    const newMaxLevel = this.maxFruitLevel;
    
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
    const wallThickness = 100; // 벽 두께와 일치시킴

    // 미리보기 과일 업데이트 (쿨다운 중이 아닐 때만)
    if (this.canDrop) {
      // previewLevel이 유효한 범위인지 확인
      const fruitConfig = this.fruitConfigs[this.previewLevel];
      
      if (fruitConfig && fruitConfig.radius > 0) {
        const radius = fruitConfig.radius;
        
        // 미리보기 x좌표 계산 (벽을 넘어가지 않도록)
        // 벽 두께(100)를 고려하여 clamping 범위 조정
        const minX = radius + wallThickness; 
        const maxX = this.scale.width - radius - wallThickness;
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

    // 화면 이탈 방지 (안전장치) - 폭탄 폭발로 인한 터널링 방지
    // wallThickness는 위에서 이미 선언됨
    this.fruits.forEach(fruit => {
      if (!fruit.body) return;

      const r = fruit.radius;
      let clampedX = fruit.x;
      let clampedY = fruit.y;
      let corrected = false;

      // 왼쪽 벽 이탈 방지 (x < 벽 두께 + 반지름)
      if (fruit.x < wallThickness + r) {
        clampedX = wallThickness + r;
        corrected = true;
        // 벽 쪽으로 향하는 속도 제거
        if (fruit.body.velocity.x < 0) {
          this.matter.body.setVelocity(fruit.body, { x: 0, y: fruit.body.velocity.y });
        }
      }
      // 오른쪽 벽 이탈 방지 (x > 너비 - 벽 두께 - 반지름)
      else if (fruit.x > this.scale.width - wallThickness - r) {
        clampedX = this.scale.width - wallThickness - r;
        corrected = true;
        // 벽 쪽으로 향하는 속도 제거
        if (fruit.body.velocity.x > 0) {
          this.matter.body.setVelocity(fruit.body, { x: 0, y: fruit.body.velocity.y });
        }
      }

      // 바닥 이탈 방지 (바닥 벽 두께 고려)
      // 바닥 벽은 height - (wallThickness / 2)에 위치, 높이는 wallThickness
      // 즉 바닥의 윗면은 height - wallThickness
      if (fruit.y > this.scale.height - wallThickness - r) {
        clampedY = this.scale.height - wallThickness - r;
        corrected = true;
        if (fruit.body.velocity.y > 0) {
          this.matter.body.setVelocity(fruit.body, { x: fruit.body.velocity.x, y: 0 });
        }
      }

      // 위치 보정이 필요한 경우 적용
      if (corrected) {
        this.matter.body.setPosition(fruit.body, { x: clampedX, y: clampedY });
      }
    });
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

    // 1. 어두운 배경 (페이드 인)
    const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000);
    overlay.setDepth(90);
    overlay.setAlpha(0);
    
    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 500
    });

    // 2. 메인 패널 (팝업)
    const panelX = this.scale.width / 2;
    const panelY = this.scale.height / 2;
    const panelW = 420;
    const panelH = 360;
    
    const panel = this.add.container(panelX, panelY);
    panel.setDepth(100);
    panel.setScale(0); // 팝업 효과를 위해 크기 0에서 시작

    // 패널 배경 (흰색 둥근 사각형 + 그림자)
    const panelBg = this.add.graphics();
    // 그림자
    panelBg.fillStyle(0x000000, 0.3);
    panelBg.fillRoundedRect(-panelW/2 + 8, -panelH/2 + 8, panelW, panelH, 25);
    // 본체
    panelBg.fillStyle(0xffffff, 1);
    panelBg.fillRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 25);
    // 테두리
    panelBg.lineStyle(4, 0xffd700, 1); // 골드 테두리
    panelBg.strokeRoundedRect(-panelW/2, -panelH/2, panelW, panelH, 25);
    panel.add(panelBg);

    // 3. 타이틀 텍스트
    const titleText = this.add.text(0, -100, 'GAME OVER', {
      fontSize: '52px',
      color: '#ff4444',
      fontFamily: 'Arial Black',
      fontWeight: 'bold',
      stroke: '#ffffff',
      strokeThickness: 6
    }).setOrigin(0.5);
    // 타이틀 그림자
    titleText.setShadow(3, 3, 'rgba(0,0,0,0.3)', 2, true, true);
    panel.add(titleText);

    // 4. 점수 레이블
    const scoreLabel = this.add.text(0, -20, 'FINAL SCORE', {
      fontSize: '24px',
      color: '#555555',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    panel.add(scoreLabel);

    // 5. 점수 (카운트 업 효과)
    const scoreText = this.add.text(0, 35, '0', {
      fontSize: '64px',
      color: '#333333',
      fontFamily: 'Arial Black',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    panel.add(scoreText);

    // 6. 재시작 버튼
    const btnW = 220;
    const btnH = 65;
    const btnY = 120;
    
    const buttonContainer = this.add.container(0, btnY);
    
    // 버튼 배경
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x4CAF50, 1); // 기본 녹색
    btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 15);
    
    const btnText = this.add.text(0, 0, 'RETRY', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    buttonContainer.add([btnBg, btnText]);
    
    // 버튼 인터랙션 영역 (Zone 사용)
    const btnZone = this.add.zone(0, 0, btnW, btnH).setInteractive();
    buttonContainer.add(btnZone);

    btnZone.on('pointerover', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
      btnBg.clear();
      btnBg.fillStyle(0x66BB6A, 1); // 밝은 녹색
      btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 15);
    });
    
    btnZone.on('pointerout', () => {
      this.tweens.add({
        targets: buttonContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
      btnBg.clear();
      btnBg.fillStyle(0x4CAF50, 1); // 기본 녹색
      btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, 15);
    });
    
    btnZone.on('pointerdown', () => {
      this.scene.restart();
    });
    
    panel.add(buttonContainer);

    // 7. 패널 팝업 애니메이션
    this.tweens.add({
      targets: panel,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 8. 점수 카운트 업 애니메이션
    this.tweens.addCounter({
      from: 0,
      to: this.score,
      duration: 1500,
      ease: 'Power2.easeOut',
      onUpdate: (tween) => {
        const value = Math.round(tween.getValue());
        scoreText.setText(value.toLocaleString());
      }
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
            // 제거될 과일은 제외하고 깨우기
            if (!fruitsToRemove.includes(fruit) && fruit.body) {
              Sleeping.set(fruit.body, false);
              fruit.body.isSleeping = false; // 강제로 깨우기
              fruit.body.sleepCounter = 0; // 수면 카운터 초기화
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
    
    // 폭탄 과일 스케일 보정
    if (fruitConfig.isBomb) {
      fruit.setScale(radius / 142.5);
    } else {
      fruit.setScale(radius / 170);
    }
    
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
    let textContent = newNumber.toString();
    let textStyle = {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#333333',
      strokeThickness: 3
    };

    // 폭탄일 경우 타이머 텍스트 스타일 적용 (병합 생성 시)
    if (fruitConfig.isBomb) {
      // 폭탄 타이머 설정
      fruit.bombTimer = newNumber; 
      textContent = `${fruit.bombTimer}`;
      
      textStyle = {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
        fontWeight: 'bold',
        align: 'center',
        stroke: '#ff4444',
        strokeThickness: 6,
        shadow: { color: '#000000', blur: 4, fill: true, stroke: true, offsetX: 2, offsetY: 2 }
      };
    }

    const fruitText = this.add.text(x, y, textContent, textStyle);
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
    // sprite.scene이 없으면 destroyed된 상태이므로 새로 생성해야 함
    let textureKey = `fruit_${this.previewLevel}`;
    if (fruitConfig.isBomb) {
      textureKey = `fruit_bomb_${this.previewNumber}`;
    }

    if (!this.previewSprite || !this.previewSprite.active || !this.previewSprite.scene) {
      this.previewSprite = this.add.sprite(mouseX, mouseY, textureKey);
      this.previewSprite.setOrigin(0.5, 0.5);
      this.previewSprite.setDepth(5);
      this.previewSpriteRotation = 0;
    } else {
      // 기존 스프라이트 업데이트
      this.previewSprite.setTexture(textureKey);
      this.previewSprite.setPosition(mouseX, mouseY);
    }
    
    // 폭탄 과일 스케일 보정 (MainScene.js dropFruit 참조)
    if (fruitConfig.isBomb) {
      this.previewSprite.setScale(radius / 142.5);
    } else {
      this.previewSprite.setScale(radius / 170);
    }

    this.previewSprite.setAlpha(alpha);
    this.previewSprite.setRotation(0);

    // 숫자 텍스트 업데이트
    let textContent = this.previewNumber.toString();
    let textStyle = {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#333333',
      strokeThickness: 3,
      shadow: null
    };

    if (fruitConfig.isBomb) {
      textContent = `${this.previewNumber}`;
      textStyle = {
        fontSize: '42px', // 이전 미리보기 과일과 동일한 크기
        color: '#ffffff', // 흰색 (이전 미리보기 과일과 동일)
        fontFamily: 'Arial Black', // Arial Black 폰트 (이전 미리보기 과일과 동일)
        fontWeight: 'bold',
        stroke: '#ff4444', // 빨간색 테두리 (이전 미리보기 과일과 동일)
        strokeThickness: 6, // 테두리 두께 (이전 미리보기 과일과 동일)
        shadow: { color: '#000000', blur: 4, fill: true, stroke: true, offsetX: 2, offsetY: 2 } // 그림자 효과 (이전 미리보기 과일과 동일)
      };
    }

    this.previewText.setText(textContent);
    this.previewText.setStyle(textStyle);
    this.previewText.setPosition(mouseX, mouseY);
    this.previewText.setAlpha(alpha);
  }
}
