// COFFEE LIFE — WhatsApp + Payments + Cart (Final 2025)
// Final single-file JS, DOM-safe, auto-inserts payment icons, and uses only provided locations/areas.

(function () {
  "use strict";

  // run when DOM is ready
  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  onReady(() => {
    // ===== INITIAL CART =====
    window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");

    // ===== DOM ELEMENTS (resolved after DOM ready) =====
    const cartItemsContainer = document.getElementById("cartItems");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const deliveryFeeEl = document.getElementById("deliveryFee");
    const cartTotalEl = document.getElementById("cartTotal");
    const deliverySelect = document.getElementById("delivery-zone");
    const locationGroupSelect = document.getElementById("location-group");
    const orderNowBtn = document.getElementById("orderNow");
    const callSupportBtn = document.getElementById("callSupport");
    const whatsappConfirmBtn = document.getElementById("whatsapp-confirm");
    const paymentContainer = document.getElementById("payment-section");
    const whatsappBtn = document.querySelector(".whatsapp-float");

    // ===== LOCATION CONTACTS =====
    const LOCATION_CONTACTS = {
      "jinja-highway": ["256752746763", "256749958799", "256751054138"],
      "jinja-lakeview": ["256750038032"],
      "kampala-kasangalinke": ["256783070102"]
    };

    // ===== DELIVERY AREAS (fees in UGX) =====
    const DELIVERY_AREAS = {
      "Jinja Town": 2000, "Milo Mbili": 2000, "Walukuba West": 2000,
      "Walukuba East": 3000, "Mafubira": 3000, "Mpumudde": 3000,
      "Bugembe": 3000, "Nile": 3000, "Masese": 4000, "Wakitaka": 4000,
      "Namuleesa": 4000, "Lakeview Central": 2000, "Mailombili": 2000,
      "Makerere": 3000, "Kira Road": 3000, "Gabba Road": 3500, "Other Kampala": 4000
    };

    let DELIVERY_FEE = 0;

    // ===== UTILITIES =====
    function persistCart() {
      localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
    }

    function formatUGX(amount) {
      return Number(amount || 0).toLocaleString() + " UGX";
    }

    function calcCartSubtotal() {
      return window.cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);
    }

    function getSelectedDeliveryFee() {
      if (!deliverySelect) return 0;
      const sel = deliverySelect.selectedOptions && deliverySelect.selectedOptions[0];
      return sel ? parseInt(sel.dataset.fee, 10) || 0 : 0;
    }

    // ===== CART DISPLAY =====
    function updateCartDisplay() {
      if (!cartItemsContainer) return;
      cartItemsContainer.innerHTML = "";

      if (!window.cart.length) {
        cartItemsContainer.innerHTML = "<p class='cart-empty'>🛒 Your cart is empty.</p>";
      } else {
        // render items
        window.cart.forEach(item => {
          const div = document.createElement("div");
          div.className = "cart-item";
          // no required image — only include if present in the item
          const imgHtml = item.img ? `<img src="${item.img}" alt="${escapeHtml(item.name)}">` : "";
          div.innerHTML = `
            ${imgHtml}
            <div class="cart-item-info">
              <span class="name">${escapeHtml(item.name)}</span>
              <span class="price">${formatUGX(item.price)}</span>
            </div>
            <div class="cart-controls">
              <button class="qty-btn" data-action="minus" data-name="${escapeHtml(item.name)}" aria-label="Decrease">-</button>
              <span class="qty">${item.qty}</span>
              <button class="qty-btn" data-action="plus" data-name="${escapeHtml(item.name)}" aria-label="Increase">+</button>
            </div>
            <span class="remove" data-name="${escapeHtml(item.name)}" aria-label="Remove item">×</span>
          `;
          cartItemsContainer.appendChild(div);
        });
      }

      DELIVERY_FEE = getSelectedDeliveryFee();
      const subtotal = calcCartSubtotal();
      const total = subtotal + DELIVERY_FEE;

      if (cartSubtotalEl) cartSubtotalEl.textContent = formatUGX(subtotal);
      if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
      if (cartTotalEl) cartTotalEl.textContent = formatUGX(total);

      updateWhatsAppState();
      bindCartButtons();
    }

    // escapeHtml helper
    function escapeHtml(str) {
      return String(str || "").replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }

    // ===== CART BUTTONS =====
    function bindCartButtons() {
      // qty buttons
      document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.onclick = () => {
          const action = btn.dataset.action;
          const name = btn.dataset.name;
          const item = window.cart.find(i => i.name === name);
          if (!item) return;
          if (action === "plus") item.qty++;
          else { item.qty--; if (item.qty <= 0) window.cart = window.cart.filter(i => i.name !== name); }
          persistCart(); updateCartDisplay();
        };
      });
      // remove buttons
      document.querySelectorAll(".remove").forEach(btn => {
        btn.onclick = () => {
          const name = btn.dataset.name;
          window.cart = window.cart.filter(i => i.name !== name);
          persistCart(); updateCartDisplay();
        };
      });
    }

    // ===== ADD TO CART (menu buttons) =====
    document.querySelectorAll(".btn-add, .add-to-cart-btn").forEach(btn => {
      btn.onclick = e => {
        const itemEl = e.target.closest(".menu-item, .menu-card");
        if (!itemEl) return;
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price, 10) || 0;
        const img = itemEl.querySelector("img")?.src || "";
        const existing = window.cart.find(i => i.name === name);
        if (existing) existing.qty++;
        else window.cart.push({ name, price, qty: 1, img });
        persistCart(); updateCartDisplay();
        const btnAdd = itemEl.querySelector(".btn-add");
        if (btnAdd) { btnAdd.classList.add("shake", "glow"); setTimeout(() => btnAdd.classList.remove("shake"), 600); setTimeout(() => btnAdd.classList.remove("glow"), 1400); }
      };
    });

    // ===== WHATSAPP MESSAGE GENERATION =====
    function generateCartMessage(customerName, area, paymentMethod = "Cash") {
      const subtotal = calcCartSubtotal();
      const total = subtotal + DELIVERY_FEE;
      let message = `✨ *Coffee Life Order* ✨\n\n`;
      message += `👤 Customer: ${customerName || "[Your Name]"}\n`;
      message += `📍 Delivery Area: ${area || "[Your Location]"}\n`;
      message += `💰 Payment: ${paymentMethod}\n\n🛒 Order Details:\n`;
      window.cart.forEach((item, i) => {
        message += `${i + 1}. ${item.name} x${item.qty} - ${formatUGX(item.price * item.qty)}\n`;
      });
      message += `\n💰 Subtotal: ${formatUGX(subtotal)}`;
      message += `\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}`;
      message += `\n📦 Total: ${formatUGX(total)}`;
      message += `\n\n☕ Coffee Life — Crafted with Passion, Served with Care`;
      return message;
    }

    // ===== CONTACTS & Ordering =====
    function getContactsForLocationGroup() {
      if (!locationGroupSelect) return [];
      return LOCATION_CONTACTS[locationGroupSelect.value] || [];
    }

    function handleOrderNow(paymentMethod = "Cash") {
      if (!window.cart.length) return alert("Add items to your cart!");
      if (!deliverySelect || !deliverySelect.value) return alert("Select a delivery area!");
      if (!locationGroupSelect || !locationGroupSelect.value) return alert("Select a location group!");
      const customerName = prompt("Enter your full name:")?.trim();
      if (!customerName) return alert("Name required!");
      const area = deliverySelect.value;
      const message = generateCartMessage(customerName, area, paymentMethod);
      const contacts = getContactsForLocationGroup();
      if (!contacts.length) return alert("No WhatsApp contacts for selected location.");
      contacts.forEach(number => {
        const clean = String(number).replace(/\D/g, "");
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(message)}`, "_blank");
      });
      window.cart = []; persistCart(); updateCartDisplay();
    }

    // ===== CALL SUPPORT =====
    if (callSupportBtn) {
      callSupportBtn.addEventListener("click", () => {
        const contacts = getContactsForLocationGroup();
        if (!contacts.length) return alert("No support contact for this location.");
        window.location.href = `tel:${contacts[0]}`;
      });
    }

    // ===== WHATSAPP CONFIRM (payment confirmation) =====
    if (whatsappConfirmBtn) {
      whatsappConfirmBtn.addEventListener("click", () => handleOrderNow("Cash"));
    }

    // ===== PAYMENTS (USSD + auto icons) =====
    const PAYMENT_MERCHANTS = { mtn: "4393386", airtel1: "971714", airtel2: "4393386" };
    const USSD_PATTERNS = { mtn: "*165*3*{merchant}*{amount}%23", airtel: "*185*9*{merchant}*{amount}%23" };

    function handlePayment(type) {
      if (!window.cart.length) return alert("Add items first!");
      const subtotal = calcCartSubtotal();
      const area = (deliverySelect && deliverySelect.value) || "";
      const total = subtotal + (DELIVERY_AREAS[area] || 0);
      const method = (type === "mtn") ? "MTN Mobile Money" : "Airtel Money";
      const merchant = (type === "mtn") ? PAYMENT_MERCHANTS.mtn : PAYMENT_MERCHANTS.airtel1;
      const ussdTemplate = (type === "mtn") ? USSD_PATTERNS.mtn : USSD_PATTERNS.airtel;
      const ussd = ussdTemplate.replace("{merchant}", merchant).replace("{amount}", String(total));
      // Open dialer with USSD pattern (mobile)
      window.location.href = "tel:" + ussd;
      // After small delay, open WhatsApp confirmation flow
      setTimeout(() => handleOrderNow(method), 1000);
    }

    // Single, final addPaymentButtons that includes icons
    function addPaymentButtons() {
      if (!paymentContainer) return;
      paymentContainer.innerHTML = ''; // clear existing

      const payments = [
        { type: 'mtn', label: 'Pay with MTN', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/MTN_logo.svg' },
        { type: 'airtel', label: 'Pay with Airtel', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Airtel_Logo.svg' }
      ];

      payments.forEach(p => {
        const btn = document.createElement('button');
        btn.className = `payment-btn ${p.type} shake glow`;
        // image included — CSS should control size (.payment-btn img { height: 24px })
        btn.innerHTML = `<img src="${p.icon}" alt="${escapeHtml(p.type)} icon" loading="lazy" /> <span>${escapeHtml(p.label)}</span>`;
        btn.addEventListener('click', () => handlePayment(p.type));
        paymentContainer.appendChild(btn);
      });

      const note = document.createElement('div');
      note.className = 'payment-temp-note';
      note.textContent = "Select your preferred payment method above";
      paymentContainer.appendChild(note);
    }

    // ===== WHATSAPP FLOAT STATE =====
    function updateWhatsAppState() {
      if (!whatsappBtn) return;
      if (!window.cart.length) {
        whatsappBtn.classList.add("disabled", "shake", "glow");
        whatsappBtn.style.pointerEvents = "none";
        whatsappBtn.title = "Add items to cart first!";
      } else {
        whatsappBtn.classList.remove("disabled");
        whatsappBtn.style.pointerEvents = "auto";
        whatsappBtn.title = "Chat on WhatsApp";
      }
    }

    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", e => {
        if (whatsappBtn.classList.contains("disabled")) { e.preventDefault(); alert("Add items to cart before contacting WhatsApp!"); }
      });
    }

    // ===== DELIVERY SELECT CHANGE =====
    if (deliverySelect) {
      deliverySelect.addEventListener("change", () => {
        DELIVERY_FEE = getSelectedDeliveryFee();
        updateCartDisplay();
      });
    }

    // ===== LOCATION GROUP CHANGE: hide/show delivery options by data-location =====
    if (locationGroupSelect && deliverySelect) {
      locationGroupSelect.addEventListener("change", () => {
        const group = locationGroupSelect.value;
        Array.from(deliverySelect.options).forEach(opt => {
          if (!opt.dataset.location) return;
          opt.hidden = opt.dataset.location !== group;
        });
        deliverySelect.value = "";
        updateCartDisplay();
      });
    }

    // ===== ORDER BUTTONS BIND =====
    [orderNowBtn].forEach(btn => {
      if (btn) btn.addEventListener("click", () => handleOrderNow());
    });

    // ===== INIT =====
    addPaymentButtons();
    updateCartDisplay();

    // expose some helpers for debugging (optional)
    window.coffeeLife = {
      updateCartDisplay,
      addPaymentButtons,
      handlePayment,
      handleOrderNow
    };
  });
})();
// ===== GET CONTACTS FOR SELECTED LOCATION =====
function getContactsForLocationGroup() {
  const locationGroup = document.getElementById("location-group").value;
  const LOCATION_CONTACTS = {
    "jinja-highway": ["256752746763", "256749958799", "256751054138"],
    "jinja-lakeview": ["256750038032"],
    "kampala-kasangalinke": ["256783070102"]
  };
  return LOCATION_CONTACTS[locationGroup] || [];
}

// ===== HANDLE ORDER =====
function handleOrderNow(paymentMethod = "Cash") {
  if (window.cart.length === 0) return alert("Add items to your cart!");
  const deliverySelect = document.getElementById("delivery-zone");
  if (!deliverySelect.value) return alert("Select a delivery area!");
  const locationGroupSelect = document.getElementById("location-group");
  if (!locationGroupSelect.value) return alert("Select a location group!");

  const customerName = prompt("Enter your full name:")?.trim();
  if (!customerName) return alert("Name required!");

  const area = deliverySelect.value;
  const subtotal = window.cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const DELIVERY_FEE = parseInt(deliverySelect.selectedOptions[0].dataset.fee) || 0;
  const total = subtotal + DELIVERY_FEE;

  let message = `✨ *Coffee Life Order* ✨\n\n`;
  message += `👤 Customer: ${customerName}\n`;
  message += `📍 Delivery Area: ${area}\n`;
  message += `💰 Payment: ${paymentMethod}\n\n🛒 Order Details:\n`;
  window.cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} x${item.qty} - ${item.price * item.qty} UGX\n`;
  });
  message += `\n💰 Subtotal: ${subtotal} UGX\n🚚 Delivery Fee: ${DELIVERY_FEE} UGX\n📦 Total: ${total} UGX\n\n`;
  message += `☕ Coffee Life — Crafted with Passion, Served with Care`;

  const contacts = getContactsForLocationGroup();
  if (contacts.length === 0) return alert("No WhatsApp contacts for selected location.");

  contacts.forEach(number => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
  });

  // Clear cart after ordering
  window.cart = [];
  localStorage.setItem("coffee_life_cart", JSON.stringify([]));
  updateCartDisplay();
}

// ===== BIND WHATSAPP BUTTON =====
document.getElementById("whatsapp-confirm")?.addEventListener("click", () => handleOrderNow("Cash"));
