document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = JSON.parse(getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Элементы DOM
    const profileName = document.getElementById('profile-name');
    const profileCity = document.getElementById('profile-city');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileCountry = document.getElementById('profile-country');
    const profileAge = document.getElementById('profile-age');
    const profileAvatar = document.getElementById('profile-avatar');
    const coverImage = document.getElementById('cover-image');
    const friendsPreview = document.getElementById('friends-preview');
    const postsList = document.getElementById('posts-list');
    const photosGrid = document.getElementById('photos-grid');
    const travelList = document.getElementById('travel-list');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileForm = document.getElementById('edit-profile-form');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const changeCoverBtn = document.getElementById('change-cover-btn');
    const coverUpload = document.getElementById('cover-upload');
    const publishPostBtn = document.getElementById('publish-post-btn');
    const postText = document.getElementById('post-text');
    const postPhotoUpload = document.getElementById('post-photo-upload');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // Загрузка данных
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let friends = JSON.parse(localStorage.getItem('friends')) || [];
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let photos = JSON.parse(localStorage.getItem('photos')) || [];
    let travelPosts = JSON.parse(localStorage.getItem('travelPosts')) || [];

    // Обновление информации профиля
    function updateProfileInfo() {
        const user = users.find(u => u.email === currentUser.email) || currentUser;
        
        profileName.textContent = user.name || 'Без имени';
        profileCity.textContent = user.city || 'Город не указан';
        profileEmail.textContent = user.email;
        profilePhone.textContent = user.phone || 'Не указан';
        profileCountry.textContent = user.country || 'Не указана';
        
        if (user.birthday) {
            const age = calculateAge(user.birthday);
            profileAge.textContent = age > 0 ? `${age} лет` : 'Не указано';
        }
        
        profileAvatar.src = user.avatar || 'https://via.placeholder.com/150';
        
        if (user.coverImage) {
            coverImage.style.backgroundImage = `url(${user.coverImage})`;
        }
        
        // Обновляем статистику
        updateStats();
    }

    // Расчет возраста
    function calculateAge(birthday) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Обновление статистики
    function updateStats() {
        // Количество друзей
        const friendsCount = friends.filter(f => f.userEmail === currentUser.email).length;
        document.getElementById('friends-count').textContent = friendsCount;
        
        // Количество фото (упрощенная логика)
        const photosCount = photos.filter(p => p.userEmail === currentUser.email).length;
        document.getElementById('photos-count').textContent = photosCount;
        
        // Количество путешествий
        const travelsCount = travelPosts.filter(t => t.author === currentUser.email).length;
        document.getElementById('travels-count').textContent = travelsCount;
    }

    // Загрузка друзей для превью
    function loadFriendsPreview() {
        const userFriends = friends
            .filter(f => f.userEmail === currentUser.email)
            .slice(0, 6);
        
        friendsPreview.innerHTML = '';
        
        if (userFriends.length === 0) {
            friendsPreview.innerHTML = '<p>У вас пока нет друзей</p>';
            return;
        }
        
        userFriends.forEach(friend => {
            const user = users.find(u => u.email === friend.email) || {};
            const friendElement = document.createElement('div');
            friendElement.className = 'friend-preview';
            friendElement.innerHTML = `
                <img src="${user.avatar || 'https://via.placeholder.com/150'}" 
                     alt="${user.name}" 
                     class="friend-preview-avatar">
                <div class="friend-preview-name">${user.name || 'Неизвестный'}</div>
            `;
            friendsPreview.appendChild(friendElement);
        });
    }

    // Загрузка постов пользователя
    function loadUserPosts() {
        const userPosts = posts
            .filter(p => p.author === currentUser.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        postsList.innerHTML = '';
        
        if (userPosts.length === 0) {
            postsList.innerHTML = '<p>У вас пока нет записей</p>';
            return;
        }
        
        userPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.innerHTML = `
                <div class="post-author">
                    <img src="${currentUser.avatar || 'https://via.placeholder.com/150'}" 
                         alt="${currentUser.name}" 
                         class="post-author-avatar">
                    <span class="post-author-name">${currentUser.name}</span>
                    <span class="post-time">${formatPostTime(post.createdAt)}</span>
                </div>
                <div class="post-text">${post.text}</div>
                ${post.photos && post.photos.length > 0 ? `
                    <div class="post-photos-grid">
                        ${post.photos.slice(0, 3).map(photo => `
                            <img src="${photo}" class="post-photo-item">
                        `).join('')}
                    </div>
                ` : ''}
                <div class="post-actions-bar">
                    <div class="post-action">
                        <i class="far fa-heart"></i> <span>${post.likes || 0}</span>
                    </div>
                    <div class="post-action">
                        <i class="far fa-comment"></i> <span>${post.comments || 0}</span>
                    </div>
                </div>
            `;
            postsList.appendChild(postElement);
        });
    }

    // Форматирование времени поста
    function formatPostTime(dateString) {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'только что';
        } else if (diffInHours < 24) {
            return `${diffInHours} ${getHoursWord(diffInHours)} назад`;
        } else {
            return postDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    function getHoursWord(hours) {
        if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
        if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return 'часа';
        return 'часов';
    }

    // Загрузка фотографий пользователя
    function loadUserPhotos() {
        const userPhotos = photos
            .filter(p => p.userEmail === currentUser.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        photosGrid.innerHTML = '';
        
        if (userPhotos.length === 0) {
            photosGrid.innerHTML = '<p>У вас пока нет фотографий</p>';
            return;
        }
        
        userPhotos.forEach(photo => {
            const photoElement = document.createElement('img');
            photoElement.className = 'photo-item';
            photoElement.src = photo.url;
            photoElement.alt = 'Фото пользователя';
            photosGrid.appendChild(photoElement);
        });
    }

    // Загрузка путешествий пользователя
    function loadUserTravels() {
        const userTravels = travelPosts
            .filter(t => t.author === currentUser.email)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        travelList.innerHTML = '';
        
        if (userTravels.length === 0) {
            travelList.innerHTML = '<p>У вас пока нет путешествий</p>';
            return;
        }
        
        userTravels.forEach(travel => {
            const travelElement = document.createElement('div');
            travelElement.className = 'travel-item';
            travelElement.innerHTML = `
                ${travel.photos && travel.photos.length > 0 ? `
                    <img src="${travel.photos[0]}" class="travel-image">
                ` : '<div class="travel-image" style="background:#eee;"></div>'}
                <div class="travel-info">
                    <h3 class="travel-title">${travel.title}</h3>
                    <div class="travel-meta">
                        ${travel.country}, ${formatTravelDate(travel.date)}
                    </div>
                    <p class="travel-description">
                        ${travel.description || 'Описание отсутствует'}
                    </p>
                    <a href="#" class="travel-link" data-id="${travel.id}">Подробнее</a>
                </div>
            `;
            travelList.appendChild(travelElement);
        });
    }

    // Переключение вкладок
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Удаляем активный класс у всех кнопок и вкладок
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке и соответствующей вкладке
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // При необходимости загружаем данные для вкладки
            if (tabId === 'photos' && photosGrid.innerHTML === '') {
                loadUserPhotos();
            } else if (tabId === 'travel' && travelList.innerHTML === '') {
                loadUserTravels();
            }
        });
    });

    // Редактирование профиля
    editProfileBtn.addEventListener('click', function() {
        const user = users.find(u => u.email === currentUser.email) || currentUser;
        
        // Заполняем форму текущими данными
        document.getElementById('edit-name').value = user.name || '';
        document.getElementById('edit-city').value = user.city || '';
        document.getElementById('edit-country').value = user.country || '';
        document.getElementById('edit-birthday').value = user.birthday || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-bio').value = user.bio || '';
        
        // Показываем модальное окно
        editProfileModal.style.display = 'block';
    });

    // Сохранение изменений профиля
    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Находим пользователя в массиве
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        const user = userIndex !== -1 ? users[userIndex] : currentUser;
        
        // Обновляем данные
        user.name = document.getElementById('edit-name').value;
        user.city = document.getElementById('edit-city').value;
        user.country = document.getElementById('edit-country').value;
        user.birthday = document.getElementById('edit-birthday').value;
        user.phone = document.getElementById('edit-phone').value;
        user.bio = document.getElementById('edit-bio').value;
        
        // Сохраняем изменения
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Обновляем текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Закрываем модальное окно и обновляем данные на странице
        editProfileModal.style.display = 'none';
        updateProfileInfo();
    });

    // Изменение аватара
    changeAvatarBtn.addEventListener('click', function() {
        avatarUpload.click();
    });

    avatarUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Обновляем аватар на странице
                profileAvatar.src = e.target.result;
                
                // Сохраняем в данных пользователя
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].avatar = e.target.result;
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    // Обновляем текущего пользователя
                    currentUser.avatar = e.target.result;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Изменение обложки
    changeCoverBtn.addEventListener('click', function() {
        coverUpload.click();
    });

    coverUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Обновляем обложку на странице
                coverImage.style.backgroundImage = `url(${e.target.result})`;
                
                // Сохраняем в данных пользователя
                const userIndex = users.findIndex(u => u.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].coverImage = e.target.result;
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    // Обновляем текущего пользователя
                    currentUser.coverImage = e.target.result;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Публикация поста
    publishPostBtn.addEventListener('click', function() {
        const text = postText.value.trim();
        if (!text) return;
        
        const newPost = {
            id: Date.now().toString(),
            text: text,
            author: currentUser.email,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            photos: []
        };
        
        // В реальном приложении нужно загружать фото на сервер
        if (postPhotoUpload.files.length > 0) {
            Array.from(postPhotoUpload.files).forEach(file => {
                const photoUrl = URL.createObjectURL(file);
                newPost.photos.push(photoUrl);
                
                // Сохраняем фото в общий массив
                photos.push({
                    id: Date.now().toString(),
                    url: photoUrl,
                    userEmail: currentUser.email,
                    createdAt: new Date().toISOString()
                });
            });
        }
        
        // Добавляем пост и сохраняем
        posts.unshift(newPost);
        localStorage.setItem('posts', JSON.stringify(posts));
        localStorage.setItem('photos', JSON.stringify(photos));
        
        // Очищаем форму и обновляем список постов
        postText.value = '';
        postPhotoUpload.value = '';
        loadUserPosts();
        
        // Переключаем на вкладку постов, если это не она
        if (!document.querySelector('.tab-btn[data-tab="posts"]').classList.contains('active')) {
            document.querySelector('.tab-btn[data-tab="posts"]').click();
        }
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', function(e) {
        if (e.target === editProfileModal) {
            editProfileModal.style.display = 'none';
        }
    });

    // Инициализация страницы
    updateProfileInfo();
    loadFriendsPreview();
    loadUserPosts();
});