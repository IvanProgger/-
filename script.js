// Хранилище данных (все в памяти, для простоты)
let currentPoll = {
    id: 'poll_' + Date.now(),
    title: 'Опрос группы',
    question: 'Куда идем?',
    options: ['Кино', 'Парк'],
    votes: [0, 0] // количество голосов для каждого варианта
};

let pollMode = 'constructor'; // constructor, poll, results

// DOM элементы
const newPollBtn = document.getElementById('newPollBtn');
const constructor = document.getElementById('constructor');
const result = document.getElementById('result');
const pollView = document.getElementById('pollView');
const resultsView = document.getElementById('resultsView');

const pollTitle = document.getElementById('pollTitle');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const createPollBtn = document.getElementById('createPollBtn');

const voteLink = document.getElementById('voteLink');
const resultLink = document.getElementById('resultLink');
const createAnotherBtn = document.getElementById('createAnotherBtn');

const viewPollTitle = document.getElementById('viewPollTitle');
const viewPollQuestion = document.getElementById('viewPollQuestion');
const optionsList = document.getElementById('optionsList');
const voteBtn = document.getElementById('voteBtn');
const backToConstructorBtn = document.getElementById('backToConstructorBtn');

const resultsTitle = document.getElementById('resultsTitle');
const statsContainer = document.getElementById('statsContainer');
const progressContainer = document.getElementById('progressContainer');
const backToConstructorFromResultsBtn = document.getElementById('backToConstructorFromResultsBtn');

// Кнопки копирования
const copyButtons = document.querySelectorAll('.copy-btn');

// --- Инициализация ---
function init() {
    // Показываем только конструктор при старте
    showConstructor();
    
    // Заполняем демо-данными
    pollTitle.value = currentPoll.title;
    questionText.value = currentPoll.question;
    renderOptions();
    
    // Обновляем ссылки
    updateLinks();
    
    // Добавляем обработчики
    addEventListeners();
}

function addEventListeners() {
    newPollBtn.addEventListener('click', showConstructor);
    addOptionBtn.addEventListener('click', addOption);
    createPollBtn.addEventListener('click', createPoll);
    createAnotherBtn.addEventListener('click', showConstructor);
    voteBtn.addEventListener('click', submitVote);
    backToConstructorBtn.addEventListener('click', showConstructor);
    backToConstructorFromResultsBtn.addEventListener('click', showConstructor);
    
    // Копирование ссылок
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.dataset.copy;
            const linkElement = document.getElementById(targetId);
            const textToCopy = linkElement.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = this.textContent;
                this.textContent = '✅ Скопировано!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 1500);
            });
        });
    });
}

// --- Управление отображением ---
function showConstructor() {
    pollMode = 'constructor';
    constructor.style.display = 'block';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    newPollBtn.style.display = 'block';
}

function showResult() {
    pollMode = 'result';
    constructor.style.display = 'none';
    result.style.display = 'block';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    newPollBtn.style.display = 'none';
}

function showPollView() {
    pollMode = 'poll';
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'block';
    resultsView.style.display = 'none';
    newPollBtn.style.display = 'none';
    
    // Заполняем данные
    viewPollTitle.textContent = currentPoll.title;
    viewPollQuestion.textContent = currentPoll.question;
    
    // Рендерим варианты
    renderPollOptions();
}

function showResultsView() {
    pollMode = 'results';
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'block';
    newPollBtn.style.display = 'none';
    
    // Заполняем данные
    resultsTitle.textContent = `Результаты: ${currentPoll.title}`;
    renderStats();
}

// --- Работа с опциями ---
function renderOptions() {
    optionsContainer.innerHTML = '<label>Варианты ответа</label>';
    
    currentPoll.options.forEach((opt, index) => {
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
        input.addEventListener('input', updateOptionsFromInputs);
    });
}

function addOption() {
    currentPoll.options.push('Новый вариант');
    currentPoll.votes.push(0);
    renderOptions();
}

function updateOptionsFromInputs() {
    const inputs = document.querySelectorAll('.option-input');
    const newOptions = [];
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            newOptions.push(input.value);
        }
    });
    
    // Если есть пустые, не удаляем, а просто игнорируем
    if (newOptions.length > 0) {
        // Сохраняем старые голоса для существующих опций
        const oldVotes = [...currentPoll.votes];
        currentPoll.options = [...newOptions];
        
        // Подгоняем длину массива голосов
        while (currentPoll.votes.length < currentPoll.options.length) {
            currentPoll.votes.push(0);
        }
        while (currentPoll.votes.length > currentPoll.options.length) {
            currentPoll.votes.pop();
        }
    }
}

// --- Создание опроса ---
function createPoll() {
    // Обновляем данные из полей
    currentPoll.title = pollTitle.value || 'Опрос группы';
    currentPoll.question = questionText.value || 'Куда идем?';
    updateOptionsFromInputs();
    
    // Генерируем новый ID
    currentPoll.id = 'poll_' + Date.now();
    
    // Обновляем ссылки
    updateLinks();
    
    // Показываем результат
    showResult();
}

function updateLinks() {
    const baseUrl = 'https://studentpoll.ru';
    voteLink.textContent = `${baseUrl}/vote/${currentPoll.id}`;
    resultLink.textContent = `${baseUrl}/results/${currentPoll.id}`;
}

// --- Голосование ---
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
            // Снимаем выделение со всех
            document.querySelectorAll('.option-item-view').forEach(el => {
                el.classList.remove('selected');
                el.querySelector('input').checked = false;
            });
            // Выделяем текущий
            this.classList.add('selected');
            this.querySelector('input').checked = true;
        });
        
        optionsList.appendChild(div);
    });
}

function submitVote() {
    const selected = document.querySelector('input[name="vote"]:checked');
    
    if (!selected) {
        alert('Выберите вариант ответа!');
        return;
    }
    
    const index = parseInt(selected.value);
    currentPoll.votes[index]++;
    
    // Показываем результаты
    showResultsView();
}

// --- Статистика ---
function renderStats() {
    const totalVotes = currentPoll.votes.reduce((a, b) => a + b, 0);
    
    statsContainer.innerHTML = '';
    progressContainer.innerHTML = '';
    
    currentPoll.options.forEach((opt, index) => {
        const votes = currentPoll.votes[index];
        const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        
        // Статистика текстом
        const statDiv = document.createElement('div');
        statDiv.className = 'stat-item';
        statDiv.innerHTML = `${opt}: <span class="stat-count">${votes}</span> голосов (${percent}%)`;
        statsContainer.appendChild(statDiv);
        
        // Прогресс-бар
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

// --- Запуск ---
document.addEventListener('DOMContentLoaded', init);