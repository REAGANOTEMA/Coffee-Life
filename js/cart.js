/* ============================
   cart.js — COFFEE LIFE Cart + WhatsApp + AI Chatbot + TEMP Payments
   ============================ */

(() => {
  // ===== CONFIG =====
  const WA_PHONE = "256772514889";
  const DELIVERY_FEE = 4000; // UGX delivery fee automatically added

  // 🔧 TEMP PAYMENT MERCHANT CODES — REPLACE with real values
  // Replace these with real MTN / Airtel merchant credentials provided by your payment provider
  const MTN_MERCHANT_CODE = "TEMP_MERCHANT_CODE_MTN";
  const AIRTEL_MERCHANT_CODE = "TEMP_MERCHANT_CODE_AIRTEL";

  // ===== DOM SELECTORS (with fallbacks to support variations in HTML) =====
  const cartBtn = document.querySelector(".cart-btn");
  const cartClose = document.querySelector(".cart-close");
  const cartContainer = document.querySelector(".cart-container") || document.getElementById("cart") || null;
  const cartItemsContainer = document.querySelector(".cart-items") || document.getElementById("cartItems") || null;
  const cartTotalEl = document.querySelector(".cart-total") || document.getElementById("cartTotal") || null;
  const cartOrderBtn = document.querySelector(".cart-order-btn") || document.getElementById("orderNow") || null;

  const whatsappFloat = document.querySelector(".whatsapp-float");
  const whatsappModal = document.querySelector(".whatsapp-modal");
  const whatsappClose = document.querySelector(".close-whatsapp");
  const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");
  const cartPreview = document.querySelector(".whatsapp-cart-preview");
  const qrBtn = document.querySelector(".qr-btn");
  const whatsappBtnFooter = document.querySelector(".btn-whatsapp-send-footer");

  const chatMessages = document.querySelector(".chat-messages");
  const chatInput = document.getElementById("chatUserInput");
  const chatSendBtnChat = document.getElementById("chatSendBtn");

  // ===== Global cart persisted to localStorage =====
  window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");

  function persistCart() {
    localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
  }

  // ===== Utilities =====
  function formatUGX(v) {
    return "UGX " + Number(v).toLocaleString();
  }

  function calcTotal() {
    return window.cart.reduce((s, it) => s + (it.price * it.qty), 0);
  }

  // ===== Cart Modal Open/Close (if those controls exist) =====
  if (cartBtn && cartContainer) {
    cartBtn.addEventListener("click", () => cartContainer.classList.toggle("active"));
  }
  if (cartClose && cartContainer) {
    cartClose.addEventListener("click", () => cartContainer.classList.remove("active"));
  }

  // ===== Add to Cart: accept item object { id, name, price, img } =====
  function addToCart(item) {
    if (!item || !item.id) {
      console.warn("addToCart requires an item with id");
      return;
    }
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...item, qty: 1 });
    persistCart();
    renderCart();
    updateCartPreview();
    updateQRLink();
    // subtle UI feedback
    flashAddButton(item.id);
  }

  // Expose small hook so menu.js can call it directly:
  window.cartAdd = addToCart;

  // Also support adding via HTML buttons (class .btn-add on each .menu-item)
  function wireStaticAddButtons() {
    document.querySelectorAll(".menu-item .btn-add, .menu-item .add-to-cart-btn").forEach(btn => {
      if (btn.__wired) return;
      btn.__wired = true;
      btn.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".menu-item");
        // if menu.js rendered card style, handle that too
        const id = itemEl?.dataset.id || itemEl?.querySelector(".add-to-cart-btn")?.dataset.id || itemEl?.querySelector(".add-to-cart-btn")?.getAttribute("data-id") || null;
        const name = itemEl?.dataset.name || itemEl?.querySelector("h4, h3")?.textContent?.trim() || itemEl?.querySelector(".menu-name")?.textContent?.trim() || "Item";
        const price = parseInt(itemEl?.dataset.price || itemEl?.dataset?.price || itemEl?.querySelector(".price")?.textContent?.replace(/\D/g, "") || 0);
        const img = itemEl?.querySelector("img")?.getAttribute("src") || "";
        // if id isn't set, create a deterministic id from name
        const safeId = id || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
        addToCart({ id: safeId, name, price: Number(price), img });
      });
    });
  }

  // Flash animation on add
  function flashAddButton(itemId) {
    // find a corresponding button
    const btn = document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`) || document.querySelector(`.add-to-cart-btn[data-id="${itemId}"]`);
    if (!btn) return;
    btn.classList.add("shake", "glow");
    setTimeout(() => btn.classList.remove("shake"), 600);
    setTimeout(() => btn.classList.remove("glow"), 1400);
  }

  // ===== Remove / change quantity =====
  function removeFromCart(id) {
    window.cart = window.cart.filter(i => i.id !== id);
    persistCart();
    renderCart();
    updateCartPreview();
    updateQRLink();
  }

  function updateQty(id, qty) {
    const it = window.cart.find(i => i.id === id);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) removeFromCart(id);
    persistCart();
    renderCart();
    updateCartPreview();
    updateQRLink();
  }

  // ===== Render cart inside the cart panel (if present) =====
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
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.img || 'menu-images/placeholder.jpg'}" alt="${escapeHtml(item.name)}">
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>UGX ${Number(item.price).toLocaleString()} x ${item.qty}</p>
        </div>
        <div class="cart-controls">
          <button class="qty-btn small" data-action="minus" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn small" data-action="plus" data-id="${item.id}">+</button>
          <button class="cart-item-remove" data-id="${item.id}" title="Remove">&times;</button>
        </div>
      `;
      // attach handlers
      div.querySelectorAll(".qty-btn").forEach(b => {
        b.addEventListener("click", (e) => {
          const action = e.currentTarget.dataset.action;
          const id = e.currentTarget.dataset.id;
          const it2 = window.cart.find(i => i.id === id);
          if (!it2) return;
          if (action === "plus") updateQty(id, it2.qty + 1);
          else updateQty(id, it2.qty - 1);
        });
      });
      div.querySelector(".cart-item-remove")?.addEventListener("click", (e) => removeFromCart(e.currentTarget.dataset.id));
      cartItemsContainer.appendChild(div);
    });
    const grandTotal = total + DELIVERY_FEE;
    if (cartTotalEl) cartTotalEl.textContent = `Total: UGX ${grandTotal.toLocaleString()}`;
  }

  // ===== Update floating WhatsApp cart preview (small widget) =====
  function updateCartPreview() {
    if (!cartPreview) return;
    cartPreview.innerHTML = "";
    if (window.cart.length === 0) {
      cartPreview.innerHTML = "<p>Your cart is empty.</p>";
      return;
    }
    window.cart.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <span class="name">${escapeHtml(item.name)}</span>
        <div class="controls">
          <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
        </div>
        <span class="price">${formatUGX(item.price * item.qty)}</span>
      `;
      cartPreview.appendChild(div);
    });
    // wire qty buttons
    cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;
        const it = window.cart.find(x => x.id === id);
        if (!it) return;
        if (action === "plus") updateQty(id, it.qty + 1);
        else updateQty(id, it.qty - 1);
      });
    });
  }

  // ===== Generate WhatsApp message (includes delivery fee) =====
  function generateCartMessage(name = "[Your Name]", location = "[Your Location]", paymentMethod = "[Payment Method]") {
    let message = `✨ Coffee Life Order ✨\n\n`;
    message += `👤 Customer: ${name}\n📍 Delivery: ${location}\n\n`;
    message += "🛒 Order Details:\n";
    if (window.cart.length === 0) message += "No items selected yet.\n";
    else {
      let total = 0;
      window.cart.forEach((item, i) => {
        message += `${i + 1}. ${item.name} x${item.qty} - ${formatUGX(item.price * item.qty)}\n`;
        total += item.price * item.qty;
      });
      message += `\n🧾 Subtotal: ${formatUGX(total)}`;
      message += `\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}`;
      message += `\n\n💰 Grand Total: ${formatUGX(total + DELIVERY_FEE)}`;
    }
    message += `\n\n💳 Payment Method: ${paymentMethod}`;
    message += `\n\n💵 Payment before delivery required.\n☕ Coffee Life — Crafted with Passion, Served with Care.`;
    return message;
  }

  // ===== Send Flow (asks for name/location and payment method, then opens WhatsApp) =====
  function sendCartWhatsApp() {
    if (window.cart.length === 0) {
      alert("Your cart is empty! Please add items first.");
      return;
    }
    const name = prompt("Please enter your name:")?.trim();
    if (!name) { alert("Name is required!"); return; }
    const location = prompt("Please enter your delivery location:")?.trim();
    if (!location) { alert("Location is required!"); return; }

    // Ask for payment method: WhatsApp order only, or simulate Mobile Money
    const pm = prompt("Payment method? Type: WHATSAPP (order), MTN, or AIRTEL").trim()?.toUpperCase() || "WHATSAPP";
    let paymentMethod = "WhatsApp Order (pay on delivery)";
    if (pm === "MTN" || pm === "AIRTEL") {
      paymentMethod = `${pm} Mobile Money (temporary instructions)`;
      // show temporary instructions flow
      handleTemporaryMobileMoney(pm, name, location);
      return; // handleTemporaryMobileMoney will show instructions and also prepare WA message if needed
    }

    const message = generateCartMessage(name, location, paymentMethod);
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
  }

  // ===== Temporary Mobile Money helper (instruction only, creates mock reference) =====
  function handleTemporaryMobileMoney(provider, name, location) {
    // TEMP: create a pseudo transaction reference for the merchant
    const ref = `CL-${provider}-${Date.now().toString().slice(-6)}`;
    const total = calcTotal() + DELIVERY_FEE;
    let instructions = `TEMP ${provider} PAYMENT\n\nMerchant: Coffee Life\nMerchant Code: ${provider === "MTN" ? MTN_MERCHANT_CODE : AIRTEL_MERCHANT_CODE}\nReference: ${ref}\nAmount: ${formatUGX(total)}\n\nPlease send payment from your ${provider} Mobile Money to the merchant code above and include reference: ${ref}\n\nWhen done, send proof or reply on WhatsApp.`;

    // show instructions to user:
    alert(instructions);

    // also prepare whatsapp message to business including reference and "payment pending"
    const message = generateCartMessage(name, location, `${provider} MM - PENDING (ref: ${ref})`) +
                    `\n\n🔖 Payment reference: ${ref}\n(Temporary flow — replace merchant code with live credentials later)`;

    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
  }

  // ===== WhatsApp Event Listeners (buttons exist in multiple files) =====
  if (cartOrderBtn) cartOrderBtn.addEventListener("click", sendCartWhatsApp);
  if (whatsappSendBtn) whatsappSendBtn.addEventListener("click", sendCartWhatsApp);
  if (whatsappBtnFooter) whatsappBtnFooter.addEventListener("click", sendCartWhatsApp);

  if (whatsappFloat) {
    whatsappFloat.addEventListener("click", () => {
      whatsappModal?.classList.toggle("active");
      renderCart();
      updateCartPreview();
      startChat();
    });
  }
  if (whatsappClose) whatsappClose.addEventListener("click", () => whatsappModal?.classList.remove("active"));
  setInterval(() => whatsappFloat?.classList.toggle("highlight"), 3000);

  // ===== QR LINK update (keeps same behavior) =====
  function updateQRLink() {
    if (!qrBtn) return;
    qrBtn.setAttribute("href", "#menu");
  }

  // ===== AI Chatbot (small) =====
  let chatStep = 0;
  let userData = { name: "", location: "" };

  function addMessage(text, sender = "bot") {
    if (!chatMessages) return;
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function startChat() {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    chatStep = 0;
    userData = { name: "", location: "" };
    addMessage("👋 Hello! Welcome to Coffee Life ☕");
    setTimeout(() => addMessage("May I have your name, please?"), 800);
  }

  function handleChat() {
    if (!chatInput) return;
    const input = chatInput.value.trim();
    if (!input) return;
    addMessage(input, "user");
    chatInput.value = "";

    setTimeout(() => {
      if (chatStep === 0) {
        userData.name = input;
        addMessage(`Nice to meet you, ${userData.name}! Where should we deliver?`);
        chatStep++;
      } else if (chatStep === 1) {
        userData.location = input;
        addMessage(`Delivery to ${userData.location}. Delivery fee is ${formatUGX(DELIVERY_FEE)}.`);
        addMessage("Would you like to view menu or place an order?");
        chatStep++;
      } else if (chatStep === 2) {
        if (input.toLowerCase().includes("menu")) {
          addMessage("Opening menu... 🍽");
          setTimeout(() => window.location.hash = "#menu", 600);
        } else {
          addMessage("When ready, press Send to WhatsApp to place order.");
          const orderBtn = document.createElement("button");
          orderBtn.className = "btn-whatsapp-send";
          orderBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Send to WhatsApp';
          orderBtn.onclick = sendCartWhatsApp;
          chatMessages.appendChild(orderBtn);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
    }, 600);
  }

  if (chatSendBtnChat) chatSendBtnChat.addEventListener("click", handleChat);
  if (chatInput) chatInput.addEventListener("keypress", e => { if (e.key === "Enter") handleChat(); });

  // ===== Small helpers & initialization =====
  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  // init
  renderCart();
  updateCartPreview();
  updateQRLink();
  wireStaticAddButtons();

  // Re-wire static add buttons when DOM changes (for menu.js creating cards)
  const observer = new MutationObserver(() => wireStaticAddButtons());
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose some internals for debugging in console
  window.__coffeeLife = {
    getCart: () => window.cart,
    clearCart: () => { window.cart = []; persistCart(); renderCart(); updateCartPreview(); updateQRLink(); },
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    DELIVERY_FEE,
    MTN_MERCHANT_CODE,
    AIRTEL_MERCHANT_CODE
  };
})();
