// ===== GLOBAL JS (Final Premium Version) =====

// Select elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const siteHeader = document.querySelector('.site-header');
const navLinkItems = document.querySelectorAll('.nav-links a');
const scrollElements = document.querySelectorAll('.animate-on-scroll');

// ===== Hamburger Toggle =====
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// ===== Sticky Header on Scroll =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        siteHeader.classList.add('scrolled');
    } else {
        siteHeader.classList.remove('scrolled');
    }
});

// ===== Highlight Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 80;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav-links a[href*=' + sectionId + ']').classList.add('active');
        } else {
            document.querySelector('.nav-links a[href*=' + sectionId + ']').classList.remove('active');
        }
    });
});

// ===== Scroll Reveal Animations =====
const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend;
};

const displayScrollElement = (element) => {
    element.classList.add('visible');
};

const hideScrollElement = (element) => {
    element.classList.remove('visible');
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1.2)) {
            displayScrollElement(el);
        } else {
            hideScrollElement(el);
        }
    });
};

window.addEventListener('scroll', handleScrollAnimation);

// ===== Smooth Scroll for Navigation Links =====
navLinkItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });

        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});
// ============================
// global.js — CoffeeLife Cafe PWA
// ============================

// ===== Service Worker Registration =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
        .then(() => console.log('Service Worker Registered'))
        .catch(err => console.error('SW registration failed:', err));
}

// ===== PWA Install Prompt =====
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Prevent automatic prompt
    deferredPrompt = e;

    // Create custom install button
    const btn = document.createElement('button');
    btn.textContent = 'Install CoffeeLife App';
    btn.className = 'btn-install';
    btn.style.position = 'fixed';
    btn.style.bottom = '80px';
    btn.style.right = '20px';
    btn.style.zIndex = '1000';
    btn.style.padding = '15px 25px';
    btn.style.backgroundColor = '#b85c38';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '12px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    document.body.appendChild(btn);

    btn.addEventListener('click', async () => {
        btn.style.display = 'none';
        deferredPrompt.prompt(); // Show browser install prompt
        const choice = await deferredPrompt.userChoice;
        console.log('User choice:', choice.outcome);
        deferredPrompt = null;
    });
});

// ===== WhatsApp Floating Button =====
const whatsappBtn = document.querySelector('.whatsapp-btn');
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        const phone = '+256709691395'; // Replace with your WhatsApp number
        const message = encodeURIComponent('Hello CoffeeLife, I want to place an order.');
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
}

// ===== Utility Function: Format UGX =====
function formatUGX(amount) {
    return "UGX " + Number(amount).toLocaleString();
}

// ===== Menu Rendering Hooks =====
function addToCart(item) {
    // Add 4000 transport charge
    const itemWithTransport = { ...item, price: item.price + 4000 };
    console.log(`Added to cart: ${item.name} (+4000 transport)`);

    if (window.cartAdd) {
        window.cartAdd(itemWithTransport);
    } else {
        // fallback if cartAdd is not defined
        window.cart = window.cart || [];
        const existing = window.cart.find(i => i.id === item.id);
        if (existing) existing.qty++;
        else window.cart.push({ ...itemWithTransport, qty: 1 });
        alert(`${item.name} added to cart (+4000 delivery)`);
    }
}

// Optional: Expose globally for menu.js
window.globalAddToCart = addToCart;

// ===== Responsive Adjustments =====
window.addEventListener("resize", () => {
    const menuContainer = document.getElementById("menu-container");
    if (!menuContainer) return;

    if (window.innerWidth <= 600) menuContainer.style.gridTemplateColumns = "1fr";
    else if (window.innerWidth <= 900) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    else if (window.innerWidth <= 1200) menuContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
    else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
});
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.querySelector(".nav-menu");

    // Toggle Menu
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Close menu when link clicked
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });

    // Optional: Close menu on outside click
    document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        }
    });
});
