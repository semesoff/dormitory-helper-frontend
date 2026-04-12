let config = { backend_address: 'http://localhost:8081' };
let authState = { token: '', user: null, isAdmin: false };
let currentBookingType = 'laundry';
let remindersInterval = null;

const sections = {
    laundry: document.getElementById('laundry-section'),
    kitchen: document.getElementById('kitchen-section'),
    repairs: document.getElementById('repairs-section'),
    exchange: document.getElementById('exchange-section'),
    announcements: document.getElementById('announcements-section'),
    reminders: document.getElementById('reminders-section'),
    polls: document.getElementById('polls-section'),
    faq: document.getElementById('faq-section'),
    analytics: document.getElementById('analytics-section'),
    'admin-panel': document.getElementById('admin-panel-section'),
};

const repairCategoryNames = { plumbing: 'Сантехника', electrical: 'Электрика', furniture: 'Мебель', heating: 'Отопление', windows: 'Окна/Двери', other: 'Другое' };
const exchangeCategoryNames = { electronics: 'Электроника', furniture: 'Мебель', books: 'Книги', clothes: 'Одежда', kitchenware: 'Посуда', sports: 'Спорт', other: 'Другое' };
const exchangeTypeNames = { give: 'Отдам даром', exchange: 'Обмен', sell: 'Продам' };
const priorityNames = { high: 'Важно', medium: 'Средний', low: 'Информация' };
const faqTopicNames = { rules: 'Правила проживания', laundry: 'Прачечная и кухня', repairs: 'Ремонт', payments: 'Оплата', contacts: 'Контакты', guests: 'Гости' };

document.addEventListener('DOMContentLoaded', () => {
    boot().catch(error => {
        console.error(error);
        showToast(error.message || 'Не удалось запустить приложение', 'error', 5000);
        document.getElementById('loading-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
    });
});

async function boot() {
    await loadConfig();
    await restoreSession();
    bindNavigation();
    bindBookingForm();
    bindRepairForm();
    bindExchangeForm();
    bindAdminAuth();
    bindPollForm();
    bindFAQ();
    bindAdminPanel();
    updateHeader();
    document.getElementById('loading-page').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
    await loadFAQQuickTopics();
    await loadSection('laundry');
    startReminderPolling();
}

async function loadConfig() {
    try {
        const response = await fetch('config.json', { cache: 'no-store' });
        if (response.ok) config = await response.json();
    } catch (error) {
        console.warn('config.json unavailable', error);
    }
}

function getOrCreateDeviceID() {
    let deviceID = localStorage.getItem('device-id');
    if (!deviceID) {
        deviceID = 'web-' + Math.random().toString(36).slice(2, 12);
        localStorage.setItem('device-id', deviceID);
    }
    return deviceID;
}

async function ensureStudentSession() {
    const payload = await request('/api/v1/auth/session', {
        method: 'POST',
        body: { device_id: getOrCreateDeviceID() }
    }, false);
    setAuth(payload.access_token, payload.user);
    localStorage.setItem('session-role', 'student');
}

async function restoreSession() {
    const savedToken = localStorage.getItem('access-token') || '';
    const savedRole = localStorage.getItem('session-role') || 'student';

    if (savedToken) {
        try {
            authState.token = savedToken;
            const user = await request('/api/v1/auth/me');
            setAuth(savedToken, user);
            localStorage.setItem('session-role', user.role || savedRole);
            return;
        } catch (error) {
            localStorage.removeItem('access-token');
        }
    }

    if (savedRole === 'admin') {
        localStorage.setItem('session-role', 'student');
    }
    await ensureStudentSession();
}

function setAuth(token, user) {
    authState.token = token;
    authState.user = user;
    authState.isAdmin = user.role === 'admin';
    localStorage.setItem('access-token', token);
}

async function request(path, options = {}, withAuth = true) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (withAuth && authState.token) headers.Authorization = 'Bearer ' + authState.token;
    const response = await fetch(config.backend_address + path, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

function ensureObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function updateHeader() {
    document.getElementById('username-display').textContent = authState.user ? authState.user.username : '-';
    document.getElementById('admin-badge').classList.toggle('hidden', !authState.isAdmin);
    document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', !authState.isAdmin));
    const btn = document.getElementById('admin-login-btn');
    btn.textContent = authState.isAdmin ? '🚪' : '🔑';
    btn.title = authState.isAdmin ? 'Выйти из админки' : 'Войти как администратор';
}

function bindNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const target = e.currentTarget.dataset.target;
            if (!target) return;
            document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
            e.currentTarget.classList.add('active');
            await loadSection(target);
        });
    });
}

async function loadSection(target) {
    Object.values(sections).forEach(section => section && section.classList.add('hidden'));
    if (sections[target]) sections[target].classList.remove('hidden');

    if (target === 'laundry' || target === 'kitchen') return loadBookings(target);
    if (target === 'repairs') return loadRepairs();
    if (target === 'exchange') return loadExchange();
    if (target === 'announcements') return loadAnnouncements();
    if (target === 'reminders') return loadReminders();
    if (target === 'polls') return loadPolls();
    if (target === 'faq') return resetFAQ();
    if (target === 'analytics') return loadAnalytics();
    if (target === 'admin-panel') return loadAdminPanel();
}

function bindBookingForm() {
    document.getElementById('create-laundry-btn').addEventListener('click', () => openBookingModal('laundry'));
    document.getElementById('create-kitchen-btn').addEventListener('click', () => openBookingModal('kitchen'));
    document.getElementById('cancel-booking-btn').addEventListener('click', closeBookingModal);
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await request('/api/v1/bookings', {
                method: 'POST',
                body: {
                    resource_type: currentBookingType,
                    start_at: new Date(document.getElementById('start-time').value).toISOString(),
                    end_at: new Date(document.getElementById('end-time').value).toISOString()
                }
            });
            showToast('Бронирование создано', 'success');
            closeBookingModal();
            await loadBookings(currentBookingType);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

function openBookingModal(type) {
    currentBookingType = type;
    document.getElementById('modal-title').textContent = type === 'laundry'
        ? 'Создать бронирование прачечной (макс. 2 часа)'
        : 'Создать бронирование кухни (макс. 3 часа)';
    const now = new Date();
    now.setMinutes(0, 0, 0);
    document.getElementById('start-time').value = formatInputDate(new Date(now.getTime() + 60 * 60 * 1000));
    document.getElementById('end-time').value = formatInputDate(new Date(now.getTime() + 3 * 60 * 60 * 1000));
    document.getElementById('booking-modal').classList.remove('hidden');
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.add('hidden');
    document.getElementById('booking-form').reset();
}

async function loadBookings(type) {
    let [mine, all] = await Promise.all([
        request('/api/v1/bookings/my?resource_type=' + type),
        request('/api/v1/bookings?resource_type=' + type)
    ]);
    mine = ensureArray(mine);
    all = ensureArray(all);
    renderBookings(type, mine, all);
}

function renderBookings(type, mine, all) {
    document.getElementById('my-' + type + '-bookings').innerHTML = mine.length
        ? mine.map(item => bookingCard(item, true, type)).join('')
        : '<div class="empty-message">У вас нет бронирований</div>';
    document.getElementById('all-' + type + '-bookings').innerHTML = all.length
        ? all.map(item => bookingCard(item, item.user_id === authState.user.id, type)).join('')
        : '<div class="empty-message">Нет бронирований</div>';
    document.querySelectorAll('[data-booking-id]').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await request('/api/v1/bookings/' + button.dataset.bookingId, { method: 'DELETE' });
                showToast('Бронирование удалено', 'success');
                await loadBookings(button.dataset.bookingType);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

function bookingCard(item, mine, type) {
    return `<div class="booking-card ${mine ? 'my-booking' : ''}">
        <div class="booking-time"><strong>Начало:</strong> ${formatDate(item.start_at)}</div>
        <div class="booking-time"><strong>Конец:</strong> ${formatDate(item.end_at)}</div>
        ${mine ? `<div class="booking-actions"><button class="btn-danger" data-booking-id="${item.id}" data-booking-type="${type}">Удалить</button></div>` : ''}
    </div>`;
}

function bindRepairForm() {
    document.getElementById('create-repair-btn').addEventListener('click', () => document.getElementById('repair-modal').classList.remove('hidden'));
    document.getElementById('cancel-repair-btn').addEventListener('click', () => {
        document.getElementById('repair-modal').classList.add('hidden');
        document.getElementById('repair-form').reset();
    });
    document.getElementById('repair-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await request('/api/v1/repairs', {
                method: 'POST',
                body: {
                    location: document.getElementById('repair-location').value,
                    category: document.getElementById('repair-category').value,
                    description: document.getElementById('repair-description').value
                }
            });
            document.getElementById('repair-modal').classList.add('hidden');
            document.getElementById('repair-form').reset();
            showToast('Заявка создана', 'success');
            await loadRepairs();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

async function loadRepairs() {
    let [mine, all] = await Promise.all([request('/api/v1/repairs/my'), request('/api/v1/repairs')]);
    mine = ensureArray(mine);
    all = ensureArray(all);
    renderRepairs('my-repairs', mine, true);
    renderRepairs('all-repairs', all, false);
}

function renderRepairs(containerId, items, mineOnly) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.length ? items.map(item => {
        const mine = item.user_id === authState.user.id;
        const actions = mine
            ? `<button class="btn-danger" data-repair-delete="${item.id}">Удалить</button>`
            : '';
        return `<div class="repair-card ${mine ? 'my-repair' : ''}">
            <div class="repair-info"><strong>Место:</strong> ${escapeHtml(item.location)}</div>
            <div class="repair-info"><strong>Категория:</strong> ${escapeHtml(repairCategoryNames[item.category] || item.category)}</div>
            <div class="repair-info"><strong>Статус:</strong> <span class="repair-status ${item.status}">${escapeHtml(item.status)}</span></div>
            <div class="repair-description">${escapeHtml(item.description)}</div>
            <div class="repair-date">${formatDate(item.created_at)}</div>
            ${actions ? `<div class="booking-actions">${actions}</div>` : ''}
        </div>`;
    }).join('') : `<div class="empty-message">${mineOnly ? 'У вас нет заявок на ремонт' : 'Нет заявок на ремонт'}</div>`;

    container.querySelectorAll('[data-repair-delete]').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await request('/api/v1/repairs/' + button.dataset.repairDelete, { method: 'DELETE' });
                showToast('Заявка удалена', 'success');
                await loadRepairs();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

function bindExchangeForm() {
    document.getElementById('create-exchange-btn').addEventListener('click', () => document.getElementById('exchange-modal').classList.remove('hidden'));
    document.getElementById('cancel-exchange-btn').addEventListener('click', () => {
        document.getElementById('exchange-modal').classList.add('hidden');
        document.getElementById('exchange-form').reset();
    });
    document.getElementById('exchange-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await request('/api/v1/exchange', {
                method: 'POST',
                body: {
                    title: document.getElementById('exchange-title').value,
                    category: document.getElementById('exchange-category').value,
                    type: document.getElementById('exchange-type').value,
                    description: document.getElementById('exchange-description').value,
                    contact: '@' + authState.user.username
                }
            });
            document.getElementById('exchange-modal').classList.add('hidden');
            document.getElementById('exchange-form').reset();
            showToast('Объявление добавлено', 'success');
            await loadExchange();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

async function loadExchange() {
    const items = ensureArray(await request('/api/v1/exchange'));
    const container = document.getElementById('exchange-list');
    container.innerHTML = items.length ? items.map(item => {
        const mine = authState.isAdmin || item.user_id === authState.user.id;
        return `<div class="exchange-card ${mine ? 'my-exchange' : ''}">
            <div class="exchange-type-badge ${item.type}">${escapeHtml(exchangeTypeNames[item.type] || item.type)}</div>
            <div class="exchange-title">${escapeHtml(item.title)}</div>
            <div class="exchange-info"><strong>Категория:</strong> ${escapeHtml(exchangeCategoryNames[item.category] || item.category)}</div>
            <div class="exchange-description">${escapeHtml(item.description)}</div>
            <div class="exchange-info"><strong>Контакт:</strong> ${escapeHtml(item.contact || 'не указан')}</div>
            <div class="exchange-date">${formatDate(item.created_at)}</div>
            ${mine ? `<div class="booking-actions"><button class="btn-danger" data-exchange-delete="${item.id}">Удалить</button></div>` : ''}
        </div>`;
    }).join('') : '<div class="empty-message">Нет объявлений</div>';

    container.querySelectorAll('[data-exchange-delete]').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await request('/api/v1/exchange/' + button.dataset.exchangeDelete, { method: 'DELETE' });
                showToast('Объявление удалено', 'success');
                await loadExchange();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

async function loadAnnouncements() {
    const items = ensureArray(await request('/api/v1/announcements'));
    document.getElementById('announcements-list').innerHTML = items.length ? items.map(item => `<div class="announcement-card ${item.priority}">
        <div class="announcement-priority">${escapeHtml(priorityNames[item.priority] || item.priority)}</div>
        <div class="announcement-title">${escapeHtml(item.title)}</div>
        <div class="announcement-content">${escapeHtml(item.content)}</div>
        <div class="announcement-date">${formatDate(item.created_at)}</div>
    </div>`).join('') : '<div class="empty-message">Нет объявлений</div>';
}

function bindAdminAuth() {
    const loginBtn = document.getElementById('admin-login-btn');
    const modal = document.getElementById('admin-login-modal');
    const form = document.getElementById('admin-login-form');
    const cancel = document.getElementById('cancel-admin-login-btn');
    const logout = document.getElementById('admin-logout-btn');

    loginBtn.addEventListener('click', () => {
        if (authState.isAdmin) {
            logoutAdmin();
        } else {
            modal.classList.remove('hidden');
        }
    });

    cancel.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const payload = await request('/api/v1/auth/login', {
                method: 'POST',
                body: { username: 'admin', password: document.getElementById('admin-password').value }
            }, false);
            setAuth(payload.access_token, payload.user);
            localStorage.setItem('session-role', 'admin');
            modal.classList.add('hidden');
            form.reset();
            updateHeader();
            showToast('Вы вошли как администратор', 'success');
        } catch (error) {
            showToast('Неверный пароль', 'error');
        }
    });

    logout.addEventListener('click', logoutAdmin);
}

async function logoutAdmin() {
    await ensureStudentSession();
    updateHeader();
    document.querySelector('.nav-link[data-target="laundry"]').click();
    showToast('Вы вышли из режима администратора', 'info');
}

function startReminderPolling() {
    if (remindersInterval) clearInterval(remindersInterval);
    remindersInterval = setInterval(() => {
        if (!sections.reminders.classList.contains('hidden')) {
            loadReminders().catch(error => console.error(error));
        }
    }, 30000);

    ['reminder-bookings', 'reminder-repairs', 'reminder-polls'].forEach(id => {
        document.getElementById(id).addEventListener('change', saveReminderSettings);
    });
}

async function saveReminderSettings() {
    try {
        await request('/api/v1/notification-settings', {
            method: 'PUT',
            body: {
                bookings_enabled: document.getElementById('reminder-bookings').checked,
                repairs_enabled: document.getElementById('reminder-repairs').checked,
                polls_enabled: document.getElementById('reminder-polls').checked
            }
        });
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadReminders() {
    let [settings, items] = await Promise.all([
        request('/api/v1/notification-settings'),
        request('/api/v1/notifications')
    ]);
    settings = ensureObject(settings);
    items = ensureArray(items);
    document.getElementById('reminder-bookings').checked = settings.bookings_enabled !== false;
    document.getElementById('reminder-repairs').checked = settings.repairs_enabled !== false;
    document.getElementById('reminder-polls').checked = settings.polls_enabled !== false;

    const container = document.getElementById('reminders-list');
    container.innerHTML = items.length ? items.map(item => `<div class="reminder-card priority-${priorityForNotification(item.type)}">
        <div class="reminder-content">
            <div class="reminder-title">${escapeHtml(item.title)}</div>
            <div class="reminder-message">${escapeHtml(item.message)}</div>
            <div class="announcement-date">${formatDate(item.created_at)}</div>
        </div>
        ${item.is_read ? '' : `<div class="booking-actions"><button class="btn-secondary" data-notification-read="${item.id}">Прочитано</button></div>`}
    </div>`).join('') : '<div class="empty-message">Нет активных напоминаний. Всё спокойно!</div>';

    container.querySelectorAll('[data-notification-read]').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await request('/api/v1/notifications/' + button.dataset.notificationRead + '/read', { method: 'PATCH' });
                await loadReminders();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

function priorityForNotification(type) {
    if (type === 'poll') return 'high';
    if (type === 'repair') return 'medium';
    return 'low';
}

function bindPollForm() {
    const modal = document.getElementById('poll-modal');
    const form = document.getElementById('poll-form');
    const optionsContainer = document.getElementById('poll-options-container');

    document.getElementById('create-poll-btn').addEventListener('click', () => {
        document.getElementById('poll-end-date').value = formatInputDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        modal.classList.remove('hidden');
    });

    document.getElementById('cancel-poll-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
        resetPollOptions();
    });

    document.getElementById('add-poll-option-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'poll-option-input';
        input.placeholder = 'Вариант ' + (optionsContainer.querySelectorAll('.poll-option-input').length + 1);
        input.required = true;
        optionsContainer.appendChild(input);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const options = Array.from(optionsContainer.querySelectorAll('.poll-option-input')).map(input => input.value.trim()).filter(Boolean);
        if (options.length < 2) {
            showToast('Нужно минимум 2 варианта ответа', 'error');
            return;
        }
        try {
            await request('/api/v1/admin/polls', {
                method: 'POST',
                body: {
                    title: document.getElementById('poll-title').value,
                    anonymous: document.getElementById('poll-anonymous').checked,
                    end_at: new Date(document.getElementById('poll-end-date').value).toISOString(),
                    options
                }
            });
            modal.classList.add('hidden');
            form.reset();
            resetPollOptions();
            showToast('Голосование создано', 'success');
            await loadPolls();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

function resetPollOptions() {
    document.getElementById('poll-options-container').innerHTML = '<input type="text" class="poll-option-input" placeholder="Вариант 1" required><input type="text" class="poll-option-input" placeholder="Вариант 2" required>';
}

async function loadPolls() {
    const items = ensureArray(await request('/api/v1/polls'));
    const container = document.getElementById('polls-list');
    container.innerHTML = items.length ? items.map(item => {
        const totalVotes = item.total_votes || item.options.reduce((sum, option) => sum + option.votes, 0);
        return `<div class="poll-card ${item.status === 'active' ? 'active' : 'closed'}">
            <div class="poll-header">
                <div class="poll-title">${escapeHtml(item.title)}</div>
                <span class="poll-status-badge ${item.status}">${item.status === 'active' ? 'Активно' : 'Завершено'}</span>
            </div>
            <div class="poll-meta">Голосов: ${totalVotes} | ${item.anonymous ? 'Анонимное' : 'Открытое'} | До: ${formatDate(item.end_at)}</div>
            <div class="poll-options">${item.options.map(option => {
                const percent = totalVotes ? Math.round(option.votes / totalVotes * 100) : 0;
                const voteable = item.status === 'active' && !item.has_voted;
                return `<div class="poll-option ${voteable ? 'voteable' : ''}" data-poll-id="${item.id}" data-option-id="${option.id}">
                    <div class="poll-option-bar" style="width: ${percent}%"></div>
                    <div class="poll-option-content"><span class="poll-option-text">${escapeHtml(option.text)}</span><span class="poll-option-votes">${option.votes} (${percent}%)</span></div>
                </div>`;
            }).join('')}</div>
            ${item.has_voted ? '<div class="poll-voted-label">Вы уже проголосовали</div>' : ''}
            ${authState.isAdmin ? `<div class="poll-actions"><button class="btn-danger btn-sm" data-poll-delete="${item.id}">Удалить</button></div>` : ''}
        </div>`;
    }).join('') : '<div class="empty-message">Нет голосований</div>';

    container.querySelectorAll('.poll-option.voteable').forEach(node => {
        node.addEventListener('click', async () => {
            try {
                await request('/api/v1/polls/' + node.dataset.pollId + '/vote', { method: 'POST', body: { option_id: Number(node.dataset.optionId) } });
                showToast('Ваш голос учтён', 'success');
                await loadPolls();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });

    container.querySelectorAll('[data-poll-delete]').forEach(node => {
        node.addEventListener('click', async () => {
            try {
                await request('/api/v1/admin/polls/' + node.dataset.pollDelete, { method: 'DELETE' });
                showToast('Голосование удалено', 'success');
                await loadPolls();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

function bindFAQ() {
    const input = document.getElementById('faq-input');
    document.getElementById('faq-send-btn').addEventListener('click', () => askFAQ(input));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askFAQ(input);
    });
}

async function loadFAQQuickTopics() {
    const container = document.querySelector('.faq-quick-topics');
    if (!container) return;
    try {
        const items = ensureArray(await request('/api/v1/faq/keywords'));
        if (!items.length) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = items.map(item => `<button class="faq-topic-btn" data-topic="${escapeHtml(item.topic)}">${escapeHtml(item.keyword || item.topic)}</button>`).join('');
        container.querySelectorAll('.faq-topic-btn').forEach(btn => {
            btn.addEventListener('click', () => loadFAQTopic(btn.dataset.topic));
        });
    } catch (error) {
        console.error('Failed to load FAQ keywords', error);
    }
}

function resetFAQ() {
    document.getElementById('faq-chat').innerHTML = '<div class="faq-message bot-message"><div class="faq-avatar">🤖</div><div class="faq-bubble">Здравствуйте! Я FAQ-бот общежития. Задайте мне вопрос или выберите тему ниже.</div></div>';
}

async function askFAQ(input) {
    const question = input.value.trim();
    if (!question) return;
    input.value = '';
    const chat = document.getElementById('faq-chat');
    chat.innerHTML += '<div class="faq-message user-message"><div class="faq-bubble">' + escapeHtml(question) + '</div><div class="faq-avatar">👤</div></div>';
    try {
        const items = ensureArray(await request('/api/v1/faq/search?q=' + encodeURIComponent(question)));
        const answer = items.length ? items[0].answer : 'К сожалению, я не нашёл точного ответа на ваш вопрос.';
        chat.innerHTML += '<div class="faq-message bot-message"><div class="faq-avatar">🤖</div><div class="faq-bubble">' + escapeHtml(answer) + '</div></div>';
        chat.scrollTop = chat.scrollHeight;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadFAQTopic(topic) {
    const chat = document.getElementById('faq-chat');
    chat.innerHTML += '<div class="faq-message user-message"><div class="faq-bubble">Тема: ' + escapeHtml(faqTopicNames[topic] || topic) + '</div><div class="faq-avatar">👤</div></div>';
    try {
        const items = ensureArray(await request('/api/v1/faq/topics/' + topic));
        const answer = items.length
            ? '<strong>' + escapeHtml(faqTopicNames[topic] || topic) + '</strong><br><br>' + items.map(item => '<strong>• ' + escapeHtml(item.question) + '</strong><br>' + escapeHtml(item.answer)).join('<br><br>')
            : 'По этой теме пока нет информации.';
        chat.innerHTML += '<div class="faq-message bot-message"><div class="faq-avatar">🤖</div><div class="faq-bubble">' + answer + '</div></div>';
        chat.scrollTop = chat.scrollHeight;
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAnalytics() {
    let [summary, charts] = await Promise.all([
        request('/api/v1/admin/analytics/summary'),
        request('/api/v1/admin/analytics/charts')
    ]);
    summary = ensureObject(summary);
    charts = ensureObject(charts);
    document.getElementById('stat-laundry').textContent = summary.laundry_bookings ?? 0;
    document.getElementById('stat-kitchen').textContent = summary.kitchen_bookings ?? 0;
    document.getElementById('stat-repairs').textContent = summary.repairs ?? 0;
    document.getElementById('stat-exchange').textContent = summary.exchange_items ?? 0;
    document.getElementById('stat-polls').textContent = summary.polls ?? 0;
    document.getElementById('stat-users').textContent = summary.users ?? 0;
    renderBarChart('repairs-chart', ensureArray(charts.repair_statuses), ['#f59e0b', '#6366f1', '#10b981', '#ef4444']);
    renderBarChart('exchange-chart', ensureArray(charts.exchange_types), ['#10b981', '#6366f1', '#f59e0b']);
    renderBarChart('activity-chart', ensureArray(charts.weekly_activity), ['#6366f1', '#818cf8', '#6366f1', '#818cf8', '#6366f1', '#ec4899', '#ec4899']);
    renderBarChart('polls-chart', ensureArray(charts.active_polls), ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444']);
}

function renderBarChart(containerId, items, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!items || !items.length) {
        container.innerHTML = '<div class="empty-message">Нет данных</div>';
        return;
    }
    const max = Math.max(...items.map(item => item.value), 1);
    container.innerHTML = items.map((item, index) => {
        const height = Math.max((item.value / max) * 100, 5);
        return `<div class="bar-item"><div class="bar-value">${item.value}</div><div class="bar" style="height: ${height}%; background: ${colors[index % colors.length]};"></div><div class="bar-label">${escapeHtml(item.label)}</div></div>`;
    }).join('');
}

function bindAdminPanel() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.add('hidden'));
            const target = document.getElementById(this.dataset.adminTab + '-tab');
            if (target) target.classList.remove('hidden');
        });
    });

    document.getElementById('faq-admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await request('/api/v1/admin/faq', {
                method: 'POST',
                body: {
                    topic: document.getElementById('faq-admin-topic').value,
                    keywords: document.getElementById('faq-admin-keywords').value.split(',').map(item => item.trim().toLowerCase()).filter(Boolean),
                    question: document.getElementById('faq-admin-question').value,
                    answer: document.getElementById('faq-admin-answer').value
                }
            });
            e.target.reset();
            showToast('Вопрос добавлен в базу знаний', 'success');
            await loadAdminFAQList();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    document.getElementById('announcement-admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await request('/api/v1/admin/announcements', {
                method: 'POST',
                body: {
                    title: document.getElementById('announcement-admin-title').value,
                    content: document.getElementById('announcement-admin-content').value,
                    priority: document.getElementById('announcement-admin-priority').value
                }
            });
            e.target.reset();
            showToast('Объявление опубликовано', 'success');
            await loadAnnouncements();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

async function loadAdminPanel() {
    await Promise.all([loadAdminFAQList(), loadAdminRepairsList()]);
}

async function loadAdminFAQList() {
    const items = ensureArray(await request('/api/v1/admin/faq'));
    const container = document.getElementById('faq-admin-list');
    container.innerHTML = items.map(item => `<div class="admin-faq-item">
        <div class="admin-faq-topic">${escapeHtml(faqTopicNames[item.topic] || item.topic)}</div>
        <div class="admin-faq-question">${escapeHtml(item.question)}</div>
        <div class="admin-faq-answer">${escapeHtml(item.answer.slice(0, 100))}...</div>
        <button class="btn-danger btn-sm" data-faq-delete="${item.id}">Удалить</button>
    </div>`).join('');
    container.querySelectorAll('[data-faq-delete]').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                await request('/api/v1/admin/faq/' + button.dataset.faqDelete, { method: 'DELETE' });
                showToast('Удалено из базы знаний', 'success');
                await loadAdminFAQList();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

async function loadAdminRepairsList() {
    const items = ensureArray(await request('/api/v1/repairs'));
    const container = document.getElementById('admin-repairs-list');
    container.innerHTML = items.map(item => `<div class="admin-repair-item">
        <div class="repair-info"><strong>${escapeHtml(item.location)}</strong> — ${escapeHtml(repairCategoryNames[item.category] || item.category)}</div>
        <div class="repair-description">${escapeHtml(item.description)}</div>
        <div class="admin-repair-controls">
            <span class="repair-status ${item.status}">${escapeHtml(item.status)}</span>
            <select class="admin-status-select" data-repair-status="${item.id}">
                <option value="pending"${item.status === 'pending' ? ' selected' : ''}>Ожидает</option>
                <option value="in_progress"${item.status === 'in_progress' ? ' selected' : ''}>В работе</option>
                <option value="completed"${item.status === 'completed' ? ' selected' : ''}>Выполнено</option>
                <option value="rejected"${item.status === 'rejected' ? ' selected' : ''}>Отклонено</option>
            </select>
        </div>
    </div>`).join('');
    container.querySelectorAll('[data-repair-status]').forEach(select => {
        select.addEventListener('change', async () => {
            try {
                await request('/api/v1/admin/repairs/' + select.dataset.repairStatus + '/status', {
                    method: 'PATCH',
                    body: { status: select.value }
                });
                showToast('Статус заявки обновлён', 'success');
                await loadAdminRepairsList();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

function formatInputDate(value) {
    const date = new Date(value);
    const pad = number => String(number).padStart(2, '0');
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(value) {
    const node = document.createElement('div');
    node.textContent = value;
    return node.innerHTML;
}

function showToast(message, type = 'error', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { error: '❌', success: '✅', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div class="toast-icon">${icons[type] || icons.info}</div><div class="toast-message">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.parentNode && toast.parentNode.removeChild(toast), 300);
    }, duration);
}
