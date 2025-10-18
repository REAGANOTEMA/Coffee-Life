// ============================
// COFFEE LIFE WhatsApp + Cart (Final 2025)
// ============================

// ===== CART STORAGE =====
window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");

// ===== DOM ELEMENTS =====
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const cartItemsContainer = document.getElementById("cartItems");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const deliveryFeeEl = document.getElementById("deliveryFee");
const cartTotalEl = document.getElementById("cartTotal");
const deliverySelect = document.getElementById("delivery-zone");
const locationGroupSelect = document.getElementById("location-group");
const orderNowBtn = document.getElementById("orderNow");
const footerOrderBtn = document.getElementById("orderWhatsApp");
const callSupportBtn = document.getElementById("callSupport");
const whatsappBtn = document.querySelector(".whatsapp-float");
const whatsappConfirmBtn = document.getElementById("whatsapp-confirm");
const allWAButtons = document.querySelectorAll(".btn-whatsapp, .payment-btn, .btn-whatsapp-send");
const paymentContainer = document.getElementById("payment-section");

// ===== LOCATION CONTACTS =====
const LOCATION_CONTACTS = {
  "jinja-highway": ["256752746763", "256749958799", "256751054138"],
  "jinja-lakeview": ["256750038032"],
  "kampala-kasangalinke": ["256783070102"]
};

// ===== DELIVERY FEES =====
const DELIVERY_AREAS = {
  "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
  "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
  "Bugembe": 3000, "Nile": 3000, "Makerere": 3000,
  "Kira Road": 3000, "Masese": 4000, "Wakitaka": 4000,
  "Namuleesa": 4000, "Lakeview Central": 2000, "Mailombili": 2000,
  "Gabba Road": 3500, "Other Kampala": 4000
};
let DELIVERY_FEE = 0;

// ===== CART MANAGEMENT =====
function persistCart() {
  localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
}

function formatUGX(amount) {
  return amount.toLocaleString() + " UGX";
}

function calcCartSubtotal() {
  return window.cart.reduce((acc, item) => acc + item.price * item.qty, 0);
}

function getSelectedDeliveryFee() {
  const selectedOption = deliverySelect.selectedOptions[0];
  return selectedOption ? parseInt(selectedOption.dataset.fee) || 0 : 0;
}

function updateCartPreview() {
  if (!cartPreview) return;
  cartPreview.innerHTML = "";

  if (window.cart.length === 0) {
    cartPreview.innerHTML = "<p class='empty-msg'>🛒 Your cart is empty.</p>";
    updateWhatsAppState();
    return;
  }

  let subtotal = 0;
  window.cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerHTML = `
      <span class="name">${index + 1}. ${item.name}</span>
      <div class="controls">
        <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
      </div>
      <span class="price">${item.price * item.qty} UGX</span>
    `;
    cartPreview.appendChild(div);
  });

  DELIVERY_FEE = getSelectedDeliveryFee();
  const total = subtotal + DELIVERY_FEE;

  const summary = document.createElement("div");
  summary.classList.add("summary");
  summary.innerHTML = `
    <hr>
    <p>Subtotal: <strong>${formatUGX(subtotal)}</strong></p>
    <p>Delivery Fee: <strong>${formatUGX(DELIVERY_FEE)}</strong></p>
    <p><strong>Total Amount to Pay: ${formatUGX(total)}</strong></p>
  `;
  cartPreview.appendChild(summary);

  // Quantity Buttons
  cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const action = e.target.dataset.action;
      const name = e.target.dataset.name;
      const item = window.cart.find(i => i.name === name);
      if (!item) return;
      if (action === "plus") item.qty++;
      else {
        item.qty--;
        if (item.qty <= 0) window.cart = window.cart.filter(i => i.name !== name);
      }
      persistCart();
      updateCartPreview();
    });
  });

  updateWhatsAppState();
}

function updateCartDisplay() {
  updateCartPreview();
  const subtotal = calcCartSubtotal();
  const deliveryFee = getSelectedDeliveryFee();
  const total = subtotal + deliveryFee;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatUGX(subtotal);
  if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(deliveryFee);
  if (cartTotalEl) cartTotalEl.textContent = formatUGX(total);
}

// ===== ADD TO CART =====
document.querySelectorAll(".btn-add, .add-to-cart-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const itemEl = e.target.closest(".menu-item, .menu-card");
    if (!itemEl) return;
    const name = itemEl.dataset.name;
    const price = parseInt(itemEl.dataset.price) || 0;
    addToCart(name, price, itemEl);
  });
});

function addToCart(name, price, el = null) {
  const existing = window.cart.find(i => i.name === name);
  if (existing) existing.qty++;
  else window.cart.push({ name, price, qty: 1 });

  if (el) {
    const btn = el.querySelector(".btn-add");
    if (btn) {
      btn.classList.add("shake", "glow");
      setTimeout(() => btn.classList.remove("shake"), 600);
      setTimeout(() => btn.classList.remove("glow"), 1400);
    }
  }

  persistCart();
  updateCartPreview();
  updateCartDisplay();
}

// ===== WHATSAPP MESSAGE GENERATOR =====
function generateCartMessage(name, location, paymentMethod = "Cash") {
  let subtotal = calcCartSubtotal();
  let total = subtotal + DELIVERY_FEE;
  let message = `✨ *Coffee Life Order* ✨\n\n`;
  message += `👤 Customer Name: ${name || "[Your Name]"}\n`;
  message += `📍 Delivery Area: ${location || "[Your Location]"}\n`;
  message += `💰 Payment Method: ${paymentMethod}\n\n`;
  message += `🛒 Order Details:\n`;
  window.cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} x${item.qty} - ${formatUGX(item.price * item.qty)}\n`;
  });
  message += `\n💰 Subtotal: ${formatUGX(subtotal)}`;
  message += `\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}`;
  message += `\n📦 Total: ${formatUGX(total)}`;
  message += `\n\n☕ Coffee Life — Crafted with Passion, Served with Care`;
  return message;
}

// ===== GET CONTACTS FOR LOCATION =====
function getContactsForLocationGroup() {
  const group = locationGroupSelect.value;
  return LOCATION_CONTACTS[group] || [];
}

// ===== HANDLE ORDER =====
function handleOrderNow(paymentMethod = "Cash") {
  if (window.cart.length === 0) return alert("Add items to your cart!");
  if (!deliverySelect.value) return alert("Select a delivery area!");
  if (!locationGroupSelect.value) return alert("Select a location group!");

  const customerName = prompt("Enter your full name:")?.trim();
  if (!customerName) return alert("Name required!");
  const area = deliverySelect.value;
  const message = generateCartMessage(customerName, area, paymentMethod);

  const contacts = getContactsForLocationGroup();
  if (contacts.length === 0) return alert("No WhatsApp contacts found for selected location.");

  contacts.forEach(number => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  });

  window.cart = [];
  persistCart();
  updateCartPreview();
  updateCartDisplay();
}

// ===== CALL SUPPORT =====
callSupportBtn?.addEventListener("click", () => {
  const contacts = getContactsForLocationGroup();
  if (contacts.length === 0) return alert("No support contact for this location.");
  window.location.href = `tel:${contacts[0]}`;
});

// ===== WHATSAPP CONFIRM =====
whatsappConfirmBtn?.addEventListener("click", () => handleOrderNow("Cash"));

// ===== PAYMENT BUTTONS (MTN/Airtel) =====
const PAYMENT_MERCHANTS = { mtn: "4393386", airtel1: "971714", airtel2: "4393386" };
const USSD_PATTERNS = { mtn: "*165*3*{merchant}*{amount}%23", airtel: "*185*9*{merchant}*{amount}%23" };

function addPaymentButtons() {
  if (!paymentContainer) return;
  paymentContainer.innerHTML = '';
  ["mtn", "airtel"].forEach(type => {
    const btn = document.createElement("button");
    btn.className = `payment-btn ${type} shake glow`;
    btn.textContent = type === "mtn" ? "Pay with MTN" : "Pay with Airtel";
    btn.addEventListener("click", () => handlePayment(type));
    paymentContainer.appendChild(btn);
  });
  const note = document.createElement("div");
  note.className = "payment-temp-note";
  note.textContent = "Select your preferred payment method above";
  paymentContainer.appendChild(note);
}

function handlePayment(type) {
  if (window.cart.length === 0) return alert("Add items to cart first!");
  let subtotal = calcCartSubtotal();
  const area = deliverySelect.value || "";
  const total = subtotal + (DELIVERY_AREAS[area] || 0);
  let method = type === "mtn" ? "MTN Mobile Money" : "Airtel Money";
  let merchant = type === "mtn" ? PAYMENT_MERCHANTS.mtn : PAYMENT_MERCHANTS.airtel1;
  const ussd = (type === "mtn" ? USSD_PATTERNS.mtn : USSD_PATTERNS.airtel)
    .replace("{merchant}", merchant)
    .replace("{amount}", total);
  window.location.href = "tel:" + ussd;
  setTimeout(() => handleOrderNow(method), 1000);
}

// ===== WHATSAPP BUTTON STATE =====
function updateWhatsAppState() {
  if (!whatsappBtn) return;
  if (window.cart.length === 0) {
    whatsappBtn.classList.add("disabled", "shake", "glow");
    whatsappBtn.style.pointerEvents = "none";
    whatsappBtn.title = "Add items to cart first!";
  } else {
    whatsappBtn.classList.remove("disabled");
    whatsappBtn.style.pointerEvents = "auto";
    whatsappBtn.title = "Chat on WhatsApp";
  }
}

// ===== BIND ORDER BUTTONS =====
[orderNowBtn, footerOrderBtn].forEach(btn => {
  btn?.addEventListener("click", () => handleOrderNow());
});

// ===== DELIVERY SELECTION CHANGE =====
deliverySelect?.addEventListener("change", () => {
  DELIVERY_FEE = getSelectedDeliveryFee();
  updateCartPreview();
  updateCartDisplay();
});

// ===== LOCATION GROUP CHANGE =====
locationGroupSelect?.addEventListener("change", () => {
  const group = locationGroupSelect.value;
  Array.from(deliverySelect.options).forEach(opt => {
    if (!opt.dataset.location) return;
    opt.hidden = opt.dataset.location !== group;
  });
  deliverySelect.value = "";
  updateCartPreview();
  updateCartDisplay();
});

// ===== DISABLED WHATSAPP IF EMPTY =====
whatsappBtn?.addEventListener("click", e => {
  if (whatsappBtn.classList.contains("disabled")) {
    e.preventDefault();
    alert("Add items to your cart before contacting WhatsApp!");
  }
});

// ===== INIT =====
updateCartPreview();
updateCartDisplay();
addPaymentButtons();
