// 게임 설정
const FRUITS = [
    { name: '체리', radius: 25, color: '#FF0000', number: 1, weight: 0.001 },
    { name: '딸기', radius: 35, color: '#FF3366', number: 2, weight: 0.0015 },
    { name: '포도', radius: 45, color: '#9400D3', number: 3, weight: 0.002 },
    { name: '오렌지', radius: 55, color: '#FFA500', number: 4, weight: 0.0025 },
    { name: '감', radius: 65, color: '#FF8C00', number: 5, weight: 0.003 },
    { name: '사과', radius: 75, color: '#FF6347', number: 6, weight: 0.0035 },
    { name: '배', radius: 85, color: '#ADFF2F', number: 7, weight: 0.004 },
    { name: '복숭아', radius: 95, color: '#FFC0CB', number: 8, weight: 0.0045 },
    { name: '파인애플', radius: 105, color: '#FFD700', number: 9, weight: 0.005 },
    { name: '메론', radius: 115, color: '#32CD32', number: 10, weight: 0.0055 },
    { name: '수박', radius: 125, color: '#008000', number: 11, weight: 0.006 }
];

// 과일 텍스트 요소 캐시
const textElementCache = new Map();

// 확률 분포에 따른 랜덤 숫자 생성 (1-9)
// 1~3: 40%, 4~6: 40%, 7~9: 20% 확률 분포
function getRandomNumber() {
    // 확률에 따른 범위 결정
    const rand = Math.random();
    let rangeMin, rangeMax;
    
    if (rand < 0.4) {
        // 40% 확률로 1-3 범위
        rangeMin = 1;
        rangeMax = 3;
    } else if (rand < 0.8) {
        // 40% 확률로 4-6 범위
        rangeMin = 4;
        rangeMax = 6;
    } else {
        // 20% 확률로 7-9 범위
        rangeMin = 7;
        rangeMax = 9;
    }
    
    // 선택된 범위 내에서 랜덤 숫자 생성
    return Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
}

// 과일 생성
function createFruit(x, y, fruitIndex) {
    const fruit = FRUITS[fruitIndex];
    // 현재 떨어질 숫자 사용
    const fruitNumber = currentFruitNumber;
    
    const body = Bodies.circle(x, y, fruit.radius, {
        restitution: 0.2,
        friction: 10,
        frictionAir: 0.005,
        density: fruit.weight,
        slop: 0.01,
        timeScale: 1.0,
        render: {
            fillStyle: fruit.color,
            strokeStyle: fruit.color,
            lineWidth: 0
        },
        fruitIndex: fruitIndex,
        number: fruitNumber,
        id: Date.now() + Math.random(),
        isFruit: true // 과일 식별 플래그 추가
    });

    // 과일 내부에 숫자 표시
    const text = document.createElement('div');
    text.style.position = 'absolute';
    text.style.color = 'white';
    text.style.fontWeight = 'bold';
    text.style.fontSize = `${fruit.radius * 0.8}px`;
    text.style.userSelect = 'none';
    text.style.pointerEvents = 'none';
    text.style.textAlign = 'center';
    text.style.width = `${fruit.radius * 2}px`;
    text.style.height = `${fruit.radius * 2}px`;
    text.style.lineHeight = `${fruit.radius * 2}px`;
    text.textContent = fruitNumber;
    text.id = `text-${body.id}`;
    container.appendChild(text);

    // 텍스트 요소 캐시에 저장
    textElementCache.set(body.id, text);

    // 과일 위치에 따라 숫자 위치 업데이트 (성능 최적화)
    const updateTextPosition = function() {
        const textElement = textElementCache.get(body.id);
        if (!textElement) {
            Events.off(engine, 'afterUpdate', updateTextPosition);
            return;
        }
        
        if (body.position) {
            // 회전 상태에 따라 숫자 위치 조정
            if (window.isFlipped) {
                // 화면이 뒤집힌 상태에서는 숫자 위치도 반대로
                const containerHeight = container.clientHeight;
                const containerWidth = container.clientWidth;
                const adjustedY = containerHeight - body.position.y;
                const adjustedX = containerWidth - body.position.x;
                textElement.style.left = `${adjustedX - fruit.radius}px`;
                textElement.style.top = `${adjustedY - fruit.radius}px`;
                // 텍스트는 회전시키지 않음
            } else {
                // 원래 상태에서는 그대로
                textElement.style.left = `${body.position.x - fruit.radius}px`;
                textElement.style.top = `${body.position.y - fruit.radius}px`;
            }
        } else {
            textElement.remove();
            textElementCache.delete(body.id);
            Events.off(engine, 'afterUpdate', updateTextPosition);
        }
    };

    Events.on(engine, 'afterUpdate', updateTextPosition);
    
    // 과일에 텍스트 ID 저장
    body.textId = `text-${body.id}`;
    
    return body;
}

// 대기 중인 과일 업데이트 (최적화)
function updateWaitingFruit() {
    const fruit = FRUITS[nextFruitIndex];
    
    // 대기 중인 과일 스타일 설정 (한 번에 업데이트)
    let topPosition;
    
    // 회전 상태와 관계없이 항상 상단에 위치
    topPosition = `${100 - fruit.radius}px`;
    
    Object.assign(waitingFruitElement.style, {
        width: `${fruit.radius * 2}px`,
        height: `${fruit.radius * 2}px`,
        backgroundColor: fruit.color,
        fontSize: `${fruit.radius * 0.8}px`,
        left: `${mouseX - fruit.radius}px`, 
        top: topPosition, 
        display: canDropFruit ? 'flex' : 'none'
    });
    
    waitingFruitElement.textContent = currentFruitNumber;
    waitingFruitElement.style.color = 'white'; // 텍스트 색상을 흰색으로 설정
}

// 두 과일이 접촉 중인지 확인 (최적화)
function areFruitsTouching(fruitA, fruitB) {
    const dx = fruitB.position.x - fruitA.position.x;
    const dy = fruitB.position.y - fruitA.position.y;
    const distanceSquared = dx * dx + dy * dy;
    
    const radiusA = FRUITS[fruitA.fruitIndex].radius;
    const radiusB = FRUITS[fruitB.fruitIndex].radius;
    const radiusSum = radiusA + radiusB + 5; // 5픽셀 여유 추가
    
    // 제곱근 계산 피하기 위해 제곱 값으로 비교
    return distanceSquared <= radiusSum * radiusSum;
}

// DFS로 연결된 과일 그룹 찾기
function dfs(index, visited, adjacencyMatrix, fruits, group) {
    visited[index] = true;
    group.push(fruits[index]);

    for (let i = 0; i < fruits.length; i++) {
        if (adjacencyMatrix[index][i] && !visited[i]) {
            dfs(i, visited, adjacencyMatrix, fruits, group);
        }
    }
}

// 모든 과일 그룹 찾기 (최적화)
function findAllFruitGroups(fruits) {
    const fruitsLength = fruits.length;
    const adjacencyMatrix = Array(fruitsLength).fill().map(() => Array(fruitsLength).fill(false));

    // 모든 과일 쌍에 대해 접촉 여부 확인
    for (let i = 0; i < fruitsLength; i++) {
        for (let j = i + 1; j < fruitsLength; j++) {
            if (areFruitsTouching(fruits[i], fruits[j])) {
                adjacencyMatrix[i][j] = true;
                adjacencyMatrix[j][i] = true;
            }
        }
    }

    // 방문 여부 추적
    const visited = Array(fruitsLength).fill(false);
    const allGroups = [];

    // 모든 과일에 대해 연결된 그룹 찾기
    for (let i = 0; i < fruitsLength; i++) {
        if (!visited[i]) {
            const group = [];
            dfs(i, visited, adjacencyMatrix, fruits, group);
            if (group.length > 0) {
                allGroups.push(group);
            }
        }
    }

    return allGroups;
}

// 그룹 내에서 합이 10이 되는 부분 그룹 찾기 (최적화)
function findSubgroupsWithSum10(group) {
    const subgroups = [];
    const groupLength = group.length;
    
    // 모든 과일 쌍에 대해 접촉 여부 확인
    const adjacencyMatrix = Array(groupLength).fill().map(() => Array(groupLength).fill(false));
    
    for (let i = 0; i < groupLength; i++) {
        for (let j = i + 1; j < groupLength; j++) {
            if (areFruitsTouching(group[i], group[j])) {
                adjacencyMatrix[i][j] = true;
                adjacencyMatrix[j][i] = true;
            }
        }
    }
    
    // 모든 가능한 부분 그룹 찾기 (메모이제이션 추가)
    const memo = new Map();
    
    const findConnectedSubgroups = (startIdx, visited = new Set(), currentGroup = []) => {
        const key = `${startIdx},${[...visited].sort().join(',')}`;
        if (memo.has(key)) return memo.get(key);
        
        visited.add(startIdx);
        currentGroup.push(group[startIdx]);
        
        // 현재 부분 그룹의 합 계산
        const sum = currentGroup.reduce((total, fruit) => total + fruit.number, 0);
        
        let result = [];
        // 합이 10이면 부분 그룹 추가
        if (sum === 10) {
            result = [[...currentGroup]];
        }
        
        // 합이 10보다 작으면 계속 탐색
        if (sum < 10) {
            for (let i = 0; i < groupLength; i++) {
                if (!visited.has(i) && adjacencyMatrix[startIdx][i]) {
                    const subResults = findConnectedSubgroups(i, new Set([...visited]), [...currentGroup]);
                    result = [...result, ...subResults];
                }
            }
        }
        
        memo.set(key, result);
        return result;
    };
    
    // 모든 과일에서 시작하여 부분 그룹 찾기
    for (let i = 0; i < groupLength; i++) {
        const results = findConnectedSubgroups(i, new Set(), []);
        subgroups.push(...results);
    }
    
    // 중복 제거 (동일한 과일 조합은 하나만 유지)
    const uniqueSubgroups = [];
    const seen = new Set();
    
    for (const subgroup of subgroups) {
        // 과일 ID를 정렬하여 고유 키 생성
        const key = subgroup.map(fruit => fruit.id).sort().join(',');
        if (!seen.has(key)) {
            seen.add(key);
            uniqueSubgroups.push(subgroup);
        }
    }
    
    return uniqueSubgroups;
}

// 과일 드롭
function dropFruit(x) {
    if (!canDropFruit || isGameOver) return;

    canDropFruit = false;
    
    // 대기 중인 과일 숨기기
    waitingFruitElement.style.display = 'none';
    
    // 실제 물리 효과가 있는 과일 생성
    let dropY;
    let dropX = x;
    
    // 회전 상태에 따라 드롭 위치 조정
    if (window.isFlipped) {
        // 화면이 뒤집힌 상태에서는 화면 하단에서 드롭
        const containerHeight = container.clientHeight;
        dropY = containerHeight - 100;
        // 좌우 반전된 위치 계산
        const containerWidth = container.clientWidth;
        dropX = containerWidth - x;
    } else {
        // 원래 상태에서는 화면 상단에서 드롭
        dropY = 100;
    }
    
    currentFruit = createFruit(dropX, dropY, nextFruitIndex);
    World.add(engine.world, currentFruit);

    // 다음 과일 준비
    // 현재 과일 숫자를 다음 과일 숫자로 업데이트
    currentFruitNumber = nextFruitNumber;
    // 새로운 다음 과일 숫자 생성
    nextFruitNumber = getRandomNumber();
    // 대기 중인 과일 업데이트
    updateWaitingFruit();
    // 다음 과일 미리보기 업데이트
    updateNextFruit();
    
    // 일정 시간 후 다음 과일 드롭 가능
    setTimeout(() => {
        canDropFruit = true;
        currentFruit = null;
    }, 500);
}

// 과일 그룹 확인 및 합치기 함수 (최적화)
function checkFruitGroups() {
    if (isGameOver) return;
    
    // 모든 과일 가져오기
    const bodies = Composite.allBodies(engine.world);
    const fruits = bodies.filter(body => body.fruitIndex !== undefined);
    
    // 과일이 2개 미만이면 처리할 필요 없음
    if (fruits.length < 2) return;
    
    // 모든 과일 그룹 찾기
    const allGroups = findAllFruitGroups(fruits);
    
    // 각 그룹 내에서 같은 과일 종류의 숫자 합이 10인 과일 찾기
    let mergedAny = false;
    
    allGroups.forEach(group => {
        if (group.length > 1) {
            // 같은 종류의 과일끼리 그룹화
            const fruitTypeGroups = {};
            
            group.forEach(fruit => {
                const key = `${fruit.fruitIndex}`;
                if (!fruitTypeGroups[key]) {
                    fruitTypeGroups[key] = [];
                }
                fruitTypeGroups[key].push(fruit);
            });
            
            // 같은 종류의 과일 중 합이 10인 그룹 찾기
            for (const key in fruitTypeGroups) {
                const sameTypeGroup = fruitTypeGroups[key];
                if (sameTypeGroup.length >= 2) {
                    // 모든 가능한 부분 그룹 찾기
                    const subgroups = findSubgroupsWithSum10(sameTypeGroup);
                    
                    // 이미 처리된 과일 추적
                    const processedFruits = new Set();
                    
                    // 부분 그룹 합치기 (가장 큰 부분 그룹부터)
                    subgroups.sort((a, b) => b.length - a.length);
                    
                    for (const subgroup of subgroups) {
                        // 이미 처리된 과일이 있는지 확인
                        const alreadyProcessed = subgroup.some(fruit => processedFruits.has(fruit.id));
                        if (alreadyProcessed) continue;
                        
                        // 부분 그룹 합치기
                        mergeFruits(subgroup);
                        mergedAny = true;
                        
                        // 로그 출력
                        console.log(`합쳐진 과일: ${subgroup.map(fruit => `${FRUITS[fruit.fruitIndex].name}(${fruit.number})`).join(', ')}`);
                        
                        // 처리된 과일 표시
                        subgroup.forEach(fruit => processedFruits.add(fruit.id));
                    }
                }
            }
        }
    });
    
    // 과일이 합쳐졌으면 다시 검사 (연쇄 반응을 위해)
    if (mergedAny) {
        // requestAnimationFrame 사용하여 더 효율적인 타이밍으로 실행
        requestAnimationFrame(() => setTimeout(checkFruitGroups, 100));
    }
}

// 과일 합치기 함수 (최적화)
function mergeFruits(group) {
    // 그룹의 중심 위치 계산
    let centerX = 0;
    let centerY = 0;
    
    group.forEach(fruit => {
        centerX += fruit.position.x;
        centerY += fruit.position.y;
    });
    
    centerX /= group.length;
    centerY /= group.length;
    
    // 텍스트 요소 및 과일 제거
    group.forEach(fruit => {
        // 캐시에서 텍스트 요소 가져오기
        const textElement = textElementCache.get(fruit.id);
        if (textElement) {
            textElement.remove();
            textElementCache.delete(fruit.id);
        }
        
        // 과일 제거
        World.remove(engine.world, fruit);
    });
    
    // 확률 분포를 사용하여 다음 과일 인덱스 결정
    const currentFruitIndex = group[0].fruitIndex;
    let nextFruitIndex;
    
    // 마지막 과일이 아니면 확률 분포 적용
    if (currentFruitIndex < FRUITS.length - 1) {
        // 확률 분포 함수를 사용하여 다음 과일 결정
        nextFruitIndex = currentFruitIndex + 1;
        
        // 다음 과일의 숫자를 확률 분포에 따라 결정
        const newFruitNumber = getRandomNumber();
        
        // 현재 과일 숫자를 임시로 저장
        const tempCurrentFruitNumber = currentFruitNumber;
        // 새 과일 생성을 위해 currentFruitNumber 값을 변경
        currentFruitNumber = newFruitNumber;
        
        const newFruit = createFruit(centerX, centerY, nextFruitIndex);
        
        // currentFruitNumber 값 복원
        currentFruitNumber = tempCurrentFruitNumber;
        
        World.add(engine.world, newFruit);
    } else {
        // 이미 최대 크기면 그대로 유지
        nextFruitIndex = currentFruitIndex;
        
        // 현재 과일 숫자를 임시로 저장
        const tempCurrentFruitNumber = currentFruitNumber;
        // 새 과일 생성을 위해 currentFruitNumber 값을 변경
        currentFruitNumber = getRandomNumber();
        
        const newFruit = createFruit(centerX, centerY, nextFruitIndex);
        
        // currentFruitNumber 값 복원
        currentFruitNumber = tempCurrentFruitNumber;
        
        World.add(engine.world, newFruit);
    }
    
    // 점수 업데이트
    const bonusScore = 100 + (group.length * 10); // 기본 100점 + 과일당 10점
    score += bonusScore;
    scoreElement.textContent = `점수: ${score}`;
}