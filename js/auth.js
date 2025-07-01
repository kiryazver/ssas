// Функции для работы с куками
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name + '=; Max-Age=-99999999; path=/'; 
}

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Регистрация нового пользователя (демо-версия без сохранения)
document.getElementById('register-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // В демо-версии просто устанавливаем куку
    setCookie('currentUser', JSON.stringify({
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value
    }), 1);
    
    window.location.href = 'index.html';
});

// Авторизация пользователя
document.getElementById('login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Проверка учетных данных admin
    if (email === 'admin' && password === 'admin') {
        setCookie('currentUser', JSON.stringify({
            name: "Админ",
            email: "admin@example.com"
        }), 1);
        window.location.href = 'index.html';
        return;
    }
    
    // Попытка найти пользователя в куках (демо-версия)
    const usersCookie = getCookie('users');
    const users = usersCookie ? JSON.parse(usersCookie) : [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        setCookie('currentUser', JSON.stringify(user), 1);
        window.location.href = 'index.html';
    } else {
        alert('Неверный email или пароль');
    }
});

// Выход из системы
document.getElementById('logout-btn')?.addEventListener('click', function() {
    eraseCookie('currentUser');
    window.location.href = 'login.html';
});



// Функция для получения текущего пользователя
function getCurrentUser() {
    const userCookie = getCookie('currentUser');
    return userCookie ? JSON.parse(userCookie) : null;
}