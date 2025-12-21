// Configuration and state
let config = {};
let userId = 0;
let username = '';
let currentBookingType = '';

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

    // Show main page immediately
    showMainPage();

    // Initialize all modules with default data
    initializeAllModules();
});

// Initialize all modules with default data
function initializeAllModules() {
    initializeLaundryData();
    initializeKitchenData();
    initializeRepairsData();
    initializeExchangeData();
    initializeAnnouncementsData();

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

        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.classList.add('active');

        Object.values(sections).forEach(section => section.classList.add('hidden'));
        sections[target].classList.remove('hidden');

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
