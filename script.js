// script.js

const animalNames = [
  '원숭이', '펭귄', '분홍 토끼', '기린', '여우',
  '코끼리', '판다', '호랑이', '코알라', '흰색 토끼'
];
const grid = document.getElementById('animal-grid');
const startBtn = document.getElementById('start-btn');
const raceContainer = document.getElementById('race-container');
const resultDiv = document.getElementById('result');
const images = animalNames.map((_, i) => `./images/animal${i + 1}.png`);

let selected = [], runners = [], trackWidth = 0, trackHeight = 60;

// 이미지 사전 로딩 (배경 포함)
const bgList = [
  './images/background-track.webp',
  './images/background-sand.webp',
  './images/background-savannah.webp'
];
[...images, ...bgList].forEach(src => {
  const img = new Image();
  img.src = src;
});

// 동물 선택 UI
images.forEach((src, idx) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'item';
  const img = document.createElement('img');
  img.src = src;
  img.alt = animalNames[idx];
  img.loading = "eager";
  img.addEventListener('click', () => toggleSelect(img, idx));
  const cap = document.createElement('span');
  cap.className = 'caption';
  cap.textContent = animalNames[idx];
  wrapper.append(img, cap);
  grid.appendChild(wrapper);
});

function toggleSelect(img, idx) {
  if (img.classList.contains('selected')) {
    img.classList.remove('selected');
    selected = selected.filter(i => i !== idx);
  } else if (selected.length < 10) {
    img.classList.add('selected');
    selected.push(idx);
  }
  startBtn.disabled = selected.length < 2;
}

startBtn.addEventListener('click', () => {
  const trackBgList = [
    'background-track.webp',
    'background-sand.webp',
    'background-savannah.webp'
  ];
  const trackImg = trackBgList[Math.floor(Math.random() * trackBgList.length)];

  grid.style.display = 'none';
  startBtn.style.display = 'none';
  raceContainer.style.display = 'block';

  adjustLayout();
  runRace(selected, trackImg);
});

function runRace(arr, trackImg) {
  raceContainer.innerHTML = "";
  resultDiv.textContent = "";
  trackWidth = raceContainer.clientWidth - 60;
  runners = [];
  const finishOrder = [];

  arr.forEach((idx, i) => {
    // 트랙 생성
    const track = document.createElement('div');
    track.className = 'track';
    track.style.top = `${i * trackHeight}px`;
    track.style.height = trackHeight + "px";
    track.style.backgroundImage = `url('./images/${trackImg}')`;
    if (i === arr.length - 1) track.style.borderBottom = "none";
    raceContainer.appendChild(track);

    // 러너 생성
    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.style.top = `${i * trackHeight}px`;
    runner.style.height = trackHeight + "px";

    const img = document.createElement('img');
    img.src = images[idx];
    img.loading = "eager";
    img.style.width = (trackHeight * 0.65) + "px";

    const rankEl = document.createElement('span');
    rankEl.className = 'rank';
    rankEl.textContent = "0위";                  // 공간 확보용
    rankEl.style.fontSize = (trackHeight * 0.3) + "px";
    rankEl.style.opacity = 0;                   // 초기 숨김

    runner.appendChild(img);
    runner.appendChild(rankEl);
    raceContainer.appendChild(runner);

    // 초기 속도 편차 설정
    let totalFrames;
    const randomType = Math.random();
    if (randomType < 0.2) {
      totalFrames = Math.random() * 20 + 380;   // 선두 그룹 (7~8초)
    } else if (randomType < 0.8) {
      totalFrames = Math.random() * 70 + 420;   // 보통 그룹
    } else {
      totalFrames = Math.random() * 50 + 470;   // 느린 그룹
    }
    const baseSpeed = trackWidth / totalFrames;

    // 후반부 속도 변동 프레임
    const changeFrames = [];
    const changeCount = Math.floor(Math.random() * 2) + 5;
    while (changeFrames.length < changeCount) {
      const f = Math.floor(Math.random() * totalFrames * 0.95);
      if (!changeFrames.includes(f)) changeFrames.push(f);
    }
    changeFrames.sort((a, b) => a - b);

    runners.push({
      idx,
      el: runner,
      x: 0,
      progress: 0,
      baseSpeed,
      speed: baseSpeed,
      changeFrames,
      frame: 0,
      slowCount: 0,
      boostCount: 0,
      boostFrames: 0
    });
  });

  // 배경 이동 효과
  let bgOffset = 0;

  function animate() {
    bgOffset -= 2;
    document.querySelectorAll('.track').forEach(track => {
      track.style.backgroundPosition = `${bgOffset}px center`;
    });

    const minX = Math.min(...runners.map(r => r.x));
    const maxX = Math.max(...runners.map(r => r.x));

    runners.forEach(runner => {
      if (finishOrder.includes(runner)) return;
      runner.frame++;

      let speedFactor = 1;

      // 후반부 역전/부스터 로직
      if (runner.progress > 0.7) {
        if (
          runner.x === maxX &&
          runner.slowCount < 2 &&
          Math.random() < 0.4
        ) {
          speedFactor = Math.random() * 0.35 + 0.5; // 0.5~0.85×
          runner.slowCount++;
        } else if (
          runner.x === minX &&
          runner.boostCount < 2 &&
          Math.random() < 0.5
        ) {
          speedFactor = Math.random() * 2.0 + 2.0;   // 2.0~4.0×
          runner.boostCount++;
          runner.boostFrames = 200;

          const icon = document.createElement('img');
          icon.src = './images/bolt.png';
          icon.className = 'boost-icon';
          runner.el.appendChild(icon);
          setTimeout(() => icon.remove(), 500);
        } else if (Math.random() < 0.3) {
          speedFactor = Math.random() < 0.5
            ? Math.random() * 0.2 + 0.9
            : Math.random() * 0.3 + 1.0;
        }
      }

      // 부스터 지속 처리
      if (runner.boostFrames > 0) {
        speedFactor *= 2.5;
        runner.boostFrames--;
      }
      // 일반 변동
      else if (runner.changeFrames.includes(runner.frame)) {
        speedFactor = Math.random() < 0.5
          ? Math.random() * 0.3 + 0.9
          : Math.random() * 0.2 + 1.0;
      }

      runner.speed = runner.baseSpeed * speedFactor;
      runner.x += runner.speed;
      runner.progress = runner.x / trackWidth;
      runner.el.style.transform = `translate(${runner.x}px,${Math.sin(runner.frame/5)*2}px)`;

      if (runner.x >= trackWidth) {
        finishOrder.push(runner);
        runner.el.classList.add('jump');
        const rank = runner.el.querySelector('.rank');
        rank.style.opacity = 1;
        rank.textContent = `${finishOrder.length}위`;
        if (finishOrder.length === runners.length) showResult(finishOrder);
      }
    });

    if (finishOrder.length < runners.length) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function showResult(order) {
  // 1위
  const winner = order[0];
  // 2위 이하 리스트
  const rest = order.slice(1)
    .map((r, i) => `${i+2}위: ${animalNames[r.idx]}`)
    .join('<br>');

  // 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = "result-overlay";
  overlay.innerHTML = `
    <div class="winner">🎉 당첨: ${animalNames[winner.idx]}</div>
    <div class="others">${rest}</div>
    <button id="next-round">재시작</button>
  `;

  // raceContainer 위에 덧붙이기
  raceContainer.appendChild(overlay);

  // 버튼 이벤트
  document.getElementById("next-round").addEventListener("click", () => {
    overlay.remove();
    resetGame();
  });
}

function resetGame() {
  raceContainer.style.display = "none";
  grid.style.display = "grid";
  startBtn.style.display = "block";
  resultDiv.textContent = "";
  selected = [];
  document.querySelectorAll('.item img').forEach(img => img.classList.remove('selected'));
  startBtn.disabled = true;
}

function adjustLayout() {
  trackHeight = Math.max(40, Math.min(window.innerWidth * 0.15, 60));
  raceContainer.style.height = `${selected.length * trackHeight}px`;

  runners.forEach((runner, i) => {
    runner.el.style.top = `${i * trackHeight}px`;
    runner.el.style.height = `${trackHeight}px`;
    runner.el.querySelector("img").style.width = `${trackHeight * 0.65}px`;

    const rankEl = runner.el.querySelector(".rank");
    rankEl.style.fontSize = `${trackHeight * 0.3}px`;
    rankEl.style.left = `-${trackHeight * 0.5}px`; // 동물 왼쪽에 고정
  });
}

window.addEventListener("resize", adjustLayout);

// 초기 버튼 비활성화
startBtn.disabled = true;
