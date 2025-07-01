document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = JSON.parse(getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Элементы DOM
    const travelPosts = document.getElementById('travel-posts');
    const createTravelBtn = document.getElementById('create-travel-btn');
    const travelModal = document.getElementById('travel-modal');
    const viewTravelModal = document.getElementById('view-travel-modal');
    const closeModals = document.querySelectorAll('.close-modal');
    const travelForm = document.getElementById('travel-form');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const countryFilter = document.getElementById('travel-country');
    const typeFilter = document.getElementById('travel-type');
    const photosInput = document.getElementById('travel-photos');
    const photosPreview = document.getElementById('photos-preview');

    // Инициализация карты
    const map = L.map('travel-map').setView([55.7558, 37.6173], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Инициализация карты для редактирования
    let editMap, editMarkers = [], editRoute = null;

    // Загрузка данных
    let travelPostsData = JSON.parse(localStorage.getItem('travelPosts')) || [];
    let countries = [];

    // Цвета для разных типов путешествий
    const typeColors = {
        'hiking': '#4CAF50',
        'city': '#2196F3',
        'beach': '#FFC107',
        'roadtrip': '#F44336'
    };

    // Иконки для карты
    const typeIcons = {
        'hiking': L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        'city': L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        'beach': L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        'roadtrip': L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    };

    // Отображение постов
    function renderPosts(filteredPosts = travelPostsData) {
        travelPosts.innerHTML = '';

        if (filteredPosts.length === 0) {
            travelPosts.innerHTML = `
                <div class="empty-posts">
                    <i class="fas fa-globe-europe"></i>
                    <p>Пока нет путешествий</p>
                </div>
            `;
            return;
        }

        // Сортируем по дате (новые сначала)
        const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedPosts.forEach(post => {
            const user = getUserByEmail(post.author) || {};
            const photosHTML = post.photos.slice(0, 3).map(photo => `
                <img src="${photo}" alt="Фото путешествия" class="post-photo" data-full="${photo}">
            `).join('');

            const postElement = document.createElement('div');
            postElement.className = 'travel-post';
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-author">
                        <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.name}" class="author-avatar">
                        <div>
                            <div>${user.name || 'Неизвестный'}</div>
                            <div class="post-meta">
                                ${formatTravelDate(post.date)}, ${post.country}
                            </div>
                        </div>
                    </div>
                    <span class="post-type ${post.type}">${getTravelTypeName(post.type)}</span>
                </div>
                <div class="post-body">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-description">${post.description}</p>
                    ${post.photos.length > 0 ? `
                        <div class="post-photos">
                            ${photosHTML}
                            ${post.photos.length > 3 ? `<div class="more-photos">+${post.photos.length - 3}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="post-footer">
                    <div class="post-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${post.locations.length > 0 ? post.locations[0].name : 'Местоположение не указано'}
                    </div>
                    <div class="post-actions">
                        <button class="view-post-btn" data-id="${post.id}">
                            <i class="fas fa-eye"></i> Подробнее
                        </button>
                    </div>
                </div>
            `;
            travelPosts.appendChild(postElement);
        });

        // Добавляем обработчики для кнопок
        document.querySelectorAll('.view-post-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                showTravelDetails(postId);
            });
        });

        // Просмотр фото
        document.querySelectorAll('.post-photo').forEach(photo => {
            photo.addEventListener('click', function() {
                const fullPhoto = this.getAttribute('data-full');
                // Можно реализовать просмотр фото в полноэкранном режиме
                window.open(fullPhoto, '_blank');
            });
        });

        // Обновляем карту
        updateMapWithPosts(filteredPosts);
    }

    // Форматирование даты
    function formatTravelDate(dateString) {
        const options = { month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    // Получение названия типа путешествия
    function getTravelTypeName(type) {
        const types = {
            'hiking': 'Походы',
            'city': 'Города',
            'beach': 'Пляжный отдых',
            'roadtrip': 'Роуд-трип'
        };
        return types[type] || type;
    }

    // Получение пользователя по email
    function getUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.find(u => u.email === email);
    }

    // Обновление карты с постами
    function updateMapWithPosts(posts) {
        // Очищаем карту
        map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        // Добавляем маркеры и маршруты
        posts.forEach(post => {
            if (post.locations && post.locations.length > 0) {
                // Добавляем маркеры
                post.locations.forEach(location => {
                    const marker = L.marker([location.lat, location.lng], {
                        icon: typeIcons[post.type]
                    }).addTo(map);
                    
                    marker.bindPopup(`
                        <b>${post.title}</b><br>
                        <small>${post.country}, ${formatTravelDate(post.date)}</small>
                    `);
                });

                // Добавляем маршрут, если есть несколько точек
                if (post.locations.length > 1 && post.type === 'roadtrip') {
                    const route = L.polyline(
                        post.locations.map(loc => [loc.lat, loc.lng]),
                        {color: typeColors[post.type]}
                    ).addTo(map);
                }
            }
        });

        // Автоматически подбираем масштаб, если есть маркеры
        if (posts.some(post => post.locations && post.locations.length > 0)) {
            const markerLayers = posts.flatMap(post => 
                post.locations ? post.locations.map(loc => L.latLng(loc.lat, loc.lng)) : []
            );
            map.fitBounds(L.latLngBounds(markerLayers), {padding: [50, 50]});
        }
    }

    // Показать модальное окно создания путешествия
    createTravelBtn.addEventListener('click', function() {
        // Инициализируем карту для редактирования
        initEditMap();
        
        // Показываем модальное окно
        travelModal.style.display = 'block';
    });

    // Инициализация карты для редактирования
    function initEditMap() {
        if (editMap) {
            editMap.remove();
        }
        
        editMap = L.map('travel-map-edit').setView([55.7558, 37.6173], 3);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(editMap);
        
        // Очищаем предыдущие маркеры и маршрут
        editMarkers = [];
        editRoute = null;
        
        // Добавляем обработчик клика по карте
        editMap.on('click', function(e) {
            if (document.getElementById('add-marker-btn').classList.contains('active')) {
                addMarkerToEditMap(e.latlng);
            }
        });
    }

    // Добавление маркера на карту редактирования
    function addMarkerToEditMap(latlng) {
        const marker = L.marker(latlng, {
            draggable: true
        }).addTo(editMap);
        
        editMarkers.push(marker);
        
        // Обновляем маршрут, если нужно
        updateEditRoute();
        
        // Добавляем обработчик удаления маркера
        marker.on('contextmenu', function() {
            editMap.removeLayer(marker);
            editMarkers = editMarkers.filter(m => m !== marker);
            updateEditRoute();
        });
        
        // Запрашиваем название места через Nominatim API
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
            .then(response => response.json())
            .then(data => {
                const name = data.display_name || 'Неизвестное место';
                marker.bindPopup(name).openPopup();
            });
    }

    // Обновление маршрута на карте редактирования
    function updateEditRoute() {
        if (editRoute) {
            editMap.removeLayer(editRoute);
        }
        
        if (editMarkers.length > 1) {
            editRoute = L.polyline(
                editMarkers.map(marker => marker.getLatLng()),
                {color: '#4267B2'}
            ).addTo(editMap);
        }
    }

    // Обработчики кнопок управления картой
    document.getElementById('add-marker-btn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('add-route-btn').classList.remove('active');
    });

    document.getElementById('add-route-btn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('add-marker-btn').classList.remove('active');
    });

    document.getElementById('clear-map-btn').addEventListener('click', function() {
        editMarkers.forEach(marker => editMap.removeLayer(marker));
        editMarkers = [];
        if (editRoute) editMap.removeLayer(editRoute);
        editRoute = null;
    });

    // Обработчик загрузки фото
    photosInput.addEventListener('change', function() {
        photosPreview.innerHTML = '';
        
        if (this.files.length > 0) {
            Array.from(this.files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoElement = document.createElement('div');
                    photoElement.className = 'photo-preview';
                    photoElement.innerHTML = `
                        <img src="${e.target.result}" alt="Предпросмотр фото">
                        <button class="remove-photo" data-index="${index}">&times;</button>
                    `;
                    photosPreview.appendChild(photoElement);
                    
                    // Обработчик удаления фото
                    photoElement.querySelector('.remove-photo').addEventListener('click', function() {
                        // Сложная логика удаления файла из input
                        const files = Array.from(photosInput.files);
                        files.splice(parseInt(this.getAttribute('data-index')), 1);
                        
                        const dataTransfer = new DataTransfer();
                        files.forEach(file => dataTransfer.items.add(file));
                        photosInput.files = dataTransfer.files;
                        
                        // Перерисовываем превью
                        photosInput.dispatchEvent(new Event('change'));
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    });

    // Закрыть модальные окна
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            travelModal.style.display = 'none';
            viewTravelModal.style.display = 'none';
        });
    });

    // Закрыть при клике вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target === travelModal) {
            travelModal.style.display = 'none';
        }
        if (e.target === viewTravelModal) {
            viewTravelModal.style.display = 'none';
        }
    });

    // Создание нового путешествия
    travelForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Получаем данные из формы
        const newPost = {
            id: Date.now().toString(),
            title: document.getElementById('travel-title').value,
            description: document.getElementById('travel-description').value,
            country: document.getElementById('travel-country-select').value,
            type: document.getElementById('travel-type-select').value,
            date: document.getElementById('travel-date').value,
            author: currentUser.email,
            createdAt: new Date().toISOString(),
            locations: editMarkers.map(marker => {
                const latlng = marker.getLatLng();
                return {
                    lat: latlng.lat,
                    lng: latlng.lng,
                    name: marker.getPopup()?.getContent() || 'Неизвестное место'
                };
            }),
            photos: []
        };

        // Сохраняем фото (в реальном приложении нужно загружать на сервер)
        if (photosInput.files.length > 0) {
            newPost.photos = Array.from(photosInput.files).map(file => {
                return URL.createObjectURL(file); // Временные URL, в реальном приложении нужно другое решение
            });
        }

        // Добавляем пост в массив и сохраняем
        travelPostsData.unshift(newPost);
        localStorage.setItem('travelPosts', JSON.stringify(travelPostsData));

        // Закрываем модальное окно и очищаем форму
        travelModal.style.display = 'none';
        travelForm.reset();
        photosPreview.innerHTML = '';

        // Обновляем список постов
        renderPosts();
        updateCountriesList();
    });

    // Показать детали путешествия
    function showTravelDetails(postId) {
        const post = travelPostsData.find(p => p.id === postId);
        if (!post) return;

        const user = getUserByEmail(post.author) || {};

        document.getElementById('travel-details').innerHTML = `
            <div class="travel-detail-header">
                <div class="post-author">
                    <img src="${user.avatar || 'https://via.placeholder.com/150'}" alt="${user.name}" class="author-avatar">
                    <div>
                        <h3>${user.name || 'Неизвестный'}</h3>
                        <div class="post-meta">
                            ${formatTravelDate(post.date)}, ${post.country}
                        </div>
                    </div>
                </div>
                <span class="post-type ${post.type}">${getTravelTypeName(post.type)}</span>
            </div>
            <div class="travel-detail-body">
                <h2>${post.title}</h2>
                <p class="travel-detail-description">${post.description}</p>
                
                ${post.photos.length > 0 ? `
                    <div class="travel-photos">
                        <h3>Фотографии (${post.photos.length})</h3>
                        <div class="photos-grid">
                            ${post.photos.map(photo => `
                                <img src="${photo}" alt="Фото путешествия" class="travel-photo">
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${post.locations.length > 0 ? `
                    <div class="travel-map-detail">
                        <h3>Карта путешествия</h3>
                        <div id="travel-detail-map" style="height: 300px;"></div>
                    </div>
                ` : ''}
            </div>
        `;

        // Инициализируем карту для просмотра деталей
        if (post.locations.length > 0) {
            const detailMap = L.map('travel-detail-map').setView(
                [post.locations[0].lat, post.locations[0].lng], 
                post.locations.length === 1 ? 10 : 5
            );
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(detailMap);
            
            // Добавляем маркеры
            post.locations.forEach(location => {
                L.marker([location.lat, location.lng], {
                    icon: typeIcons[post.type]
                }).addTo(detailMap)
                .bindPopup(`<b>${location.name}</b>`);
            });
            
            // Добавляем маршрут, если есть несколько точек
            if (post.locations.length > 1 && post.type === 'roadtrip') {
                L.polyline(
                    post.locations.map(loc => [loc.lat, loc.lng]),
                    {color: typeColors[post.type]}
                ).addTo(detailMap);
            }
        }

        // Показываем модальное окно
        viewTravelModal.style.display = 'block';
    }

    // Обновление списка стран для фильтра
    function updateCountriesList() {
        countries = [...new Set(travelPostsData.map(post => post.country))].sort();
        
        // Обновляем фильтр
        countryFilter.innerHTML = `
            <option value="all">Все страны</option>
            ${countries.map(country => `
                <option value="${country}">${country}</option>
            `).join('')}
        `;
        
        // Обновляем datalist для формы
        document.getElementById('countries').innerHTML = countries.map(country => `
            <option value="${country}">
        `).join('');
    }

    // Применение фильтров
    applyFiltersBtn.addEventListener('click', function() {
        const country = countryFilter.value;
        const type = typeFilter.value;
        
        let filteredPosts = travelPostsData;
        
        if (country !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.country === country);
        }
        
        if (type !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.type === type);
        }
        
        renderPosts(filteredPosts);
    });

    // Инициализация при загрузке
    updateCountriesList();
    renderPosts();
});