/**
 * 골든라이프 (Golden Life / YOLD) - 통합 클라이언트 앱 로직
 * Forest Green Senior System & AI 동반자(말동무) 컨트롤러 v1.2.0
 */

// 1. 글자 크기 상태 관리 (localStorage 영속화)
const FONT_SCALES = ['default', 'large', 'xlarge'];
let currentFontScaleIndex = 0;

function initFontScale() {
  const savedScale = localStorage.getItem('goldenlife_font_scale') || 'default';
  currentFontScaleIndex = FONT_SCALES.indexOf(savedScale);
  if (currentFontScaleIndex === -1) currentFontScaleIndex = 0;
  applyFontScale(FONT_SCALES[currentFontScaleIndex]);
}

function toggleFontScale() {
  currentFontScaleIndex = (currentFontScaleIndex + 1) % FONT_SCALES.length;
  const newScale = FONT_SCALES[currentFontScaleIndex];
  localStorage.setItem('goldenlife_font_scale', newScale);
  applyFontScale(newScale);

  const scaleNames = { 'default': '보통 글자', 'large': '큰 글자 (115%)', 'xlarge': '아주 큰 글자 (130%)' };
  showToast(`글자 크기: ${scaleNames[newScale]}로 변경되었습니다.`);
  playFeedbackSound('success');
}

function applyFontScale(scale) {
  if (scale === 'default') {
    document.documentElement.removeAttribute('data-font-size');
  } else {
    document.documentElement.setAttribute('data-font-size', scale);
  }

  // 버튼 라벨 갱신
  document.querySelectorAll('.font-scale-btn').forEach(btn => {
    if (scale === 'default') {
      btn.innerHTML = `가+`;
      btn.title = "글자 크게 보기";
    } else if (scale === 'large') {
      btn.innerHTML = `가++`;
      btn.title = "글자 아주 크게 보기";
    } else {
      btn.innerHTML = `보통가`;
      btn.title = "보통 글자로 변경";
    }
  });
}

// 2. 부드러운 시니어 Web Audio 사운드 피드백
function playFeedbackSound(type = 'tap') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!window._audioCtx) window._audioCtx = new AudioContext();
    const ctx = window._audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {}
}

// 3. 토스트 알림창
function showToast(message, duration = 2500) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #D4E8C8;"></i> <span>${message}</span>`;
  toast.classList.add('show');
  playFeedbackSound('tap');

  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// 4. 전담 전화 상담 모달 (1588-0000)
function openPhoneModal(serviceName = "골든라이프 전담 상담") {
  let modal = document.getElementById('phoneSupportModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'phoneSupportModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #5B7F3E; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px;">
              <i class="fa-solid fa-headset"></i>
            </div>
            <div>
              <h3 style="font-size: 19px; font-weight: 800; color: #2C3328; margin: 0;">전담 상담사 연결</h3>
              <p style="font-size: 13px; color: #6B7B6A; margin: 0;">어르신 맞춤 1:1 친절 안내</p>
            </div>
          </div>
          <button onclick="closePhoneModal()" style="background: none; border: none; font-size: 24px; color: #6B7B6A; cursor: pointer; padding: 4px;">&times;</button>
        </div>

        <div style="background-color: #F5F7F3; border: 1.5px solid #D5DDD0; border-radius: 18px; padding: 18px; text-align: center;">
          <p id="phoneModalServiceText" style="font-size: 15px; font-weight: 700; color: #4B5B4A; margin-bottom: 6px;">${serviceName}</p>
          <div style="font-size: 28px; font-weight: 900; color: #5B7F3E; letter-spacing: 1px; margin-bottom: 6px;">
            1588-0000
          </div>
          <p style="font-size: 13px; color: #6B7B6A;">(통화료 무료 · 평일 09:00 ~ 18:00)</p>
        </div>

        <div style="font-size: 15px; color: #1A1F17; line-height: 1.5; padding: 0 4px;">
          복잡한 화면 입력 없이, <strong>말씀만 하시면</strong> 상담원이 대신 일정 예약과 식단 신청을 도와드립니다.
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="tel:1588-0000" onclick="handleDirectCall(event)" class="btn-amber-action" style="text-decoration: none; width: 100%;">
            <i class="fa-solid fa-phone-volume"></i> 지금 바로 전화 걸기
          </a>
          <button onclick="closePhoneModal()" style="background: #F0F3EE; border: 1.5px solid #D5DDD0; border-radius: 9999px; padding: 14px; font-size: 16px; font-weight: 700; color: #4B5B4A; cursor: pointer;">
            닫기
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    document.getElementById('phoneModalServiceText').innerText = serviceName;
  }
  modal.classList.add('show');
  playFeedbackSound('tap');
}

function closePhoneModal() {
  const modal = document.getElementById('phoneSupportModal');
  if (modal) modal.classList.remove('show');
}

function handleDirectCall(e) {
  if (!navigator.userAgent.match(/Android|iPhone|iPad/i)) {
    e.preventDefault();
    closePhoneModal();
    showToast("전담 상담센터(1588-0000)로 연결 신호를 보냈습니다.", 3000);
  }
}

// ============================================================
// 5. 골든 AI 다정한 말동무 '가온' (친구 대화 & 시니어 감성 케어)
// ============================================================
const COMPANION_KNOWLEDGE = [
  {
    triggers: ['안녕', '반가워', '좋은 아침', '누구', '처음'],
    response: "안녕하세요, 문영 님! 든든하고 다정한 말동무 '가온'이에요. 오늘 컨디션은 어떠세요? 따뜻한 보리차 한 잔 챙겨 드시고, 오늘 있었던 일이나 생각나시는 이야기 편하게 들려주세요.",
    action: null
  },
  {
    triggers: ['기분', '심심', '외로', '이야기', '대화', '심심해', '놀아줘'],
    response: "문영 님 곁에 제가 늘 함께 있으니 적적해하지 마세요. 오늘 창밖을 보셨나요? 햇살이 참 포근해요. 오늘 하루 재미있었던 일이나 기분 좋은 추억 나눠주시면 제가 정성껏 귀담아들을게요.",
    action: null
  },
  {
    triggers: ['옛날', '동화', '재미있는', '옛날이야기', '이야기해줘', '이야기 들려'],
    response: "옛날 한 마을에 마음씨 착한 어르신이 사셨는데, 길가에 핀 들꽃 하나도 소중히 여겨 온 마을이 꽃향기로 가득해졌대요. 문영 님의 고운 미소도 꼭 그 꽃을 닮았어요. 언제나 건강하고 행복만 가득하세요!",
    action: null
  },
  {
    triggers: ['차', '음료', '건강차', '목', '따뜻한'],
    response: "요즘 같은 날씨엔 구수한 메밀차나 목을 촉촉하게 해주는 따뜻한 도라지 배차가 참 좋아요. 한 모금 천천히 드시면 온몸이 사르르 따뜻해지실 거예요.",
    action: null
  },
  {
    triggers: ['스트레칭', '체조', '운동', '무릎', '허리', '뻐근', '다리'],
    response: "문영 님, 의자에 편안히 앉으셔서 양팔을 천천히 위로 쭉 뻗고 심호흡을 세 번 해보세요. 숨을 천천히 들이마시고~ 내쉬고~ 몸이 한결 가뿐하고 시원해지셨죠?",
    action: null
  },
  {
    triggers: ['노래', '음악', '추억', '가요', '가곡'],
    response: "잔잔하고 서정적인 가곡이나 평온한 클래식을 떠올려보세요. '고향의 봄'이나 부드러운 첼로 선율처럼, 문영 님의 마음에 평화롭고 따스한 쉼이 깃들기를 바라요.",
    action: null
  },
  {
    triggers: ['고마워', '착하다', '좋다', '사랑해', '예쁘네'],
    response: "문영 님께서 다정하게 말씀해 주시니 제 마음도 봄꽃처럼 활짝 피어나는 것 같아요! 언제든 말동무가 필요하실 때 저 가온이를 편하게 불러주세요.",
    action: null
  },
  {
    triggers: ['날씨', '오늘 날씨', '기온', '비', '추워', '더워'],
    response: "오늘 날씨는 산책하기 딱 좋은 포근한 날이에요. 가벼운 외투 걸치시고 햇살 좋은 곳에서 10분만 비타민D 쬐고 오시면 기분도 상쾌해지실 거예요.",
    action: null
  },
  {
    triggers: ['여행', '온천', '단풍', '호텔', '휴가', '나들이'],
    response: "여행 생각만 해도 가슴이 설레네요, 문영 님! 어르신 안심 케어와 간호사가 동행하는 편안한 온천 여행 페이지를 제가 얼른 열어드릴게요.",
    action: () => { setTimeout(() => { window.location.href = 'travel.html'; }, 1500); }
  },
  {
    triggers: ['식단', '케어푸드', '반찬', '밥', '당뇨', '저염'],
    response: "문영 님의 입맛과 건강을 챙겨드리는 맞춤 저염·영양 식단 페이지로 안내해 드릴게요. 골고루 맛있게 드셔야 건강해요!",
    action: () => { setTimeout(() => { window.location.href = 'care_food.html'; }, 1500); }
  },
  {
    triggers: ['맛집', '식당', '음식점', '외식', '한식'],
    response: "이가 약하셔도 편안히 드실 수 있는 부드러운 안심 룸식당 페이지로 모시겠습니다.",
    action: () => { setTimeout(() => { window.location.href = 'dining.html'; }, 1500); }
  },
  {
    triggers: ['라운지', '모임', '출입', '바코드', '살롱'],
    response: "강남 테헤란로점 시니어 라운지와 출입 패스 화면으로 모실게요. 동년배 분들과 도란도란 차 한잔 나누기 참 좋은 곳이에요.",
    action: () => { setTimeout(() => { window.location.href = 'lounge.html'; }, 1500); }
  },
  {
    triggers: ['내 정보', '마이', '포인트', '예약 내역', '주문'],
    response: "문영 님의 예약 내역과 힐링 포인트를 확인하실 수 있는 마이페이지로 이동합니다.",
    action: () => { setTimeout(() => { window.location.href = 'mypage.html'; }, 1500); }
  },
  {
    triggers: ['글자', '크게', '돋보기', '글씨', '안 보여'],
    response: "문영 님, 눈 편안하시도록 글자 크기를 시원하고 큼직하게 키워드렸어요!",
    action: () => { toggleFontScale(); }
  },
  {
    triggers: ['전화', '상담', '도와줘', '매니저', '사람'],
    response: "문영 님, 다정하고 친절한 전담 상담원(1588-0000)에게 바로 전화 연결해 드릴게요.",
    action: () => { openPhoneModal('말동무 가온의 전화 상담 연결'); }
  }
];

function openCompanionModal(initialPrompt = null) {
  let modal = document.getElementById('aiCompanionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'aiCompanionModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content-card" style="max-width: 440px; padding: 22px 18px; border-radius: 28px;">
        <!-- 상단 헤더: 다정한 친구 가온 캐릭터 -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #D5DDD0; padding-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <!-- 다정한 친구 얼굴 3D 실사 아바타 -->
            <img src="assets/images/companion_face.jpg" alt="말동무 가온 얼굴" style="width: 50px; height: 50px; min-width: 50px; min-height: 50px; max-width: 50px; max-height: 50px; border-radius: 50%; object-fit: cover; border: 2.5px solid #C5DEB5; box-shadow: 0 4px 14px rgba(61,90,42,0.35); flex-shrink: 0; display: block;">
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <h3 style="font-size: 19px; font-weight: 900; color: #2C3328; margin: 0;">다정한 말동무 가온</h3>
                <span style="background: #E8F2E0; color: #3D5A2A; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">항상 귀 기울여요</span>
              </div>
              <p style="font-size: 12.5px; color: #6B7B6A; margin: 2px 0 0;">최문영 님과 도란도란 정다운 이야기 나누기</p>
            </div>
          </div>
          <button onclick="closeCompanionModal()" style="background: none; border: none; font-size: 26px; color: #6B7B6A; cursor: pointer; padding: 4px; line-height: 1;">&times;</button>
        </div>

        <!-- 정다운 대화 상자 -->
        <div id="companionChatList" class="companion-chat-box" style="min-height: 200px; max-height: 300px;">
          <div class="chat-bubble ai">
            <strong>가온:</strong> 문영 님, 어서 오세요! 오늘도 이렇게 정답게 뵈니 참 기뻐요. 오늘 하루 마음 편안히 보내셨나요? 재미난 이야기나 일상 생각, 무엇이든 편안하게 말씀해 주세요.
          </div>
        </div>

        <!-- 음성 애니메이션 파형 -->
        <div id="companionWaveBox" style="display: none; text-align: center; margin: 8px 0; background: #F0F7EC; border-radius: 14px; padding: 10px;">
          <div class="voice-waveforms" style="height: 32px; margin: 2px 0;">
            <div class="voice-waveform-bar" style="background-color: #5B7F3E;"></div>
            <div class="voice-waveform-bar" style="background-color: #5B7F3E;"></div>
            <div class="voice-waveform-bar" style="background-color: #5B7F3E;"></div>
            <div class="voice-waveform-bar" style="background-color: #5B7F3E;"></div>
            <div class="voice-waveform-bar" style="background-color: #5B7F3E;"></div>
          </div>
          <span style="font-size: 13px; font-weight: 700; color: #3D5A2A;">문영 님의 따뜻한 목소리를 듣고 있어요...</span>
        </div>

        <!-- 친구와 나누는 따뜻한 대화 주제 칩 (상품 나열 X, 순수 친구 대화 O) -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-top: 8px; scrollbar-width: none;">
          <button onclick="askCompanionDirect('오늘 기분 좋은 이야기 들려줘')" class="btn-companion-quick" style="background: #F0F3EE; color: #2C3328; border-color: #D5DDD0;">☀️ 따뜻한 안부 나누기</button>
          <button onclick="askCompanionDirect('재미있는 옛날이야기 해줘')" class="btn-companion-quick" style="background: #F0F3EE; color: #2C3328; border-color: #D5DDD0;">🌸 정다운 옛날이야기</button>
          <button onclick="askCompanionDirect('마음 편해지는 건강차 추천해줘')" class="btn-companion-quick" style="background: #F0F3EE; color: #2C3328; border-color: #D5DDD0;">🍵 건강차 추천</button>
          <button onclick="askCompanionDirect('가벼운 건강 스트레칭 알려줘')" class="btn-companion-quick" style="background: #F0F3EE; color: #2C3328; border-color: #D5DDD0;">🧘 3분 의자 스트레칭</button>
          <button onclick="askCompanionDirect('가온아, 고마워')" class="btn-companion-quick" style="background: #F0F3EE; color: #2C3328; border-color: #D5DDD0;">💖 가온아 고마워</button>
        </div>

        <!-- 음성 대화 버튼 & 텍스트 바 -->
        <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
          <button id="companionMicBtn" onclick="triggerCompanionVoice()" class="btn-companion-voice" style="flex: 0 0 54px; height: 54px; padding: 0; border-radius: 50%;" title="음성으로 말씀하기">
            <i class="fa-solid fa-microphone" style="font-size: 21px;"></i>
          </button>
          <div style="flex: 1; display: flex; background: #F0F3EE; border: 1.5px solid #D5DDD0; border-radius: 9999px; padding: 8px 16px; align-items: center; gap: 8px;">
            <input type="text" id="companionTextInput" placeholder="친구에게 말하듯 편히 적어보세요..." style="border: none; background: transparent; width: 100%; font-size: 15px; outline: none; font-family: inherit; font-weight: 600; color: #1A1F17;" onkeydown="if(event.key==='Enter') submitCompanionText()">
            <button onclick="submitCompanionText()" style="background: none; border: none; color: #5B7F3E; font-size: 19px; cursor: pointer; padding: 2px;">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('show');
  playFeedbackSound('tap');

  if (initialPrompt) {
    setTimeout(() => askCompanionDirect(initialPrompt), 400);
  }
}

function closeCompanionModal() {
  const modal = document.getElementById('aiCompanionModal');
  if (modal) modal.classList.remove('show');
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function speakWithCompanionTTS(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.95; // 시니어 청취에 적합한 편안한 속도
  utterance.pitch = 1.05; // 부드럽고 다정한 톤
  window.speechSynthesis.speak(utterance);
}

function submitCompanionText() {
  const input = document.getElementById('companionTextInput');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  processCompanionQuery(text);
}

function askCompanionDirect(text) {
  processCompanionQuery(text);
}

function triggerCompanionVoice() {
  playFeedbackSound('tap');
  const waveBox = document.getElementById('companionWaveBox');
  if (waveBox) waveBox.style.display = 'block';

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;

    recognition.onresult = function(event) {
      if (waveBox) waveBox.style.display = 'none';
      const text = event.results[0][0].transcript;
      processCompanionQuery(text);
    };

    recognition.onerror = function() {
      if (waveBox) waveBox.style.display = 'none';
      simulateCompanionVoice();
    };

    try {
      recognition.start();
    } catch(e) {
      simulateCompanionVoice();
    }
  } else {
    simulateCompanionVoice();
  }
}

function simulateCompanionVoice() {
  const samples = [
    "문영 님, 오늘 날씨가 참 좋아요. 산책 어떠세요?",
    "따뜻한 온천 여행 보여줘",
    "저염 건강 식단 신청할래",
    "글자 크기 좀 크게 키워줘"
  ];
  const chosen = samples[Math.floor(Math.random() * samples.length)];
  setTimeout(() => {
    const waveBox = document.getElementById('companionWaveBox');
    if (waveBox) waveBox.style.display = 'none';
    processCompanionQuery(chosen);
  }, 1200);
}

function processCompanionQuery(userText) {
  const chatList = document.getElementById('companionChatList');
  if (!chatList) return;

  // 1. 유저 말풍선 추가
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerHTML = `<strong>최문영 님:</strong> ${userText}`;
  chatList.appendChild(userBubble);
  chatList.scrollTop = chatList.scrollHeight;
  playFeedbackSound('tap');

  // 2. 답변 매칭
  let matched = null;
  const lower = userText.toLowerCase();
  for (const item of COMPANION_KNOWLEDGE) {
    if (item.triggers.some(t => lower.includes(t))) {
      matched = item;
      break;
    }
  }

  const aiReply = matched 
    ? matched.response 
    : `문영 님, '${userText}'에 대해 정성껏 알아보고 있습니다. 언제든 편히 말씀해 주시면 원하는 곳으로 안내해 드릴게요.`;

  // 3. AI 말풍선 추가 (약간의 자연스러운 딜레이)
  setTimeout(() => {
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    aiBubble.innerHTML = `<strong>가온:</strong> ${aiReply}`;
    chatList.appendChild(aiBubble);
    chatList.scrollTop = chatList.scrollHeight;
    playFeedbackSound('success');
    speakWithCompanionTTS(aiReply);

    if (matched && matched.action) {
      matched.action();
    }
  }, 450);
}

// ============================================================
// 6. 음성 검색 모달 (기존 호환)
// ============================================================
function openVoiceModal() {
  openCompanionModal();
}
function closeVoiceModal() {
  closeCompanionModal();
}

// 7. 예약 & 주문 로컬스토리지 연동
function bookProduct(item) {
  localStorage.setItem('goldenlife_pending_order', JSON.stringify(item));
  window.location.href = 'payment.html';
}

function getPendingOrder() {
  const saved = localStorage.getItem('goldenlife_pending_order');
  if (saved) {
    try { return JSON.parse(saved); } catch(e) {}
  }
  return {
    title: "해운대 프리미엄 리조트 & 건강 스파 패키지",
    category: "프리미엄 웰니스 케어",
    price: 290000,
    originalPrice: 520000,
    date: "2026. 4. 15(수) ~ 4. 16(목) (1박 2일)",
    party: "성인 2인 (시니어 안심 동행)",
    image: "assets/images/hotel_resort_thumb.png"
  };
}

function completeOrder(orderData) {
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem('goldenlife_my_orders') || '[]');
  } catch(e) {}

  orderData.orderId = 'GL-' + Date.now().toString().slice(-6);
  orderData.orderDate = new Date().toLocaleDateString('ko-KR');
  orders.unshift(orderData);
  localStorage.setItem('goldenlife_my_orders', JSON.stringify(orders));
  return orderData;
}

// 8. 전역 버튼 리액션 & 피드백 시스템 (클릭 효과음 + 시각적 리플 + 햅틱)
function setupAllButtonReactions() {
  // 모든 버튼과 인터랙티브 요소에 사운드 및 피드백 부여
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, .tag-chip, .service-card, [data-voice-search], [data-call-support], [data-companion-btn]');
    if (!target) return;

    // 사운드 리액션
    playFeedbackSound('tap');

    // 시각적 피드백 클래스
    target.classList.add('btn-feedback');
    setTimeout(() => target.classList.remove('btn-feedback'), 280);

    // 물결 리플 이펙트
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute; border-radius: 50%;
      background: rgba(91, 127, 62, 0.28);
      width: 100px; height: 100px;
      left: ${x - 50}px; top: ${y - 50}px;
      transform: scale(0); opacity: 1;
      animation: ripple-out 0.45s ease-out forwards;
      pointer-events: none; z-index: 10;
    `;
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
}

// 9. 페이지 초기화 리스너
document.addEventListener('DOMContentLoaded', () => {
  initFontScale();

  // 모든 전화 상담 버튼 이벤트 연결
  document.querySelectorAll('[data-call-support]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-call-support') || '골든라이프 고객 지원';
      openPhoneModal(service);
    });
  });

  // 모든 AI 동반자 / 음성 검색 트리거 연결
  document.querySelectorAll('[data-voice-search]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCompanionModal();
    });
  });

  document.querySelectorAll('[data-companion-btn], .nav-companion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCompanionModal();
    });
  });

  // 전역 버튼 리액션 활성화
  setupAllButtonReactions();

  // 리플 애니메이션 CSS 동적 주입
  if (!document.getElementById('rippleStyles')) {
    const style = document.createElement('style');
    style.id = 'rippleStyles';
    style.textContent = `
      @keyframes ripple-out {
        to { transform: scale(4); opacity: 0; }
      }
      @keyframes btn-press {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      .btn-feedback {
        animation: btn-press 0.25s ease !important;
      }
    `;
    document.head.appendChild(style);
  }
});
