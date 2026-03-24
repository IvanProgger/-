// ============================================
// GOOGLE TABLES — ФИНАЛЬНАЯ ВЕРСИЯ
// ============================================

// 👇 ВСТАВЬ СВОИ ССЫЛКИ
const GOOGLE_SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0dNK3abgB1r1WYc_G7EfBqfjWVpJZtO3yQS8gh1tYW4GnRsKn-7s0fQzz-sW611aBHii-KB7G9AU4/pub?gid=0&single=true&output=csv';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwb1VO0H-ws1EJU75qcBMX27zkvm1z1ay-tcO_b0fBmq19AjiQxqkvCG41GaHFIRS-x/exec';

const constructor = document.getElementById('constructor');
const result = document.getElementById('result');
const pollView = document.getElementById('pollView');
const resultsView = document.getElementById('resultsView');
const headerSubtitle = document.getElementById('headerSubtitle');

const pollTitle = document.getElementById('pollTitle');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const createPollBtn = document.getElementById('createPollBtn');

const voteLink = document.getElementById('voteLink');
const resultLink = document.getElementById('resultLink');
const copyVoteBtn = document.getElementById('copyVoteBtn');
const copyResultBtn = document.getElementById('copyResultBtn');
const viewPollBtn = document.getElementById('viewPollBtn');
const createAnotherBtn = document.getElementById('createAnotherBtn');

const viewPollTitle = document.getElementById('viewPollTitle');
const viewPollQuestion = document.getElementById('viewPollQuestion');
const optionsList = document.getElementById('optionsList');
const voteBtn = document.getElementById('voteBtn');
const backFromPollBtn = document.getElementById('backFromPollBtn');

const resultsTitle = document.getElementById('resultsTitle');
const statsContainer = document.getElementById('statsContainer');
const progressContainer = document.getElementById('progressContainer');
const backFromResultsBtn = document.getElementById('backFromResultsBtn');

let currentPoll = null;
let currentPollId = null;

function init() {
    handleRoute();
    addEventListeners();
    renderConstructorOptions();
}

function handleRoute() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#vote/')) {
        const encodedData = hash.replace('#vote/', '');
        try {
            const decoded = decodeURIComponent(encodedData);
            currentPoll = JSON.parse(decoded);
            currentPollId = currentPoll.id;
            showPollPage();
        } catch(e) {
            alert('Ошибка: неправильная ссылка');
            showConstructorPage();
        }
    }
    else if (hash.startsWith('#results/')) {
        const encodedData = hash.replace('#results/', '');
        try {
            const decoded = decodeURIComponent(encodedData);
            currentPoll = JSON.parse(decoded);
            currentPollId = currentPoll.id;
            showResultsPage();
        } catch(e) {
            alert('Ошибка: неправильная ссылка');
            showConstructorPage();
        }
    }
    else {
        showConstructorPage();
    }
}

function showConstructorPage() {
    constructor.style.display = 'block';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    headerSubtitle.textContent = 'Создай опрос за минуту';
}

function showResultPage() {
    constructor.style.display = 'none';
    result.style.display = 'block';
    pollView.style.display = 'none';
    resultsView.style.display = 'none';
    headerSubtitle.textContent = 'Опрос готов!';
}

function showPollPage() {
    if (!currentPoll) return;
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
    constructor.style.display = 'none';
    result.style.display = 'none';
    pollView.style.display = 'none';
    resultsView.style.display = 'block';
    headerSubtitle.textContent = 'Результаты';
    resultsTitle.textContent = `Результаты: ${currentPoll.title}`;
    loadResults();
}

function renderConstructorOptions() {
    optionsContainer.innerHTML = '<label>Варианты ответа</label>';
    ['Кино', 'Парк'].forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.innerHTML = `<input type="text" class="big-input option-input" value="${opt}" placeholder="Вариант ${i+1}">`;
        optionsContainer.appendChild(div);
    });
}

function addOption() {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.innerHTML = `<input type="text" class="big-input option-input" value="Новый вариант" placeholder="Новый вариант">`;
    optionsContainer.appendChild(div);
}

function getOptions() {
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
    const options = getOptions();
    
    if (options.length < 2) {
        alert('Добавь хотя бы 2 варианта!');
        return;
    }
    
    const pollId = Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const pollData = { id: pollId, title, question, options };
    
    currentPoll = pollData;
    currentPollId = pollId;
    
    const encoded = encodeURIComponent(JSON.stringify(pollData));
    const baseUrl = window.location.origin + window.location.pathname;
    
    voteLink.textContent = baseUrl + '#vote/' + encoded;
    resultLink.textContent = baseUrl + '#results/' + encoded;
    
    showResultPage();
}

// ========== ЧТЕНИЕ ИЗ ТАБЛИЦЫ ==========
async function loadResults() {
    if (!currentPoll) return;
    
    statsContainer.innerHTML = '<div class="stat-item">📡 Загрузка...</div>';
    
    try {
        const response = await fetch(GOOGLE_SHEET_CSV);
        const text = await response.text();
        
        const lines = text.split('\n');
        const votes = new Array(currentPoll.options.length).fill(0);
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            if (line.includes(currentPollId)) {
                const parts = line.split(',');
                if (parts.length >= 2) {
                    const idx = parseInt(parts[1]);
                    if (!isNaN(idx) && idx >= 0 && idx < votes.length) {
                        votes[idx]++;
                    }
                }
            }
        }
        
        renderStats(votes);
    } catch(e) {
        console.error('Ошибка:', e);
        statsContainer.innerHTML = '<div class="stat-item">⚠️ Ошибка загрузки</div>';
        renderStats(new Array(currentPoll.options.length).fill(0));
    }
}

// ========== СОХРАНЕНИЕ В ТАБЛИЦУ ==========
async function saveVote(pollId, optionIndex, optionText) {
    try {
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                pollId: pollId,
                optionIndex: optionIndex,
                optionText: optionText,
                date: new Date().toISOString()
            })
        });
        return true;
    } catch(e) {
        console.error('Ошибка:', e);
        return false;
    }
}

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

async function submitVote() {
    const selected = document.querySelector('input[name="vote"]:checked');
    if (!selected) {
        alert('Выбери вариант!');
        return;
    }
    
    const index = parseInt(selected.value);
    const optionText = currentPoll.options[index];
    
    voteBtn.textContent = '⏳ Отправка...';
    voteBtn.disabled = true;
    
    await saveVote(currentPollId, index, optionText);
    
    voteBtn.textContent = '🗳️ Проголосовать';
    voteBtn.disabled = false;
    
    alert('✅ Голос учтён!');
    showResultsPage();
}

function renderStats(votesArray) {
    const totalVotes = votesArray.reduce((a, b) => a + b, 0);
    statsContainer.innerHTML = '';
    progressContainer.innerHTML = '';
    
    currentPoll.options.forEach((opt, idx) => {
        const count = votesArray[idx];
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
        emptyDiv.textContent = 'Пока никто не голосовал. Будь первым! 🎉';
        statsContainer.appendChild(emptyDiv);
    }
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const original = button.textContent;
        button.textContent = '✅ Скопировано!';
        setTimeout(() => {
            button.textContent = original;
        }, 1500);
    });
}

function addEventListeners() {
    addOptionBtn.addEventListener('click', addOption);
    createPollBtn.addEventListener('click', createPoll);
    copyVoteBtn.addEventListener('click', () => copyToClipboard(voteLink.textContent, copyVoteBtn));
    copyResultBtn.addEventListener('click', () => copyToClipboard(resultLink.textContent, copyResultBtn));
    viewPollBtn.addEventListener('click', () => window.location.href = voteLink.textContent);
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

document.addEventListener('DOMContentLoaded', init);
