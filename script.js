// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(-${index * 100}%)`;
    });
}

function moveCarousel(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    showSlide(currentSlide);

    // Optional: Auto-advance carousel
    setInterval(() => {
        moveCarousel(1);
    }, 5000); // Change slide every 5 seconds
});


