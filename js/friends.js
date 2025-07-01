document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const friendsList = document.getElementById('friends-list');
    
    // Загрузка всех пользователей (кроме текущего)
    function loadFriends(searchTerm = '') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Фильтрация пользователей
        users = users.filter(user => user.email !== currentUser.email);
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            users = users.filter(user => 
                user.name.toLowerCase().includes(term) || 
                user.city.toLowerCase().includes(term)
            );
        }
        
        // Отображение результатов
        friendsList.innerHTML = '';
        
        users.forEach(user => {
            const friendCard = document.createElement('div');
            friendCard.className = 'friend-card';
            friendCard.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}">
                <h3>${user.name}</h3>
                <p>${user.city}</p>
                <button class="add-friend-btn" data-email="${user.email}">Добавить в друзья</button>
            `;
            friendsList.appendChild(friendCard);
        });
    }
    
    // Поиск друзей
    searchBtn.addEventListener('click', function() {
        loadFriends(searchInput.value);
    });
    
    // Загрузка всех друзей при открытии страницы
    loadFriends();
});