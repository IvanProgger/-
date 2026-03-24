// ============================================
// Хранилище данных
// ============================================

// База данных всех опросов
let pollsDatabase = {};

// ID текущего опроса (берётся из URL)
let currentPollId = null;

// Текущий режим: constructor, poll, results
let currentMode = 'constructor';

// DOM элементы
const constructor = document.getElementById('constructor');
const result = document.getElementById('result');
const pollView = document.getElementById('pollView');
const resultsView = document.getElementById('resultsView');
const headerSubtitle = document.getElementById('headerSubtitle');

// Элементы конструктора
const pollTitle = document.getElementById('pollTitle');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const createPollBtn = document.getElementById('createPollBtn');

// Элементы страницы с результатами создания
const voteLink = document.getElementById('voteLink');
const resultLink = document.getElementById('resultLink');
const copyVoteBtn = document.getElementById('copyVoteBtn');
const copyResultBtn = document.getElementById('copyResultBtn');
const viewPollBtn = document.getElementById('viewPollBtn');
const createAnotherBtn = document.getElementById('createAnotherBtn');

// Элементы страницы голосования
const viewPollTitle = document.getElementById('viewPollTitle');
const viewPollQuestion = document.getElementById('viewPollQuestion');
const optionsList = document.getElementById('optionsList');
const voteBtn = document.getElementById('voteBtn');
const backFromPollBtn = document.getElementById('backFromPollBtn');

// Элементы страницы результатов
const resultsTitle = document.getElementById('resultsTitle');
const statsContainer = document.getElementById('statsContainer');
const progressContainer = document.getElementById('progressContainer');
const backFromResultsBtn = document.getElementById('backFromResultsBtn');

// ============================================
// Инициализация приложения
// ============================================
function init() {
    // Загружаем сохранённые опросы
    loadFromStorage();
    
    // Определяем, какой режим показывать по URL
    handleRoute();
    
    // Добавляем обработчики событий
    addEventListeners();
}

// ============================================
// Обработка маршрутов (что показывать по ссылке)
// ============================================
function handleRoute() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#vote/')) {
        // Страница голосования
        const pollId = hash.replace('#vote/', '');
        currentPollId = pollId;
        
        if (pollsDatabase[pollId]) {
            showPollPage(pollId);
        } else {
            alert('Опрос не найден!');
            window.location.hash = '';
            showConstructorPage();
        }
    } 
    else if (hash.startsWith('#results/')) {
        // Страница результатов
        const pollId = hash.replace('#results/', '');
        currentPollId = pollId;
        
        if (pollsDatabase[pollId]) {
            showResultsPage(pollId);
        } else {
            alert('Опрос не найден!');
            window.location.hash = '';
            showConstructorPage();
        }
    } 
    else {
        // Главная страница (конструктор)
        showConstructorPage();
    }
}

// ============================================
// Функции для показа разных страниц
// ============================================
function showConstructorPage() {
    currentMode = 'constructor';
    currentPollId = null;
    
    constructor.style.display = 'block';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    
    headerSubtitle.textContent = 'Создай опрос за минуту';
}

function showResultPage(pollId) {
    currentMode = 'result';
    currentPollId = pollId;
    
    constructor.style.display = 'none';
    result.style.display = 'block';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    
    headerSubtitle.textContent = 'Опрос готов!';
    
    // Обновляем ссылки
    const baseUrl = window.location.origin + window.location.pathname;
    voteLink.textContent = baseUrl + '#vote/' + pollId;
    resultLink.textContent = baseUrl + '#results/' + pollId;
}

function showPollPage(pollId) {
    currentMode = 'poll';
    currentPollId = pollId;
    
    const poll = pollsDatabase[pollId];
    if (!poll) return;
    
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'block';
    resultsView.style.display = 'none';
    
    headerSubtitle.textContent = 'Голосование';
    viewPollTitle.textContent = poll.title;
    viewPollQuestion.textContent = poll.question;
    
    // Рендерим варианты
    renderPollOptions(poll);
}

function showResultsPage(pollId) {
    currentMode = 'results';
    currentPollId = pollId;
    
    const poll = pollsDatabase[pollId];
    if (!poll) return;
    
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'block';
    
    headerSubtitle.textContent = 'Результаты';
    resultsTitle.textContent = `Результаты: ${poll.title}`;
    
    // Рендерим статистику
    renderStats(poll);
}

// ============================================
// Работа с опциями в конструкторе
// ============================================
function renderOptions() {
    // Берём текущий опрос (в конструкторе он временный)
    const tempPoll = getTempPoll();
    
    optionsContainer.innerHTML = '<label>Варианты ответа</label>';
    
    tempPoll.options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `
            <input type="text" class="big-input option-input" 
                   value="${opt}" 
                   placeholder="Вариант ${index + 1}"
                   data-index="${index}">
        `;
        optionsContainer.appendChild(div);
    });
    
    // Добавляем обработчики изменения
    document.querySelectorAll('.option-input').forEach(input => {
        input.addEventListener('input', updateTempOptions);
    });
}

function getTempPoll() {
    return {
        title: pollTitle.value || 'Опрос группы',
        question: questionText.value || 'Куда идем?',
        options: ['Кино', 'Парк'],
        votes: [0, 0]
    };
}

function updateTempOptions() {
    const inputs = document.querySelectorAll('.option-input');
    // Просто сохраняем в data-атрибутах, ничего не делаем
}

function addOption() {
    const inputs = document.querySelectorAll('.option-input');
    const options = [];
    inputs.forEach(input => {
        if (input.value.trim()) options.push(input.value);
    });
    options.push('Новый вариант');
    
    // Перерисовываем
    renderOptionsWithValues(options);
}

function renderOptionsWithValues(options) {
    optionsContainer.innerHTML = '<label>Варианты ответа</label>';
    
    options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `
            <input type="text" class="big-input option-input" 
                   value="${opt}" 
                   placeholder="Вариант ${index + 1}"
                   data-index="${index}">
        `;
        optionsContainer.appendChild(div);
    });
    
    document.querySelectorAll('.option-input').forEach(input => {
        input.addEventListener('input', function() {
            // Ничего не делаем, просто даём пользователю редактировать
        });
    });
}

// ============================================
// Создание нового опроса
// ============================================
function createNewPoll() {
    // Собираем данные
    const title = pollTitle.value || 'Опрос группы';
    const question = questionText.value || 'Куда идем?';
    
    const inputs = document.querySelectorAll('.option-input');
    const options = [];
    inputs.forEach(input => {
        if (input.value.trim()) options.push(input.value);
    });
    
    if (options.length < 2) {
        alert('Добавь хотя бы 2 варианта ответа!');
        return null;
    }
    
    // Создаём новый опрос
    const pollId = 'poll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    pollsDatabase[pollId] = {
        id: pollId,
        title: title,
        question: question,
        options: options,
        votes: new Array(options.length).fill(0)
    };
    
    // Сохраняем
    saveToStorage();
    
    return pollId;
}

// ============================================
// Рендеринг страницы голосования
// ============================================
function renderPollOptions(poll) {
    optionsList.innerHTML = '';
    
    poll.options.forEach((opt, index) => {
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

// ============================================
// Голосование
// ============================================
function submitVote() {
    if (!currentPollId) return;
    
    const selected = document.querySelector('input[name="vote"]:checked');
    if (!selected) {
        alert('Выбери вариант ответа!');
        return;
    }
    
    const poll = pollsDatabase[currentPollId];
    const index = parseInt(selected.value);
    poll.votes[index]++;
    
    saveToStorage();
    
    // Показываем результаты
    window.location.hash = 'results/' + currentPollId;
    showResultsPage(currentPollId);
}

// ============================================
// Рендеринг статистики
// ============================================
function renderStats(poll) {
    const totalVotes = poll.votes.reduce((a, b) => a + b, 0);
    
    statsContainer.innerHTML = '';
    progressContainer.innerHTML = '';
    
    poll.options.forEach((opt, index) => {
        const votes = poll.votes[index];
        const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        const statDiv = document.createElement('div');
        statDiv.className = 'stat-item';
        statDiv.innerHTML = `${opt}: <span class="stat-count">${votes}</span> голосов (${percent}%)`;
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
        emptyDiv.textContent = 'Пока никто не проголосовал';
        statsContainer.appendChild(emptyDiv);
        
        const emptyBar = document.createElement('div');
        emptyBar.className = 'progress-bar';
        emptyBar.style.width = '100%';
        emptyBar.textContent = 'Нет голосов';
        progressContainer.appendChild(emptyBar);
    }
}

// ============================================
// Сохранение в localStorage
// ============================================
function saveToStorage() {
    localStorage.setItem('pollsDatabase', JSON.stringify(pollsDatabase));
}

function loadFromStorage() {
    const saved = localStorage.getItem('pollsDatabase');
    if (saved) {
        try {
            pollsDatabase = JSON.parse(saved);
        } catch(e) {
            pollsDatabase = {};
        }
    }
}

// ============================================
// Копирование в буфер обмена
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
// Обработчики событий
// ============================================
function addEventListeners() {
    // Конструктор
    addOptionBtn.addEventListener('click', addOption);
    
    createPollBtn.addEventListener('click', () => {
        const pollId = createNewPoll();
        if (pollId) {
            window.location.hash = '';
            showResultPage(pollId);
        }
    });
    
    // Страница результата
    copyVoteBtn.addEventListener('click', () => {
        copyToClipboard(voteLink.textContent, copyVoteBtn);
    });
    
    copyResultBtn.addEventListener('click', () => {
        copyToClipboard(resultLink.textContent, copyResultBtn);
    });
    
    viewPollBtn.addEventListener('click', () => {
        if (currentPollId) {
            window.location.hash = 'vote/' + currentPollId;
            showPollPage(currentPollId);
        }
    });
    
    createAnotherBtn.addEventListener('click', () => {
        window.location.hash = '';
        showConstructorPage();
        renderOptions();
    });
    
    // Страница голосования
    voteBtn.addEventListener('click', submitVote);
    
    backFromPollBtn.addEventListener('click', () => {
        window.location.hash = '';
        showConstructorPage();
    });
    
    // Страница результатов
    backFromResultsBtn.addEventListener('click', () => {
        window.location.hash = '';
        showConstructorPage();
    });
    
    // Обработка изменения хэша (кнопки назад/вперед в браузере)
    window.addEventListener('hashchange', handleRoute);
}

// ============================================
// Запуск
// ============================================
document.addEventListener('DOMContentLoaded', init);
