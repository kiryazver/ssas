// Функция для отображения информации о пользователе
function displayUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        userInfoElement.innerHTML = `<span> ${currentUser.name}</span>`;
    } else {
        userInfoElement.innerHTML = '';
    }
}

// Вызываем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();
});