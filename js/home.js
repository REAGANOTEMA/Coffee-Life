/* =========================================
   HOME.JS - FINAL ULTRA-LUXURY HEADER
   ========================================= */

/* ===== 1. HEADER SCROLL EFFECT ===== */
const header = document.querySelector("header.site-header");

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
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    hamburger.querySelectorAll('.bar').forEach(bar => {
        bar.style.backgroundColor = hamburger.classList.contains('active') ? 'var(--gold)' : 'var(--royal-blue)';
    });
});

/* ===== 3. CLOSE MOBILE MENU ON LINK CLICK ===== */
const mobileLinks = document.querySelectorAll(".mobile-link");
mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("active");
        hamburger.querySelectorAll('.bar').forEach(bar => bar.style.backgroundColor = 'var(--royal-blue)');
    });
});

/* ===== 4. NAV LINK HOVER EFFECT ===== */
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
    link.addEventListener("mouseenter", () => link.style.color = "var(--gold)");
    link.addEventListener("mouseleave", () => link.style.color = "var(--royal-blue)");
});

/* ===== 5. RESPONSIVE HERO FONT SIZES ===== */
function adjustHeroFonts() {
    const heroTitle = document.querySelector(".hero-title-text");
    const heroSubtitle = document.querySelector(".hero-subtitle");
    const heroNote = document.querySelector(".hero-note");

    if (heroTitle && heroSubtitle && heroNote) {
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
}
window.addEventListener("resize", adjustHeroFonts);
adjustHeroFonts();

/* ===== 6. CART & WHATSAPP INTEGRATION ===== */
window.cart = window.cart || [];
const whatsappBtn = document.querySelector('.whatsapp-btn, .whatsapp-float');

function updateWhatsAppButton() {
    if (!whatsappBtn) return;

    if (window.cart.length === 0) {
        whatsappBtn.classList.add('disabled');
        whatsappBtn.style.pointerEvents = 'none';
        whatsappBtn.style.opacity = 0.5;
        whatsappBtn.title = "Add items to your cart first!";
    } else {
        whatsappBtn.classList.remove('disabled');
        whatsappBtn.style.pointerEvents = 'auto';
        whatsappBtn.style.opacity = 1;
        whatsappBtn.title = "Chat on WhatsApp";
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

/* ===== 7. ADD TO CART FUNCTION ===== */
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

/* ===== 8. INITIALIZE ON PAGE LOAD ===== */
document.addEventListener("DOMContentLoaded", updateWhatsAppButton);

/* ===== 9. OPTIONAL PREMIUM ANIMATIONS ===== */
// Subtle nav link glow every 8 seconds
setInterval(() => {
    navLinks.forEach(link => {
        link.style.transition = "all 0.5s ease";
        link.style.color = "var(--gold)";
        setTimeout(() => link.style.color = "var(--royal-blue)", 500);
    });
}, 8000);
