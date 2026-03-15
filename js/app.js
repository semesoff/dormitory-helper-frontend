// Configuration and state
let config = {};
let userId = 0;
let username = '';
let currentBookingType = '';
let isAdmin = false;
const ADMIN_PASSWORD = 'admin123';

// Initialize user from localStorage or create new
function initializeUser() {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
        // Generate random user ID between 100 and 999
        storedUserId = Math.floor(Math.random() * 900) + 100;
        localStorage.setItem('userId', storedUserId.toString());
    }
    userId = parseInt(storedUserId);
    username = 'Пользователь';
    return { userId, username };
}

// Helper function to always get fresh token from localStorage
function getToken() {
    return localStorage.getItem('access-token') || '';
}

// Toast notification function
function showToast(message, type = 'error', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        error: '❌',
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, duration);
}

// DOM elements
const loadingPage = document.getElementById('loading-page');
const mainPage = document.getElementById('main-page');
const usernameDisplay = document.getElementById('username-display');
const navLinks = document.querySelectorAll('.nav-link');
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

// Booking modal
const bookingModal = document.getElementById('booking-modal');
const bookingForm = document.getElementById('booking-form');
const modalTitle = document.getElementById('modal-title');
const cancelBookingBtn = document.getElementById('cancel-booking-btn');
const createLaundryBtn = document.getElementById('create-laundry-btn');
const createKitchenBtn = document.getElementById('create-kitchen-btn');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize user
    const user = initializeUser();
    userId = user.userId;
    username = user.username;

    // Check admin state
    isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Show main page immediately
    showMainPage();

    // Initialize all modules with default data
    initializeAllModules();

    // Setup admin UI
    updateAdminUI();

    // Setup new modules
    setupAdminLogin();
    setupPolls();
    setupFAQBot();
    setupAdminPanel();
    setupReminders();
});

// Initialize all modules with default data
function initializeAllModules() {
    initializeLaundryData();
    initializeKitchenData();
    initializeRepairsData();
    initializeExchangeData();
    initializeAnnouncementsData();
    initializePollsData();
    initializeFAQData();

    // Load laundry data on start
    loadLaundryData();
}

// Show main page
function showMainPage() {
    loadingPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    usernameDisplay.textContent = username;
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.dataset.target;
        if (!target) return;

        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.classList.add('active');

        Object.values(sections).forEach(section => {
            if (section) section.classList.add('hidden');
        });
        if (sections[target]) sections[target].classList.remove('hidden');

        if (target === 'laundry') {
            loadLaundryData();
        } else if (target === 'kitchen') {
            loadKitchenData();
        } else if (target === 'repairs') {
            loadRepairsData();
        } else if (target === 'exchange') {
            loadExchangeData();
        } else if (target === 'announcements') {
            loadAnnouncementsData();
        } else if (target === 'reminders') {
            loadReminders();
        } else if (target === 'polls') {
            loadPollsData();
        } else if (target === 'analytics') {
            loadAnalyticsData();
        } else if (target === 'admin-panel') {
            loadAdminPanel();
        }
    });
});

// Initialize laundry data with defaults
function initializeLaundryData() {
    const existing = localStorage.getItem('laundry');
    if (!existing) {
        const now = new Date();
        const defaultLaundry = [
            {
                id: 1,
                user_id: 101,
                start_time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                user_id: 205,
                start_time: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(now.getTime() + 6.5 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('laundry', JSON.stringify(defaultLaundry));
        localStorage.setItem('laundryNextId', '3');
    }
}

// Load laundry data
function loadLaundryData() {
    initializeLaundryData();
    const bookings = JSON.parse(localStorage.getItem('laundry') || '[]');

    const myBookings = bookings.filter(b => b.user_id === userId);
    const allBookings = bookings;

    displayBookings('laundry', myBookings, allBookings);
}

// Initialize kitchen data with defaults
function initializeKitchenData() {
    const existing = localStorage.getItem('kitchen');
    if (!existing) {
        const now = new Date();
        const defaultKitchen = [
            {
                id: 1,
                user_id: 150,
                start_time: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                user_id: 220,
                start_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
                end_time: new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('kitchen', JSON.stringify(defaultKitchen));
        localStorage.setItem('kitchenNextId', '3');
    }
}

// Load kitchen data
function loadKitchenData() {
    initializeKitchenData();
    const bookings = JSON.parse(localStorage.getItem('kitchen') || '[]');

    const myBookings = bookings.filter(b => b.user_id === userId);
    const allBookings = bookings;

    displayBookings('kitchen', myBookings, allBookings);
}

// Display bookings
function displayBookings(type, myBookings, allBookings) {
    const myContainer = document.getElementById('my-' + type + '-bookings');
    const allContainer = document.getElementById('all-' + type + '-bookings');

    console.log('Displaying bookings for', type);
    console.log('My bookings:', myBookings);
    console.log('All bookings:', allBookings);

    // Display my bookings
    if (myBookings.length === 0) {
        myContainer.innerHTML = '<div class="empty-message">У вас нет бронирований</div>';
    } else {
        myContainer.innerHTML = myBookings.map(booking => createBookingCard(booking, true, type)).join('');
    }

    // Display all bookings
    if (allBookings.length === 0) {
        allContainer.innerHTML = '<div class="empty-message">Нет бронирований</div>';
    } else {
        allContainer.innerHTML = allBookings.map(booking => createBookingCard(booking, false, type)).join('');
    }

    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-danger[data-booking-id]').forEach(button => {
        button.addEventListener('click', function () {
            const bookingId = parseInt(this.getAttribute('data-booking-id'));
            const bookingType = this.getAttribute('data-booking-type');
            deleteBooking(bookingId, bookingType);
        });
    });
}

// Create booking card HTML
function createBookingCard(booking, isMine, type) {
    // Handle both snake_case and camelCase from API
    const startTimeStr = booking.start_time || booking.startTime;
    const endTimeStr = booking.end_time || booking.endTime;
    const userId = booking.user_id || booking.userId;

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    const formatDate = (date) => {
        if (!date || isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const deleteButton = isMine
        ? '<button class="btn-danger" data-booking-id="' + booking.id + '" data-booking-type="' + type + '">🗑️ Удалить</button>'
        : '';

    return '<div class="booking-card ' + (isMine ? 'my-booking' : '') + '">' +
        '<div class="booking-time"><strong>Начало:</strong> ' + formatDate(startTime) + '</div>' +
        '<div class="booking-time"><strong>Конец:</strong> ' + formatDate(endTime) + '</div>' +
        (deleteButton ? '<div class="booking-actions">' + deleteButton + '</div>' : '') +
        '</div>';
}

// Delete booking
function deleteBooking(bookingId, type) {
    const bookings = JSON.parse(localStorage.getItem(type) || '[]');
    const filtered = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem(type, JSON.stringify(filtered));

    showToast('Бронирование успешно удалено', 'success');

    // Reload data
    if (type === 'laundry') {
        loadLaundryData();
    } else {
        loadKitchenData();
    }
}

// Make deleteBooking available globally
window.deleteBooking = deleteBooking;

// Create booking button handlers
createLaundryBtn.addEventListener('click', () => {
    currentBookingType = 'laundry';
    modalTitle.textContent = 'Создать бронирование прачечной (макс. 2 часа)';
    showBookingModal();
});

createKitchenBtn.addEventListener('click', () => {
    currentBookingType = 'kitchen';
    modalTitle.textContent = 'Создать бронирование кухни (макс. 3 часа)';
    showBookingModal();
});

// Show booking modal
function showBookingModal() {
    // Set default times
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    document.getElementById('start-time').value = formatDateTimeLocal(startTime);
    document.getElementById('end-time').value = formatDateTimeLocal(endTime);

    bookingModal.classList.remove('hidden');
}

// Hide booking modal
function hideBookingModal() {
    bookingModal.classList.add('hidden');
    bookingForm.reset();
}

cancelBookingBtn.addEventListener('click', hideBookingModal);

// Format date for datetime-local input
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}

// Handle booking form submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const startTime = new Date(document.getElementById('start-time').value);
    const endTime = new Date(document.getElementById('end-time').value);

    // Validate times
    if (startTime >= endTime) {
        showToast('Время начала должно быть раньше времени окончания', 'error');
        return;
    }

    const duration = (endTime - startTime) / (1000 * 60 * 60); // hours
    const maxDuration = currentBookingType === 'laundry' ? 2 : 3;

    if (duration > maxDuration) {
        showToast('Максимальная длительность бронирования: ' + maxDuration + ' часа', 'error');
        return;
    }

    // Get bookings from localStorage
    const bookings = JSON.parse(localStorage.getItem(currentBookingType) || '[]');
    const nextId = parseInt(localStorage.getItem(currentBookingType + 'NextId') || '1');

    // Create new booking
    const newBooking = {
        id: nextId,
        user_id: userId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
    };

    bookings.push(newBooking);
    localStorage.setItem(currentBookingType, JSON.stringify(bookings));
    localStorage.setItem(currentBookingType + 'NextId', (nextId + 1).toString());

    showToast('Бронирование создано!', 'success');

    hideBookingModal();

    // Reload data
    if (currentBookingType === 'laundry') {
        loadLaundryData();
    } else {
        loadKitchenData();
    }
});

// ============================================
// REPAIRS MODULE - Client-side storage
// ============================================

const repairModal = document.getElementById('repair-modal');
const repairForm = document.getElementById('repair-form');
const createRepairBtn = document.getElementById('create-repair-btn');
const cancelRepairBtn = document.getElementById('cancel-repair-btn');

// Category names mapping
const repairCategoryNames = {
    'plumbing': 'Сантехника',
    'electrical': 'Электрика',
    'furniture': 'Мебель',
    'heating': 'Отопление',
    'windows': 'Окна/Двери',
    'other': 'Другое'
};

// Initialize repairs data with defaults
function initializeRepairsData() {
    const existing = localStorage.getItem('repairs');
    if (!existing) {
        const defaultRepairs = [
            {
                id: 1,
                userId: 101,
                location: 'Комната 204',
                category: 'plumbing',
                description: 'Протекает кран в ванной комнате',
                status: 'in-progress',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                userId: 205,
                location: 'Комната 312',
                category: 'electrical',
                description: 'Не работает розетка возле кровати',
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                userId: 150,
                location: 'Комната 108',
                category: 'furniture',
                description: 'Сломана ножка у стола',
                status: 'completed',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('repairs', JSON.stringify(defaultRepairs));
        localStorage.setItem('repairsNextId', '4');
    }
}

// Load repairs data
function loadRepairsData() {
    initializeRepairsData();
    const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');

    const myRepairs = repairs.filter(r => r.userId === userId);
    const allRepairs = repairs;

    displayRepairs(myRepairs, allRepairs);
}

// Display repairs
function displayRepairs(myRepairs, allRepairs) {
    const myContainer = document.getElementById('my-repairs');
    const allContainer = document.getElementById('all-repairs');

    if (myRepairs.length === 0) {
        myContainer.innerHTML = '<div class="empty-message">У вас нет заявок на ремонт</div>';
    } else {
        myContainer.innerHTML = myRepairs.map(repair => createRepairCard(repair, true)).join('');
    }

    if (allRepairs.length === 0) {
        allContainer.innerHTML = '<div class="empty-message">Нет заявок на ремонт</div>';
    } else {
        allContainer.innerHTML = allRepairs.map(repair => createRepairCard(repair, false)).join('');
    }

    // Add delete event listeners
    document.querySelectorAll('.btn-danger[data-repair-id]').forEach(button => {
        button.addEventListener('click', function() {
            const repairId = parseInt(this.getAttribute('data-repair-id'));
            deleteRepair(repairId);
        });
    });
}

// Create repair card HTML
function createRepairCard(repair, isMine) {
    const statusNames = {
        'pending': 'Ожидает',
        'in-progress': 'В работе',
        'completed': 'Выполнено',
        'rejected': 'Отклонено'
    };

    const deleteButton = isMine
        ? '<button class="btn-danger" data-repair-id="' + repair.id + '">🗑️ Удалить</button>'
        : '';

    const createdDate = new Date(repair.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return '<div class="repair-card ' + (isMine ? 'my-repair' : '') + '">' +
        '<div class="repair-info"><strong>Место:</strong> ' + repair.location + '</div>' +
        '<div class="repair-info"><strong>Категория:</strong> ' + repairCategoryNames[repair.category] + '</div>' +
        '<div class="repair-info"><strong>Дата создания:</strong> ' + createdDate + '</div>' +
        '<div class="repair-info"><strong>Статус:</strong> <span class="repair-status ' + repair.status + '">' + statusNames[repair.status] + '</span></div>' +
        '<div class="repair-description">' + repair.description + '</div>' +
        (deleteButton ? '<div class="repair-actions">' + deleteButton + '</div>' : '') +
        '</div>';
}

// Show repair modal
createRepairBtn.addEventListener('click', () => {
    repairModal.classList.remove('hidden');
});

// Hide repair modal
function hideRepairModal() {
    repairModal.classList.add('hidden');
    repairForm.reset();
}

cancelRepairBtn.addEventListener('click', hideRepairModal);

// Submit repair form
repairForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const location = document.getElementById('repair-location').value;
    const category = document.getElementById('repair-category').value;
    const description = document.getElementById('repair-description').value;

    const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
    const nextId = parseInt(localStorage.getItem('repairsNextId') || '1');

    const newRepair = {
        id: nextId,
        userId: userId,
        location: location,
        category: category,
        description: description,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    repairs.push(newRepair);
    localStorage.setItem('repairs', JSON.stringify(repairs));
    localStorage.setItem('repairsNextId', (nextId + 1).toString());

    showToast('Заявка на ремонт создана!', 'success');
    hideRepairModal();
    loadRepairsData();
});

// Delete repair
function deleteRepair(repairId) {
    const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
    const filtered = repairs.filter(r => r.id !== repairId);
    localStorage.setItem('repairs', JSON.stringify(filtered));
    showToast('Заявка удалена', 'success');
    loadRepairsData();
}

// ============================================
// EXCHANGE MODULE - Client-side storage
// ============================================

const exchangeModal = document.getElementById('exchange-modal');
const exchangeForm = document.getElementById('exchange-form');
const createExchangeBtn = document.getElementById('create-exchange-btn');
const cancelExchangeBtn = document.getElementById('cancel-exchange-btn');

// Category names mapping
const exchangeCategoryNames = {
    'electronics': 'Электроника',
    'furniture': 'Мебель',
    'books': 'Книги',
    'clothes': 'Одежда',
    'kitchenware': 'Посуда',
    'sports': 'Спорт',
    'other': 'Другое'
};

const exchangeTypeNames = {
    'give': 'Отдам даром',
    'exchange': 'Обмен',
    'sell': 'Продам'
};

// Initialize exchange data with defaults
function initializeExchangeData() {
    const existing = localStorage.getItem('exchange');
    if (!existing) {
        const defaultExchange = [
            {
                id: 1,
                userId: 101,
                title: 'Настольная лампа',
                category: 'electronics',
                type: 'give',
                description: 'Рабочая настольная лампа, в хорошем состоянии. Больше не нужна.',
                contact: '',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                userId: 205,
                title: 'Учебники по математике',
                category: 'books',
                type: 'exchange',
                description: '3 учебника по высшей математике. Обменяю на учебники по программированию.',
                contact: '',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                userId: 150,
                title: 'Микроволновка',
                category: 'electronics',
                type: 'sell',
                description: 'Микроволновая печь Samsung, 20 литров. В отличном состоянии, продаю за 2000 руб.',
                contact: '',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                userId: 220,
                title: 'Теннисная ракетка',
                category: 'sports',
                type: 'give',
                description: 'Ракетка для настольного тенниса Wilson. Почти новая, отдам даром.',
                contact: '',
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('exchange', JSON.stringify(defaultExchange));
        localStorage.setItem('exchangeNextId', '5');
    }
}

// Load exchange data
function loadExchangeData() {
    initializeExchangeData();
    const items = JSON.parse(localStorage.getItem('exchange') || '[]');

    // Sort by date, newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    displayExchange(items);
}

// Display exchange items
function displayExchange(items) {
    const container = document.getElementById('exchange-list');

    if (items.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет объявлений об обмене</div>';
    } else {
        container.innerHTML = items.map(item => createExchangeCard(item)).join('');
    }

    // Add delete event listeners
    document.querySelectorAll('.btn-danger[data-exchange-id]').forEach(button => {
        button.addEventListener('click', function() {
            const exchangeId = parseInt(this.getAttribute('data-exchange-id'));
            deleteExchange(exchangeId);
        });
    });
}

// Create exchange card HTML
function createExchangeCard(item) {
    const isMine = item.userId === userId;

    const deleteButton = isMine
        ? '<button class="btn-danger" data-exchange-id="' + item.id + '">🗑️ Удалить</button>'
        : '';

    const createdDate = new Date(item.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return '<div class="exchange-card type-' + item.type + ' ' + (isMine ? 'my-exchange' : '') + '">' +
        '<div class="exchange-title">' + item.title + '</div>' +
        '<div class="exchange-type-badge ' + item.type + '">' + exchangeTypeNames[item.type] + '</div>' +
        '<div class="exchange-info"><strong>Категория:</strong> ' + exchangeCategoryNames[item.category] + '</div>' +
        '<div class="exchange-info"><strong>Дата:</strong> ' + createdDate + '</div>' +
        '<div class="exchange-description">' + item.description + '</div>' +
        (deleteButton ? '<div class="exchange-actions">' + deleteButton + '</div>' : '') +
        '</div>';
}

// Show exchange modal
createExchangeBtn.addEventListener('click', () => {
    exchangeModal.classList.remove('hidden');
});

// Hide exchange modal
function hideExchangeModal() {
    exchangeModal.classList.add('hidden');
    exchangeForm.reset();
}

cancelExchangeBtn.addEventListener('click', hideExchangeModal);

// Submit exchange form
exchangeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('exchange-title').value;
    const category = document.getElementById('exchange-category').value;
    const type = document.getElementById('exchange-type').value;
    const description = document.getElementById('exchange-description').value;

    const items = JSON.parse(localStorage.getItem('exchange') || '[]');
    const nextId = parseInt(localStorage.getItem('exchangeNextId') || '1');

    const newItem = {
        id: nextId,
        userId: userId,
        title: title,
        category: category,
        type: type,
        description: description,
        contact: '',
        createdAt: new Date().toISOString()
    };

    items.push(newItem);
    localStorage.setItem('exchange', JSON.stringify(items));
    localStorage.setItem('exchangeNextId', (nextId + 1).toString());

    showToast('Объявление добавлено!', 'success');
    hideExchangeModal();
    loadExchangeData();
});

// Delete exchange item
function deleteExchange(exchangeId) {
    const items = JSON.parse(localStorage.getItem('exchange') || '[]');
    const filtered = items.filter(i => i.id !== exchangeId);
    localStorage.setItem('exchange', JSON.stringify(filtered));
    showToast('Объявление удалено', 'success');
    loadExchangeData();
}

// ============================================
// ANNOUNCEMENTS MODULE - Client-side storage
// ============================================

// Initialize announcements data with defaults
function initializeAnnouncementsData() {
    const existing = localStorage.getItem('announcements');
    if (!existing) {
        const defaultAnnouncements = [
            {
                id: 1,
                title: 'Отключение горячей воды',
                content: 'Уважаемые жильцы! Сообщаем, что 25 декабря с 9:00 до 18:00 будет отключена горячая вода в связи с профилактическими работами. Приносим извинения за неудобства.',
                priority: 'high',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                title: 'Новогодний праздник в общежитии',
                content: 'Приглашаем всех жильцов на новогодний праздник, который состоится 30 декабря в 18:00 в актовом зале. Будут конкурсы, призы и угощения!',
                priority: 'medium',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                title: 'График работы администрации на праздники',
                content: 'С 31 декабря по 8 января администрация общежития будет работать по сокращенному графику: с 10:00 до 16:00.',
                priority: 'medium',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                title: 'Правила пользования прачечной',
                content: 'Напоминаем всем жильцам о необходимости соблюдать правила пользования прачечной: убирать вещи сразу после стирки, не превышать время бронирования, содержать помещение в чистоте.',
                priority: 'low',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
    }
}

// Load announcements data
function loadAnnouncementsData() {
    initializeAnnouncementsData();
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');

    // Sort by date, newest first
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    displayAnnouncements(announcements);
}

// Display announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('announcements-list');

    if (announcements.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет объявлений от администрации</div>';
    } else {
        container.innerHTML = announcements.map(announcement => createAnnouncementCard(announcement)).join('');
    }
}

// Create announcement card HTML
function createAnnouncementCard(announcement) {
    const priorityNames = {
        'high': 'Важно',
        'medium': 'Средний',
        'low': 'Информация'
    };

    const createdDate = new Date(announcement.createdAt).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isImportant = announcement.priority === 'high';

    return '<div class="announcement-card ' + (isImportant ? 'important' : '') + '">' +
        '<div class="announcement-header">' +
        '<div>' +
        '<div class="announcement-title">' + announcement.title + '</div>' +
        '<div class="announcement-date">' + createdDate + '</div>' +
        '</div>' +
        '<span class="announcement-priority ' + announcement.priority + '">' + priorityNames[announcement.priority] + '</span>' +
        '</div>' +
        '<div class="announcement-content">' + announcement.content + '</div>' +
        '</div>';
}

// ============================================
// ADMIN AUTHENTICATION MODULE
// ============================================

function setupAdminLogin() {
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const cancelAdminLoginBtn = document.getElementById('cancel-admin-login-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    adminLoginBtn.addEventListener('click', () => {
        if (isAdmin) {
            logoutAdmin();
        } else {
            adminLoginModal.classList.remove('hidden');
        }
    });

    cancelAdminLoginBtn.addEventListener('click', () => {
        adminLoginModal.classList.add('hidden');
        adminLoginForm.reset();
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('admin-password').value;
        if (password === ADMIN_PASSWORD) {
            isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
            adminLoginModal.classList.add('hidden');
            adminLoginForm.reset();
            updateAdminUI();
            showToast('Вы вошли как администратор', 'success');
        } else {
            showToast('Неверный пароль', 'error');
        }
    });

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', logoutAdmin);
    }
}

function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    updateAdminUI();
    // Switch to laundry section
    document.querySelector('.nav-link[data-target="laundry"]').click();
    showToast('Вы вышли из режима администратора', 'info');
}

function updateAdminUI() {
    const adminBadge = document.getElementById('admin-badge');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const adminLoginBtn = document.getElementById('admin-login-btn');

    if (isAdmin) {
        adminBadge.classList.remove('hidden');
        adminOnlyElements.forEach(el => el.classList.remove('hidden'));
        adminLoginBtn.textContent = '🚪';
        adminLoginBtn.title = 'Выйти из админки';
    } else {
        adminBadge.classList.add('hidden');
        adminOnlyElements.forEach(el => el.classList.add('hidden'));
        adminLoginBtn.textContent = '🔑';
        adminLoginBtn.title = 'Войти как администратор';
    }
}

// ============================================
// SMART REMINDERS MODULE
// ============================================

function setupReminders() {
    // Reminders check every 30 seconds
    generateReminders();
    setInterval(generateReminders, 30000);
}

function generateReminders() {
    const reminders = [];
    const now = new Date();

    // Check booking reminders
    const reminderBookings = document.getElementById('reminder-bookings');
    if (reminderBookings && reminderBookings.checked) {
        // Laundry reminders
        const laundryBookings = JSON.parse(localStorage.getItem('laundry') || '[]');
        laundryBookings.filter(b => b.user_id === userId).forEach(b => {
            const start = new Date(b.start_time);
            const diff = (start - now) / (1000 * 60);
            if (diff > 0 && diff <= 60) {
                reminders.push({
                    type: 'booking',
                    icon: '🧺',
                    title: 'Бронирование прачечной',
                    message: 'Через ' + Math.round(diff) + ' мин начнётся ваше бронирование прачечной',
                    time: start,
                    priority: diff <= 15 ? 'high' : 'medium'
                });
            }
            const end = new Date(b.end_time);
            const endDiff = (end - now) / (1000 * 60);
            if (endDiff > 0 && endDiff <= 15) {
                reminders.push({
                    type: 'booking',
                    icon: '⏰',
                    title: 'Прачечная заканчивается',
                    message: 'Через ' + Math.round(endDiff) + ' мин заканчивается ваше бронирование прачечной',
                    time: end,
                    priority: 'high'
                });
            }
        });

        // Kitchen reminders
        const kitchenBookings = JSON.parse(localStorage.getItem('kitchen') || '[]');
        kitchenBookings.filter(b => b.user_id === userId).forEach(b => {
            const start = new Date(b.start_time);
            const diff = (start - now) / (1000 * 60);
            if (diff > 0 && diff <= 60) {
                reminders.push({
                    type: 'booking',
                    icon: '🍳',
                    title: 'Бронирование кухни',
                    message: 'Через ' + Math.round(diff) + ' мин начнётся ваше бронирование кухни',
                    time: start,
                    priority: diff <= 15 ? 'high' : 'medium'
                });
            }
        });
    }

    // Check repair status reminders
    const reminderRepairs = document.getElementById('reminder-repairs');
    if (reminderRepairs && reminderRepairs.checked) {
        const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
        repairs.filter(r => r.userId === userId).forEach(r => {
            const statusMessages = {
                'pending': 'Ваша заявка ожидает рассмотрения',
                'in-progress': 'Ваша заявка принята в работу',
                'completed': 'Ваша заявка выполнена',
                'rejected': 'Ваша заявка отклонена'
            };
            reminders.push({
                type: 'repair',
                icon: '🔧',
                title: 'Заявка: ' + r.location,
                message: statusMessages[r.status] + ' — ' + r.description.substring(0, 50) + '...',
                time: new Date(r.createdAt),
                priority: r.status === 'completed' ? 'low' : (r.status === 'rejected' ? 'high' : 'medium')
            });
        });
    }

    // Check poll reminders
    const reminderPolls = document.getElementById('reminder-polls');
    if (reminderPolls && reminderPolls.checked) {
        const polls = JSON.parse(localStorage.getItem('polls') || '[]');
        polls.filter(p => p.status === 'active').forEach(p => {
            const endDate = new Date(p.endDate);
            const hoursLeft = (endDate - now) / (1000 * 60 * 60);
            if (hoursLeft > 0 && hoursLeft <= 24) {
                const voted = p.voters && p.voters.includes(userId);
                if (!voted) {
                    reminders.push({
                        type: 'poll',
                        icon: '📊',
                        title: 'Голосование заканчивается',
                        message: p.title + ' — осталось менее ' + Math.ceil(hoursLeft) + ' ч.',
                        time: endDate,
                        priority: hoursLeft <= 2 ? 'high' : 'medium'
                    });
                }
            }
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Store for display
    localStorage.setItem('activeReminders', JSON.stringify(reminders));
}

function loadReminders() {
    generateReminders();
    const reminders = JSON.parse(localStorage.getItem('activeReminders') || '[]');
    const container = document.getElementById('reminders-list');

    if (reminders.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет активных напоминаний. Всё спокойно!</div>';
    } else {
        container.innerHTML = reminders.map(r => {
            return '<div class="reminder-card priority-' + r.priority + '">' +
                '<div class="reminder-icon">' + r.icon + '</div>' +
                '<div class="reminder-content">' +
                '<div class="reminder-title">' + r.title + '</div>' +
                '<div class="reminder-message">' + r.message + '</div>' +
                '</div>' +
                '<div class="reminder-priority-badge ' + r.priority + '">' +
                (r.priority === 'high' ? 'Срочно' : r.priority === 'medium' ? 'Внимание' : 'Инфо') +
                '</div>' +
                '</div>';
        }).join('');
    }
}

// ============================================
// POLLS MODULE
// ============================================

function initializePollsData() {
    const existing = localStorage.getItem('polls');
    if (!existing) {
        const now = new Date();
        const defaultPolls = [
            {
                id: 1,
                title: 'Какой кофейный автомат установить в холле?',
                options: [
                    { id: 1, text: 'Автомат с капучино и латте', votes: 15 },
                    { id: 2, text: 'Простой автомат (эспрессо, американо)', votes: 8 },
                    { id: 3, text: 'Автомат с чаем и кофе', votes: 12 }
                ],
                anonymous: true,
                createdBy: 'admin',
                createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                voters: [101, 205, 150, 220]
            },
            {
                id: 2,
                title: 'Время проведения общего собрания жильцов',
                options: [
                    { id: 1, text: 'Суббота 10:00', votes: 20 },
                    { id: 2, text: 'Суббота 15:00', votes: 25 },
                    { id: 3, text: 'Воскресенье 12:00', votes: 18 },
                    { id: 4, text: 'Будний день 19:00', votes: 10 }
                ],
                anonymous: false,
                createdBy: 'admin',
                createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                voters: [101, 205, 150]
            },
            {
                id: 3,
                title: 'Нужен ли тренажёрный зал в общежитии?',
                options: [
                    { id: 1, text: 'Да, обязательно', votes: 45 },
                    { id: 2, text: 'Нет, не нужен', votes: 5 },
                    { id: 3, text: 'Только если бесплатный', votes: 30 }
                ],
                anonymous: true,
                createdBy: 'admin',
                createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'closed',
                voters: [101, 205, 150, 220]
            }
        ];
        localStorage.setItem('polls', JSON.stringify(defaultPolls));
        localStorage.setItem('pollsNextId', '4');
    }
}

function setupPolls() {
    const createPollBtn = document.getElementById('create-poll-btn');
    const pollModal = document.getElementById('poll-modal');
    const pollForm = document.getElementById('poll-form');
    const cancelPollBtn = document.getElementById('cancel-poll-btn');
    const addPollOptionBtn = document.getElementById('add-poll-option-btn');

    if (createPollBtn) {
        createPollBtn.addEventListener('click', () => {
            const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            document.getElementById('poll-end-date').value = formatDateTimeLocal(endDate);
            pollModal.classList.remove('hidden');
        });
    }

    if (cancelPollBtn) {
        cancelPollBtn.addEventListener('click', () => {
            pollModal.classList.add('hidden');
            pollForm.reset();
            // Reset options to 2
            const container = document.getElementById('poll-options-container');
            container.innerHTML = '<input type="text" class="poll-option-input" placeholder="Вариант 1" required>' +
                '<input type="text" class="poll-option-input" placeholder="Вариант 2" required>';
        });
    }

    if (addPollOptionBtn) {
        addPollOptionBtn.addEventListener('click', () => {
            const container = document.getElementById('poll-options-container');
            const count = container.querySelectorAll('.poll-option-input').length + 1;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'poll-option-input';
            input.placeholder = 'Вариант ' + count;
            input.required = true;
            container.appendChild(input);
        });
    }

    if (pollForm) {
        pollForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('poll-title').value;
            const optionInputs = document.querySelectorAll('.poll-option-input');
            const options = [];
            optionInputs.forEach((input, i) => {
                if (input.value.trim()) {
                    options.push({ id: i + 1, text: input.value.trim(), votes: 0 });
                }
            });

            if (options.length < 2) {
                showToast('Нужно минимум 2 варианта ответа', 'error');
                return;
            }

            const polls = JSON.parse(localStorage.getItem('polls') || '[]');
            const nextId = parseInt(localStorage.getItem('pollsNextId') || '1');

            const newPoll = {
                id: nextId,
                title: title,
                options: options,
                anonymous: document.getElementById('poll-anonymous').checked,
                createdBy: 'admin',
                createdAt: new Date().toISOString(),
                endDate: new Date(document.getElementById('poll-end-date').value).toISOString(),
                status: 'active',
                voters: []
            };

            polls.push(newPoll);
            localStorage.setItem('polls', JSON.stringify(polls));
            localStorage.setItem('pollsNextId', (nextId + 1).toString());

            pollModal.classList.add('hidden');
            pollForm.reset();
            showToast('Голосование создано!', 'success');
            loadPollsData();
        });
    }
}

function loadPollsData() {
    initializePollsData();
    const polls = JSON.parse(localStorage.getItem('polls') || '[]');

    // Update status for expired polls
    const now = new Date();
    polls.forEach(p => {
        if (p.status === 'active' && new Date(p.endDate) < now) {
            p.status = 'closed';
        }
    });
    localStorage.setItem('polls', JSON.stringify(polls));

    // Sort: active first, then by date
    polls.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    displayPolls(polls);
}

function displayPolls(polls) {
    const container = document.getElementById('polls-list');

    if (polls.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет голосований</div>';
        return;
    }

    container.innerHTML = polls.map(poll => {
        const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
        const hasVoted = poll.voters && poll.voters.includes(userId);
        const isActive = poll.status === 'active';
        const endDate = new Date(poll.endDate).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let optionsHtml = poll.options.map(opt => {
            const percent = totalVotes > 0 ? Math.round(opt.votes / totalVotes * 100) : 0;
            const canVote = isActive && !hasVoted;

            return '<div class="poll-option ' + (canVote ? 'voteable' : '') + '" data-poll-id="' + poll.id + '" data-option-id="' + opt.id + '">' +
                '<div class="poll-option-bar" style="width: ' + percent + '%"></div>' +
                '<div class="poll-option-content">' +
                '<span class="poll-option-text">' + opt.text + '</span>' +
                '<span class="poll-option-votes">' + opt.votes + ' (' + percent + '%)</span>' +
                '</div>' +
                '</div>';
        }).join('');

        const deletePollBtn = isAdmin ? '<button class="btn-danger btn-sm" data-delete-poll="' + poll.id + '">Удалить</button>' : '';

        return '<div class="poll-card ' + (isActive ? 'active' : 'closed') + '">' +
            '<div class="poll-header">' +
            '<div class="poll-title">' + poll.title + '</div>' +
            '<span class="poll-status-badge ' + poll.status + '">' + (isActive ? 'Активно' : 'Завершено') + '</span>' +
            '</div>' +
            '<div class="poll-meta">Голосов: ' + totalVotes + ' | ' +
            (poll.anonymous ? 'Анонимное' : 'Открытое') +
            ' | До: ' + endDate + '</div>' +
            '<div class="poll-options">' + optionsHtml + '</div>' +
            (hasVoted ? '<div class="poll-voted-label">Вы уже проголосовали</div>' : '') +
            (deletePollBtn ? '<div class="poll-actions">' + deletePollBtn + '</div>' : '') +
            '</div>';
    }).join('');

    // Add vote listeners
    container.querySelectorAll('.poll-option.voteable').forEach(opt => {
        opt.addEventListener('click', function () {
            const pollId = parseInt(this.getAttribute('data-poll-id'));
            const optionId = parseInt(this.getAttribute('data-option-id'));
            votePoll(pollId, optionId);
        });
    });

    // Add delete listeners
    container.querySelectorAll('[data-delete-poll]').forEach(btn => {
        btn.addEventListener('click', function () {
            const pollId = parseInt(this.getAttribute('data-delete-poll'));
            const polls = JSON.parse(localStorage.getItem('polls') || '[]');
            localStorage.setItem('polls', JSON.stringify(polls.filter(p => p.id !== pollId)));
            showToast('Голосование удалено', 'success');
            loadPollsData();
        });
    });
}

function votePoll(pollId, optionId) {
    const polls = JSON.parse(localStorage.getItem('polls') || '[]');
    const poll = polls.find(p => p.id === pollId);
    if (!poll || poll.status !== 'active') return;
    if (poll.voters && poll.voters.includes(userId)) {
        showToast('Вы уже голосовали', 'warning');
        return;
    }

    const option = poll.options.find(o => o.id === optionId);
    if (option) {
        option.votes++;
        if (!poll.voters) poll.voters = [];
        poll.voters.push(userId);
        localStorage.setItem('polls', JSON.stringify(polls));
        showToast('Ваш голос учтён!', 'success');
        loadPollsData();
    }
}

// ============================================
// FAQ BOT MODULE
// ============================================

function initializeFAQData() {
    const existing = localStorage.getItem('faqKnowledge');
    if (!existing) {
        const defaultFAQ = [
            {
                id: 1, topic: 'rules', keywords: ['правила', 'проживание', 'общежитие', 'режим', 'тишина'],
                question: 'Какие правила проживания в общежитии?',
                answer: 'Основные правила: тишина с 23:00 до 7:00, запрещено курение в помещениях, обязательна регистрация гостей, поддержание чистоты в местах общего пользования. Полный свод правил доступен на стенде на 1 этаже.'
            },
            {
                id: 2, topic: 'laundry', keywords: ['прачечная', 'стирка', 'стиральная', 'машинка', 'бронирование'],
                question: 'Как пользоваться прачечной?',
                answer: 'Прачечная работает круглосуточно. Бронирование через наше приложение (раздел "Прачечная"), максимальное время — 2 часа. Стиральный порошок приносите свой. Обязательно заберите вещи сразу после стирки.'
            },
            {
                id: 3, topic: 'repairs', keywords: ['ремонт', 'сломалось', 'не работает', 'заявка', 'починить'],
                question: 'Как подать заявку на ремонт?',
                answer: 'Подать заявку можно через раздел "Заявки на ремонт". Укажите место, категорию проблемы и подробное описание. Среднее время обработки заявки — 1-3 рабочих дня. Срочные проблемы (протечки, электричество) решаются в течение 24 часов.'
            },
            {
                id: 4, topic: 'payments', keywords: ['оплата', 'платить', 'стоимость', 'цена', 'квитанция', 'деньги'],
                question: 'Как оплатить проживание?',
                answer: 'Оплата проживания производится ежемесячно до 10 числа. Способы оплаты: банковский перевод по реквизитам из квитанции, оплата через личный кабинет на сайте университета, или наличными в бухгалтерии (корпус А, каб. 105). Стоимость: 1500 руб/мес.'
            },
            {
                id: 5, topic: 'contacts', keywords: ['контакты', 'телефон', 'позвонить', 'администрация', 'комендант'],
                question: 'Как связаться с администрацией?',
                answer: 'Комендант: +7 (999) 123-45-67 (пн-пт 9:00-18:00). Дежурный: +7 (999) 765-43-21 (круглосуточно). Email: dorm@university.ru. Кабинет администрации: 1 этаж, каб. 101. Приёмные часы: пн-пт 10:00-12:00, 14:00-16:00.'
            },
            {
                id: 6, topic: 'guests', keywords: ['гости', 'друзья', 'посетители', 'пригласить', 'пропуск'],
                question: 'Как приглашать гостей?',
                answer: 'Гости допускаются с 8:00 до 23:00. Необходимо зарегистрировать гостя на вахте (паспорт гостя). Одновременно можно принять не более 3 гостей. Ночёвка гостей возможна по согласованию с администрацией (заявление за 1 день).'
            },
            {
                id: 7, topic: 'rules', keywords: ['интернет', 'wifi', 'вай-фай', 'сеть', 'пароль'],
                question: 'Как подключиться к Wi-Fi?',
                answer: 'Wi-Fi сеть: "Dorm_WiFi". Логин — ваш номер комнаты, пароль выдаётся при заселении. При проблемах с подключением обратитесь к системному администратору (каб. 103, пн-пт 10:00-17:00) или по email: it@university.ru.'
            },
            {
                id: 8, topic: 'laundry', keywords: ['кухня', 'готовить', 'плита', 'холодильник'],
                question: 'Как пользоваться общей кухней?',
                answer: 'Кухня доступна для бронирования через приложение (раздел "Кухня"), максимальное время — 3 часа. На кухне есть плиты, микроволновки и общие холодильники. Обязательно убирайте за собой! Личные продукты подписывайте.'
            }
        ];
        localStorage.setItem('faqKnowledge', JSON.stringify(defaultFAQ));
        localStorage.setItem('faqNextId', '9');
    }
}

function setupFAQBot() {
    const faqInput = document.getElementById('faq-input');
    const faqSendBtn = document.getElementById('faq-send-btn');
    const topicButtons = document.querySelectorAll('.faq-topic-btn');

    if (faqSendBtn) {
        faqSendBtn.addEventListener('click', () => {
            const question = faqInput.value.trim();
            if (question) {
                handleFAQQuestion(question);
                faqInput.value = '';
            }
        });
    }

    if (faqInput) {
        faqInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const question = faqInput.value.trim();
                if (question) {
                    handleFAQQuestion(question);
                    faqInput.value = '';
                }
            }
        });
    }

    topicButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.getAttribute('data-topic');
            handleFAQTopic(topic);
        });
    });
}

function handleFAQQuestion(question) {
    const chat = document.getElementById('faq-chat');
    // Add user message
    chat.innerHTML += '<div class="faq-message user-message">' +
        '<div class="faq-bubble">' + escapeHtml(question) + '</div>' +
        '<div class="faq-avatar">👤</div>' +
        '</div>';

    // Find answer
    const knowledge = JSON.parse(localStorage.getItem('faqKnowledge') || '[]');
    const words = question.toLowerCase().split(/\s+/);

    let bestMatch = null;
    let bestScore = 0;

    knowledge.forEach(item => {
        let score = 0;
        words.forEach(word => {
            if (word.length < 3) return;
            item.keywords.forEach(kw => {
                if (kw.includes(word) || word.includes(kw)) {
                    score += 2;
                }
            });
            if (item.question.toLowerCase().includes(word)) score += 1;
            if (item.answer.toLowerCase().includes(word)) score += 0.5;
        });
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    });

    let answer;
    if (bestMatch && bestScore >= 2) {
        answer = bestMatch.answer;
    } else {
        answer = 'К сожалению, я не нашёл точного ответа на ваш вопрос. Попробуйте выбрать тему из списка ниже или переформулировать вопрос. Вы также можете обратиться в администрацию (каб. 101).';
    }

    setTimeout(() => {
        chat.innerHTML += '<div class="faq-message bot-message">' +
            '<div class="faq-avatar">🤖</div>' +
            '<div class="faq-bubble">' + answer + '</div>' +
            '</div>';
        chat.scrollTop = chat.scrollHeight;
    }, 500);

    chat.scrollTop = chat.scrollHeight;
}

function handleFAQTopic(topic) {
    const knowledge = JSON.parse(localStorage.getItem('faqKnowledge') || '[]');
    const topicItems = knowledge.filter(k => k.topic === topic);

    const topicNames = {
        'rules': 'Правила проживания',
        'laundry': 'Прачечная и кухня',
        'repairs': 'Ремонт',
        'payments': 'Оплата',
        'contacts': 'Контакты',
        'guests': 'Гости'
    };

    const chat = document.getElementById('faq-chat');
    chat.innerHTML += '<div class="faq-message user-message">' +
        '<div class="faq-bubble">Тема: ' + topicNames[topic] + '</div>' +
        '<div class="faq-avatar">👤</div>' +
        '</div>';

    let response;
    if (topicItems.length === 0) {
        response = 'По этой теме пока нет информации.';
    } else {
        response = '<strong>' + topicNames[topic] + '</strong><br><br>' +
            topicItems.map(item => '<strong>❓ ' + item.question + '</strong><br>' + item.answer).join('<br><br>');
    }

    setTimeout(() => {
        chat.innerHTML += '<div class="faq-message bot-message">' +
            '<div class="faq-avatar">🤖</div>' +
            '<div class="faq-bubble">' + response + '</div>' +
            '</div>';
        chat.scrollTop = chat.scrollHeight;
    }, 500);

    chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ANALYTICS DASHBOARD MODULE
// ============================================

function loadAnalyticsData() {
    // Gather stats
    const laundry = JSON.parse(localStorage.getItem('laundry') || '[]');
    const kitchen = JSON.parse(localStorage.getItem('kitchen') || '[]');
    const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
    const exchange = JSON.parse(localStorage.getItem('exchange') || '[]');
    const polls = JSON.parse(localStorage.getItem('polls') || '[]');

    // Count unique users
    const userIds = new Set();
    laundry.forEach(b => userIds.add(b.user_id));
    kitchen.forEach(b => userIds.add(b.user_id));
    repairs.forEach(r => userIds.add(r.userId));
    exchange.forEach(e => userIds.add(e.userId));

    document.getElementById('stat-laundry').textContent = laundry.length;
    document.getElementById('stat-kitchen').textContent = kitchen.length;
    document.getElementById('stat-repairs').textContent = repairs.length;
    document.getElementById('stat-exchange').textContent = exchange.length;
    document.getElementById('stat-polls').textContent = polls.length;
    document.getElementById('stat-users').textContent = userIds.size;

    // Repairs status chart
    const repairStatuses = { 'pending': 0, 'in-progress': 0, 'completed': 0, 'rejected': 0 };
    repairs.forEach(r => { if (repairStatuses[r.status] !== undefined) repairStatuses[r.status]++; });
    renderBarChart('repairs-chart', {
        'Ожидает': repairStatuses['pending'],
        'В работе': repairStatuses['in-progress'],
        'Выполнено': repairStatuses['completed'],
        'Отклонено': repairStatuses['rejected']
    }, ['#f59e0b', '#6366f1', '#10b981', '#ef4444']);

    // Exchange types chart
    const exchangeTypes = { 'give': 0, 'exchange': 0, 'sell': 0 };
    exchange.forEach(e => { if (exchangeTypes[e.type] !== undefined) exchangeTypes[e.type]++; });
    renderBarChart('exchange-chart', {
        'Отдам даром': exchangeTypes['give'],
        'Обмен': exchangeTypes['exchange'],
        'Продам': exchangeTypes['sell']
    }, ['#10b981', '#6366f1', '#f59e0b']);

    // Activity chart (mock weekly data)
    renderBarChart('activity-chart', {
        'Пн': 12, 'Вт': 8, 'Ср': 15, 'Чт': 10, 'Пт': 18, 'Сб': 22, 'Вс': 14
    }, ['#6366f1', '#818cf8', '#6366f1', '#818cf8', '#6366f1', '#ec4899', '#ec4899']);

    // Polls results chart
    const pollData = {};
    const pollColors = [];
    const colorPalette = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    polls.filter(p => p.status === 'active').slice(0, 2).forEach((p, pi) => {
        p.options.forEach((o, i) => {
            pollData[o.text.substring(0, 12)] = o.votes;
            pollColors.push(colorPalette[(pi * 3 + i) % colorPalette.length]);
        });
    });
    if (Object.keys(pollData).length === 0) {
        pollData['Нет данных'] = 0;
        pollColors.push('#ccc');
    }
    renderBarChart('polls-chart', pollData, pollColors);
}

function renderBarChart(containerId, data, colors) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const maxVal = Math.max(...Object.values(data), 1);

    container.innerHTML = Object.entries(data).map(([label, value], i) => {
        const height = Math.max((value / maxVal) * 100, 5);
        const color = colors[i % colors.length];
        return '<div class="bar-item">' +
            '<div class="bar-value">' + value + '</div>' +
            '<div class="bar" style="height: ' + height + '%; background: ' + color + ';"></div>' +
            '<div class="bar-label">' + label + '</div>' +
            '</div>';
    }).join('');
}

// ============================================
// ADMIN PANEL MODULE
// ============================================

function setupAdminPanel() {
    // Tab switching
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.add('hidden'));
            const targetId = this.getAttribute('data-admin-tab') + '-tab';
            const target = document.getElementById(targetId);
            if (target) target.classList.remove('hidden');
        });
    });

    // FAQ admin form
    const faqAdminForm = document.getElementById('faq-admin-form');
    if (faqAdminForm) {
        faqAdminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const topic = document.getElementById('faq-admin-topic').value;
            const keywords = document.getElementById('faq-admin-keywords').value.split(',').map(k => k.trim().toLowerCase());
            const question = document.getElementById('faq-admin-question').value;
            const answer = document.getElementById('faq-admin-answer').value;

            const knowledge = JSON.parse(localStorage.getItem('faqKnowledge') || '[]');
            const nextId = parseInt(localStorage.getItem('faqNextId') || '1');

            knowledge.push({ id: nextId, topic, keywords, question, answer });
            localStorage.setItem('faqKnowledge', JSON.stringify(knowledge));
            localStorage.setItem('faqNextId', (nextId + 1).toString());

            faqAdminForm.reset();
            showToast('Вопрос добавлен в базу знаний', 'success');
            loadAdminFAQList();
        });
    }

    // Announcement admin form
    const announcementAdminForm = document.getElementById('announcement-admin-form');
    if (announcementAdminForm) {
        announcementAdminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('announcement-admin-title').value;
            const content = document.getElementById('announcement-admin-content').value;
            const priority = document.getElementById('announcement-admin-priority').value;

            const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
            const maxId = announcements.reduce((max, a) => Math.max(max, a.id || 0), 0);

            announcements.push({
                id: maxId + 1,
                title, content, priority,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('announcements', JSON.stringify(announcements));

            announcementAdminForm.reset();
            showToast('Объявление опубликовано', 'success');
        });
    }
}

function loadAdminPanel() {
    loadAdminFAQList();
    loadAdminRepairsList();
}

function loadAdminFAQList() {
    const knowledge = JSON.parse(localStorage.getItem('faqKnowledge') || '[]');
    const container = document.getElementById('faq-admin-list');
    if (!container) return;

    const topicNames = {
        'rules': 'Правила', 'laundry': 'Прачечная', 'repairs': 'Ремонт',
        'payments': 'Оплата', 'contacts': 'Контакты', 'guests': 'Гости'
    };

    container.innerHTML = knowledge.map(item => {
        return '<div class="admin-faq-item">' +
            '<div class="admin-faq-topic">' + (topicNames[item.topic] || item.topic) + '</div>' +
            '<div class="admin-faq-question">' + item.question + '</div>' +
            '<div class="admin-faq-answer">' + item.answer.substring(0, 100) + '...</div>' +
            '<button class="btn-danger btn-sm" data-delete-faq="' + item.id + '">Удалить</button>' +
            '</div>';
    }).join('');

    container.querySelectorAll('[data-delete-faq]').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = parseInt(this.getAttribute('data-delete-faq'));
            const updated = knowledge.filter(k => k.id !== id);
            localStorage.setItem('faqKnowledge', JSON.stringify(updated));
            showToast('Удалено из базы знаний', 'success');
            loadAdminFAQList();
        });
    });
}

function loadAdminRepairsList() {
    const repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
    const container = document.getElementById('admin-repairs-list');
    if (!container) return;

    const statusNames = {
        'pending': 'Ожидает', 'in-progress': 'В работе',
        'completed': 'Выполнено', 'rejected': 'Отклонено'
    };

    container.innerHTML = repairs.map(r => {
        return '<div class="admin-repair-item">' +
            '<div class="repair-info"><strong>' + r.location + '</strong> — ' + repairCategoryNames[r.category] + '</div>' +
            '<div class="repair-description">' + r.description + '</div>' +
            '<div class="admin-repair-controls">' +
            '<span class="repair-status ' + r.status + '">' + statusNames[r.status] + '</span>' +
            '<select class="admin-status-select" data-repair-id="' + r.id + '">' +
            '<option value="pending"' + (r.status === 'pending' ? ' selected' : '') + '>Ожидает</option>' +
            '<option value="in-progress"' + (r.status === 'in-progress' ? ' selected' : '') + '>В работе</option>' +
            '<option value="completed"' + (r.status === 'completed' ? ' selected' : '') + '>Выполнено</option>' +
            '<option value="rejected"' + (r.status === 'rejected' ? ' selected' : '') + '>Отклонено</option>' +
            '</select>' +
            '</div>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.admin-status-select').forEach(select => {
        select.addEventListener('change', function () {
            const repairId = parseInt(this.getAttribute('data-repair-id'));
            const newStatus = this.value;
            const allRepairs = JSON.parse(localStorage.getItem('repairs') || '[]');
            const repair = allRepairs.find(r => r.id === repairId);
            if (repair) {
                repair.status = newStatus;
                localStorage.setItem('repairs', JSON.stringify(allRepairs));
                showToast('Статус заявки обновлён', 'success');
                loadAdminRepairsList();
            }
        });
    });
}
