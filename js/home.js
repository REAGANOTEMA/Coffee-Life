/* =========================================
   HOME.JS - FINAL, ULTRA PREMIUM, STATIC HEADER
   ========================================= */

/* ===== 1. HEADER SCROLL EFFECT ===== */
const header = document.querySelector("header");

function handleHeaderScroll() {
    if(window.scrollY > 50) {
        header.classList.add("scrolled");
        header.style.backdropFilter = "blur(18px)";
        header.style.boxShadow = "0 15px 50px rgba(0,0,0,0.55)";
    } else {
        header.classList.remove("scrolled");
        header.style.backdropFilter = "blur(14px)";
        header.style.boxShadow = "0 12px 40px rgba(0,0,0,0.5)";
    }
}

window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

/* ===== 2. HAMBURGER MENU TOGGLE ===== */
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    hamburger.querySelectorAll('.bar').forEach(bar => {
        bar.style.backgroundColor = hamburger.classList.contains('active') ? 'var(--gold)' : 'var(--coffee)';
    });
});

/* ===== 3. MOBILE LINK CLICK CLOSE MENU ===== */
const mobileLinks = document.querySelectorAll(".mobile-link");
mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        hamburger.querySelectorAll('.bar').forEach(bar => bar.style.backgroundColor = 'var(--coffee)');
    });
});

/* ===== 4. NAV LINK HOVER EFFECT ===== */
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => link.style.color = "var(--gold)");
    link.addEventListener("mouseleave", () => link.style.color = "var(--coffee)");
});

/* ===== 5. NAV LINK SHAKE ANIMATION EVERY 5s ===== */
setInterval(() => {
    navLinks.forEach(link => {
        link.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => link.style.animation = "", 500);
    });
}, 5000);

/* ===== 6. NAV LINK LIGHT-UP ANIMATION EVERY 6s ===== */
setInterval(() => {
    navLinks.forEach(link => {
        link.style.animation = "lightUp 1s ease-in-out";
        setTimeout(() => link.style.animation = "", 1000);
    });
}, 6000);

/* ===== 7. RESPONSIVE HERO FONT SIZES ===== */
function adjustHeroFonts() {
    const heroTitle = document.querySelector(".hero-title-text");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroNote = document.querySelector(".hero-note");

    if(heroTitle && heroSubtitle && heroNote){
        if(window.innerWidth < 768){
            heroTitle.style.fontSize = "3.5rem";
            heroSubtitle.style.fontSize = "1.5rem";
            heroNote.style.fontSize = "1rem";
        } else {
            heroTitle.style.fontSize = "5rem";
            heroSubtitle.style.fontSize = "2rem";
            heroNote.style.fontSize = "1.2rem";
        }
    }
}

window.addEventListener("resize", adjustHeroFonts);
adjustHeroFonts();

/* ===== 8. CART & WHATSAPP INTEGRATION ===== */
window.cart = window.cart || [];
const whatsappBtn = document.querySelector('.whatsapp-btn, .whatsapp-float');

function updateWhatsAppButton() {
    if (!whatsappBtn) return;
    if (window.cart.length === 0) {
        whatsappBtn.classList.add('disabled');
        whatsappBtn.style.pointerEvents = 'none';
        whatsappBtn.title = "Add items to your cart first!";
        whatsappBtn.style.opacity = 0.5;
    } else {
        whatsappBtn.classList.remove('disabled');
        whatsappBtn.style.pointerEvents = 'auto';
        whatsappBtn.title = "Chat on WhatsApp";
        whatsappBtn.classList.add('highlight');
        whatsappBtn.style.opacity = 1;
    }
}

if (whatsappBtn) {
    whatsappBtn.addEventListener('click', e => {
        if (window.cart.length === 0) {
            e.preventDefault();
            alert("Please add items to your cart before contacting us on WhatsApp!");
            return;
        }
        const phone = '2567XXXXXXXX'; // Replace with your WhatsApp number
        const message = encodeURIComponent("Hello CoffeeLife, I want to place an order.");
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
}

/* ===== 9. ADD TO CART HOOK ===== */
function addToCart(item) {
    const itemWithTransport = { ...item, price: item.price + 4000 };
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...itemWithTransport, qty: 1 });

    alert(`${item.name} added to cart (+4000 delivery)`);
    updateWhatsAppButton();
    if (window.renderCart) window.renderCart();
}

window.globalAddToCart = addToCart;

// Initialize WhatsApp button on page load
document.addEventListener("DOMContentLoaded", updateWhatsAppButton);
