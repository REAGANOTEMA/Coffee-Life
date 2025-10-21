(() => {
  // ==========================
  // COFFEE LIFE Cart + WhatsApp + Payments (FINAL 2025)
  // ==========================

  // ----- CONFIGURATION -----
  const WA_PHONE = "256772514889";
  const DELIVERY_AREAS = {
    "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
    "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
    "Bugembe": 3000, "Nile": 3000, "Makerere": 3000,
    "Kira Road": 3000, "Masese": 4000, "Wakitaka": 4000,
    "Namuleesa": 4000
  };
  let DELIVERY_FEE = 0;

  // ----- DOM SELECTORS -----
  const cartBtn = document.querySelector(".cart-btn");
  const cartClose = document.querySelector(".cart-close");
  const cartContainer = document.querySelector(".cart-container");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalEl = document.querySelector(".cart-total");
  const deliverySelect = document.getElementById("delivery-zone");

  let paymentContainer = document.querySelector(".payment-section");
  if (!paymentContainer) {
    paymentContainer = document.createElement("div");
    paymentContainer.className = "payment-section";
    cartContainer?.insertBefore(paymentContainer, cartTotalEl);
  }

  let whatsappFloat = document.querySelector(".whatsapp-float");
  if (!whatsappFloat) {
    whatsappFloat = document.createElement("div");
    whatsappFloat.className = "whatsapp-float";
    whatsappFloat.innerHTML = '<i class="fab fa-whatsapp"></i>';
    document.body.appendChild(whatsappFloat);
  }

  // ----- GLOBAL CART -----
  window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");
  const persistCart = () => localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
  const formatUGX = v => Number(v).toLocaleString() + " UGX";
  const calcTotal = () => window.cart.reduce((s, it) => s + (it.price * it.qty), 0);

  // ----- CART COUNTER -----
  function updateCartCount() {
    const cartCountEl = document.getElementById("cart-count");
    const totalItems = window.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;
  }

  // ----- CART MODAL -----
  cartBtn?.addEventListener("click", () => cartContainer?.classList.toggle("active"));
  cartClose?.addEventListener("click", () => cartContainer?.classList.remove("active"));

  // ----- ADD TO CART -----
  function addToCart(item) {
    if (!item || !item.id) return console.warn("addToCart requires item with id");
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...item, qty: 1 });

    if (calcTotal() > 50000000) {
      alert("Cart cannot exceed UGX 50,000,000!");
      if (existing) existing.qty--; else window.cart.pop();
      return;
    }

    persistCart();
    renderCart();
    updateCartCount(); // ✅ update header count
    flashAddButton(item.id);
  }
  window.cartAdd = addToCart;

  // ----- WIRE STATIC ADD BUTTONS -----
  function wireStaticAddButtons() {
    document.querySelectorAll(".menu-item .btn-add, .menu-item .add-to-cart-btn").forEach(btn => {
      if (btn.__wired) return; btn.__wired = true;
      btn.addEventListener("click", e => {
        const itemEl = e.target.closest(".menu-item");
        if (!itemEl) return;
        const id = itemEl.dataset.id || null;
        const name = itemEl.dataset.name || itemEl.querySelector("h4,h3")?.textContent?.trim() || "Item";
        const price = parseInt(itemEl.dataset.price || itemEl.querySelector(".price")?.textContent?.replace(/\D/g, "") || 0);
        const img = itemEl.querySelector("img")?.getAttribute("src") || "";
        const safeId = id || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
        addToCart({ id: safeId, name, price: Number(price), img });
      });
    });
  }

  // ----- BUTTON ANIMATION -----
  function flashAddButton(itemId) {
    const btn = document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`)
      || document.querySelector(`.add-to-cart-btn[data-id="${itemId}"]`);
    if (!btn) return;
    btn.classList.add("shake", "glow");
    setTimeout(() => btn.classList.remove("shake"), 600);
    setTimeout(() => btn.classList.remove("glow"), 1400);
  }

  // ----- REMOVE / UPDATE QTY -----
  function removeFromCart(id) {
    window.cart = window.cart.filter(i => i.id !== id);
    persistCart();
    renderCart();
    updateCartCount(); // ✅ update header count
  }
  function updateQty(id, qty) {
    const it = window.cart.find(i => i.id === id);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) removeFromCart(id);
    persistCart();
    renderCart();
    updateCartCount(); // ✅ update header count
  }

  // ----- RENDER CART -----
  function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";
    let total = 0;
    if (window.cart.length === 0) {
      cartItemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
      if (cartTotalEl) cartTotalEl.textContent = `Total: UGX 0`;
      return;
    }

    window.cart.forEach(item => {
      total += item.price * item.qty;
      const div = document.createElement("div"); div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.img || 'menu-images/placeholder.jpg'}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${formatUGX(item.price)} x ${item.qty}</p>
          <span class="subtotal">${formatUGX(item.price * item.qty)}</span>
        </div>
        <div class="controls">
          <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
          <span class="cart-item-remove" data-id="${item.id}">&times;</span>
        </div>
      `;
      div.querySelectorAll(".qty-btn").forEach(b => b.addEventListener("click", e => {
        const action = e.currentTarget.dataset.action, id = e.currentTarget.dataset.id, it2 = window.cart.find(i => i.id === id);
        if (!it2) return; if (action === "plus") updateQty(id, it2.qty + 1); else updateQty(id, it2.qty - 1);
      }));
      div.querySelector(".cart-item-remove")?.addEventListener("click", e => removeFromCart(e.currentTarget.dataset.id));
      cartItemsContainer.appendChild(div);
    });

    const grandTotal = total + (DELIVERY_FEE || 0);
    if (cartTotalEl) cartTotalEl.innerHTML = `
      Total: ${formatUGX(grandTotal)}
      <span class="delivery-fee">Delivery: ${formatUGX(DELIVERY_FEE)}</span>
    `;
  }

  // ----- UPDATE DELIVERY FEE -----
  function updateDeliveryFee() {
    const area = deliverySelect?.value || "";
    DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
    renderCart();
    updateCartCount(); // ✅ update header count
  }
  deliverySelect?.addEventListener("change", updateDeliveryFee);

  // ----- ORDER HANDLER (WHATSAPP) -----
  function handleOrderButton(paymentMethod = "Cash") {
    if (window.cart.length === 0) { alert("Please add items to your cart before proceeding."); return; }
    if (!deliverySelect?.value) { alert("Please select a delivery area."); return; }

    const name = prompt("Enter your full name:")?.trim();
    if (!name) { alert("Name required"); return; }
    const area = deliverySelect.value;

    let message = `✨ *Coffee Life Order* ✨\n\n👤 Customer: ${name}\n📍 Delivery Area: ${area}\n💰 Payment: ${paymentMethod}\n\n🛒 Order Details:\n`;
    message += window.cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`).join("\n");
    message += `\n\n🧾 Subtotal: ${formatUGX(calcTotal())}\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}\n💰 Grand Total: ${formatUGX(calcTotal() + DELIVERY_FEE)}`;
    message += `\n\n☕ Coffee Life — Crafted with Passion, Served with Care.`;

    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");

    window.cart = []; persistCart(); renderCart(); updateCartCount(); // ✅ clear and update
  }

  // ----- PAYMENT BUTTONS -----
  function addPaymentButtons() {
    paymentContainer.innerHTML = '';
    ["mtn", "airtel"].forEach(type => {
      const btn = document.createElement("button");
      btn.className = `payment-btn ${type}`;
      btn.textContent = type === "mtn" ? "Pay with MTN" : "Pay with Airtel";
      btn.addEventListener("click", () => handleOrderButton(type === "mtn" ? "MTN Mobile Money" : "Airtel Money"));
      paymentContainer.appendChild(btn);
    });
    const note = document.createElement("div");
    note.className = "payment-temp-note";
    note.textContent = "Select your preferred payment method above";
    paymentContainer.appendChild(note);
  }

  // ----- FLOATING WHATSAPP BUTTON -----
  whatsappFloat.addEventListener("click", () => handleOrderButton("Cash"));

  // ----- INITIALIZATION -----
  wireStaticAddButtons();
  addPaymentButtons();
  renderCart();
  updateCartCount(); // ✅ show count on page load

  // ----- STYLING -----
  const style = document.createElement("style");
  style.textContent = `
    body { background-color: #fefefe; font-family: Arial, sans-serif; color: #333; }
    .menu-item { border-bottom: 1px solid #ccc; padding: 12px 0; }
    .menu-item:last-child { border-bottom: none; }
    .cart-container { background-color: #ffffffdd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 12px; padding: 20px; }
    .payment-section { margin-top: 15px; }
    .payment-btn { margin-right: 10px; margin-bottom: 10px; padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; }
    .payment-btn.mtn { background-color: #fcd116; color: #000; }
    .payment-btn.airtel { background-color: #e60000; color: #fff; }
    .cart-item { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
  `;
  document.head.appendChild(style);

})();
// ----- CART COUNTER WITH BOUNCE -----
function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  const totalItems = window.cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;

    // Add bounce animation
    cartCountEl.classList.remove("bounce"); // reset animation
    void cartCountEl.offsetWidth; // trigger reflow
    cartCountEl.classList.add("bounce");
  }
}

// ----- BOUNCE ANIMATION STYLING -----
const cartStyle = document.createElement("style");
cartStyle.textContent = `
  #cart-count {
    display: inline-block;
    transition: transform 0.2s ease;
  }
  #cart-count.bounce {
    transform: scale(1.4);
  }
  #cart-count.bounce {
    animation: bounceAnimation 0.3s ease;
  }
  @keyframes bounceAnimation {
    0% { transform: scale(1); }
    50% { transform: scale(1.4); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(cartStyle);
// ✅ AUTO-FIX LEGACY BUTTONS (ensures all menu items have working Add buttons)
(function fixLegacyButtons() {
  document.querySelectorAll('.menu-item').forEach(item => {
    const btn = item.querySelector('button');
    if (btn && !btn.classList.contains('btn-add')) {
      btn.classList.add('btn-add');
      btn.removeAttribute('onclick'); // Remove old inline JS
    }
  });
  // Re-wire all buttons with new system
  if (typeof wireStaticAddButtons === 'function') {
    wireStaticAddButtons();
  }
})();
