// ============================ 
// COFFEE LIFE WhatsApp + AI Chatbot
// ============================

// Elements
const whatsappFloat = document.querySelector(".whatsapp-float");
const whatsappModal = document.querySelector(".whatsapp-modal");
const whatsappClose = document.querySelector(".close-whatsapp");
const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const qrBtn = document.querySelector(".qr-btn");

// WhatsApp number
const WA_PHONE = "256772514889";

// ============================
// Modal Toggle
// ============================
whatsappFloat?.addEventListener("click", () => {
    whatsappModal.classList.toggle("active");
    updateCartPreview();
    startChat();
});
whatsappClose?.addEventListener("click", () => whatsappModal.classList.remove("active"));

// ============================
// Cart System
// ============================
let cart = [];

document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const itemEl = e.target.closest(".menu-item");
        if (!itemEl) return;
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price);
        const existing = cart.find(i => i.name === name);
        if (existing) existing.qty += 1;
        else cart.push({ name, price, qty: 1 });
        updateCartPreview();
        updateQRLink();
    });
});

// ============================
// Update Cart Preview
// ============================
function updateCartPreview() {
    if (!cartPreview) return;
    cartPreview.innerHTML = "";
    if (cart.length === 0) {
        cartPreview.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach(item => {
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

    // Quantity buttons
    cartPreview.querySelectorAll(".qty-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            const action = e.target.dataset.action;
            const name = e.target.dataset.name;
            const item = cart.find(i => i.name === name);
            if (action === "plus") item.qty++;
            else if (action === "minus") {
                item.qty--;
                if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
            }
            updateCartPreview();
            updateQRLink();
        });
    });
}

// ============================
// Generate WhatsApp Message
// ============================
function generateMessage(name, location) {
    let msg = `Hello Coffee Life ☕! I’m ${name || "[Your Name]"}.\nI'd like to place an order:\n\n`;
    let total = 0;

    cart.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} x${item.qty} - ${item.price * item.qty} UGX\n`;
        total += item.price * item.qty;
    });

    msg += `\nTotal: ${total} UGX\n📍 Location: ${location || "[Enter your location]"}\n`;
    msg += "💬 Note: Delivery fee may vary depending on your location.";
    return msg;
}

// ============================
// Send Order via WhatsApp
// ============================
whatsappSendBtn?.addEventListener("click", () => {
    if (cart.length === 0) return alert("Please add some items to your order before sending.");

    const name = prompt("Please enter your name:");
    if (!name) return alert("Name is required!");

    const location = prompt("Please enter your delivery location:");
    if (!location) return alert("Location is required for delivery!");

    const message = encodeURIComponent(generateMessage(name, location));
    window.open(`https://wa.me/${WA_PHONE}?text=${message}`, "_blank");
});

// ============================
// QR Link Update
// ============================
function updateQRLink() {
    if (!qrBtn) return;
    const message = encodeURIComponent(generateMessage());
    qrBtn.href = `https://wa.me/${WA_PHONE}?text=${message}`;
}

// ============================
// Floating Animation
// ============================
setInterval(() => {
    whatsappFloat.classList.toggle("highlight");
}, 3000);

// ============================
// AI Chatbot
// ============================
const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.getElementById("chatUserInput");
const chatSendBtnChat = document.getElementById("chatSendBtn");

let chatStep = 0;
let userData = { name: "", location: "" };

// Append message
function addMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Start chat
function startChat() {
    if (!chatMessages) return;
    chatMessages.innerHTML = "";
    chatStep = 0;
    userData = { name: "", location: "" };
    addMessage("👋 Hello! Welcome to Coffee Life ☕");
    setTimeout(() => addMessage("May I have your name, please?"), 1500);
}

// Handle user replies
chatSendBtnChat?.addEventListener("click", handleChat);
chatInput?.addEventListener("keypress", e => { if (e.key === "Enter") handleChat(); });

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
                addMessage("Great! Opening our delicious menu... 🍰☕");
                setTimeout(() => window.location.href = "#menu", 1000);
            } else {
                addMessage("Perfect! Let's prepare your order. Click below 👇");
                const orderBtn = document.createElement("button");
                orderBtn.className = "btn-whatsapp-send";
                orderBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Send to WhatsApp';
                orderBtn.onclick = () => {
                    const message = encodeURIComponent(
                        `Hello Coffee Life! I'm ${userData.name}.\nLocation: ${userData.location}\nI'd like to place an order.`
                    );
                    window.open(`https://wa.me/${WA_PHONE}?text=${message}`, "_blank");
                };
                chatMessages.appendChild(orderBtn);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }, 1000);
}

// ============================
// Initialize
// ============================
updateCartPreview();
updateQRLink();
