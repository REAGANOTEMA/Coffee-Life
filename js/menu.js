/* ============================
   COFFEE LIFE MENU & CART JS 2025
   Click image → payment.html + Add to cart
============================ */

// Inject custom styles for clean, bright layout
const style = document.createElement('style');
style.textContent = `
/* General page background */
body {
  font-family: 'Arial', sans-serif;
  background-color: #ffffff; /* pure white */
  margin: 0;
  padding: 0;
  color: #333;
}

/* Menu grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Menu item card */
.menu-item {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.12);
}

/* Menu image */
.menu-media img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid #eee;
  transition: transform 0.2s ease;
}

.menu-media img:hover {
  transform: scale(1.05);
}

/* Menu body */
.menu-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Item name */
.menu-body h4 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

/* Description */
.menu-body .desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Price styling */
.menu-body .price {
  font-weight: bold;
  margin: 4px 0;
  font-size: 16px;
  color: #222;
}

/* Action buttons */
.actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
}

.actions .btn-add,
.actions .btn-whatsapp {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.actions .btn-add {
  background-color: #ff7f50;
  color: white;
}

.actions .btn-whatsapp {
  background-color: #25D366;
  color: white;
}

.actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Cart styling */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
}

.cart-item {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.cart-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.qty-btn {
  padding: 2px 6px;
  border: none;
  background-color: #eee;
  border-radius: 6px;
  cursor: pointer;
}

.qty-btn:hover {
  background-color: #ddd;
}

.remove {
  color: red;
  cursor: pointer;
}
`;
document.head.appendChild(style);

// ============================
// JS Menu & Cart Logic
// ============================

let cart = [];

// Helper to create elements
function createEl(tag, className, innerHTML) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

// Render menu items
function renderMenu() {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";
  container.className = "menu-grid";

  const menuItems = window.MENU_ITEMS || [];

  menuItems.forEach(item => {
    const card = createEl("div", "menu-item");

    card.innerHTML = `
      <div class="menu-media">
        <a href="payment.html" class="img-link">
          <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}">
        </a>
      </div>
      <div class="menu-body">
        <h4>${item.name}</h4>
        <p class="desc">${item.description}</p>
        <p class="price">UGX ${item.price.toLocaleString()}</p>
        <div class="actions">
          <button class="btn-add">Add</button>
          <button class="btn-whatsapp">WhatsApp</button>
        </div>
      </div>
    `;

    // Shake effect every 3 seconds
    setInterval(() => {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 600);
    }, 3000);

    // Add to cart
    const btnAdd = card.querySelector(".btn-add");
    btnAdd.addEventListener("click", e => {
      e.stopPropagation();
      addToCart(item);
      btnAdd.classList.add("shake");
      setTimeout(() => btnAdd.classList.remove("shake"), 600);
    });

    // WhatsApp single item
    const btnWhatsApp = card.querySelector(".btn-whatsapp");
    btnWhatsApp.addEventListener("click", e => {
      e.stopPropagation();
      const msg = `I want ${item.name} (UGX ${item.price.toLocaleString()})`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
    });

    container.appendChild(card);
  });

  normalizeMenuHeights();
}

// Add item to cart
function addToCart(item) {
  const existing = cart.find(ci => ci.id === item.id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  saveCartToLocal(); // Persist cart for payment page
}

// Render cart
function renderCart() {
  const container = document.querySelector(".cart-items");
  if (!container) return;
  container.innerHTML = "";

  cart.forEach(item => {
    const cartItem = createEl("div", "cart-item");
    cartItem.innerHTML = `
      <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}">
      <div class="cart-item-info">
        <span>${item.name}</span>
        <div class="cart-controls">
          <button class="qty-btn minus">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn plus">+</button>
          <span class="remove">x</span>
        </div>
      </div>
    `;

    const btnMinus = cartItem.querySelector(".minus");
    const btnPlus = cartItem.querySelector(".plus");
    const removeBtn = cartItem.querySelector(".remove");

    btnMinus.addEventListener("click", () => {
      if (item.qty > 1) item.qty--;
      else cart = cart.filter(ci => ci.id !== item.id);
      renderCart();
      saveCartToLocal();
    });

    btnPlus.addEventListener("click", () => { item.qty++; renderCart(); saveCartToLocal(); });
    removeBtn.addEventListener("click", () => { cart = cart.filter(ci => ci.id !== item.id); renderCart(); saveCartToLocal(); });

    container.appendChild(cartItem);
  });

  updateCartTotals();
}

// Update totals
function updateCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("subtotal")?.textContent = subtotal.toLocaleString();
  document.getElementById("deliveryFee")?.textContent = "0";
  document.getElementById("grandTotal")?.textContent = subtotal.toLocaleString();
}

// WhatsApp full cart
document.querySelector(".btn-order")?.addEventListener("click", () => {
  if (!cart.length) return alert("Cart is empty!");
  let msg = "Order:%0A";
  cart.forEach(item => {
    msg += `${item.name} x${item.qty} = UGX ${(item.price * item.qty).toLocaleString()}%0A`;
  });
  msg += `Total: UGX ${cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}`;
  window.open(`https://wa.me/?text=${msg}`);
});

// Normalize menu item heights
function normalizeMenuHeights() {
  const items = document.querySelectorAll('.menu-item');
  let maxHeight = 0;
  items.forEach(item => item.style.height = 'auto');
  items.forEach(item => maxHeight = Math.max(maxHeight, item.offsetHeight));
  items.forEach(item => item.style.height = maxHeight + 'px');
}

// Persist cart to localStorage for payment page
function saveCartToLocal() {
  localStorage.setItem("COFFEE_CART", JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocal() {
  const saved = localStorage.getItem("COFFEE_CART");
  if (saved) cart = JSON.parse(saved);
}

// Initial render
document.addEventListener("DOMContentLoaded", () => {
  loadCartFromLocal();
  renderMenu();
  renderCart();
});

window.addEventListener('load', normalizeMenuHeights);
window.addEventListener('resize', normalizeMenuHeights);
