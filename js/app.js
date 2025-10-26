// Configuration and state
let config = {};
let userId = 0;
let username = '';
let currentBookingType = '';

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
};

// Booking modal
const bookingModal = document.getElementById('booking-modal');
const bookingForm = document.getElementById('booking-form');
const modalTitle = document.getElementById('modal-title');
const cancelBookingBtn = document.getElementById('cancel-booking-btn');
const createLaundryBtn = document.getElementById('create-laundry-btn');
const createKitchenBtn = document.getElementById('create-kitchen-btn');

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    // Check if running from file:// protocol
    if (window.location.protocol === 'file:') {
        console.warn('⚠️ Running from file:// protocol. Some features may not work correctly.');
        console.warn('📌 Recommended: Run a local HTTP server instead:');
        console.warn('   python -m http.server 8000');
        console.warn('   or: npx http-server -p 8000');
        console.warn('   Then open: http://localhost:8000');
    }

    await loadConfig();
    await authenticate();
});

// Load configuration from config.json
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        console.log('Config loaded from config.json:', config);
    } catch (error) {
        console.warn('Failed to load config.json, using default config:', error);
        // Fallback configuration if config.json cannot be loaded (e.g., file:// protocol)
        config = {
            backend_address: 'http://localhost:8081'
        };
        console.log('Using default config:', config);
    }
}

// Authenticate user with backend
async function authenticate() {
    try {
        // Get token from localStorage or create new one
        const token = getToken();

        const response = await fetch(config.backend_address + '/api/v1/auth/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const data = await response.json();
        console.log('Auth response:', data); // Добавим логирование для проверки
        const newToken = data.token;
        userId = data.userId || data.user_id; // Поддержка обоих форматов
        username = data.username;

        // Save token to localStorage
        localStorage.setItem('access-token', newToken);

        console.log('Authenticated:', { userId, username, token: newToken.substring(0, 20) + '...' });

        // Show main page
        showMainPage();

        // Load initial data
        loadLaundryData();
    } catch (error) {
        console.error('Authentication error:', error);
        showToast('Ошибка аутентификации: ' + error.message, 'error');
    }
}

// Show main page
function showMainPage() {
    loadingPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    usernameDisplay.textContent = username || 'ID ' + userId;
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
        }
    });
});

// Load laundry data
async function loadLaundryData() {
    try {
        // Load my bookings
        const myResponse = await fetch(config.backend_address + '/api/v1/laundry/bookings/my?token=' + getToken());
        if (!myResponse.ok) throw new Error('Failed to load my laundry bookings');
        const myData = await myResponse.json();
        console.log('My laundry bookings:', myData);

        // Load all bookings
        const allResponse = await fetch(config.backend_address + '/api/v1/laundry/bookings');
        if (!allResponse.ok) throw new Error('Failed to load all laundry bookings');
        const allData = await allResponse.json();
        console.log('All laundry bookings:', allData);

        displayBookings('laundry', myData.bookings || [], allData.bookings || []);
    } catch (error) {
        console.error('Error loading laundry data:', error);
        showToast('Ошибка загрузки данных прачечной', 'error');
    }
}

// Load kitchen data
async function loadKitchenData() {
    try {
        // Load my bookings
        const myResponse = await fetch(config.backend_address + '/api/v1/kitchen/bookings/my?token=' + getToken());
        if (!myResponse.ok) throw new Error('Failed to load my kitchen bookings');
        const myData = await myResponse.json();
        console.log('My kitchen bookings:', myData);

        // Load all bookings
        const allResponse = await fetch(config.backend_address + '/api/v1/kitchen/bookings');
        if (!allResponse.ok) throw new Error('Failed to load all kitchen bookings');
        const allData = await allResponse.json();
        console.log('All kitchen bookings:', allData);

        displayBookings('kitchen', myData.bookings || [], allData.bookings || []);
    } catch (error) {
        console.error('Error loading kitchen data:', error);
        showToast('Ошибка загрузки данных кухни', 'error');
    }
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
        '<div class="booking-info"><strong>ID:</strong> ' + booking.id + '</div>' +
        '<div class="booking-info"><strong>Пользователь:</strong> ' + (userId || 'N/A') + '</div>' +
        '<div class="booking-time"><strong>Начало:</strong> ' + formatDate(startTime) + '</div>' +
        '<div class="booking-time"><strong>Конец:</strong> ' + formatDate(endTime) + '</div>' +
        (deleteButton ? '<div class="booking-actions">' + deleteButton + '</div>' : '') +
        '</div>';
}

// Delete booking
async function deleteBooking(bookingId, type) {
    try {
        const response = await fetch(
            config.backend_address + '/api/v1/' + type + '/bookings/' + bookingId + '?token=' + getToken(),
            {
                method: 'DELETE',
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete booking');
        }

        showToast('Бронирование успешно удалено', 'success');

        // Reload data
        if (type === 'laundry') {
            loadLaundryData();
        } else {
            loadKitchenData();
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showToast('Ошибка удаления бронирования', 'error');
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
bookingForm.addEventListener('submit', async (e) => {
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

    try {
        const response = await fetch(config.backend_address + '/api/v1/' + currentBookingType + '/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: getToken(),
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to create booking');
        }

        const data = await response.json();
        const bookingId = data.bookingId || data.booking_id || data.id;
        showToast('Бронирование создано! ID: ' + bookingId, 'success');

        hideBookingModal();

        // Reload data
        if (currentBookingType === 'laundry') {
            loadLaundryData();
        } else {
            loadKitchenData();
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        showToast('Ошибка создания бронирования: ' + error.message, 'error');
    }
});
