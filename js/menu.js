/* ============================
   COFFEE LIFE MENU & CART JS
   Fully Compatible with your CSS
============================ */

// Cart
let cart = [];

// Helper to create elements
function createEl(tag, className, innerHTML) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

// Render menu from your real menu.json items
function renderMenu() {
  const container = document.getElementById("menu-container");
  container.innerHTML = "";

  // Replace with your real menu array
  const menuItems = window.MENU_ITEMS || []; // assume MENU_ITEMS is loaded from menu.json

  menuItems.forEach(item => {
    const card = createEl("div", "menu-item");
    card.innerHTML = `
      <div class="menu-media"><img src="${item.img || 'placeholder.jpg'}" alt="${item.name}"></div>
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

    // Add to cart
    card.querySelector(".btn-add").addEventListener("click", () => {
      addToCart(item);
      card.querySelector(".btn-add").classList.add("shake");
      setTimeout(() => card.querySelector(".btn-add").classList.remove("shake"), 600);
    });

    // Quick WhatsApp order for this item
    card.querySelector(".btn-whatsapp").addEventListener("click", () => {
      window.open(`https://wa.me/?text=I want ${item.name} (UGX ${item.price.toLocaleString()})`);
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
      <img src="${item.img || 'placeholder.jpg'}" alt="${item.name}">
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

// Update totals
function updateCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("subtotal").textContent = subtotal.toLocaleString();

  const deliveryFeeEl = document.getElementById("deliveryFee");
  if (deliveryFeeEl) deliveryFeeEl.textContent = "0"; // optional: keep delivery static
  const grandTotalEl = document.getElementById("grandTotal");
  if (grandTotalEl) grandTotalEl.textContent = subtotal.toLocaleString();
}

// Quick WhatsApp full cart
document.querySelector(".btn-order")?.addEventListener("click", () => {
  if (!cart.length) return alert("Cart is empty!");
  let msg = "Order:%0A";
  cart.forEach(item => {
    msg += `${item.name} x${item.qty} = UGX ${(item.price * item.qty).toLocaleString()}%0A`;
  });
  msg += `Total: UGX ${cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}`;
  window.open(`https://wa.me/?text=${msg}`);
});

// Normalize menu heights
function normalizeMenuHeights() {
  const items = document.querySelectorAll('.menu-item');
  let maxHeight = 0;
  items.forEach(item => { item.style.height = 'auto'; maxHeight = Math.max(maxHeight, item.offsetHeight); });
  items.forEach(item => item.style.height = maxHeight + 'px');
}

// Initial render
document.addEventListener("DOMContentLoaded", () => { renderMenu(); renderCart(); });
window.addEventListener('load', normalizeMenuHeights);
window.addEventListener('resize', normalizeMenuHeights);
