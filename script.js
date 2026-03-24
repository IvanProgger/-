// ============================================
// ВЕСЬ ОПРОС ХРАНИТСЯ В ССЫЛКЕ!
// Друг откроет — сразу увидит вопросы
// ============================================

// DOM элементы
const constructor = document.getElementById('constructor');
const result = document.getElementById('result');
const pollView = document.getElementById('pollView');
const resultsView = document.getElementById('resultsView');
const headerSubtitle = document.getElementById('headerSubtitle');

// Конструктор
const pollTitle = document.getElementById('pollTitle');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const createPollBtn = document.getElementById('createPollBtn');

// Результат создания
const voteLink = document.getElementById('voteLink');
const resultLink = document.getElementById('resultLink');
const copyVoteBtn = document.getElementById('copyVoteBtn');
const copyResultBtn = document.getElementById('copyResultBtn');
const viewPollBtn = document.getElementById('viewPollBtn');
const createAnotherBtn = document.getElementById('createAnotherBtn');

// Голосование
const viewPollTitle = document.getElementById('viewPollTitle');
const viewPollQuestion = document.getElementById('viewPollQuestion');
const optionsList = document.getElementById('optionsList');
const voteBtn = document.getElementById('voteBtn');
const backFromPollBtn = document.getElementById('backFromPollBtn');

// Результаты
const resultsTitle = document.getElementById('resultsTitle');
const statsContainer = document.getElementById('statsContainer');
const progressContainer = document.getElementById('progressContainer');
const backFromResultsBtn = document.getElementById('backFromResultsBtn');

// Текущий опрос (для голосования/результатов)
let currentPoll = null;
let currentMode = 'constructor';
let currentPollId = null;

// Хранилище голосов (только на этом устройстве)
let votesStorage = {};

// ============================================
// ЗАПУСК
// ============================================
function init() {
    loadVotesFromStorage();
    handleRoute();
    addEventListeners();
    renderConstructorOptions(); // начальные варианты
}

// ============================================
// МАРШРУТИЗАЦИЯ ПО ХЭШУ
// ============================================
function handleRoute() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#vote/')) {
        // Ссылка для голосования
        const encodedData = hash.replace('#vote/', '');
        try {
            const decoded = decodeURIComponent(encodedData);
            const pollData = JSON.parse(decoded);
            currentPoll = pollData;
            currentPollId = pollData.id;
            showPollPage();
        } catch(e) {
            alert('Ошибка: неправильная ссылка на опрос');
            showConstructorPage();
        }
    }
    else if (hash.startsWith('#results/')) {
        // Ссылка для результатов
        const encodedData = hash.replace('#results/', '');
        try {
            const decoded = decodeURIComponent(encodedData);
            const pollData = JSON.parse(decoded);
            currentPoll = pollData;
            currentPollId = pollData.id;
            showResultsPage();
        } catch(e) {
            alert('Ошибка: неправильная ссылка на результаты');
            showConstructorPage();
        }
    }
    else {
        showConstructorPage();
    }
}

// ============================================
// ПОКАЗ СТРАНИЦ
// ============================================
function showConstructorPage() {
    currentMode = 'constructor';
    constructor.style.display = 'block';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    headerSubtitle.textContent = 'Создай опрос за минуту';
}

function showResultPage() {
    currentMode = 'result';
    constructor.style.display = 'none';
    result.style.display = 'block';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    headerSubtitle.textContent = 'Опрос готов!';
}

function showPollPage() {
    if (!currentPoll) return;
    currentMode = 'poll';
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'block';
    resultsView.style.display = 'none';
    headerSubtitle.textContent = 'Голосование';
    
    viewPollTitle.textContent = currentPoll.title;
    viewPollQuestion.textContent = currentPoll.question;
    renderPollOptions();
}

function showResultsPage() {
    if (!currentPoll) return;
    currentMode = 'results';
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'block';
    headerSubtitle.textContent = 'Результаты';
    
    resultsTitle.textContent = `Результаты: ${currentPoll.title}`;
    renderStats();
}

// ============================================
// КОНСТРУКТОР
// ============================================
function renderConstructorOptions() {
    const defaultOptions = ['Кино', 'Парк'];
    optionsContainer.innerHTML = '<label>Варианты ответа</label>';
    
    defaultOptions.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `
            <input type="text" class="big-input option-input" 
                   value="${opt}" 
                   placeholder="Вариант ${index + 1}">
        `;
        optionsContainer.appendChild(div);
    });
}

function addOption() {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `
        <input type="text" class="big-input option-input" 
               value="Новый вариант" 
               placeholder="Новый вариант">
    `;
    optionsContainer.appendChild(div);
}

function getOptionsFromConstructor() {
    const inputs = document.querySelectorAll('.option-input');
    const options = [];
    inputs.forEach(input => {
        if (input.value.trim()) options.push(input.value.trim());
    });
    return options;
}

function createPoll() {
    const title = pollTitle.value || 'Опрос группы';
    const question = questionText.value || 'Куда идем?';
    const options = getOptionsFromConstructor();
    
    if (options.length < 2) {
        alert('Добавь хотя бы 2 варианта ответа!');
        return;
    }
    
    const pollId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const pollData = {
        id: pollId,
        title: title,
        question: question,
        options: options
    };
    
    currentPoll = pollData;
    currentPollId = pollId;
    
    // Кодируем опрос в строку для ссылки
    const encoded = encodeURIComponent(JSON.stringify(pollData));
    const baseUrl = window.location.origin + window.location.pathname;
    
    voteLink.textContent = baseUrl + '#vote/' + encoded;
    resultLink.textContent = baseUrl + '#results/' + encoded;
    
    showResultPage();
}

// ============================================
// ГОЛОСОВАНИЕ
// ============================================
function renderPollOptions() {
    optionsList.innerHTML = '';
    
    currentPoll.options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option-item-view';
        div.dataset.index = index;
        div.innerHTML = `
            <input type="radio" name="vote" value="${index}" class="option-radio">
            <span class="option-text">${opt}</span>
        `;
        
        div.addEventListener('click', function() {
            document.querySelectorAll('.option-item-view').forEach(el => {
                el.classList.remove('selected');
                el.querySelector('input').checked = false;
            });
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
        
        optionsList.appendChild(div);
    });
}

function submitVote() {
    const selected = document.querySelector('input[name="vote"]:checked');
    if (!selected) {
        alert('Выбери вариант!');
        return;
    }
    
    const index = parseInt(selected.value);
    
    // Сохраняем голос в localStorage этого устройства
    if (!votesStorage[currentPollId]) {
        votesStorage[currentPollId] = new Array(currentPoll.options.length).fill(0);
    }
    votesStorage[currentPollId][index]++;
    saveVotesToStorage();
    
    alert('Голос учтён!');
    showResultsPage();
}

// ============================================
// СТАТИСТИКА
// ============================================
function renderStats() {
    const votes = votesStorage[currentPollId] || new Array(currentPoll.options.length).fill(0);
    const totalVotes = votes.reduce((a, b) => a + b, 0);
    
    statsContainer.innerHTML = '';
    progressContainer.innerHTML = '';
    
    currentPoll.options.forEach((opt, idx) => {
        const count = votes[idx];
        const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        
        const statDiv = document.createElement('div');
        statDiv.className = 'stat-item';
        statDiv.innerHTML = `${opt}: <span class="stat-count">${count}</span> голосов (${percent}%)`;
        statsContainer.appendChild(statDiv);
        
        if (totalVotes > 0) {
            const barDiv = document.createElement('div');
            barDiv.className = 'progress-bar';
            barDiv.style.width = `${percent}%`;
            barDiv.textContent = `${opt}: ${percent}%`;
            progressContainer.appendChild(barDiv);
        }
    });
    
    if (totalVotes === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'stat-item';
        emptyDiv.textContent = 'Пока никто не голосовал';
        statsContainer.appendChild(emptyDiv);
    }
}

// ============================================
// ХРАНЕНИЕ ГОЛОСОВ
// ============================================
function loadVotesFromStorage() {
    const saved = localStorage.getItem('poll_votes');
    if (saved) {
        try {
            votesStorage = JSON.parse(saved);
        } catch(e) {
            votesStorage = {};
        }
    }
}

function saveVotesToStorage() {
    localStorage.setItem('poll_votes', JSON.stringify(votesStorage));
}

// ============================================
// КОПИРОВАНИЕ
// ============================================
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const original = button.textContent;
        button.textContent = '✅ Скопировано!';
        setTimeout(() => {
            button.textContent = original;
        }, 1500);
    });
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================
function addEventListeners() {
    addOptionBtn.addEventListener('click', addOption);
    createPollBtn.addEventListener('click', createPoll);
    
    copyVoteBtn.addEventListener('click', () => {
        copyToClipboard(voteLink.textContent, copyVoteBtn);
    });
    copyResultBtn.addEventListener('click', () => {
        copyToClipboard(resultLink.textContent, copyResultBtn);
    });
    
    viewPollBtn.addEventListener('click', () => {
        window.location.href = voteLink.textContent;
    });
    
    createAnotherBtn.addEventListener('click', () => {
        window.location.hash = '';
        showConstructorPage();
    });
    
    voteBtn.addEventListener('click', submitVote);
    
    backFromPollBtn.addEventListener('click', () => {
        window.location.hash = '';
        showConstructorPage();
    });
    
    backFromResultsBtn.addEventListener('click', () => {
        window.location.hash = '';
        showConstructorPage();
    });
    
    window.addEventListener('hashchange', handleRoute);
}

// ============================================
// ЗАПУСК
// ============================================
document.addEventListener('DOMContentLoaded', init);
