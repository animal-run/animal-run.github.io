const animalNames = [
  '원숭이', '펭귄', '분홍 토끼', '기린', '여우',
  '코끼리', '판다', '호랑이', '코알라', '흰색 토끼'
];
const grid = document.getElementById('animal-grid');
const startBtn = document.getElementById('start-btn');
const raceContainer = document.getElementById('race-container');
const resultDiv = document.getElementById('result');
const optionsDiv = document.getElementById('options');
const modeSelect = document.getElementById('mode');
const countSelect = document.getElementById('count');
const images = animalNames.map((_, i) => `./images/animal${i + 1}.png`);
let selected = [], runners = [], trackWidth = 0, trackHeight = 60;

// ✅ 이미지 사전 로딩 (배경 포함)
const bgList = ['./images/background-track.webp', './images/background-sand.webp', './images/background-savannah.webp'];
[...images, ...bgList].forEach(src => { const img = new Image(); img.src = src; });

// ✅ 동물 선택 UI
images.forEach((src, idx) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'item';
  const img = document.createElement('img');
  img.src = src; img.alt = animalNames[idx]; img.loading = "eager";
  img.addEventListener('click', () => toggleSelect(img, idx));
  const cap = document.createElement('span');
  cap.className = 'caption'; cap.textContent = animalNames[idx];
  wrapper.append(img, cap); grid.appendChild(wrapper);
});

function toggleSelect(img, idx) {
  if (img.classList.contains('selected')) {
    img.classList.remove('selected');
    selected = selected.filter(i => i !== idx);
  } else if (selected.length < 10) {
    img.classList.add('selected');
    selected.push(idx);
  }
  updateCountOptions();
  startBtn.disabled = selected.length < 2 || selected.length > 10;
}

function updateCountOptions() {
  countSelect.innerHTML = "";
  const maxCount = selected.length || 1;
  for (let i = 1; i <= maxCount; i++) {
    const opt = document.createElement("option");
    opt.value = i; opt.textContent = i + "명"; countSelect.appendChild(opt);
  }
  countSelect.value = 1;
}

startBtn.addEventListener('click', () => {
  const trackBgList = ['background-track.webp', 'background-sand.webp', 'background-savannah.webp'];
  const trackImg = trackBgList[Math.floor(Math.random() * trackBgList.length)];
  // raceContainer.style.background =
  //   trackImg.includes('sand') || trackImg.includes('savannah')
  //     ? `url('./images/${trackImg}') repeat-x center/auto 100%`
  //     : `url('./images/${trackImg}') repeat-x center/auto 100%`;

  grid.style.display = 'none'; startBtn.style.display = 'none'; optionsDiv.style.display = 'none';
  raceContainer.style.display = 'block';

  adjustLayout(); // ✅ 시작 시 즉시 레이아웃 조정
  runRace(selected, trackImg);
});

function runRace(arr, trackImg) {
  raceContainer.innerHTML = ""; resultDiv.textContent = "";
  trackWidth = raceContainer.clientWidth - 60; runners = []; const finishOrder = [];

  arr.forEach((idx, i) => {
    const track = document.createElement('div');
    track.className = 'track';
    track.style.top = `${i * trackHeight}px`;
    track.style.height = trackHeight + "px";
    track.style.backgroundImage = `url('./images/${trackImg}')`; // ✅ 각 트랙에 개별 적용
    if (i === arr.length - 1) track.style.borderBottom = "none";
    raceContainer.appendChild(track);

    const runner = document.createElement('div');
    runner.className = 'runner'; runner.style.top = `${i * trackHeight}px`;
    runner.style.height = trackHeight + "px";

    const img = document.createElement('img');
    img.src = images[idx]; img.loading = "eager";
    img.style.width = (trackHeight * 0.65) + "px";

    const rankEl = document.createElement('span');
    rankEl.className = 'rank';
    rankEl.textContent = "0위"; // 공간 확보용
    rankEl.style.fontSize = (trackHeight * 0.3) + "px";
    rankEl.style.opacity = 0;    // ✅ 초기 숨김
    runner.appendChild(img);
    runner.appendChild(rankEl);
    raceContainer.appendChild(runner);

    // ✅ 초기 속도 편차
    let totalFrames;
    const randomType = Math.random();
    if (randomType < 0.2) {
      totalFrames = Math.random() * 20 + 380; // 선두 그룹 (7~8초)
    } else if (randomType < 0.8) {
      totalFrames = Math.random() * 70 + 420; // 보통 그룹
    } else {
      totalFrames = Math.random() * 50 + 470; // 느린 그룹
    }
    const baseSpeed = trackWidth / totalFrames;

    // ✅ 속도 변동: 후반부 중심 (역전 포인트)
    const changeFrames = [];
    const changeCount = Math.floor(Math.random() * 2) + 5; // 2~3번 변화
    while (changeFrames.length < changeCount) {
      const f = Math.floor(Math.random() * totalFrames * 0.95);
      if (!changeFrames.includes(f)) changeFrames.push(f);
    }
    changeFrames.sort((a, b) => a - b);

    runners.push({
      idx, el: runner, x: 0, progress: 0,
      baseSpeed, speed: baseSpeed, changeFrames, frame: 0
    });
  });

  // ✅ 배경 이동(긴박감)
  let bgOffset = 0;


  function animate() {
    // ✅ 배경 반복 이동
    bgOffset -= 2; // 속도 (1~3 사이 값으로 조절 가능)
    document.querySelectorAll('.track').forEach(track => {
      track.style.backgroundPosition = `${bgOffset}px center`;
    });

    const minX = Math.min(...runners.map(r => r.x));
    const maxX = Math.max(...runners.map(r => r.x));

    runners.forEach(runner => {
      if (finishOrder.includes(runner)) return;
      runner.frame++;

      let speedFactor = 1;

      // animate() 내부 부스터 로직
      if (runner.progress > 0.7) {
        // 선두 감속 (최대 2회, 40% 확률)
        if (runner.x === maxX && (runner.slowCount || 0) < 2 && Math.random() < 0.4) {
          speedFactor = Math.random() * 0.35 + 0.5;   // 0.5~0.85× (더 확실히 느려짐)
          runner.slowCount = (runner.slowCount || 0) + 1;
        }
        // 후발 부스터 (최대 2회, 50% 확률)
        else if (runner.x === minX && (runner.boostCount || 0) < 2 && Math.random() < 0.5) {
          speedFactor = Math.random() * 2.0 + 2.0;   // 2.0~4.0× (훨씬 빠르게)
          runner.boostCount = (runner.boostCount || 0) + 1;

          // 번개 아이콘
          const icon = document.createElement('img');
          icon.src = './images/bolt.png';
          icon.className = 'boost-icon';
          runner.el.appendChild(icon);
          setTimeout(() => icon.remove(), 500);

          // ✅ 부스터 유지 시간: 다음 20프레임 동안 1.5× 유지
          runner.boostFrames = 200;
        }
        // 중간권 소폭 변동
        else if (Math.random() < 0.3) {
          speedFactor = Math.random() < 0.5
            ? Math.random() * 0.2 + 0.9
            : Math.random() * 0.3 + 1.0;
        }
      }

      // 부스터 지속 처리
      if (runner.boostFrames > 0) {
        speedFactor *= 2.5;       // 추가 1.5×
        runner.boostFrames--;
      }

      // 기존 changeFrames 이벤트
      else if (runner.changeFrames.includes(runner.frame)) {
        speedFactor = Math.random() < 0.5
          ? Math.random() * 0.3 + 0.9
          : Math.random() * 0.2 + 1.0;
      }

      runner.speed = runner.baseSpeed * speedFactor;
      runner.x += runner.speed;
      runner.progress = runner.x / trackWidth;
      runner.el.style.transform = `translate(${runner.x}px,${Math.sin(runner.frame / 5) * 2}px)`;

      if (runner.x >= trackWidth) {
        finishOrder.push(runner);
        runner.el.classList.add('jump');
        const rank = runner.el.querySelector('.rank');
        rank.style.opacity = 1;          // ✅ 완주 시 표시
        rank.textContent = `${finishOrder.length}위`;
        if (finishOrder.length === runners.length) showResult(finishOrder);
      }
    });

    if (finishOrder.length < runners.length) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function showResult(order) {
  const mode = modeSelect.value;
  const count = Math.min(parseInt(countSelect.value), selected.length);
  const result = (mode === "win"
    ? order.slice(0, count)
    : order.slice(-count)
  ).map(r => animalNames[r.idx]);

  const overlay = document.createElement("div");
  overlay.id = "result-overlay";
  overlay.innerHTML = `
    🎉 ${mode === "win" ? "당첨" : "탈락"}: ${result.join(", ")}
    <button id="next-round">재시작</button>
  `;
  raceContainer.appendChild(overlay);

  document.getElementById("next-round").addEventListener("click", () => {
    overlay.remove();
    resetGame(); // ✅ 이 한 줄이면 충분
  });
}

function resetGame() {
  raceContainer.style.display = "none";
  grid.style.display = "grid";
  optionsDiv.style.display = "flex";
  startBtn.style.display = "block";
  resultDiv.textContent = "";
  selected = [];
  document.querySelectorAll('.item img').forEach(img => img.classList.remove('selected'));
  startBtn.disabled = true;
  modeSelect.value = "win";
  updateCountOptions();
}


function adjustLayout(isStart = false) {
  const totalTracks = 10;
  trackHeight = Math.max(40, Math.min(window.innerWidth * 0.15, 60));

  raceContainer.style.height = `${totalTracks * trackHeight}px`;

  if (!isStart) {
    runners.forEach((runner, i) => {
      runner.el.style.top = `${i * trackHeight}px`;
      runner.el.style.height = `${trackHeight}px`;
      runner.el.querySelector("img").style.width = `${trackHeight * 0.65}px`;
      runner.el.querySelector(".rank").style.fontSize = `${trackHeight * 0.3}px`;
    });
  }
}

window.addEventListener("resize", adjustLayout);
updateCountOptions();
