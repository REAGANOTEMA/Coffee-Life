/* =========================================
   ULTRA-LUXURY CINEMATIC HEADER - JS (SIDE LOGO PERFECTLY FILLED)
   ========================================= */

// ====== GLOBAL ELEMENTS ======
const header = document.getElementById("mainHeader");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const cartCount = document.getElementById("cart-count");

// ====== LOGO + SLOGAN INJECT (SIDE, FULLY CONTAINED) ======
const logoWrapper = document.createElement('div');
logoWrapper.id = "luxury-logo-wrapper";
logoWrapper.innerHTML = `
    <div class="luxury-logo-circle">
        <img src="images/logo.jpg" alt="Logo" class="luxury-logo-img" />
    </div>
    <div class="luxury-slogan">eat. meat. work.</div>
`;
header.appendChild(logoWrapper);

// ====== HEADER SCROLL EFFECT ======
function handleHeaderScroll() {
    const scrollY = window.scrollY;
    header.style.backdropFilter = `blur(${16 + scrollY / 20}px)`;
    header.style.boxShadow = `0 ${12 + scrollY / 10}px ${40 + scrollY / 5}px rgba(0,0,0,${0.5 + scrollY / 100})`;
}
window.addEventListener("scroll", handleHeaderScroll);
handleHeaderScroll();

// ====== HAMBURGER MENU ======
hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");
});

// ====== CART SYSTEM ======
window.cart = window.cart || [];
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

// ====== BACKGROUND ANIMATION ======
const headerBg = document.createElement('div');
headerBg.classList.add('header-bg-anim');
headerBg.style.backgroundImage = 'url("images/hero.jpg")';
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

// ====== FLOATING GOLD PARTICLES ======
const particleContainer = document.createElement('div');
particleContainer.classList.add('luxury-particle-container');
header.appendChild(particleContainer);

for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.classList.add('gold-particle');
    p.style.top = Math.random() * 100 + '%';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = `${5 + Math.random() * 5}s`;
    particleContainer.appendChild(p);
}

// ====== STYLES (APPENDED) ======
const style = document.createElement('style');
style.innerHTML = `
#luxury-logo-wrapper {
    position: absolute;
    top: 50%;
    left: 5%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
}
.luxury-logo-circle {
    width: 120px;
    height: 120px;
    border: 4px solid gold;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 50px rgba(212,175,55,0.7), 0 0 60px rgba(0,0,0,0.6);
    overflow: hidden; /* ensure logo stays fully inside */
}
.luxury-logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* fill the circle perfectly */
}
.luxury-slogan {
    margin-top: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    color: gold;
    text-transform: uppercase;
    letter-spacing: 3px;
    text-shadow: 0 0 10px rgba(212,175,55,0.9);
    white-space: nowrap;
    text-align: center;
}
.header-bg-anim {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
    filter: brightness(0.6) contrast(1.25) saturate(1.4);
    z-index: -2;
    transition: transform 0.05s linear;
}
.luxury-particle-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: -1;
}
.gold-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: gold;
    border-radius: 50%;
    opacity: 0.8;
    animation-name: floatParticle;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
}
@keyframes floatParticle {
    0% { transform: translate(0,0) scale(1);}
    50% { transform: translate(10px,-15px) scale(1.3);}
    100% { transform: translate(0,0) scale(1);}
}
`;
document.head.appendChild(style);
