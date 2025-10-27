(() => {
    // ==========================
    // COFFEE LIFE FINAL PAYMENT JS
    // ==========================

    const WA_PHONE = "+256709691395";

    const DELIVERY_AREAS = {
        "jinja-town": 2000, "milo-mbili": 2000, "walukuba-west": 2000,
        "walukuba-east": 3000, "mafubira": 3000, "mpumudde": 3000,
        "bugembe": 3000, "nile": 3000, "makerere": 3000,
        "kira-road": 3000, "masese": 4000, "wakitaka": 4000,
        "namuleesa": 4000
    };

    let DELIVERY_FEE = 0;

    // ----- DOM SELECTORS -----
    const deliverySelect = document.getElementById("delivery-zone");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const whatsappBtn = document.getElementById("whatsapp-confirm");
    const callSupportBtn = document.getElementById("callSupport");
    const cartCountEl = document.getElementById("cart-count");

    // ----- GLOBAL CART -----
    window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");
    const persistCart = () => localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart));
    const formatUGX = v => Number(v).toLocaleString() + " UGX";

    // ----- CART LOGIC -----
    function calcTotal() {
        return (window.cart || []).reduce((sum, it) => sum + it.price * it.qty, 0);
    }

    function updateCartCount() {
        const totalItems = window.cart.reduce((sum, i) => sum + i.qty, 0);
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
            cartCountEl.classList.remove("shake");
            void cartCountEl.offsetWidth;
            cartCountEl.classList.add("shake");
        }
    }

    function addToCart(item) {
        if (!item || !item.id) return;
        const existing = window.cart.find(i => i.id === item.id);
        if (existing) existing.qty++;
        else window.cart.push({ ...item, qty: 1 });
        persistCart(); renderCart(); updateCartCount();
    }
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

    // ----- RENDER CART -----
    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";
        let total = 0;
        if (window.cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty. <a href="index.html#menu">Add items</a>.</p>`;
            cartTotalEl.textContent = `0 UGX`;
            return;
        }
        window.cart.forEach(item => {
            total += item.price * item.qty;
            const div = document.createElement("div");
            div.className = "cart-item flex shaking";
            div.innerHTML = `
                <img src="${item.img || 'images/logo.jpg'}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatUGX(item.price)} x ${item.qty}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                </div>
            `;
            div.querySelectorAll(".qty-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const action = e.currentTarget.dataset.action;
                    const id = e.currentTarget.dataset.id;
                    const it2 = window.cart.find(i => i.id === id);
                    if (!it2) return;
                    if (action === "plus") updateQty(id, it2.qty + 1);
                    else updateQty(id, it2.qty - 1);
                });
            });
            div.querySelector(".cart-item-remove").addEventListener("click", e => removeFromCart(e.currentTarget.dataset.id));
            cartItemsContainer.appendChild(div);
        });
        const grandTotal = total + DELIVERY_FEE;
        cartTotalEl.innerHTML = `${formatUGX(grandTotal)}`;
        document.getElementById("deliveryFee")?.textContent = formatUGX(DELIVERY_FEE);
    }

    // ----- DELIVERY FEE -----
    function updateDeliveryFee() {
        const area = deliverySelect?.value;
        DELIVERY_FEE = DELIVERY_AREAS[area] || 0;
        renderCart(); updateCartCount();
    }
    deliverySelect?.addEventListener("change", updateDeliveryFee);

    // ----- WHATSAPP ORDER -----
    function handleWhatsAppOrder(method = "Cash") {
        if (window.cart.length === 0) { alert("Cart is empty."); return; }
        if (!deliverySelect?.value) { alert("Select delivery area."); return; }
        const name = prompt("Enter your full name:")?.trim();
        if (!name) return alert("Name required.");
        let msg = `✨ *Coffee Life Order* ✨\n\n👤 Customer: ${name}\n📍 Delivery Area: ${deliverySelect.value}\n💰 Payment: ${method}\n\n🛒 Items:\n`;
        msg += window.cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`).join("\n");
        msg += `\n\n🧾 Subtotal: ${formatUGX(calcTotal())}\n🚚 Delivery: ${formatUGX(DELIVERY_FEE)}\n💰 Total: ${formatUGX(calcTotal() + DELIVERY_FEE)}\n\n☕ Coffee Life — Crafted with Passion.`;
        window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
        window.cart = []; persistCart(); renderCart(); updateCartCount();
    }

    whatsappBtn?.addEventListener("click", () => handleWhatsAppOrder("Cash"));
    callSupportBtn?.addEventListener("click", () => window.open(`https://wa.me/${WA_PHONE}`, "_blank"));

    // ----- PAYMENT BUTTONS -----
    document.querySelectorAll(".payment-option").forEach(btn => {
        btn.addEventListener("click", e => {
            const provider = btn.dataset.provider;
            if (provider === "mtn") handleWhatsAppOrder("MTN Mobile Money");
            else if (provider === "airtel") handleWhatsAppOrder("Airtel Money");
        });
    });

    // ----- INITIALIZE -----
    renderCart(); updateCartCount();

})();
