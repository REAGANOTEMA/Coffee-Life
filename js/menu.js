/* ============================
   COFFEE LIFE MENU & CART JS
   Fully Compatible with your CSS
============================ */

const HQ_LAT = 1.2921; // Coffee shop latitude
const HQ_LNG = 36.8219; // Coffee shop longitude
const deliveryRatePerKm = 0.5; // Example: $0.5 per km

// Sample menu items
const menuItems = [
  { id: 1, name: "Espresso", desc: "Strong & bold", price: 2.5, img: "espresso.jpg" },
  { id: 2, name: "Cappuccino", desc: "Frothy delight", price: 3.0, img: "cappuccino.jpg" },
  { id: 3, name: "Latte", desc: "Smooth & creamy", price: 3.2, img: "latte.jpg" },
  { id: 4, name: "Mocha", desc: "Chocolatey coffee", price: 3.5, img: "mocha.jpg" },
];

// Cart
let cart = [];

// Helper to create elements
function createEl(tag, className, innerHTML) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

// Render menu
function renderMenu() {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";
  menuItems.forEach(item => {
    const card = createEl("div", "menu-item");
    card.innerHTML = `
      <div class="menu-media"><img src="${item.img}" alt="${item.name}"></div>
      <div class="menu-body">
        <h4>${item.name}</h4>
        <p class="desc">${item.desc}</p>
        <p class="price">$${item.price.toFixed(2)}</p>
        <div class="actions">
          <button class="btn-add">Add</button>
          <button class="btn-whatsapp">WhatsApp</button>
        </div>
      </div>
    `;
    // Add to cart
    card.querySelector(".btn-add").addEventListener("click", () => {
      addToCart(item);
      card.querySelector(".btn-add").classList.add("shake");
      setTimeout(() => card.querySelector(".btn-add").classList.remove("shake"), 600);
    });
    // Quick WhatsApp order for this item
    card.querySelector(".btn-whatsapp").addEventListener("click", () => {
      window.open(`https://wa.me/?text=I want ${item.name} ($${item.price.toFixed(2)})`);
    });
    container.appendChild(card);
  });
}

// Add to cart
function addToCart(item) {
  const existing = cart.find(ci => ci.id === item.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  renderCart();
}

// Render cart
function renderCart() {
  const container = document.querySelector(".cart-items");
  container.innerHTML = "";
  cart.forEach(item => {
    const cartItem = createEl("div", "cart-item");
    cartItem.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-info">
        <span>${item.name}</span>
        <div class="cart-controls">
          <button class="qty-btn">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn">+</button>
          <span class="remove">x</span>
        </div>
      </div>
    `;
    // Quantity controls
    const [btnMinus, , btnPlus, removeBtn] = cartItem.querySelectorAll(".qty-btn, .remove");
    btnMinus.addEventListener("click", () => {
      if (item.qty > 1) item.qty--;
      else cart = cart.filter(ci => ci.id !== item.id);
      renderCart();
    });
    btnPlus.addEventListener("click", () => { item.qty++; renderCart(); });
    removeBtn.addEventListener("click", () => { cart = cart.filter(ci => ci.id !== item.id); renderCart(); });
    container.appendChild(cartItem);
  });
  updateCartTotals();
}

// Calculate distance (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Update totals
function updateCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFeeEl = document.getElementById("deliveryFee");
  let deliveryFee = 0;
  if (navigator.geolocation && deliveryFeeEl) {
    navigator.geolocation.getCurrentPosition(pos => {
      const dist = getDistance(HQ_LAT, HQ_LNG, pos.coords.latitude, pos.coords.longitude);
      deliveryFee = dist * deliveryRatePerKm;
      deliveryFeeEl.textContent = deliveryFee.toFixed(2);
      document.getElementById("grandTotal").textContent = (subtotal + deliveryFee).toFixed(2);
    }, () => { deliveryFeeEl.textContent = "0"; document.getElementById("grandTotal").textContent = subtotal.toFixed(2); });
  }
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
}

// Quick WhatsApp full cart
document.querySelector(".btn-order")?.addEventListener("click", () => {
  if (!cart.length) return alert("Cart is empty!");
  let msg = "Order:%0A";
  cart.forEach(item => { msg += `${item.name} x${item.qty} = $${(item.price * item.qty).toFixed(2)}%0A`; });
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = parseFloat(document.getElementById("deliveryFee")?.textContent || "0");
  const total = subtotal + deliveryFee;
  msg += `Delivery: $${deliveryFee.toFixed(2)}%0ATotal: $${total.toFixed(2)}`;
  window.open(`https://wa.me/?text=${msg}`);
});

// Initial render
document.addEventListener("DOMContentLoaded", () => { renderMenu(); renderCart(); });
function normalizeMenuHeights() {
  const items = document.querySelectorAll('.menu-item');
  let maxHeight = 0;
  items.forEach(item => {
    item.style.height = 'auto';
    maxHeight = Math.max(maxHeight, item.offsetHeight);
  });
  items.forEach(item => item.style.height = maxHeight + 'px');
}

window.addEventListener('load', normalizeMenuHeights);
window.addEventListener('resize', normalizeMenuHeights);
