/* ========================================= 
   HOME.JS - ULTRA-LUXURY CINEMATIC HEADER & CART
   ========================================= */

/* ===== 1. HEADER SCROLL EFFECT ===== */
const header = document.getElementById("mainHeader");
function handleHeaderScroll() {
    if (window.scrollY > 30) {
        header.classList.add("scrolled");
        header.style.backdropFilter = "blur(18px)";
        header.style.boxShadow = "0 15px 50px rgba(0,0,0,0.55)";
    } else {
        header.classList.remove("scrolled");
        header.style.backdropFilter = "blur(16px)";
        header.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
    }
}
window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

/* ===== 2. HAMBURGER MENU TOGGLE ===== */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

function toggleMenu() {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !expanded);
}
hamburger.addEventListener("click", toggleMenu);

/* ===== 3. CLOSE MOBILE MENU ON LINK CLICK ===== */
document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => {
        if (hamburger.classList.contains("active")) toggleMenu();
    });
});

/* ===== 4. NAV LINK HOVER EFFECT ===== */
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => link.style.color = "var(--primary-gold)");
    link.addEventListener("mouseleave", () => link.style.color = "var(--white)");
});

/* ===== 5. RESPONSIVE HERO FONT SIZES ===== */
function adjustHeroFonts() {
    const heroTitle = document.querySelector(".hero-title-text");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroNote = document.querySelector(".hero-note");

    if (!heroTitle || !heroSubtitle || !heroNote) return;

    if (window.innerWidth < 768) {
        heroTitle.style.fontSize = "3.2rem";
        heroSubtitle.style.fontSize = "1.4rem";
        heroNote.style.fontSize = "0.95rem";
    } else {
        heroTitle.style.fontSize = "4.8rem";
        heroSubtitle.style.fontSize = "2rem";
        heroNote.style.fontSize = "1.2rem";
    }
}
window.addEventListener("resize", adjustHeroFonts);
adjustHeroFonts();

/* ===== 6. CART INTEGRATION ===== */
window.cart = window.cart || [];
const cartCount = document.getElementById("cart-count");

function updateCartCount() {
    if (cartCount) {
        const totalQty = window.cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalQty;
    }
}

/* ===== 7. ADD TO CART FUNCTION ===== */
function addToCart(item) {
    const itemWithTransport = { ...item, price: item.price + 4000 };
    const existing = window.cart.find(i => i.id === item.id);

    if (existing) existing.qty++;
    else window.cart.push({ ...itemWithTransport, qty: 1 });

    alert(`${item.name} added to cart (+4000 delivery)`);
    updateCartCount();
}
window.globalAddToCart = addToCart;

/* ===== 8. INITIALIZE ON PAGE LOAD ===== */
document.addEventListener("DOMContentLoaded", updateCartCount);

/* ===== 9. PREMIUM NAV ANIMATION ===== */
setInterval(() => {
    navLinks.forEach(link => {
        link.style.transition = "all 0.5s ease";
        link.style.color = "var(--primary-gold)";
        setTimeout(() => link.style.color = "var(--white)", 500);
    });
}, 8000);

/* ===== 10. CINEMATIC HERO BACKGROUND ANIMATION ===== */
const headerBg = document.createElement('div');
headerBg.style.position = 'absolute';
headerBg.style.top = 0;
headerBg.style.left = 0;
headerBg.style.width = '100%';
headerBg.style.height = '100%';
headerBg.style.background = 'url("images/coffee-hero-hd.jpg") center/cover no-repeat';
headerBg.style.filter = 'brightness(0.5) contrast(1.2) saturate(1.3)';
headerBg.style.zIndex = '-2';
headerBg.style.transition = 'transform 30s linear';
header.appendChild(headerBg);

let scale = 1;
setInterval(() => {
    scale = scale >= 1.05 ? 1 : scale + 0.0005;
    headerBg.style.transform = `scale(${scale})`;
}, 16); // ~60fps

// Subtle radial haze overlay
const overlay = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.top = 0;
overlay.style.left = 0;
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.background = 'radial-gradient(circle at center, rgba(255,255,255,0.03), transparent 70%)';
overlay.style.zIndex = '-1';
header.appendChild(overlay);
