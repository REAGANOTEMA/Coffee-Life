/* =========================================
   ULTRA-LUXURY CINEMATIC HEADER - JS
   ========================================= */

// Header scroll blur and shadow effect
const header = document.getElementById("mainHeader");
function handleHeaderScroll() {
    const scrollY = window.scrollY;
    header.style.backdropFilter = `blur(${16 + scrollY / 20}px)`;
    header.style.boxShadow = `0 ${12 + scrollY / 10}px ${40 + scrollY / 5}px rgba(0,0,0,${0.5 + scrollY / 100})`;
}
window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
});

// Cart count
window.cart = window.cart || [];
const cartCount = document.getElementById("cart-count");
function updateCartCount() {
    if (cartCount) {
        const totalQty = window.cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalQty;
    }
}
function addToCart(item) {
    const itemWithTransport = { ...item, price: item.price + 4000 };
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...itemWithTransport, qty: 1 });
    updateCartCount();
}
window.globalAddToCart = addToCart;
document.addEventListener("DOMContentLoaded", updateCartCount);

// Cinematic header background animation
const headerBg = document.createElement('div');
headerBg.style.position = 'absolute';
headerBg.style.top = 0;
headerBg.style.left = 0;
headerBg.style.width = '100%';
headerBg.style.height = '100%';
headerBg.style.background = 'url("images/coffee-hero-hd.jpg") center/cover no-repeat';
headerBg.style.filter = 'brightness(0.6) contrast(1.25) saturate(1.4)';
headerBg.style.zIndex = '-2';
headerBg.style.transition = 'transform 0.05s linear';
header.appendChild(headerBg);

let scale = 1;
let direction = 0.0005;
function animateHeader() {
    scale += direction;
    if (scale > 1.05 || scale < 1) direction *= -1;
    headerBg.style.transform = `scale(${scale}) translateY(${Math.sin(Date.now() / 3000) * 5}px)`;
    requestAnimationFrame(animateHeader);
}
animateHeader();

// Floating luxury gold particles
const particleContainer = document.createElement('div');
particleContainer.style.position = 'absolute';
particleContainer.style.top = 0;
particleContainer.style.left = 0;
particleContainer.style.width = '100%';
particleContainer.style.height = '100%';
particleContainer.style.pointerEvents = 'none';
particleContainer.style.overflow = 'hidden';
particleContainer.style.zIndex = '-1';
header.appendChild(particleContainer);

for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.width = '2px';
    p.style.height = '2px';
    p.style.background = 'gold';
    p.style.borderRadius = '50%';
    p.style.opacity = Math.random() * 0.8;
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animation = `floatParticle ${5 + Math.random() * 5}s infinite alternate ease-in-out`;
    particleContainer.appendChild(p);
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes floatParticle {
  0% { transform: translate(0,0) scale(1);}
  50% { transform: translate(${Math.random() * 20 - 10}px,${Math.random() * 20 - 10}px) scale(1.2);}
  100% { transform: translate(0,0) scale(1);}
}`;
document.head.appendChild(style);
