/* =========================
   HOME.JS - HERO INTERACTIONS & PWA
========================= */

// Hero text elements
const heroMainHeading = document.querySelector('.hero-content h1');
const heroSubHeading = document.querySelector('.hero-content p');
const heroMovingText = document.querySelector('.hero-moving-text span');

// Array of luxurious fonts for hero headings
const fonts = ["'Playfair Display', serif", "'Lora', serif", "'Cinzel', serif", "'Montserrat', sans-serif", "'Garamond', serif"];
let fontIndex = 0;

// Rotate fonts every 4 seconds
setInterval(() => {
    if (heroMainHeading && heroSubHeading) {
        heroMainHeading.style.fontFamily = fonts[fontIndex % fonts.length];
        heroSubHeading.style.fontFamily = fonts[(fontIndex + 1) % fonts.length];
        fontIndex++;
    }
}, 4000);

// Hero button hover effect
const heroButtons = document.querySelectorAll('.hero-btn');
heroButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.transition = 'all 0.3s ease';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});

// Fade-in animations on load
window.addEventListener('load', () => {
    if (heroMainHeading) heroMainHeading.classList.add('fade-in');
    if (heroSubHeading) heroSubHeading.classList.add('fade-in');
    if (heroMovingText) heroMovingText.classList.add('fade-in');
});

// Pause moving text on hover
if (heroMovingText) {
    heroMovingText.addEventListener('mouseenter', () => {
        heroMovingText.style.animationPlayState = 'paused';
    });
    heroMovingText.addEventListener('mouseleave', () => {
        heroMovingText.style.animationPlayState = 'running';
    });
}

// Scroll-triggered effects for hero section
const heroSection = document.querySelector('.hero');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            heroSection.style.opacity = 1;
            heroSection.style.transform = 'scale(1)';
        } else {
            heroSection.style.opacity = 0.95;
            heroSection.style.transform = 'scale(0.98)';
        }
    });
}, { threshold: 0.1 });

if (heroSection) observer.observe(heroSection);

/* =========================
   PWA SERVICE WORKER REGISTRATION
========================= */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered!', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

/* =========================
   OPTIONAL: MENU INTERACTIONS (Offline-ready)
========================= */
// Fetch menu JSON (cached via service worker)
const menuContainer = document.querySelector('#menu-container'); // assuming this div exists
fetch('menu.json')
    .then(response => response.json())
    .then(data => {
        if (menuContainer) {
            menuContainer.innerHTML = data.map(item => `
                <div class="menu-item">
                    <img src="${item.image}" alt="${item.name}" />
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <span class="price">UGX ${item.price}</span>
                    <button class="order-btn">Order Now</button>
                </div>
            `).join('');
        }
    })
    .catch(err => console.log('Failed to load menu:', err));
