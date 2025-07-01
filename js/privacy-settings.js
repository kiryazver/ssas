document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = JSON.parse(getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Элементы DOM
    const menuItems = document.querySelectorAll('.settings-menu-item');
    const saveButton = document.getElementById('save-settings');
    
    // Загрузка настроек приватности
    function loadPrivacySettings() {
        const settings = currentUser.privacySettings || {};
        
        // Устанавливаем значения из сохраненных настроек
        document.getElementById('profile-visibility').value = settings.profileVisibility || 'friends';
        document.getElementById('post-visibility').value = settings.postVisibility || 'friends';
        document.getElementById('friends-visibility').value = settings.friendsVisibility || 'friends';
        document.getElementById('friend-requests').value = settings.friendRequests || 'everyone';
        document.getElementById('comments-permission').value = settings.commentsPermission || 'friends';
        document.getElementById('tagging-permission').value = settings.taggingPermission || 'friends';
        document.getElementById('search-engine-index').checked = settings.searchEngineIndex || false;
        document.getElementById('site-search').checked = settings.siteSearch !== false;
    }

    // Сохранение настроек приватности
    saveButton.addEventListener('click', function() {
        // Получаем значения настроек
        const settings = {
            profileVisibility: document.getElementById('profile-visibility').value,
            postVisibility: document.getElementById('post-visibility').value,
            friendsVisibility: document.getElementById('friends-visibility').value,
            friendRequests: document.getElementById('friend-requests').value,
            commentsPermission: document.getElementById('comments-permission').value,
            taggingPermission: document.getElementById('tagging-permission').value,
            searchEngineIndex: document.getElementById('search-engine-index').checked,
            siteSearch: document.getElementById('site-search').checked
        };
        
        // Обновляем настройки пользователя
        const userIndex = updateUserSettings(currentUser.email, settings);
        
        if (userIndex !== -1) {
            // Обновляем текущего пользователя
            currentUser.privacySettings = settings;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            alert('Настройки приватности успешно сохранены!');
        }
    });

    // Обновление настроек пользователя в хранилище
    function updateUserSettings(email, settings) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            users[userIndex].privacySettings = settings;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        return userIndex;
    }

    // Переключение между разделами настроек
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Удаляем активный класс у всех элементов
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Добавляем активный класс текущему элементу
            this.classList.add('active');
            
            // Здесь можно добавить загрузку соответствующего контента
            // В этом примере мы показываем только настройки приватности
            alert(`Переход в раздел: ${this.textContent.trim()}`);
        });
    });

    // Инициализация страницы
    loadPrivacySettings();
});