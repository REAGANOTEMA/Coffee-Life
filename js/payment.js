/* final payment.js — Coffee Life (2025)
   - Shows merchant codes for MTN & Airtel
   - Full cart + delivery + WhatsApp flow
   - Copy merchant code, animations, and polished UX
*/

(() => {
    // === Config ===
    const WA_PHONE = "256709691395"; // WhatsApp recipient (no + for wa.me)
    const MTN_MERCHANT = "971714";
    const AIRTEL_MERCHANT = "4393386";

    // Delivery map (keys correspond to select option values in HTML)
    const DELIVERY_AREAS = {
        "jinja-town": 2000, "milo-mbili": 2000, "walukuba-west": 2000,
        "walukuba-east": 3000, "mafubira": 3000, "mpumudde": 3000,
        "bugembe": 3000, "nile": 3000, "makerere": 3000,
        "kira-road": 3000, "masese": 4000, "wakitaka": 4000,
        "namuleesa": 4000
    };

    // === DOM ===
    const deliverySelect = document.getElementById("delivery-zone");
    const deliveryFeeDisplay = document.getElementById("deliveryFee");
    const deliveryFeeSummaryElem = document.getElementById("deliveryFeeSummary");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartSubtotalElem = document.getElementById("cartSubtotal");
    const cartTotalElem = document.getElementById("cartTotal");
    const cartCountEl = document.getElementById("cart-count");

    const paymentOptions = Array.from(document.querySelectorAll(".payment-option"));
    const paymentNumberInput = document.getElementById("paymentNumber");
    const whatsappBtn = document.getElementById("whatsapp-confirm");
    const callSupportBtn = document.getElementById("callSupport");

    // We'll create a small merchant-info area appended into #payment-section
    const paymentSection = document.getElementById("payment-section");

    // === State ===
    let DELIVERY_FEE = 0;
    let selectedProvider = null;

    // Cart stored in localStorage under key
    window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");

    // === Helpers ===
    const persistCart = () => localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
    const formatUGX = (v) => Number(v || 0).toLocaleString() + " UGX";
    const parseNumberFromText = s => parseInt((s || "").toString().replace(/\D/g, "")) || 0;

    // small animation helper: apply .shaking (CSS) then remove after duration
    const flash = (el, cls = "shaking", ms = 600) => {
        if (!el) return;
        el.classList.add(cls);
        setTimeout(() => el.classList.remove(cls), ms);
    };

    // === Cart operations ===
    function calcSubtotal() {
        return (window.cart || []).reduce((acc, it) => acc + (Number(it.price) * Number(it.qty)), 0);
    }

    function updateCartCount() {
        const totalItems = (window.cart || []).reduce((s, i) => s + i.qty, 0);
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
            flash(cartCountEl, "shaking", 500);
        }
    }

    function addToCart(item) {
        if (!item || !item.id) { console.warn("addToCart requires item with id"); return; }
        const existing = window.cart.find(i => i.id === item.id);
        if (existing) existing.qty++;
        else window.cart.push({ ...item, qty: 1 });
        persistCart(); renderCart(); updateCartCount();
    }
    // expose to window for menu scripts to call
    window.cartAdd = addToCart;

    function removeFromCart(id) {
        window.cart = window.cart.filter(i => i.id !== id);
        persistCart(); renderCart(); updateCartCount();
    }

    function updateQty(id, qty) {
        const it = window.cart.find(i => i.id === id);
        if (!it) return;
        it.qty = qty;
        if (it.qty <= 0) removeFromCart(id);
        persistCart(); renderCart(); updateCartCount();
    }

    // === Render cart UI ===
    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";
        const cart = window.cart || [];
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty. <a href="index.html#menu">Add items</a>.</p>`;
            if (cartSubtotalElem) cartSubtotalElem.textContent = `0 UGX`;
            if (cartTotalElem) cartTotalElem.textContent = `0 UGX`;
            if (deliveryFeeSummaryElem) deliveryFeeSummaryElem.textContent = formatUGX(DELIVERY_FEE);
            return;
        }

        let subtotal = 0;
        cart.forEach(item => {
            subtotal += Number(item.price) * Number(item.qty);
            const root = document.createElement("div");
            root.className = "cart-item flex";
            root.innerHTML = `
        <img src="${item.img || 'images/logo.jpg'}" alt="${escapeHtml(item.name)}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>${formatUGX(item.price)} x ${item.qty}</p>
          <div class="subtotal">${formatUGX(item.price * item.qty)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-controls">
            <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">&times;</button>
        </div>
      `;
            // wire qty buttons
            root.querySelectorAll(".qty-btn").forEach(b => {
                b.addEventListener("click", (e) => {
                    const action = e.currentTarget.dataset.action;
                    const id = e.currentTarget.dataset.id;
                    const it = window.cart.find(x => x.id === id);
                    if (!it) return;
                    if (action === "plus") updateQty(id, it.qty + 1);
                    else updateQty(id, it.qty - 1);
                    flash(e.currentTarget);
                });
            });
            // wire remove
            root.querySelector(".cart-item-remove")?.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                removeFromCart(id);
                flash(root, "shaking");
            });

            cartItemsContainer.appendChild(root);
        });

        // update subtotals & totals
        if (cartSubtotalElem) cartSubtotalElem.textContent = formatUGX(subtotal);
        if (deliveryFeeSummaryElem) deliveryFeeSummaryElem.textContent = formatUGX(DELIVERY_FEE);
        const grand = subtotal + (DELIVERY_FEE || 0);
        if (cartTotalElem) cartTotalElem.textContent = formatUGX(grand);
    }

    // very small helper to escape HTML
    function escapeHtml(s) {
        if (!s) return "";
        return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    }

    // === Delivery fee ===
    function readDeliveryFeeFromSelect() {
        const val = deliverySelect?.value;
        DELIVERY_FEE = DELIVERY_AREAS[val] || 0;
        if (deliveryFeeDisplay) deliveryFeeDisplay.textContent = formatUGX(DELIVERY_FEE);
        if (deliveryFeeSummaryElem) deliveryFeeSummaryElem.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    }
    deliverySelect?.addEventListener("change", () => {
        readDeliveryFeeFromSelect();
        flash(deliveryFeeDisplay);
    });

    // init delivery fee (in case default selected)
    readDeliveryFeeFromSelect();

    // === Merchant info UI ===
    function createMerchantCard() {
        // if already exists, return it
        let el = document.getElementById("merchantCard");
        if (el) return el;

        el = document.createElement("div");
        el.id = "merchantCard";
        el.className = "merchant-card";
        el.style = "margin-top:12px;padding:12px;border-radius:10px;background:linear-gradient(180deg,#fff,#fffaf5);box-shadow:0 6px 18px rgba(0,0,0,0.06);";

        el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="flex:1;">
          <strong style="display:block;font-size:0.95rem;color:#333;">Selected Provider:</strong>
          <div id="merchantProvider" style="margin-top:6px;color:#555">None</div>
        </div>
        <div style="text-align:right;">
          <strong style="display:block;font-size:0.95rem;color:#333;">Merchant code</strong>
          <div id="merchantCode" style="margin-top:6px;color:#111;font-weight:700;">—</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button id="copyMerchant" class="btn small">Copy Code</button>
        <button id="showUSSD" class="btn small" style="background:#444;color:#fff;">Show Instructions</button>
      </div>
    `;

        // append to payment section
        paymentSection?.appendChild(el);

        // wire copy button
        el.querySelector("#copyMerchant")?.addEventListener("click", () => {
            const code = document.getElementById("merchantCode")?.textContent || "";
            if (!code || code === "—") { alert("No merchant selected."); return; }
            navigator.clipboard?.writeText(code).then(() => {
                flash(document.getElementById("merchantCode"));
                alert("Merchant code copied to clipboard: " + code);
            }).catch(() => {
                alert("Copy failed. Merchant code: " + code);
            });
        });

        // wire show instructions
        el.querySelector("#showUSSD")?.addEventListener("click", () => {
            const provider = selectedProvider;
            if (!provider) { alert("Please select MTN or Airtel first."); return; }
            const merchant = provider === "mtn" ? MTN_MERCHANT : AIRTEL_MERCHANT;
            // show a friendly modal-like instruction using prompt alert (simple)
            const instr = `To pay using ${provider.toUpperCase()} Mobile Money:\n\n1) Open your Mobile Money app or dial your provider's USSD.\n2) Choose "Send Money" or "Pay Merchant".\n3) Enter Merchant code: ${merchant}\n4) Enter amount and your name as reference.\n\nAfter payment, press OK to send confirmation to Coffee Life on WhatsApp.`;
            alert(instr);
        });

        return el;
    }

    createMerchantCard();

    // update merchant card display
    function setSelectedProvider(provider) {
        selectedProvider = provider;
        const providerText = provider ? provider.toUpperCase() : "None";
        const code = provider === "mtn" ? MTN_MERCHANT : provider === "airtel" ? AIRTEL_MERCHANT : "—";
        document.getElementById("merchantProvider").textContent = providerText;
        document.getElementById("merchantCode").textContent = code;
        // visual highlight
        paymentOptions.forEach(b => {
            if (b.dataset.provider === provider) b.classList.add("selected");
            else b.classList.remove("selected");
        });
        flash(document.getElementById("merchantCard"));
    }

    // wire payment-option buttons
    paymentOptions.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const provider = btn.dataset.provider;
            setSelectedProvider(provider);
            flash(btn);
            // set placeholder for payment number with country code hint
            if (paymentNumberInput) paymentNumberInput.placeholder = "Enter your phone number (e.g. 0772XXXXXX)";
        });
    });

    // === WhatsApp order builder ===
    function buildWhatsAppMessage(customerName, paymentNumber, paymentMethodLabel) {
        // safety: sanitize user input
        const nameSafe = (customerName || "Customer").toString().trim();
        const numberSafe = (paymentNumber || "").toString().trim();

        // Items summary
        const itemsText = (window.cart || []).map((it, i) => {
            return `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`;
        }).join("\n");

        const subtotal = calcSubtotal();
        const grand = subtotal + (DELIVERY_FEE || 0);

        // merchant code if provider selected
        const merchant = selectedProvider === "mtn" ? MTN_MERCHANT : selectedProvider === "airtel" ? AIRTEL_MERCHANT : "";

        let msg = "";
        msg += `✨ Coffee Life Order ✨\n\n`;
        msg += `👤 Customer: ${nameSafe}\n`;
        if (numberSafe) msg += `📱 Phone: ${numberSafe}\n`;
        msg += `📍 Delivery area: ${deliverySelect?.selectedOptions?.[0]?.text || "N/A"}\n`;
        msg += `💳 Payment method: ${paymentMethodLabel}${merchant ? " (Merchant: " + merchant + ")" : ""}\n\n`;
        msg += `🛒 Items:\n${itemsText}\n\n`;
        msg += `🧾 Subtotal: ${formatUGX(subtotal)}\n`;
        msg += `🚚 Delivery: ${formatUGX(DELIVERY_FEE)}\n`;
        msg += `💰 Total: ${formatUGX(grand)}\n\n`;
        msg += `Thank you — Coffee Life ☕️`;

        return msg;
    }

    // confirm & send via WhatsApp
    function sendWhatsApp(paymentMethodLabel) {
        if (!window.cart || window.cart.length === 0) { alert("Please add items to the cart."); return; }
        if (!deliverySelect?.value) { alert("Please select a delivery area."); return; }

        // get payment number optionally
        const payNumber = paymentNumberInput?.value?.trim();
        // Ask for customer name
        const customerName = prompt("Please enter your full name:", "") || "";
        if (!customerName) { alert("Name is required to place the order."); return; }

        // Build message (includes merchant code if provider is selected)
        const message = buildWhatsAppMessage(customerName, payNumber, paymentMethodLabel);

        // Open WhatsApp
        const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");

        // clear cart after sending
        window.cart = [];
        persistCart();
        renderCart();
        updateCartCount();
    }

    // button handlers
    whatsappBtn?.addEventListener("click", (e) => {
        flash(whatsappBtn);
        // if a provider is selected, label will include provider name
        const label = selectedProvider === "mtn" ? "MTN Mobile Money" : selectedProvider === "airtel" ? "Airtel Money" : "Cash";
        sendWhatsApp(label);
    });

    callSupportBtn?.addEventListener("click", () => {
        window.open(`https://wa.me/${WA_PHONE}`, "_blank");
    });

    // also let clicking a provider button trigger direct send-with-merchant if user wants
    // but we will only open the WhatsApp with that payment type after confirming
    paymentOptions.forEach(btn => {
        btn.addEventListener("dblclick", () => {
            const provider = btn.dataset.provider;
            if (!provider) return;
            setSelectedProvider(provider);
            const confirmSend = confirm(`Send order confirmation now using ${provider.toUpperCase()} Mobile Money? (You will be prompted for name)`);
            if (confirmSend) sendWhatsApp(provider === "mtn" ? "MTN Mobile Money" : "Airtel Money");
        });
    });

    // === Small utility: wire static menu "add" buttons if present ===
    function wireMenuAddButtons() {
        document.querySelectorAll(".menu-item .btn-add, .menu-item .add-to-cart-btn").forEach(btn => {
            if (btn.__wired) return; btn.__wired = true;
            btn.addEventListener("click", (e) => {
                const itemEl = e.target.closest(".menu-item");
                if (!itemEl) return;
                const id = itemEl.dataset.id || null;
                const name = itemEl.dataset.name || itemEl.querySelector("h4,h3")?.textContent?.trim() || "Item";
                const price = parseInt(itemEl.dataset.price || itemEl.querySelector(".price")?.textContent?.replace(/\D/g, "") || 0);
                const img = itemEl.querySelector("img")?.getAttribute("src") || "images/logo.jpg";
                const safeId = id || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
                addToCart({ id: safeId, name, price: Number(price), img });
                flash(btn);
            });
        });
    }
    wireMenuAddButtons();

    // === Utilities used by other code ===
    function calcSubtotal() { return (window.cart || []).reduce((s, i) => s + (i.price * i.qty), 0); }

    // expose some methods for debugging / external use
    window.CoffeeLife = {
        addToCart, removeFromCart, updateQty, renderCart, setSelectedProvider
    };

    // === Initialization ===
    renderCart();
    updateCartCount();
    // highlight if any provider preselected
    // (if you want default provider, call setSelectedProvider('mtn') here)
})();
