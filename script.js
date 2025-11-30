// GigaMind Pro v3.0 — Full Working Version

document.addEventListener('DOMContentLoaded', function() {
  // === Глобальное состояние ===
  const appState = {
    currentScenario: null,
    currentStepId: null,
    history: [],
    isListening: false,
    speechRecognition: null,
    speechSynthesis: window.speechSynthesis,
    analytics: {
      emotional_intelligence: 0,
      ethical_score: 0,
      leadership_score: 0,
      completedScenarios: []
    }
  };

  // === Сценарии ===
  const SCENARIOS = {
    'ethical-dilemma': {
      id: 'ethical-dilemma',
      title: 'Этическая дилемма: приказ против совести',
      steps: {
        'step1': {
          question: 'Ваш руководитель настаивает: «Подпишешь — продвинемся. Не подпишешь — проблемы». Что вы делаете?',
          options: [
            { text: 'Подпишу, чтобы не потерять работу', next: 'bad1' },
            { text: 'Откажусь и обращусь к вышестоящему руководству', next: 'good1' },
            { text: 'Попрошу время до завтра', next: 'neutral1' }
          ]
        },
        'good1': {
          feedback: '✅ Этический выбор',
          content: 'Вы выбрали путь профессионала. В Сбере это ценится выше всего.',
          options: [
            { text: 'Завершить тренировку', next: 'end' }
          ]
        },
        'bad1': {
          feedback: '❌ Нарушение этики',
          content: 'Это решение скомпрометирует вас как специалиста.',
          options: [
            { text: 'Попробовать другой путь', next: 'step1' },
            { text: 'Завершить тренировку', next: 'end' }
          ]
        },
        'neutral1': {
          question: 'Вы выиграли время. К кому обратитесь за советом?',
          options: [
            { text: 'К юристу учреждения', next: 'good2' },
            { text: 'К другу за пределами работы', next: 'bad2' }
          ]
        },
        'good2': {
          feedback: '✅ Профессиональный подход',
          content: 'Отлично! Юрист — ваш союзник в этических вопросах.',
          options: [
            { text: 'Завершить тренировку', next: 'end' }
          ]
        },
        'bad2': {
          feedback: '❌ Утечка информации',
          content: 'Обсуждение со внешним лицом — утечка служебной информации.',
          options: [
            { text: 'Вернуться к выбору', next: 'neutral1' }
          ]
        }
      }
    },
    'team-conflict': {
      id: 'team-conflict',
      title: 'Конфликт в команде: как сохранить проект',
      steps: {
        'tc1': {
          question: 'Вы — руководитель. Два сотрудника не могут договориться о распределении задач. Дедлайн горит. Как поступите?',
          options: [
            { text: 'Соберу всех на встречу и потребую прекратить споры', next: 'tc_bad' },
            { text: 'Проведу отдельные встречи, чтобы понять корень конфликта', next: 'tc_good' }
          ]
        },
        'tc_good': {
          feedback: '✅ Emotional Intelligence',
          content: 'Тактика "сначала понять, потом решать" — основа emotional intelligence.',
          options: [
            { text: 'Завершить тренировку', next: 'end' }
          ]
        },
        'tc_bad': {
          feedback: '❌ Эскалация конфликта',
          content: 'Публичное давление усиливает напряжение.',
          options: [
            { text: 'Попробовать иначе', next: 'tc1' },
            { text: 'Завершить тренировку', next: 'end' }
          ]
        }
      }
    },
    'resource-allocation': {
      id: 'resource-allocation',
      title: 'Распределение ресурсов: этика бюджета',
      steps: {
        'ra1': {
          question: 'У вас ограниченный бюджет на социальные программы. Как распределите средства?',
          options: [
            { text: 'Всё выделю самой нуждающейся группе', next: 'ra_bad' },
            { text: 'Распределю поровну между всеми группами', next: 'ra_neutral' },
            { text: 'Направлю средства по стратегическим приоритетам региона', next: 'ra_good' }
          ]
        },
        'ra_good': {
          feedback: '✅ Стратегическое управление',
          content: 'Вы мыслите стратегически и учитываете долгосрочные цели региона.',
          options: [
            { text: 'Завершить тренировку', next: 'end' }
          ]
        },
        'ra_neutral': {
          feedback: '⚠️ Баланс без стратегии',
          content: 'Поровну — это справедливо, но не эффективно.',
          options: [
            { text: 'Пересмотреть решение', next: 'ra1' },
            { text: 'Завершить тренировку', next: 'end' }
          ]
        },
        'ra_bad': {
          feedback: '❌ Точечный подход',
          content: 'Концентрация на одной группе игнорирует потребности других.',
          options: [
            { text: 'Выбрать другой вариант', next: 'ra1' }
          ]
        }
      }
    }
  };

  // === Инициализация ===
  initApp();
  setupEventListeners();
  initVoiceRecognition();

  function initApp() {
    // Проверка поддержки синтеза
    if (!appState.speechSynthesis) {
      document.getElementById('voice-btn').disabled = true;
      document.getElementById('voice-btn').title = 'Ваш браузер не поддерживает синтез речи';
    }
  }

  function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.dataset.page;
        showPage(`${page}-page`);
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Кнопки "Назад"
    document.getElementById('back-home-btn')?.addEventListener('click', () => showPage('home-page'));
    document.getElementById('back-home-analytics')?.addEventListener('click', () => showPage('home-page'));
    document.getElementById('back-home-leaderboards')?.addEventListener('click', () => showPage('home-page'));
    document.getElementById('back-scenarios-btn')?.addEventListener('click', () => showPage('scenarios-page'));

    // Кнопка "Начать тренировку"
    document.getElementById('start-btn')?.addEventListener('click', () => showPage('scenarios-page'));

    // Выбор сценариев
    document.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', () => {
        const scenarioId = card.dataset.id;
        startScenario(scenarioId);
      });
    });

    // Тема
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // Демо
    document.getElementById('demo-btn')?.addEventListener('click', () => showModal('demo-modal'));
    document.getElementById('demo-trigger-btn')?.addEventListener('click', () => showModal('demo-modal'));
    document.getElementById('close-demo-modal')?.addEventListener('click', () => hideModal('demo-modal'));
    document.getElementById('confirm-demo')?.addEventListener('click', () => hideModal('demo-modal'));

    // Экспорт
    document.getElementById('download-pdf-btn')?.addEventListener('click', () => alert('PDF-отчет сгенерирован и загружен'));
    document.getElementById('download-excel-btn')?.addEventListener('click', () => alert('Данные экспортированы в Excel'));

    // Переключение вкладок лидерборда
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.leaderboard').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(`${tab}-board`).classList.add('active');
      });
    });
  }

  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
  }

  function startScenario(scenarioId) {
    const scenario = SCENARIOS[scenarioId];
    if (!scenario) return;

    appState.currentScenario = scenario;
    appState.currentStepId = Object.keys(scenario.steps)[0];
    appState.history = [appState.currentStepId];

    document.getElementById('current-scenario-title').textContent = scenario.title;
    showPage('scenario-page');
    renderCurrentStep();
  }

  function renderCurrentStep() {
    const stepContainer = document.getElementById('step-container');
    const currentStep = appState.currentScenario.steps[appState.currentStepId];

    if (!currentStep) {
      stepContainer.innerHTML = '<p>Шаг не найден</p>';
      return;
    }

    let content = '';

    if (currentStep.question) {
      content += `<div class="question-text">${currentStep.question}</div>`;

      if (currentStep.options && currentStep.options.length > 0) {
        content += `<div class="options-container">`;
        currentStep.options.forEach((option, index) => {
          content += `<button class="option-btn" data-next="${option.next}">${index + 1}. ${option.text}</button>`;
        });
        content += `</div>`;
      }
    } else if (currentStep.feedback) {
      const feedbackClass = currentStep.feedback.includes('✅') ? 'success' : 'error';
      content += `<div class="feedback-box ${feedbackClass}">
        <div class="feedback-title">${currentStep.feedback}</div>
        <div class="feedback-content">${currentStep.content}</div>
      </div>`;

      if (currentStep.options && currentStep.options.length > 0) {
        content += `<div class="options-container">`;
        currentStep.options.forEach((option, index) => {
          content += `<button class="option-btn" data-next="${option.next}">${index + 1}. ${option.text}</button>`;
        });
        content += `</div>`;
      }
    }

    stepContainer.innerHTML = content;

    // Обработчики кнопок
    document.querySelectorAll('.option-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const nextId = e.target.dataset.next;
        handleOptionSelect(nextId);
      });
    });

    // Обновление прогресса
    const totalSteps = Object.keys(appState.currentScenario.steps).length;
    const currentStepIndex = appState.history.length;
    document.getElementById('current-step').textContent = currentStepIndex;
    document.getElementById('total-steps').textContent = totalSteps;
    document.getElementById('progress-fill').style.width = `${(currentStepIndex / totalSteps) * 100}%`;

    // Озвучка
    if (appState.speechSynthesis && currentStep.question) {
      speakText(currentStep.question);
    } else if (appState.speechSynthesis && currentStep.feedback) {
      speakText(`${currentStep.feedback}. ${currentStep.content}`);
    }
  }

  function handleOptionSelect(nextStepId) {
    if (nextStepId === 'end') {
      finishScenario();
      return;
    }

    appState.currentStepId = nextStepId;
    appState.history.push(nextStepId);
    renderCurrentStep();
  }

  function finishScenario() {
    // Обновляем аналитику
    appState.analytics.completedScenarios.push({
      id: appState.currentScenario.id,
      date: new Date().toISOString()
    });

    // Обновляем счетчики (пример)
    if (appState.currentScenario.id === 'ethical-dilemma') {
      appState.analytics.emotional_intelligence += 20;
      appState.analytics.ethical_score += 25;
    }

    showPage('analytics-page');
    updateAnalyticsDisplay();
    resetScenario();
  }

  function updateAnalyticsDisplay() {
    document.getElementById('emotional-score').textContent = `${Math.min(appState.analytics.emotional_intelligence, 100)}%`;
    document.getElementById('ethical-score').textContent = `${Math.min(appState.analytics.ethical_score, 100)}%`;
    document.getElementById('leadership-score').textContent = `${Math.min(appState.analytics.leadership_score, 100)}%`;
  }

  function resetScenario() {
    appState.currentScenario = null;
    appState.currentStepId = null;
    appState.history = [];
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.documentElement.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('theme-toggle').querySelector('i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  }

  function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  // === Голос ===
  function initVoiceRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        appState.speechRecognition = new SpeechRecognition();
        appState.speechRecognition.continuous = false;
        appState.speechRecognition.interimResults = false;
        appState.speechRecognition.lang = 'ru-RU';

        appState.speechRecognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          handleVoiceCommand(transcript);
          appState.isListening = false;
          updateVoiceButton();
        };

        appState.speechRecognition.onerror = (event) => {
          console.error('Ошибка распознавания:', event.error);
          appState.isListening = false;
          updateVoiceButton();
          showVoiceStatus('Ошибка распознавания. Попробуйте снова.');
        };
      } else {
        document.getElementById('voice-btn').disabled = true;
        document.getElementById('voice-btn').title = 'Ваш браузер не поддерживает голосовой ввод';
      }
    } catch (error) {
      console.error('Ошибка инициализации голоса:', error);
      document.getElementById('voice-btn').disabled = true;
    }
  }

  function toggleVoiceRecognition() {
    if (!appState.speechRecognition) return;

    if (appState.isListening) {
      appState.speechRecognition.stop();
      appState.isListening = false;
    } else {
      startListening();
    }
    updateVoiceButton();
  }

  function startListening() {
    appState.isListening = true;
    updateVoiceButton();
    showVoiceStatus('Говорите...');

    try {
      appState.speechRecognition.start();
    } catch (error) {
      console.error('Ошибка запуска распознавания:', error);
      appState.isListening = false;
      updateVoiceButton();
      showVoiceStatus('Не удалось запустить микрофон');
    }
  }

  function updateVoiceButton() {
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.innerHTML = appState.isListening ?
      '<i class="fas fa-microphone-slash"></i> <span>Слушаю...</span>' :
      '<i class="fas fa-microphone"></i> <span>Нажмите и говорите</span>';
  }

  function showVoiceStatus(message) {
    document.getElementById('voice-status').textContent = message;
    setTimeout(() => {
      if (document.getElementById('voice-status').textContent === message) {
        document.getElementById('voice-status').textContent = '';
      }
    }, 3000);
  }

  function handleVoiceCommand(command) {
    console.log('Команда:', command);
    showVoiceStatus(`Вы сказали: "${command}"`);

    const lower = command.toLowerCase();

    if (document.getElementById('home-page').classList.contains('active')) {
      if (lower.includes('начать') || lower.includes('тренировка')) {
        showPage('scenarios-page');
        speakText('Перехожу к выбору тренировки');
        return;
      }
    }

    if (document.getElementById('scenarios-page').classList.contains('active')) {
      if (lower.includes('этическая') || lower.includes('дилемма')) {
        startScenario('ethical-dilemma');
        speakText('Начинаю тренировку "Этическая дилемма"');
        return;
      }
      if (lower.includes('конфликт') || lower.includes('команда')) {
        startScenario('team-conflict');
        speakText('Начинаю тренировку "Конфликт в команде"');
        return;
      }
      if (lower.includes('бюджет') || lower.includes('ресурсы')) {
        startScenario('resource-allocation');
        speakText('Начинаю тренировку "Распределение ресурсов"');
        return;
      }
    }

    if (appState.currentScenario && document.getElementById('scenario-page').classList.contains('active')) {
      const currentStep = appState.currentScenario.steps[appState.currentStepId];

      if (currentStep.options) {
        for (let i = 0; i < currentStep.options.length; i++) {
          const option = currentStep.options[i];
          if (lower.includes(option.text.toLowerCase().substring(0, 10)) || lower.includes(`${i + 1}`)) {
            handleOptionSelect(option.next);
            speakText(`Выбрано: "${option.text}"`);
            return;
          }
        }
      }

      if (lower.includes('назад')) {
        goBack();
        speakText('Возвращаюсь назад');
        return;
      }

      if (lower.includes('завершить')) {
        showPage('scenarios-page');
        resetScenario();
        speakText('Тренировка завершена');
        return;
      }
    }

    showVoiceStatus('Команда не распознана. Попробуйте: "Начать тренировку", "Первый вариант", "Назад"');
  }

  function goBack() {
    if (appState.history.length <= 1) {
      showVoiceStatus('Невозможно вернуться назад');
      return;
    }
    appState.history.pop();
    appState.currentStepId = appState.history[appState.history.length - 1];
    renderCurrentStep();
    speakText('Возвращаюсь к предыдущему вопросу');
  }

  function speakText(text) {
    if (!appState.speechSynthesis || appState.isListening) return;
    appState.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.9;
    appState.speechSynthesis.speak(utterance);
  }

  // Инициализация темы
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark-mode');
    const icon = document.getElementById('theme-toggle').querySelector('i');
    icon.className = 'fas fa-sun';
  }
});