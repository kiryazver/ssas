document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const photoUpload = document.getElementById('photo-upload');
    
    let currentSlide = 0;
    
    // Показать текущий слайд
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }
    
    // Следующий слайд
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Предыдущий слайд
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    // Обработчики кнопок
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    

});