// ===== payment.js =====
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ===== ELEMENTS =====
    const backMenuBtn = document.getElementById("backMenuBtn");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartSubtotalEl = document.getElementById("cartSubtotal");
    const deliveryFeeEl = document.getElementById("deliveryFeeSummary");
    const cartTotalEl = document.getElementById("cartTotal");
    const deliverySelect = document.getElementById("delivery-zone");
    const locationGroupSelect = document.getElementById("location-group");
    const whatsappBtn = document.getElementById("whatsapp-confirm");
    const signInBtn = document.getElementById("signinBtn");
    const signInModal = document.getElementById("signInModal");
    const closeSignIn = document.getElementById("closeSignIn");
    const saveProfile = document.getElementById("saveProfile");
    const selectedPaymentInput = document.getElementById("selectedPayment");
    const callSupportBtn = document.getElementById("callSupport");
    const yearEl = document.getElementById("year");

    let cart = [];
    let deliveryFee = 0;

    // ===== LOCATION CONTACTS =====
    const LOCATION_CONTACTS = {
        "jinja-highway": ["+256752746763", "+256749958799", "+256751054138", "+256701234567", "+256702345678"],
        "jinja-lakeview": ["+256750038032", "+256703456789", "+256704567890", "+256705678901", "+256706789012"],
        "kampala-kansanga": ["+256783070102", "+256707890123", "+256708901234", "+256709012345", "+256709123456"]
    };
    const SUPPORT_NUMBER = "+256709691395";

    // ===== UTILITY FUNCTIONS =====
    const formatCurrency = (amount) => `${amount.toLocaleString()} UGX`;

    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const total = subtotal + deliveryFee;
        return { subtotal, total };
    };

    const updateTotalsDisplay = () => {
        const { subtotal, total } = calculateTotals();
        cartSubtotalEl.textContent = formatCurrency(subtotal);
        deliveryFeeEl.textContent = formatCurrency(deliveryFee);
        cartTotalEl.textContent = formatCurrency(total);
    };

    const persistCart = () => localStorage.setItem("coffee_life_cart", JSON.stringify(cart));

    // ===== CART FUNCTIONS =====
    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="small">Your cart is empty. Go back to the menu to add items.</p>`;
        } else {
            cart.forEach(item => {
                const div = document.createElement("div");
                div.className = "cart-item";
                div.innerHTML = `
                    <span>${item.name} x ${item.qty}</span>
                    <span>${formatCurrency(item.price * item.qty)}</span>
                    <button class="remove-btn" data-name="${item.name}" aria-label="Remove ${item.name}">&times;</button>
                `;
                cartItemsContainer.appendChild(div);
            });

            cartItemsContainer.querySelectorAll(".remove-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const name = e.target.dataset.name;
                    cart = cart.filter(ci => ci.name !== name);
                    persistCart();
                    renderCart();
                });
            });
        }
        updateTotalsDisplay();
        updateWhatsAppState();
    };

    const addToCart = (item) => {
        const existing = cart.find(ci => ci.name === item.name);
        if (existing) existing.qty += 1;
        else cart.push({ ...item, qty: 1 });
        persistCart();
        renderCart();
    };

    // ===== DELIVERY FEE =====
    const updateDeliveryFee = () => {
        const selected = deliverySelect?.selectedOptions[0];
        deliveryFee = selected ? parseInt(selected.dataset.fee || 0, 10) : 0;
        updateTotalsDisplay();
    };

    deliverySelect?.addEventListener("change", updateDeliveryFee);

    // ===== BACK TO MENU BUTTON EFFECT =====
    backMenuBtn?.addEventListener("mouseover", () => {
        backMenuBtn.classList.add("shake");
        setTimeout(() => backMenuBtn.classList.remove("shake"), 800);
    });

    // ===== PAYMENT OPTION TOGGLE =====
    document.querySelectorAll(".payment-option").forEach(option => {
        option.addEventListener("click", () => {
            document.querySelectorAll(".payment-option").forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");
            selectedPaymentInput.value = option.dataset.provider;
        });
    });

    // ===== WHATSAPP ORDER =====
    const generateOrderMessage = (customerName, area, paymentMethod) => {
        const { subtotal, total } = calculateTotals();
        let msg = `✨ *Coffee Life Order* ✨\n\n👤 Name: ${customerName}\n📍 Area: ${area}\n💰 Payment Method: ${paymentMethod}\n\n🛒 Order Details:\n`;
        cart.forEach((item, i) => msg += `${i + 1}. ${item.name} x${item.qty} - ${formatCurrency(item.price * item.qty)}\n`);
        msg += `\n💰 Subtotal: ${formatCurrency(subtotal)}\n🚚 Delivery Fee: ${formatCurrency(deliveryFee)}\n📦 Total: ${formatCurrency(total)}\n\n☕ Coffee Life — Crafted with Passion`;
        return msg;
    };

    const handleWhatsAppOrder = () => {
        if (!cart.length) return alert("🛒 Your cart is empty!");
        if (!deliverySelect.value) return alert("📍 Please select a delivery location.");
        if (!selectedPaymentInput.value) return alert("💳 Please select a payment method.");

        const contacts = LOCATION_CONTACTS[deliverySelect.value] || [];
        if (!contacts.length) return alert("❌ No WhatsApp contacts for this location.");

        const customerName = prompt("Enter your full name:")?.trim();
        if (!customerName) return alert("⚠ Name is required.");

        const area = deliverySelect.value;
        const waNumber = contacts[Math.floor(Math.random() * contacts.length)];
        const message = generateOrderMessage(customerName, area, selectedPaymentInput.value.toUpperCase());

        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, "_blank");

        // Clear cart after sending
        cart = [];
        persistCart();
        renderCart();
    };

    whatsappBtn?.addEventListener("click", handleWhatsAppOrder);

    // ===== CALL SUPPORT =====
    callSupportBtn?.addEventListener("click", () => {
        window.location.href = `tel:${SUPPORT_NUMBER}`;
    });

    // ===== SIGN-IN MODAL =====
    const toggleSignInModal = (show) => {
        signInModal.style.display = show ? "block" : "none";
        signInModal.setAttribute("aria-hidden", !show);
    };

    signInBtn?.addEventListener("click", () => toggleSignInModal(true));
    closeSignIn?.addEventListener("click", () => toggleSignInModal(false));

    saveProfile?.addEventListener("click", () => {
        const name = document.getElementById("fullname")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();
        if (!name) return alert("Please enter your name.");
        localStorage.setItem("cl_user_name", name);
        localStorage.setItem("cl_user_phone", phone);
        toggleSignInModal(false);
        alert("Profile saved!");
    });

    // ===== AUTO UPDATE YEAR =====
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ===== INIT =====
    cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");
    renderCart();
});
(() => {
    const WA_PHONE = "+2567096991395";

    // ----- GET BUTTONS -----
    const whatsappBtn = document.getElementById("whatsapp-confirm");
    const callBtn = document.getElementById("callSupport");

    // ----- HELPER -----
    const formatUGX = v => Number(v).toLocaleString() + " UGX";
    const calcTotal = () => (window.cart || []).reduce((s, it) => s + (it.price * it.qty), 0);
    const DELIVERY_FEE = 0; // optional default if you want static here

    // ----- ORDER MESSAGE -----
    function buildWhatsAppMessage(paymentMethod = "Cash") {
        const cart = window.cart || [];
        if (!cart.length) return null;

        const name = prompt("Enter your full name:")?.trim();
        if (!name) { alert("Name required"); return null; }

        let message = `✨ *Coffee Life Order* ✨\n\n👤 Customer: ${name}\n💰 Payment: ${paymentMethod}\n\n🛒 Order Details:\n`;
        cart.forEach((it, i) => {
            message += `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}\n`;
        });
        message += `\n🧾 Subtotal: ${formatUGX(calcTotal())}`;
        message += `\n💰 Grand Total: ${formatUGX(calcTotal() + DELIVERY_FEE)}`;
        message += `\n\n☕ Coffee Life — Crafted with Passion, Served with Care.`;
        return message;
    }

    // ----- EVENT LISTENERS -----
    whatsappBtn?.addEventListener("click", () => {
        const message = buildWhatsAppMessage();
        if (message) window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
    });

    callBtn?.addEventListener("click", () => {
        // Open WhatsApp chat
        window.open(`https://wa.me/${WA_PHONE}`, "_blank");
        // Or uncomment the next line to make it a direct call
        // window.location.href = `tel:${WA_PHONE}`;
    });
})();
