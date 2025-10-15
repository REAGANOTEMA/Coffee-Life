// ============================
// COFFEE LIFE Cart + WhatsApp + AI Chatbot Integration (Final)
// ============================

// ===== DOM Elements =====
const cartBtn = document.querySelector(".cart-btn");
const cartClose = document.querySelector(".cart-close");
const cartContainer = document.querySelector(".cart-container");
const cartItemsContainer = document.querySelector(".cart-items");
const cartOrderBtn = document.querySelector(".cart-order-btn");

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

const WA_PHONE = "256772514889";

// ===== Global Cart =====
window.cart = [];

// ===== Cart Modal Open/Close =====
cartBtn?.addEventListener("click", () => cartContainer?.classList.toggle("active"));
cartClose?.addEventListener("click", () => cartContainer?.classList.remove("active"));

// ===== Add to Cart =====
function addToCart(item) {
    const existing = window.cart.find(i => i.id === item.id);
    if (existing) existing.qty++;
    else window.cart.push({ ...item, qty: 1 });
    renderCart();
    updateCartPreview();
    updateQRLink();
}

// ===== Remove from Cart =====
function removeFromCart(id) {
    window.cart = window.cart.filter(i => i.id !== id);
    renderCart();
    updateCartPreview();
    updateQRLink();
}

// ===== Render Cart Panel =====
function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (window.cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
        document.querySelector(".cart-total")?.textContent = `Total: UGX 0`;
        return;
    }

    window.cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>UGX ${item.price.toLocaleString()} x ${item.qty}</p>
            </div>
            <span class="cart-item-remove">&times;</span>
        `;
        div.querySelector(".cart-item-remove").addEventListener("click", () => removeFromCart(item.id));
        cartItemsContainer.appendChild(div);
    });

    document.querySelector(".cart-total")?.textContent = `Total: UGX ${total.toLocaleString()}`;
}

// ===== Update Floating WhatsApp Cart Preview =====
function updateCartPreview() {
    if (!cartPreview) return;
    cartPreview.innerHTML = "";

    if (window.cart.length === 0) {
        cartPreview.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    window.cart.forEach(item => {
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
            renderCart();
        });
    });
}

// ===== Generate WhatsApp Message =====
function generateCartMessage(name = "[Your Name]", location = "[Your Location]") {
    let message = `✨ Coffee Life Order ✨\n\n`;
    message += `👤 Customer: ${name}\n📍 Delivery: ${location}\n\n`;
    message += "🛒 Order Details:\n";

    if (window.cart.length === 0) message += "No items selected yet.\n";
    else {
        let total = 0;
        window.cart.forEach((item, i) => {
            message += `${i + 1}. ${item.name} x${item.qty} - UGX ${item.price * item.qty}\n`;
            total += item.price * item.qty;
        });
        message += `\n💰 Total: UGX ${total.toLocaleString()}`;
    }

    message += "\n\n💵 Payment before delivery required.\n☕ Coffee Life — Crafted with Passion, Served with Care.";
    return message;
}

// ===== Send Cart via WhatsApp =====
function sendCartWhatsApp() {
    if (window.cart.length === 0) return alert("Your cart is empty! Please add items first.");
    const name = prompt("Please enter your name:")?.trim();
    if (!name) return alert("Name is required!");
    const location = prompt("Please enter your delivery location:")?.trim();
    if (!location) return alert("Location is required!");
    const message = generateCartMessage(name, location);
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
}

// ===== WhatsApp Event Listeners =====
cartOrderBtn?.addEventListener("click", sendCartWhatsApp);
whatsappSendBtn?.addEventListener("click", sendCartWhatsApp);
whatsappBtnFooter?.addEventListener("click", sendCartWhatsApp);

whatsappFloat?.addEventListener("click", () => {
    whatsappModal?.classList.toggle("active");
    renderCart();
    updateCartPreview();
    startChat();
});
whatsappClose?.addEventListener("click", () => whatsappModal?.classList.remove("active"));
setInterval(() => whatsappFloat?.classList.toggle("highlight"), 3000);

// ===== Update QR Link =====
function updateQRLink() {
    if (!qrBtn) return;
    qrBtn.setAttribute("href", "#menu");
}

// ===== AI Chatbot =====
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
    setTimeout(() => addMessage("May I have your name, please?"), 1500);
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
            addMessage(`Nice to meet you, ${userData.name}! 😊`);
            addMessage("Where should we deliver your order?");
            chatStep++;
        } else if (chatStep === 1) {
            userData.location = input;
            addMessage(`Got it! Delivery to ${userData.location}.`);
            addMessage("💡 Note: delivery fee may vary depending on distance.");
            addMessage("Would you like to *view the menu* or *place an order*?");
            chatStep++;
        } else if (chatStep === 2) {
            if (input.toLowerCase().includes("menu")) {
                addMessage("Opening menu... 🍰☕");
                setTimeout(() => window.location.href = "#menu", 1000);
            } else {
                addMessage("Preparing your order. Click below 👇");
                const orderBtn = document.createElement("button");
                orderBtn.className = "btn-whatsapp-send";
                orderBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Send to WhatsApp';
                orderBtn.onclick = sendCartWhatsApp;
                chatMessages.appendChild(orderBtn);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }, 1000);
}

chatSendBtnChat?.addEventListener("click", handleChat);
chatInput?.addEventListener("keypress", e => { if (e.key === "Enter") handleChat(); });

// ===== Auto Year Update =====
document.getElementById("year")?.textContent = new Date().getFullYear();

// ===== Initialize =====
renderCart();
updateCartPreview();
updateQRLink();

// ===== Hero Buttons Integration =====
document.getElementById("discoverMenu")?.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
});

document.getElementById("orderWhatsApp")?.addEventListener("click", e => {
    e.preventDefault();
    sendCartWhatsApp();
});

// ===== Hero title shimmer effect (premium) =====
const shimmer = document.querySelector(".hero-title-shimmer");
if (shimmer) {
    shimmer.innerHTML = shimmer.textContent;
    shimmer.style.background = "linear-gradient(120deg, transparent 0%, rgba(255, 215, 128, 0.7) 50%, transparent 100%)";
    shimmer.style.backgroundSize = "200% auto";
    shimmer.style.color = "transparent";
    shimmer.style.backgroundClip = "text";
    shimmer.style.webkitBackgroundClip = "text";
    shimmer.style.animation = "heroShimmer 6s infinite linear";
}
