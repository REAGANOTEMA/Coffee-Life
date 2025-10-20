/* =========================================
   ULTRA-LUXURY CAFÉ HEADER - FINAL JS (Option C)
   - "Moments Begin with Coffee"
   - "Where Comfort Meets Flavor"
   ========================================= */

// ====== ELEMENT HOISTS ======
const header = document.getElementById("mainHeader") || document.querySelector("header") || document.body;
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
let cartCount = document.getElementById("cart-count");

// ====== SAFETY: REMOVE ANY ORDER BUTTONS ======
const orderBtn = document.querySelector('.order-btn, #orderButton, .header-order');
if (orderBtn) orderBtn.remove();

// ====== BUILD LOGO + CAFÉ TEXT BLOCK ======
(function injectLogoAndText() {
    // Remove any previous injected wrapper to avoid duplicates
    const prev = document.getElementById('luxury-logo-wrapper');
    if (prev) prev.remove();

    const logoWrapper = document.createElement('div');
    logoWrapper.id = "luxury-logo-wrapper";
    logoWrapper.setAttribute('aria-hidden', 'false');
    logoWrapper.innerHTML = `
    <div class="luxury-logo-inner" role="img" aria-label="Cafe logo">
      <div class="luxury-logo-circle">
          <img src="images/logo.jpg" alt="Cafe Logo" class="luxury-logo-img" />
      </div>
      <div class="luxury-copy">
        <div class="luxury-slogan">Moments Begin with Coffee</div>
        <div class="luxury-slogan-sub">Where Comfort Meets Flavor</div>
      </div>
    </div>
  `;
    // ensure header is positioned relatively for absolute children
    if (header && getComputedStyle(header).position === 'static') {
        header.style.position = 'relative';
    }
    header.prepend(logoWrapper);
})();

// ====== HEADER SCROLL TREATMENT ======
(function headerScrollEffect() {
    function handleHeaderScroll() {
        const scrollY = Math.min(window.scrollY, 200); // cap for subtlety
        header.style.backdropFilter = `blur(${6 + scrollY / 40}px)`;
        header.style.boxShadow = `0 ${6 + scrollY / 24}px ${24 + scrollY / 6}px rgba(0,0,0,${0.25 + scrollY / 300})`;
        header.style.transition = 'box-shadow 220ms ease, backdrop-filter 220ms ease';
    }
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });
    handleHeaderScroll();
})();

// ====== HAMBURGER RELIABILITY ======
if (hamburger) {
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('aria-controls', mobileMenu ? mobileMenu.id || 'mobileMenu' : '');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        if (mobileMenu) mobileMenu.classList.toggle('active', isActive);
        hamburger.setAttribute('aria-expanded', String(isActive));
    });
    // close when tapping outside mobile menu
    document.addEventListener('click', (e) => {
        if (!mobileMenu || !hamburger) return;
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
}

// ====== CART MODEL (global so other scripts can call add/remove) ======
window.cart = window.cart || []; // items: { id, title, price, qty }
function getCartTotal() {
    return window.cart.reduce((s, it) => s + (it.price * it.qty), 0);
}
function updateCartCountDisplay() {
    cartCount = cartCount || document.getElementById('cart-count');
    if (!cartCount) {
        // create fallback hidden counter on floating bubble
        const created = document.querySelector('.floating-cart-bubble .bubble-count');
        if (created) {
            created.textContent = window.cart.reduce((s, i) => s + i.qty, 0);
            return;
        }
    }
    if (cartCount) cartCount.textContent = window.cart.reduce((s, i) => s + i.qty, 0);
}
function addToCart(item) {
    if (!item || !item.id) return;
    const ex = window.cart.find(i => i.id === item.id);
    if (ex) ex.qty++;
    else window.cart.push({ ...item, qty: 1 });
    updateCartCountDisplay();
    renderCartDrawerItems();
}
function removeFromCart(itemId) {
    const ex = window.cart.find(i => i.id === itemId);
    if (!ex) return;
    ex.qty--;
    if (ex.qty <= 0) window.cart = window.cart.filter(i => i.id !== itemId);
    updateCartCountDisplay();
    renderCartDrawerItems();
}
window.globalAddToCart = addToCart;
window.globalRemoveFromCart = removeFromCart;

// ====== FLOATING ADD-TO-CART BUBBLE + CART DRAWER ======
(function createFloatingCart() {
    // wrapper bubble
    const bubble = document.createElement('div');
    bubble.className = 'floating-cart-bubble';
    bubble.innerHTML = `
    <button class="floating-cart-btn" aria-label="Open cart" title="Cart" type="button">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M7 4h-2l-1 2h2l2 9h8l3-7h-12z"></path>
      </svg>
      <span class="bubble-count">0</span>
    </button>
    <div class="cart-drawer" aria-hidden="true">
      <div class="cart-drawer-head">
        <strong>Your Order</strong>
        <button class="cart-close" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-drawer-items" role="list"></div>
      <div class="cart-drawer-footer">
        <div class="cart-total">Total: <span class="cart-total-amount">UGX 0</span></div>
        <div class="cart-actions">
          <button class="checkout-btn" disabled>Checkout</button>
          <button class="clear-cart">Clear</button>
        </div>
      </div>
    </div>
  `;
    // append to body (free space)
    document.body.appendChild(bubble);

    const btn = bubble.querySelector('.floating-cart-btn');
    const drawer = bubble.querySelector('.cart-drawer');
    const closeBtn = bubble.querySelector('.cart-close');
    const itemsContainer = bubble.querySelector('.cart-drawer-items');
    const totalEl = bubble.querySelector('.cart-total-amount');
    const checkoutBtn = bubble.querySelector('.checkout-btn');
    const clearBtn = bubble.querySelector('.clear-cart');

    // open/close handlers
    function openDrawer() {
        bubble.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        renderCartDrawerItems();
    }
    function closeDrawer() {
        bubble.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
    }
    btn.addEventListener('click', () => {
        bubble.classList.toggle('open');
        const isOpen = bubble.classList.contains('open');
        drawer.setAttribute('aria-hidden', String(!isOpen));
        if (isOpen) renderCartDrawerItems();
    });
    closeBtn.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

    // render function
    window.renderCartDrawerItems = function renderCartDrawerItems() {
        itemsContainer.innerHTML = '';
        if (!window.cart.length) {
            itemsContainer.innerHTML = `<div class="empty">Your cart is empty</div>`;
            totalEl.textContent = formatCurrency(0);
            checkoutBtn.disabled = true;
            updateCartCountDisplay();
            return;
        }
        window.cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
        <div class="ci-left">
          <div class="ci-title">${escapeHtml(item.title || 'Item')}</div>
          <div class="ci-meta">UGX ${formatNumber(item.price)} × <span class="ci-qty">${item.qty}</span></div>
        </div>
        <div class="ci-controls">
          <button class="ci-add" aria-label="Add one">＋</button>
          <button class="ci-remove" aria-label="Remove one">－</button>
        </div>
      `;
            // wire controls
            row.querySelector('.ci-add').addEventListener('click', () => {
                addToCart(item);
            });
            row.querySelector('.ci-remove').addEventListener('click', () => {
                removeFromCart(item.id);
            });
            itemsContainer.appendChild(row);
        });
        totalEl.textContent = formatCurrency(getCartTotal());
        checkoutBtn.disabled = false;
        updateCartCountDisplay();
    };

    clearBtn.addEventListener('click', () => {
        window.cart = [];
        renderCartDrawerItems();
    });

    checkoutBtn.addEventListener('click', () => {
        // placeholder: trigger site checkout flow
        alert('Proceeding to checkout — implement your checkout flow here.');
    });

    // helpers
    function formatCurrency(n) {
        // UGX formatting (no decimals)
        return 'UGX ' + formatNumber(n);
    }
    function formatNumber(n) {
        return Number(n).toLocaleString('en-UG', { maximumFractionDigits: 0 });
    }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    // initialize
    renderCartDrawerItems();
})();

// ====== OPTIONAL: make site-wide "add to cart" buttons work if they have data attributes ======
(function wirePageAddButtons() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-add-to-cart]');
        if (!btn) return;
        // read item data
        const id = btn.getAttribute('data-id') || btn.getAttribute('data-item-id') || btn.dataset.id;
        const title = btn.getAttribute('data-title') || btn.dataset.title || btn.innerText || 'Item';
        const priceStr = btn.getAttribute('data-price') || btn.dataset.price || '0';
        const price = Number(priceStr) || 0;
        if (!id) {
            console.warn('Add-to-cart clicked but no item id specified. Use data-id attribute.');
            return;
        }
        addToCart({ id, title, price });
        // gentle click feedback
        btn.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease' });
    });
})();

// ====== BACKGROUND IMAGE & PARTICLES (subtle) ======
(function decorateHeaderBg() {
    const headerBg = document.createElement('div');
    headerBg.className = 'header-bg-anim';
    headerBg.style.backgroundImage = 'url("images/hero.jpg")';
    header.prepend(headerBg);

    const particleContainer = document.createElement('div');
    particleContainer.className = 'luxury-particle-container';
    header.appendChild(particleContainer);
    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'gold-particle';
        p.style.top = Math.random() * 100 + '%';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = `${4 + Math.random() * 5}s`;
        particleContainer.appendChild(p);
    }
    // gentle pan
    let t = 0;
    function pan() {
        t += 0.0016;
        headerBg.style.transform = `scale(1.02) translateY(${Math.sin(t * 2.5) * 6}px)`;
        requestAnimationFrame(pan);
    }
    pan();
})();

// ====== INJECT STYLES (final polished look) ======
(function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
    /* Logo / copy */
    #luxury-logo-wrapper { position: absolute; top: 50%; left: 3%; transform: translateY(-50%); z-index: 1200; display:flex; align-items:center; gap:12px; pointer-events: none; }
    #luxury-logo-wrapper .luxury-logo-inner { display:flex; align-items:center; gap:12px; pointer-events: auto; }
    .luxury-logo-circle { width: 72px; height:72px; border-radius:50%; border:3px solid #fffefdff; display:flex; align-items:center; justify-content:center; overflow:hidden; background: rgba(0,0,0,0.50); box-shadow: 0 6px 30px rgba(0,0,0,0.45); }
    .luxury-logo-img { width:100%; height:100%; object-fit:cover; display:block; }
    .luxury-copy { display:flex; flex-direction:column; pointer-events: none; }
    .luxury-slogan { font-family: 'Georgia', serif; font-size: 1.05rem; color: #262b5fff; font-weight:700; letter-spacing:1px; text-transform:none; text-shadow: 0 0 10px rgba(212,175,55,0.6); }
    .luxury-slogan-sub { font-family: system-ui, -apple-system, 'Segoe UI', Roboto; font-size:0.78rem; color: rgba(255,255,255,0.9); opacity:0.95; margin-top:2px; }

    /* header bg + particles */
    .header-bg-anim { position:absolute; inset:0; z-index:-50; background-size:cover; background-position:center; filter: brightness(0.6) contrast(1.15) saturate(1.12); transition: transform 220ms linear; }
    .luxury-particle-container { position:absolute; inset:0; pointer-events:none; z-index:-49; overflow:hidden; }
    .gold-particle { position:absolute; width:3px; height:3px; border-radius:50%; background: linear-gradient(180deg,#D4AF37,#FFD66B); opacity:0.9; transform-origin:center; animation: pfloat linear infinite; }
    @keyframes pfloat { 0% { transform: translateY(0) scale(1); } 50% { transform: translateY(-18px) scale(1.4); } 100% { transform: translateY(0) scale(1); } }

    /* floating cart bubble */
    .floating-cart-bubble { position: fixed; right: 22px; top: 18px; z-index: 2000; font-family: system-ui, -apple-system, 'Segoe UI', Roboto; }
    .floating-cart-btn { display:flex; align-items:center; gap:8px; background: rgba(20,20,20,0.85); color: #fff; border-radius: 999px; padding:10px 12px; border: 1px solid rgba(212,175,55,0.12); box-shadow: 0 6px 30px rgba(0,0,0,0.45); cursor:pointer; backdrop-filter: blur(6px); outline: none; }
    .floating-cart-btn svg { display:block; transform: translateY(-1px); }
    .floating-cart-bubble .bubble-count { background: #de8969ff; color:#111; border-radius:999px; min-width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center; padding:0 6px; font-weight:700; font-size:0.85rem; box-shadow: 0 2px 8px rgba(212,175,55,0.25); }
    .floating-cart-bubble .floating-cart-btn { animation: pulse 3s infinite; }
    @keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.03) } 100% { transform: scale(1) } }

    /* cart drawer */
    .cart-drawer { position:absolute; right:0; top: calc(100% + 12px); width: 320px; max-width: calc(100vw - 40px); background: linear-gradient(180deg, rgba(18,18,18,0.96), rgba(12,12,12,0.95)); color:#fff; border-radius:12px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); overflow:hidden; transform-origin: top right; opacity:0; pointer-events:none; transition: transform 220ms ease, opacity 220ms ease; border:1px solid rgba(255,255,255,0.03); }
    .floating-cart-bubble.open .cart-drawer { transform: translateY(8px) scale(1); opacity:1; pointer-events:auto; }
    .cart-drawer-head { padding:12px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.03); font-weight:700; }
    .cart-drawer-items { max-height: 220px; overflow:auto; padding:12px 14px; display:flex; flex-direction:column; gap:10px; }
    .cart-item { display:flex; justify-content:space-between; align-items:center; gap:10px; }
    .cart-item .ci-left { flex:1; }
    .ci-title { font-weight:600; font-size:0.95rem; }
    .ci-meta { font-size:0.82rem; color: rgba(255,255,255,0.8); margin-top:6px; }
    .ci-controls { display:flex; flex-direction:column; gap:6px; }
    .ci-controls button { background:rgba(255,255,255,0.06); border: none; color:#fff; padding:6px 8px; border-radius:8px; cursor:pointer; width:36px; height:36px; }
    .cart-drawer-footer { padding:12px 14px; border-top:1px solid rgba(255,255,255,0.03); display:flex; flex-direction:column; gap:8px; }
    .cart-total { font-weight:700; font-size:1rem; display:flex; justify-content:space-between; align-items:center; }
    .cart-actions { display:flex; gap:8px; }
    .checkout-btn { flex:1; background: #d7c99dff; color:#111; border:none; border-radius:8px; padding:8px 10px; font-weight:700; cursor:pointer; }
    .checkout-btn[disabled] { opacity:0.5; cursor:not-allowed; }
    .clear-cart { background: transparent; border:1px solid rgba(255,255,255,0.06); color:#fff; border-radius:8px; padding:8px 10px; cursor:pointer; }

    .empty { color: rgba(255,255,255,0.7); font-size:0.95rem; padding: 18px 0; text-align:center; }
    /* small screens adjustments */
    @media (max-width:520px) {
      #luxury-logo-wrapper { left: 10px; gap:8px; }
      .luxury-logo-circle { width:58px; height:58px; }
      .floating-cart-bubble { right: 12px; top: 12px; }
      .cart-drawer { width: 92vw; right: 8px; top: calc(100% + 8px); }
    }
  `;
    document.head.appendChild(style);
})();

// ====== DOMREADY: initialize counter if present ======
document.addEventListener('DOMContentLoaded', () => {
    updateCartCountDisplay();
});
(function cinematicTextSlider() {
    const slogans = [
        "Moments Begin with Coffee",
        "Where Comfort Meets Flavor",
        "Live the Aroma • Love the Experience",
        "Your Daily Dose of Perfection",
        "Coffee Life Café, Brewing Happiness",
        "A Cup That Inspires Your Day"
    ];

    const sloganElement = document.querySelector('.luxury-slogan');
    if (!sloganElement) {
        console.warn("luxury-slogan element not found!");
        return;
    }

    let index = 0;

    function animateText() {
        sloganElement.innerHTML = slogans[index];
        sloganElement.classList.remove("animate");

        // Restart animation
        void sloganElement.offsetWidth;

        sloganElement.classList.add("animate");
        index = (index + 1) % slogans.length;
    }

    animateText();
    setInterval(animateText, 6500); // total animation duration

    // Inject clean cinematic styles
    if (!document.getElementById("cinematicSliderStyles")) {
        const style = document.createElement('style');
        style.id = "cinematicSliderStyles";
        style.innerHTML = `
        .luxury-slogan {
            font-size: 1.5rem !important;
            font-weight: 900;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            display: inline-block;
            background: linear-gradient(90deg, #ffffff, #ffe9b6, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            white-space: nowrap;
            overflow: hidden;
            opacity: 0;
            filter: none !important; /* No blur */
        }

        .luxury-slogan.animate {
            animation: smoothSlide 6.5s ease-in-out forwards;
        }

        @keyframes smoothSlide {
            0%   { transform: translateX(100%); opacity: 0; }
            15%  { transform: translateX(0); opacity: 1; }
            70%  { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
        }
        `;
        document.head.appendChild(style);
    }
})();
