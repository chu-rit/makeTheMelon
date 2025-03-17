// 게임 상수
const FRUITS = [
    { circleRadius: 25, color: '#FF5733', density: 0.001, score: 1, number: 1, name: '체리' },
    { circleRadius: 30, color: '#FFC300', density: 0.001, score: 2, number: 2, name: '딸기' },
    { circleRadius: 35, color: '#DAF7A6', density: 0.001, score: 4, number: 3, name: '포도' },
    { circleRadius: 40, color: '#C70039', density: 0.001, score: 8, number: 4, name: '오렌지' },
    { circleRadius: 45, color: '#900C3F', density: 0.001, score: 16, number: 5, name: '감귤' },
    { circleRadius: 50, color: '#581845', density: 0.001, score: 32, number: 6, name: '사과' },
    { circleRadius: 55, color: '#2471A3', density: 0.001, score: 64, number: 7, name: '배' },
    { circleRadius: 60, color: '#138D75', density: 0.001, score: 128, number: 8, name: '복숭아' },
    { circleRadius: 65, color: '#D4AC0D', density: 0.001, score: 256, number: 9, name: '파인애플' },
    { circleRadius: 70, color: '#D35400', density: 0.001, score: 512, number: 10, name: '멜론' },
    { circleRadius: 75, color: '#A569BD', density: 0.001, score: 1024, number: 11, name: '수박' }
];

// 과일 생성
function createFruit(x, y, fruitIndex) {
    const fruit = FRUITS[fruitIndex];
    
    const body = Bodies.circle(x, y, fruit.circleRadius, {
        restitution: 0.2,
        friction: 0.01,
        frictionAir: 0.03,
        frictionStatic: 0.5,
        density: fruit.density,
        render: {
            fillStyle: fruit.color,
            strokeStyle: '#000000',
            lineWidth: 1
        }
    });
    
    body.label = 'fruit';
    body.isFruit = true;
    body.fruitIndex = fruitIndex;
    body.fruitNumber = nextFruitNumber; // 과일에 숫자 할당
    body.id = Date.now() + Math.random(); // 고유 ID 생성
    
    World.add(engine.world, body);
    
    // 과일 라벨 생성
    createFruitLabel(body, nextFruitNumber);
    
    // 과일을 fruits 배열에 추가
    fruits.push(body);
    
    return body;
}

// 과일 합치기 검사 함수 추가
function checkFruitMerging() {
    // 과일을 종류별로 그룹화
    const fruitGroups = {};
    
    for (const fruit of fruits) {
        // 쿨타임 중인 과일은 건너뛰기
        if (fruit.cooldown) continue;
        
        const index = fruit.fruitIndex;
        if (!fruitGroups[index]) {
            fruitGroups[index] = [];
        }
        fruitGroups[index].push(fruit);
    }
    
    // 각 그룹에서 합이 10이 되는 조합 찾기
    for (const index in fruitGroups) {
        const combinations = findCombinationsWithSum10(fruitGroups[index]);
        
        // 찾은 조합 중에서 접촉 중인 것만 합치기
        for (const combination of combinations) {
            if (areFruitsInContact(combination)) {
                mergeFruits(combination);
                return; // 한 번에 하나의 조합만 합치기
            }
        }
    }
}

// 합이 10이 되는 과일 조합 찾기
function findCombinationsWithSum10(fruits) {
    const result = [];
    
    // 2개 조합 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            if (fruits[i].fruitNumber + fruits[j].fruitNumber === 10) {
                result.push([fruits[i], fruits[j]]);
            }
        }
    }
    
    // 3개 조합 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            for (let k = j + 1; k < fruits.length; k++) {
                if (fruits[i].fruitNumber + fruits[j].fruitNumber + fruits[k].fruitNumber === 10) {
                    result.push([fruits[i], fruits[j], fruits[k]]);
                }
            }
        }
    }
    
    // 4개 조합 확인
    for (let i = 0; i < fruits.length; i++) {
        for (let j = i + 1; j < fruits.length; j++) {
            for (let k = j + 1; k < fruits.length; k++) {
                for (let l = k + 1; l < fruits.length; l++) {
                    if (fruits[i].fruitNumber + fruits[j].fruitNumber + fruits[k].fruitNumber + fruits[l].fruitNumber === 10) {
                        result.push([fruits[i], fruits[j], fruits[k], fruits[l]]);
                    }
                }
            }
        }
    }
    
    // 5개 이상의 조합은 재귀 함수로 찾기
    if (fruits.length >= 5) {
        findCombinationsRecursive(fruits, [], 0, 0, result);
    }
    
    return result;
}

// 재귀적으로 합이 10이 되는 조합 찾기 (5개 이상)
function findCombinationsRecursive(fruits, currentCombination, currentIndex, currentSum, result) {
    // 현재 합이 10이고 조합의 크기가 5 이상이면 결과에 추가
    if (currentSum === 10 && currentCombination.length >= 5) {
        result.push([...currentCombination]);
        return;
    }
    
    // 합이 10을 초과하거나 모든 과일을 검사했으면 종료
    if (currentSum > 10 || currentIndex >= fruits.length) {
        return;
    }
    
    // 현재 과일을 포함하는 경우
    currentCombination.push(fruits[currentIndex]);
    findCombinationsRecursive(
        fruits,
        currentCombination,
        currentIndex + 1,
        currentSum + fruits[currentIndex].fruitNumber,
        result
    );
    currentCombination.pop();
    
    // 현재 과일을 제외하는 경우
    findCombinationsRecursive(
        fruits,
        currentCombination,
        currentIndex + 1,
        currentSum,
        result
    );
}

// 과일 라벨 제거 함수 추가
function removeFruitLabel(body) {
    if (fruitLabels[body.id]) {
        const label = fruitLabels[body.id];
        if (label && label.parentNode) {
            label.parentNode.removeChild(label);
        }
        delete fruitLabels[body.id];
    }
}

// 과일 라벨 생성 함수 추가
function createFruitLabel(body, number) {
    const label = document.createElement('div');
    label.textContent = number;
    label.style.position = 'absolute';
    label.style.left = `${body.position.x - 15}px`;
    label.style.top = `${body.position.y - 15}px`;
    label.style.color = 'white';
    label.style.fontWeight = 'bold';
    label.style.fontSize = '24px';
    label.style.textAlign = 'center';
    label.style.width = '30px';
    label.style.height = '30px';
    label.style.display = 'flex';
    label.style.justifyContent = 'center';
    label.style.alignItems = 'center';
    label.style.zIndex = 10;
    label.style.pointerEvents = 'none'; // 클릭 이벤트 무시
    
    container.appendChild(label);
    fruitLabels[body.id] = label;
}

// 과일 라벨 위치 업데이트 함수 추가
function updateFruitLabels() {
    for (let i = 0; i < engine.world.bodies.length; i++) {
        const body = engine.world.bodies[i];
        if (body.label === 'fruit' && fruitLabels[body.id]) {
            const label = fruitLabels[body.id];
            label.style.left = `${body.position.x - 15}px`;
            label.style.top = `${body.position.y - 15}px`;
        }
    }
}

 // 과일 합치기 함수
 function mergeFruits(combination) {
    if (combination.length < 2) return;
    
    // 모든 과일이 같은 종류인지 확인
    const fruitIndex = combination[0].fruitIndex;
    for (const fruit of combination) {
        if (fruit.fruitIndex !== fruitIndex) return;
    }
    
    // 중간 위치 계산
    let midX = 0, midY = 0;
    for (const fruit of combination) {
        midX += fruit.position.x;
        midY += fruit.position.y;
    }
    midX /= combination.length;
    midY /= combination.length;
    
    // 기존 과일 라벨 제거 및 과일 제거
    for (const fruit of combination) {
        removeFruitLabel(fruit);
        removeBody(fruit);
    }
    
    // 다음 단계 과일 생성
    const newFruitIndex = fruitIndex + 1;
    if (newFruitIndex < FRUITS.length) {
        // 랜덤 숫자 생성 (기존 확률 분포 사용)
        let randomNumber;
        const rand = Math.random();
        
        if (rand < 0.50) { // 50% 확률로 1-3 사이
            randomNumber = Math.floor(Math.random() * 3) + 1;
        } else if (rand < 0.80) { // 30% 확률로 4-5 사이
            randomNumber = Math.floor(Math.random() * 2) + 4;
        } else if (rand < 0.95) { // 15% 확률로 6-7 사이
            randomNumber = Math.floor(Math.random() * 2) + 6;
        } else { // 5% 확률로 8-9 사이
            randomNumber = Math.floor(Math.random() * 2) + 8;
        }
        
        // 새 과일 생성
        const newFruit = createFruit(midX, midY, newFruitIndex);
        
        // 생성된 과일에 랜덤 숫자 할당
        newFruit.fruitNumber = randomNumber;
        
        // 기존 과일 라벨 제거 후 새로 생성
        removeFruitLabel(newFruit);
        createFruitLabel(newFruit, randomNumber);
        
        // 쿨타임 설정 - 0.5초 동안 합치기 불가능
        newFruit.cooldown = true;
        setTimeout(() => {
            newFruit.cooldown = false;
        }, 500);
        
        // 기본 점수
        let baseScore = FRUITS[newFruitIndex].score;
        
        // 과일 개수에 따른 보너스 점수 계산 (과일 개수 - 1) * 50% 추가
        let bonusMultiplier = 1 + ((combination.length - 2) * 0.5);
        
        // 최종 점수 계산 (기본 점수 * 보너스 배율)
        let finalScore = Math.floor(baseScore * bonusMultiplier);
        
        // 점수 추가
        score += finalScore;
        document.getElementById('score').textContent = score;
        
        // 로그 남기기
        const fruitName = FRUITS[fruitIndex].name;
        const newFruitName = FRUITS[newFruitIndex].name;
        const numbersText = combination.map(fruit => fruit.fruitNumber).join(' + ');
        const logText = `${fruitName}(${numbersText}) → ${newFruitName}(${randomNumber}) (${finalScore}점, ${combination.length}개 과일 보너스: x${bonusMultiplier.toFixed(1)})`;
        console.log(logText);
    }
}

// 대기 중인 과일 표시
function updateWaitingFruit() {
    const fruit = FRUITS[nextFruitIndex];
    
    // 1부터 9까지의 랜덤한 숫자 생성 (작은 숫자일수록 확률이 훨씬 높게)
    let randomNumber;
    const rand = Math.random();
    
    if (rand < 0.50) { // 50% 확률로 1-3 사이
        randomNumber = Math.floor(Math.random() * 3) + 1;
    } else if (rand < 0.80) { // 30% 확률로 4-5 사이
        randomNumber = Math.floor(Math.random() * 2) + 4;
    } else if (rand < 0.95) { // 15% 확률로 6-7 사이
        randomNumber = Math.floor(Math.random() * 2) + 6;
    } else { // 5% 확률로 8-9 사이
        randomNumber = Math.floor(Math.random() * 2) + 8;
    }
    
    nextFruitNumber = randomNumber;
    
    waitingFruitElement.style.width = `${fruit.circleRadius * 2}px`;
    waitingFruitElement.style.height = `${fruit.circleRadius * 2}px`;
    waitingFruitElement.style.backgroundColor = fruit.color;
    waitingFruitElement.style.borderRadius = '50%';
    waitingFruitElement.style.display = 'flex';
    waitingFruitElement.style.justifyContent = 'center';
    waitingFruitElement.style.alignItems = 'center';
    waitingFruitElement.style.color = 'white';
    waitingFruitElement.style.fontWeight = 'bold';
    waitingFruitElement.style.fontSize = `${fruit.circleRadius * 0.8}px`;
    waitingFruitElement.textContent = randomNumber;
    waitingFruitElement.style.position = 'absolute';
    waitingFruitElement.style.left = `${mouseX - fruit.circleRadius}px`;
    waitingFruitElement.style.top = '70px';
    
    waitingFruitElement.style.display = canDropFruit ? 'flex' : 'none';
}

// 과일 드롭
function dropFruit() {
    if (!canDropFruit) return;
    
    canDropFruit = false;
    
    const x = mouseX;
    const y = 120;
    
    // 과일 생성
    const fruit = createFruit(x, y, nextFruitIndex);
    
    // 생성된 과일에 대기 중이던 과일의 숫자 할당
    fruit.fruitNumber = nextFruitNumber;
    
    // 다음 과일 준비
    updateNextFruit();
    
    // 일정 시간 후 다시 과일 드롭 가능하도록 설정
    setTimeout(() => {
        canDropFruit = true;
        updateWaitingFruit();
    }, 500);
}

// 다음 과일 준비
function updateNextFruit() {
    nextFruitIndex = 0;
    updateWaitingFruit();
}

