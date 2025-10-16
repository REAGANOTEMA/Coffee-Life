// ============================
// COFFEE LIFE WhatsApp + AI Chatbot + Footer Integration (Final 2025)
// ============================

// ===== DOM Elements =====
const whatsappFloat = document.querySelector(".whatsapp-float");
const whatsappModal = document.querySelector(".whatsapp-modal");
const whatsappClose = document.querySelector(".close-whatsapp");
const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");
const whatsappBtnFooter = document.querySelector(".btn-whatsapp-send-footer");
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const qrBtn = document.querySelector(".qr-btn");

const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.getElementById("chatUserInput");
const chatSendBtnChat = document.getElementById("chatSendBtn");

const WA_PHONE = "256772514889"; // Coffee Life business number

// ===== Global Cart =====
window.cart = window.cart || [];

// ===== Add to Cart (with +4000 delivery display) =====
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const itemEl = e.target.closest(".menu-item, .menu-card");
        if (!itemEl) return;
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price) || 0;
        const existing = window.cart.find(i => i.name === name);
        if (existing) existing.qty++;
        else window.cart.push({ name, price, qty: 1 });
        updateCartPreview();
        updateQRLink();
    });
});

// ===== Update Cart Preview =====
function updateCartPreview() {
    if (!cartPreview) return;
    cartPreview.innerHTML = "";

    if (window.cart.length === 0) {
        cartPreview.innerHTML = "<p class='empty-msg'>🛒 Your cart is empty.</p>";
        return;
    }

    let subtotal = 0;
    window.cart.forEach(item => {
        subtotal += item.price * item.qty;
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <span class="name">${item.name}</span>
            <div class="controls">
                <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
            </div>
            <span class="price">${item.price * item.qty} UGX</span>
        `;
        cartPreview.appendChild(div);
    });

    const deliveryFee = 4000;
    const total = subtotal + deliveryFee;

    const summary = document.createElement("div");
    summary.classList.add("summary");
    summary.innerHTML = `
        <hr>
        <p>Subtotal: <strong>${subtotal} UGX</strong></p>
        <p>Delivery Fee: <strong>+${deliveryFee} UGX</strong></p>
        <p>Total: <strong>${total} UGX</strong></p>
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
            updateCartPreview();
            updateQRLink();
        });
    });
}

// ===== Generate WhatsApp Message =====
function generateCartMessage(name, location) {
    let message = `✨ Coffee Life Order ✨\n\n`;
    message += `👤 Name: ${name || "[Your Name]"}\n📍 Delivery: ${location || "[Your Location]"}\n\n`;
    message += "🛒 Order Details:\n";

    if (window.cart.length === 0) message += "No items selected.\n";
    else {
        let subtotal = 0;
        window.cart.forEach((item, i) => {
            message += `${i + 1}. ${item.name} x${item.qty} - ${item.price * item.qty} UGX\n`;
            subtotal += item.price * item.qty;
        });
        message += `\n💰 Subtotal: ${subtotal} UGX`;
        message += `\n🚚 Delivery Fee: +4000 UGX`;
        message += `\n📦 Total: ${subtotal + 4000} UGX`;
    }

    message += "\n\n💵 Payment before delivery required.";
    message += "\n☕ Coffee Life — Crafted with Passion, Served with Care.";
    return message;
}

// ===== Send to WhatsApp =====
function sendCartWhatsApp() {
    if (window.cart.length === 0) return alert("Your cart is empty! Please add items first.");
    const name = prompt("Please enter your name:")?.trim();
    if (!name) return alert("Name is required!");
    const location = prompt("Please enter your delivery location:")?.trim();
    if (!location) return alert("Location is required!");
    const message = generateCartMessage(name, location);
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
}

// ===== Floating WhatsApp Modal =====
whatsappFloat?.addEventListener("click", () => {
    whatsappModal?.classList.toggle("active");
    updateCartPreview();
    startChat();
});

whatsappClose?.addEventListener("click", () => whatsappModal?.classList.remove("active"));

// ===== Footer & Floating Send Buttons =====
whatsappSendBtn?.addEventListener("click", sendCartWhatsApp);
whatsappBtnFooter?.addEventListener("click", sendCartWhatsApp);

// ===== QR Link =====
function updateQRLink() {
    if (!qrBtn) return;
    qrBtn.setAttribute("href", "#menu");
}

// ===== Floating Button Pulse =====
setInterval(() => whatsappFloat?.classList.toggle("highlight"), 3000);

// ============================
// AI CHATBOT
// ============================
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
    setTimeout(() => addMessage("Can I have your name, please?"), 1200);
}

function handleChat() {
    const input = chatInput?.value.trim();
    if (!input) return;
    addMessage(input, "user");
    chatInput.value = "";

    setTimeout(() => {
        if (chatStep === 0) {
            userData.name = input;
            addMessage(`Nice to meet you, ${userData.name}! 😊`);
            addMessage("Where should we deliver your order?");
            chatStep++;
        } else if (chatStep === 1) {
            userData.location = input;
            addMessage(`Got it! Delivery to ${userData.location}.`);
            addMessage("💡 Delivery fee: +4000 UGX within Kampala.");
            addMessage("Would you like to *view the menu* or *place your order*?");
            chatStep++;
        } else if (chatStep === 2) {
            if (input.toLowerCase().includes("menu")) {
                addMessage("Opening the menu... 🍰☕");
                setTimeout(() => window.location.href = "#menu", 1000);
            } else {
                addMessage("Preparing your order. Choose a payment option below 👇");
                showPaymentOptions();
            }
        }
    }, 1000);
}

// ===== PAYMENT PLACEHOLDERS (Replace later) =====
function showPaymentOptions() {
    const wrapper = document.createElement("div");
    wrapper.className = "payment-options";
    wrapper.innerHTML = `
        <button class="pay-btn mtn">MTN Mobile Money</button>
        <button class="pay-btn airtel">Airtel Money</button>
        <button class="pay-btn whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp Order</button>
    `;
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    wrapper.querySelector(".mtn").addEventListener("click", () => {
        addMessage("📲 MTN Payment (temporary): Please send to *0772 514 889* and confirm on WhatsApp.");
    });
    wrapper.querySelector(".airtel").addEventListener("click", () => {
        addMessage("📲 Airtel Payment (temporary): Please send to *0702 514 889* and confirm on WhatsApp.");
    });
    wrapper.querySelector(".whatsapp").addEventListener("click", sendCartWhatsApp);
}

chatSendBtnChat?.addEventListener("click", handleChat);
chatInput?.addEventListener("keypress", e => { if (e.key === "Enter") handleChat(); });

// ===== Auto Year in Footer =====
document.getElementById("year")?.textContent = new Date().getFullYear();

// ===== Hero Section Buttons =====
document.getElementById("discoverMenu")?.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
});
document.getElementById("orderWhatsApp")?.addEventListener("click", e => {
    e.preventDefault();
    sendCartWhatsApp();
});

// ===== Hero Title Shimmer Effect =====
const shimmer = document.querySelector(".hero-title-shimmer");
if (shimmer) {
    shimmer.style.background = "linear-gradient(120deg, transparent 0%, rgba(255,215,128,0.8) 50%, transparent 100%)";
    shimmer.style.backgroundSize = "200% auto";
    shimmer.style.color = "transparent";
    shimmer.style.backgroundClip = "text";
    shimmer.style.webkitBackgroundClip = "text";
    shimmer.style.animation = "heroShimmer 6s infinite linear";
}

// ===== Initialize =====
updateCartPreview();
updateQRLink();
