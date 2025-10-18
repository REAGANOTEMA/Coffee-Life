// menu.js
// COFFEE LIFE — Menu + Cart + WhatsApp + Dynamic Delivery (GPS-based) — FINAL (with your locations & numbers)

// -------------------- CONFIG --------------------
// -------------------- PAYMENT SECTION ABOVE MENU --------------------
const menuWrapper = document.getElementById("menu-wrapper") || document.body; // wrapper of menu container
let paymentSection = document.getElementById("payment-section-top");
if (!paymentSection) {
  paymentSection = document.createElement("div");
  paymentSection.id = "payment-section-top";
  paymentSection.className = "payment-section-top";
  paymentSection.innerHTML = `
    <div class="payment-btns">
      <button id="payMTN" class="btn btn-pay mtn">Pay with MTN</button>
      <button id="payAirtel" class="btn btn-pay airtel">Pay with Airtel</button>
      <button id="whatsappConfirmTop" class="btn btn-whatsapp"><i class="fab fa-whatsapp"></i> Confirm Payment</button>
    </div>
    <p class="payment-note">Select your preferred payment method before browsing the menu.</p>
    <hr>
  `;
  menuWrapper.insertBefore(paymentSection, menuContainer);
}

// ----- Wire payment buttons -----
const btnMTN = document.getElementById("payMTN");
const btnAirtel = document.getElementById("payAirtel");
const btnWhatsAppTop = document.getElementById("whatsappConfirmTop");

btnMTN?.addEventListener("click", () => sendCartWhatsApp("MTN Mobile Money"));
btnAirtel?.addEventListener("click", () => sendCartWhatsApp("Airtel Money"));
btnWhatsAppTop?.addEventListener("click", () => {
  const nums = getNotifyNumbersFromSelection();
  const n = (nums && nums[0]) ? nums[0].replace(/\D/g, "") : NOTIFY_FALLBACK[0];
  const msg = encodeURIComponent("Hello Coffee Life Cafe, I have completed my payment for my order. Please confirm my order. Thank you!");
  window.open(`https://wa.me/${n}?text=${msg}`, "_blank");
});

// ----- Optional professional styling -----
const styleTop = document.createElement("style");
styleTop.textContent = `
  .payment-section-top { 
    background-color: #fff; 
    border-radius: 12px; 
    padding: 12px 16px; 
    margin-bottom: 20px; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
  .payment-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
  .btn-pay { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
  .btn-pay.mtn { background-color: #fcd116; color: #000; }
  .btn-pay.airtel { background-color: #e60000; color: #fff; }
  .btn-whatsapp { background-color: #25D366; color: #fff; border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; gap: 6px; }
  .payment-note { font-size: 0.85rem; color: #555; }
`;
document.head.appendChild(styleTop);

const HQ_LAT = 0.44;
const HQ_LNG = 33.2;

// Notification numbers by location group (no + sign)
const LOCATION_NOTIFY = {
  "jinja-highway": ["256752746763", "256749958799", "256751054138"], // Total Energies opposite Gadhafi Police Barracks, Jinja Highway
  "jinja-lakeview": ["256750038032"], // Total Lakeview, Mailombili
  "kampala-kasangalinke": ["256783070102"] // Gabba Road opposite University of East Africa
};

// Primary call numbers (first listed is primary)
const LOCATION_CALL = {
  "jinja-highway": "256752746763",
  "jinja-lakeview": "256750038032",
  "kampala-kasangalinke": "256783070102"
};

// Fallback if nothing selected
const NOTIFY_FALLBACK = ["256752746763"];

// -------------------- SAMPLE MENU DATA --------------------
const menuData = {
  food: [
    { id: "f1", name: "Classic Club Sandwich", description: "Turkey, bacon, lettuce & tomato", price: 12000, img: "images/club.jpg" },
    { id: "f2", name: "Grilled Chicken Wrap", description: "Marinated chicken, salad & zesty sauce", price: 10000, img: "images/wrap.jpg" },
    { id: "f3", name: "Beef Burger", description: "100% beef, cheese, signature sauce", price: 15000, img: "images/burger.jpg" },
    { id: "f4", name: "Veggie Pasta", description: "Creamy herb pasta with seasonal veg", price: 11000, img: "images/pasta.jpg" }
  ],
  drinks: [
    { id: "d1", name: "Americano", description: "Single origin espresso", price: 5000, img: "images/americano.jpg" },
    { id: "d2", name: "Latte", description: "Creamy milk & espresso", price: 7000, img: "images/latte.jpg" },
    { id: "d3", name: "Fresh Juice", description: "Made to order - seasonal", price: 8000, img: "images/juice.jpg" },
    { id: "d4", name: "Iced Coffee", description: "Chilled espresso & ice", price: 8000, img: "images/iced.jpg" }
  ],
  desserts: [
    { id: "s1", name: "Cheesecake", description: "Creamy New York style", price: 9000, img: "images/cheesecake.jpg" },
    { id: "s2", name: "Brownie", description: "Chocolate fudge brownie", price: 6000, img: "images/brownie.jpg" }
  ],
  specials: [
    { id: "sp1", name: "Breakfast Platter", description: "Eggs, sausage, toast, fruit", price: 18000, img: "images/breakfast.jpg" }
  ],
  coffeeBeans: [
    { id: "c1", name: "Coffee Life Beans 250g", description: "Single origin, roasted locally", price: 30000, img: "images/beans.jpg" }
  ]
};

// -------------------- DOM SELECTORS --------------------
const menuContainer = document.getElementById("menu-container");
const menuButtons = document.querySelectorAll(".menu-cat, .menu-btn");
const cartPreview = document.querySelector("#cartItems") || document.querySelector(".cart-items");
const deliverySelect = document.getElementById("delivery-zone");
const orderNowBtn = document.querySelector(".cart-order-btn") || document.getElementById("orderNow");
const cartCountEls = document.querySelectorAll(".cart-count, .cart-count-badge .cart-count");
const locationGroupSelect = document.getElementById("location-group"); // optional
const whatsappConfirmBtn = document.getElementById("whatsapp-confirm");
const callSupportBtn = document.getElementById("callSupport");

// -------------------- STATE --------------------
window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");
let userPosition = null;
let currentDistanceKm = null;
let currentDeliveryFee = 0;

// -------------------- UTILITIES --------------------
function formatUGX(amount) { return "UGX " + Number(amount || 0).toLocaleString(); }
function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function saveCart() { localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart)); }
function updateCartCountUI() { const c = window.cart.reduce((s, i) => s + (i.qty || 0), 0); cartCountEls.forEach(el => el.textContent = c); }

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getDeliveryCharge(distanceKm) {
  if (distanceKm <= 5) return 5000;
  if (distanceKm <= 10) return 8000;
  if (distanceKm <= 20) return 13000;
  return 20000;
}

// -------------------- GEOLOCATION --------------------
function requestUserLocation() {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported by browser.");
    userPosition = null; currentDistanceKm = null; currentDeliveryFee = 0; updateCartPreview();
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    userPosition = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    currentDistanceKm = calculateDistance(userPosition.latitude, userPosition.longitude, HQ_LAT, HQ_LNG);
    currentDeliveryFee = getDeliveryCharge(currentDistanceKm);
    updateCartPreview();
  }, err => {
    console.warn("Geolocation error:", err && err.message);
    userPosition = null; currentDistanceKm = null; currentDeliveryFee = 0; updateCartPreview();
  }, { timeout: 8000, maximumAge: 1000 * 60 * 5 });
}

// -------------------- CART FUNCTIONS --------------------
function findCartItem(id) { return window.cart.find(i => i.id === id); }

function addToCart(item) {
  const existing = findCartItem(item.id);
  if (existing) existing.qty++;
  else window.cart.push({ id: item.id, name: item.name, price: item.price, qty: 1, img: item.img || "" });

  const totals = calcTotals();
  if (totals.grandTotal > 50000000) {
    if (existing) existing.qty--; else window.cart = window.cart.filter(i => i.id !== item.id);
    alert("Cart cannot exceed UGX 50,000,000!");
    return;
  }

  saveCart(); updateCartPreview(); flashAddButton(item.id);
}

function removeFromCart(id) { window.cart = window.cart.filter(i => i.id !== id); saveCart(); updateCartPreview(); }
function updateQty(id, qty) { const it = findCartItem(id); if (!it) return; it.qty = qty; if (it.qty <= 0) removeFromCart(id); else saveCart(); updateCartPreview(); }

function calcTotals() {
  const subtotal = window.cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const deliveryFee = currentDeliveryFee || 0; // Option B: single global fee per order
  return { subtotal, deliveryFee, grandTotal: subtotal + deliveryFee };
}

// -------------------- CART PREVIEW --------------------
function updateCartPreview() {
  if (!cartPreview) return;
  cartPreview.innerHTML = "";
  updateCartCountUI();

  if (!window.cart.length) {
    const p = document.createElement("p"); p.className = "cart-empty"; p.textContent = "🛒 Your cart is empty."; cartPreview.appendChild(p);
    cartPreview.appendChild(renderTotals());
    return;
  }

  window.cart.forEach(item => {
    const div = document.createElement("div"); div.className = "cart-item";
    div.innerHTML = `
      <img src="${escapeHtml(item.img || '')}" alt="${escapeHtml(item.name)}" onerror="this.style.visibility='hidden'" class="cart-thumb" />
      <div class="cart-item-info">
        <h4>${escapeHtml(item.name)}</h4>
        <p class="small">${formatUGX(item.price)} x ${item.qty}</p>
        <div class="cart-item-sub">${formatUGX(item.price * item.qty)}</div>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" data-action="minus" data-id="${item.id}" aria-label="Minus">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-id="${item.id}" aria-label="Plus">+</button>
        <button class="remove" data-id="${item.id}" aria-label="Remove">&times;</button>
      </div>
    `;
    cartPreview.appendChild(div);
  });

  // attach handlers
  cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.dataset.id; const action = e.currentTarget.dataset.action;
      const it = findCartItem(id); if (!it) return;
      if (action === "plus") updateQty(id, it.qty + 1); else updateQty(id, it.qty - 1);
    });
  });
  cartPreview.querySelectorAll(".remove").forEach(btn => btn.addEventListener("click", e => removeFromCart(e.currentTarget.dataset.id)));

  cartPreview.appendChild(renderTotals());
}

function renderTotals() {
  const totals = calcTotals();
  const wrapper = document.createElement("div"); wrapper.className = "cart-total";

  let deliveryHtml;
  if (currentDistanceKm === null) {
    deliveryHtml = `<p>Delivery Fee: <strong id="deliveryFee">${formatUGX(0)}</strong></p>
      <p class="small muted">Delivery fee will be calculated once you allow location access. <button id="enableLocation" class="link-like">Enable Location</button></p>`;
  } else {
    deliveryHtml = `<p>Delivery Fee: <strong id="deliveryFee">${formatUGX(totals.deliveryFee)}</strong> <span class="small muted">(${currentDistanceKm.toFixed(2)} km)</span></p>`;
  }

  wrapper.innerHTML = `
    <hr>
    <p>Subtotal: <strong id="cartSubtotal">${formatUGX(totals.subtotal)}</strong></p>
    ${deliveryHtml}
    <p class="total-row">Total: <strong id="cartTotal">${formatUGX(totals.grandTotal)}</strong></p>
    <div class="cart-actions">
      <button id="orderNowInline" class="btn btn-order small">Order Now (WhatsApp)</button>
      <button id="clearCart" class="btn btn-ghost small">Clear Cart</button>
    </div>
  `;

  // wire inner buttons
  setTimeout(() => {
    const enableBtn = wrapper.querySelector("#enableLocation");
    if (enableBtn) enableBtn.addEventListener("click", () => { enableBtn.textContent = "Requesting..."; enableBtn.disabled = true; requestUserLocation(); });

    const orderInline = wrapper.querySelector("#orderNowInline");
    if (orderInline) orderInline.addEventListener("click", () => sendCartWhatsApp(false));

    const clearBtn = wrapper.querySelector("#clearCart");
    if (clearBtn) clearBtn.addEventListener("click", () => { if (confirm("Clear cart?")) { window.cart = []; saveCart(); updateCartPreview(); } });
  }, 0);

  return wrapper;
}

// -------------------- MENU RENDER --------------------
function adjustGridColumns() {
  if (!menuContainer) return;
  const w = window.innerWidth;
  if (w <= 600) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
  else if (w <= 1024) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
  else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
}

function renderMenu(category = "food") {
  if (!menuContainer) return;
  const items = menuData[category] || [];
  menuContainer.innerHTML = "";
  menuContainer.style.display = "grid";
  menuContainer.style.gap = "18px";
  adjustGridColumns();
  menuContainer.setAttribute("aria-busy", "true");

  items.forEach(item => {
    const card = document.createElement("article"); card.className = "menu-item card";
    card.dataset.id = item.id; card.dataset.price = item.price;
    card.innerHTML = `
      <div class="menu-media"><img src="${escapeHtml(item.img || '')}" alt="${escapeHtml(item.name)}" onerror="this.style.visibility='hidden'"></div>
      <div class="menu-body">
        <h4 class="item-name">${escapeHtml(item.name)}</h4>
        <p class="desc">${escapeHtml(item.description || '')}</p>
        <div class="meta">
          <span class="price">${formatUGX(item.price)}</span>
          <div class="actions">
            <button class="btn btn-small btn-add" data-id="${item.id}">Add</button>
            <button class="btn btn-small btn-whatsapp" data-id="${item.id}"><i class="fab fa-whatsapp" aria-hidden="true"></i> Order</button>
          </div>
        </div>
      </div>
    `;
    menuContainer.appendChild(card);

    // handlers
    card.querySelector(".btn-add").addEventListener("click", () => {
      // attempt to get user position if not yet acquired (to calculate fee)
      if (userPosition === null) {
        navigator.geolocation?.getCurrentPosition(pos => {
          userPosition = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          currentDistanceKm = calculateDistance(userPosition.latitude, userPosition.longitude, HQ_LAT, HQ_LNG);
          currentDeliveryFee = getDeliveryCharge(currentDistanceKm);
          addToCart(item);
        }, () => {
          currentDistanceKm = null; currentDeliveryFee = 0; addToCart(item);
        }, { timeout: 7000 });
      } else {
        // we already have location (or at least attempted)
        if (currentDistanceKm === null && userPosition) currentDistanceKm = calculateDistance(userPosition.latitude, userPosition.longitude, HQ_LAT, HQ_LNG);
        currentDeliveryFee = currentDistanceKm !== null ? getDeliveryCharge(currentDistanceKm) : 0;
        addToCart(item);
      }
    });

    card.querySelector(".btn-whatsapp").addEventListener("click", () => {
      // quick order single item
      const backup = JSON.parse(JSON.stringify(window.cart));
      window.cart = [{ id: item.id, name: item.name, price: item.price, qty: 1, img: item.img || "" }];
      if (userPosition === null) {
        navigator.geolocation?.getCurrentPosition(pos => {
          userPosition = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          currentDistanceKm = calculateDistance(userPosition.latitude, userPosition.longitude, HQ_LAT, HQ_LNG);
          currentDeliveryFee = getDeliveryCharge(currentDistanceKm);
          sendCartWhatsApp(true);
          window.cart = backup; saveCart(); updateCartPreview();
        }, () => {
          alert("Location permission required for delivery fee calculation. Please allow location and try again.");
          window.cart = backup; saveCart(); updateCartPreview();
        }, { timeout: 7000 });
      } else {
        sendCartWhatsApp(true);
        window.cart = backup; saveCart(); updateCartPreview();
      }
    });
  });

  menuContainer.setAttribute("aria-busy", "false");
}

// -------------------- NOTIFY / CALL HELPERS --------------------
function getNotifyNumbersFromSelection() {
  // priority: location-group select -> deliverySelect option's data-location -> fallback
  let group = null;
  if (locationGroupSelect && locationGroupSelect.value) group = locationGroupSelect.value;
  else if (deliverySelect && deliverySelect.selectedOptions && deliverySelect.selectedOptions[0]) {
    group = deliverySelect.selectedOptions[0].dataset.location || null;
  }
  if (group && LOCATION_NOTIFY[group]) return LOCATION_NOTIFY[group].slice();
  // if group undefined, return all unique numbers from LOCATION_NOTIFY
  const all = new Set(); Object.values(LOCATION_NOTIFY).flat().forEach(n => all.add(n));
  if (all.size) return Array.from(all);
  return NOTIFY_FALLBACK.slice();
}

function getPrimaryCallNumber() {
  let group = null;
  if (locationGroupSelect && locationGroupSelect.value) group = locationGroupSelect.value;
  else if (deliverySelect && deliverySelect.selectedOptions && deliverySelect.selectedOptions[0]) {
    group = deliverySelect.selectedOptions[0].dataset.location || null;
  }
  if (group && LOCATION_CALL[group]) return LOCATION_CALL[group];
  // fallback to a known primary
  return NOTIFY_FALLBACK[0];
}

// -------------------- WHATSAPP MESSAGE + SEND --------------------
function generateCartMessage(name, deliveryAreaLabel) {
  let msg = `✨ *Coffee Life Order* ✨\n\n👤 *Customer:* ${name}\n📍 *Delivery Area:* ${deliveryAreaLabel || "N/A"}\n\n🛒 *Order Details:*\n`;
  if (!window.cart.length) msg += "No items selected.\n";
  else {
    let subtotal = 0;
    window.cart.forEach((it, i) => {
      msg += `${i + 1}. ${it.name} x${it.qty} - ${formatUGX(it.price * it.qty)}\n`;
      subtotal += it.price * it.qty;
    });
    msg += `\n💰 Subtotal: ${formatUGX(subtotal)}`;
    msg += `\n🚚 Delivery Fee: ${formatUGX(currentDeliveryFee || 0)}`;
    msg += `\n📦 Total: ${formatUGX(subtotal + (currentDeliveryFee || 0))}`;
  }
  msg += `\n\n💵 Payment before delivery required.`;
  msg += `\n☕ Coffee Life — Crafted with Passion, Served with Care.`;
  return msg;
}

function sendCartWhatsApp(singleItemMode = false) {
  if (!window.cart.length) { alert("Please add items to your cart!"); return; }
  // require location to have been computed for Option B
  if (currentDistanceKm === null) {
    if (confirm("This order requires location access to calculate delivery fee. Allow location?")) {
      navigator.geolocation?.getCurrentPosition(pos => {
        userPosition = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        currentDistanceKm = calculateDistance(userPosition.latitude, userPosition.longitude, HQ_LAT, HQ_LNG);
        currentDeliveryFee = getDeliveryCharge(currentDistanceKm);
        updateCartPreview();
        // call again now that we have fee
        sendCartWhatsApp(singleItemMode);
      }, () => {
        alert("Unable to get location. Please allow location and try again.");
      }, { timeout: 8000 });
    } else {
      alert("Location required to calculate delivery fee. Please enable location and try again.");
    }
    return;
  }

  const deliveryAreaLabel = deliverySelect?.value || (locationGroupSelect?.value || "N/A");
  const name = prompt("Enter your full name:")?.trim();
  if (!name) { alert("Name is required."); return; }

  const message = generateCartMessage(name, deliveryAreaLabel);
  const notifyNums = getNotifyNumbersFromSelection();
  if (!notifyNums.length) { alert("No WhatsApp recipients configured. Please contact support."); return; }

  // open wa.me for each number so all receive the message
  notifyNums.forEach(n => {
    const clean = n.replace(/\D/g, "");
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });

  // clear cart after placing order (unless single-item quick order)
  if (!singleItemMode) {
    window.cart = [];
    saveCart();
    updateCartPreview();
  }
}

// -------------------- UI HELPERS --------------------
function flashAddButton(id) {
  const btn = document.querySelector(`.menu-item[data-id="${id}"] .btn-add`);
  if (!btn) return;
  btn.classList.add("shake", "glow");
  setTimeout(() => btn.classList.remove("shake"), 650);
  setTimeout(() => btn.classList.remove("glow"), 1400);
}

// -------------------- INIT & BINDINGS --------------------
function initMenuModule() {
  renderMenu("food");
  window.addEventListener("resize", adjustGridColumns);

  // category buttons
  if (menuButtons && menuButtons.length) {
    menuButtons.forEach(b => b.addEventListener("click", () => {
      const cat = b.dataset.category || (b.getAttribute("href") || "").replace("#", "");
      menuButtons.forEach(x => x.classList.remove("active")); b.classList.add("active");
      renderMenu(cat || "food");
    }));
  }

  // order button
  if (orderNowBtn) orderNowBtn.addEventListener("click", () => sendCartWhatsApp(false));

  // whatsapp confirm fallback (payment confirmation)
  if (whatsappConfirmBtn) whatsappConfirmBtn.addEventListener("click", e => {
    e.preventDefault();
    const nums = getNotifyNumbersFromSelection(); const n = (nums && nums[0]) ? nums[0].replace(/\D/g, "") : NOTIFY_FALLBACK[0];
    const msg = encodeURIComponent("Hello Coffee Life Cafe, I have completed my payment for my order. Please confirm my order. Thank you!");
    window.open(`https://wa.me/${n}?text=${msg}`, "_blank");
  });

  // call support
  if (callSupportBtn) callSupportBtn.addEventListener("click", () => {
    const num = getPrimaryCallNumber();
    window.location.href = `tel:+${num}`;
  });

  // deliverySelect change -> update UI (we also look for data-location attribute)
  if (deliverySelect) {
    deliverySelect.addEventListener("change", () => {
      // Update delivery group based on selected option's data-location if present
      updateCartPreview();
    });
  }

  // optional: location-group select change to update preview (if using)
  if (locationGroupSelect) {
    locationGroupSelect.addEventListener("change", () => updateCartPreview());
  }

  // try to fetch user location proactively (will ask permission)
  requestUserLocation();

  updateCartPreview();
}

// auto init
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMenuModule);
else initMenuModule();
// -------------------- FULLY PACKED 4x4 GRID --------------------
function renderPackedMenu4x4() {
  if (!menuContainer) return;
  menuContainer.innerHTML = "";
  menuContainer.style.display = "grid";
  menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)"; // 4 columns
  menuContainer.style.gridAutoRows = "1fr"; // uniform height rows
  menuContainer.style.gap = "20px"; // space between items
  menuContainer.style.alignItems = "stretch"; // make all items same height

  // Merge all categories into a single array
  const allCategories = ["food", "drinks", "desserts", "specials", "coffeeBeans"];
  let allItems = [];
  allCategories.forEach(cat => { if (menuData[cat]) allItems = allItems.concat(menuData[cat]); });

  allItems.forEach(item => {
    const card = document.createElement("article");
    card.className = "menu-item card";
    card.dataset.id = item.id;
    card.dataset.price = item.price;

    card.innerHTML = `
      <div class="menu-media">
        <img src="${escapeHtml(item.img || '')}" alt="${escapeHtml(item.name)}" onerror="this.style.visibility='hidden'">
      </div>
      <div class="menu-body">
        <h4 class="item-name">${escapeHtml(item.name)}</h4>
        <p class="desc">${escapeHtml(item.description || '')}</p>
        <div class="meta">
          <span class="price">${formatUGX(item.price)}</span>
          <div class="actions">
            <button class="btn btn-small btn-add" data-id="${item.id}">Add</button>
            <button class="btn btn-small btn-whatsapp" data-id="${item.id}">
              <i class="fab fa-whatsapp"></i> Order
            </button>
          </div>
        </div>
      </div>
    `;

    menuContainer.appendChild(card);

    // Add to Cart
    card.querySelector(".btn-add").addEventListener("click", () => addToCart(item));

    // Quick WhatsApp order
    card.querySelector(".btn-whatsapp").addEventListener("click", () => {
      const backup = JSON.parse(JSON.stringify(window.cart));
      window.cart = [{ id: item.id, name: item.name, price: item.price, qty: 1, img: item.img || "" }];
      sendCartWhatsApp(true);
      window.cart = backup; saveCart(); updateCartPreview();
    });
  });
}

// -------------------- RESPONSIVE GRID --------------------
function adjustPackedGrid() {
  if (!menuContainer) return;
  const w = window.innerWidth;
  if (w <= 480) menuContainer.style.gridTemplateColumns = "repeat(1, 1fr)";
  else if (w <= 768) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
  else if (w <= 1024) menuContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
  else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
}

// -------------------- OPTIONAL PROFESSIONAL CSS --------------------
const packedStyle = document.createElement("style");
packedStyle.textContent = `
.menu-item.card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.menu-item.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}
.menu-media img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
}
.menu-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.item-name {
  font-size: 1.05rem;
  margin: 6px 0;
  font-weight: bold;
}
.desc {
  font-size: 0.9rem;
  color: #555;
  flex-grow: 1;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.actions button {
  margin-left: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
.actions .btn-add {
  background-color: #4caf50;
  color: #fff;
}
.actions .btn-whatsapp {
  background-color: #25d366;
  color: #fff;
}
`;
document.head.appendChild(packedStyle);

// -------------------- INIT --------------------
renderPackedMenu4x4();
adjustPackedGrid();
window.addEventListener("resize", adjustPackedGrid);
/* ============================
   COFFEE LIFE — FINAL 4x4 GRID MENU
   Fully responsive, professional layout
   ============================ */
(function () {
  const menuContainer = document.getElementById("menu-container");

  if (!menuContainer) return;

  function renderPackedMenu() {
    menuContainer.innerHTML = "";
    menuContainer.style.display = "grid";
    menuContainer.style.gap = "20px";
    menuContainer.style.gridAutoRows = "1fr";
    menuContainer.style.alignItems = "stretch";

    // Merge all categories
    const allCategories = ["food", "drinks", "desserts", "specials", "coffeeBeans"];
    let allItems = [];
    allCategories.forEach(cat => {
      if (menuData[cat]) allItems = allItems.concat(menuData[cat]);
    });

    allItems.forEach(item => {
      const card = document.createElement("article");
      card.className = "menu-item card";
      card.dataset.id = item.id;
      card.dataset.price = item.price;

      card.innerHTML = `
        <div class="menu-media">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="menu-body">
          <h4 class="item-name">${item.name}</h4>
          <p class="desc">${item.description}</p>
          <div class="meta">
            <span class="price">UGX ${item.price.toLocaleString()}</span>
            <div class="actions">
              <button class="btn btn-small btn-add" data-id="${item.id}">Add</button>
              <button class="btn btn-small btn-whatsapp" data-id="${item.id}">Order</button>
            </div>
          </div>
        </div>
      `;
      menuContainer.appendChild(card);

      // Wire Add to Cart
      card.querySelector(".btn-add").addEventListener("click", () => addToCart(item));

      // Quick WhatsApp Order
      card.querySelector(".btn-whatsapp").addEventListener("click", () => {
        const backup = JSON.parse(JSON.stringify(window.cart));
        window.cart = [{ id: item.id, name: item.name, price: item.price, qty: 1, img: item.img || "" }];
        sendCartWhatsApp(true);
        window.cart = backup; saveCart(); updateCartPreview();
      });
    });

    adjustPackedGrid();
  }

  function adjustPackedGrid() {
    const w = window.innerWidth;
    if (w <= 480) menuContainer.style.gridTemplateColumns = "repeat(1, 1fr)";
    else if (w <= 768) menuContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    else if (w <= 1024) menuContainer.style.gridTemplateColumns = "repeat(3, 1fr)";
    else menuContainer.style.gridTemplateColumns = "repeat(4, 1fr)";
  }

  window.addEventListener("resize", adjustPackedGrid);

  // Optional professional styling
  const style = document.createElement("style");
  style.textContent = `
    .menu-item.card {
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      padding: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .menu-item.card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    }
    .menu-media img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
    }
    .menu-body { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
    .item-name { font-size: 1.05rem; margin: 6px 0; font-weight: bold; }
    .desc { font-size: 0.9rem; color: #555; flex-grow: 1; }
    .meta { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .actions button { margin-left: 4px; padding: 6px 10px; border-radius: 6px; border: none; cursor: pointer; }
    .actions .btn-add { background-color: #4caf50; color: #fff; }
    .actions .btn-whatsapp { background-color: #25d366; color: #fff; }
  `;
  document.head.appendChild(style);

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPackedMenu);
  } else renderPackedMenu();
})();
