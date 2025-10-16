// ============================
// COFFEE LIFE WhatsApp + AI Chatbot + Footer Integration (Final 2025)
// ============================

// ===== DOM Elements =====
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.getElementById("chatUserInput");
const chatSendBtnChat = document.getElementById("chatSendBtn");
const WA_PHONE = "256772514889"; // Coffee Life WhatsApp

// ===== Global Cart =====
window.cart = window.cart || [];

// ===== Location-based delivery =====
function getDeliveryCharge(distanceKm) {
    if(distanceKm <= 5) return 5000;
    if(distanceKm <= 10) return 8000;
    if(distanceKm <= 20) return 13000;
    return 20000;
}

// ===== Distance calculation =====
function calcDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ===== Add to Cart =====
document.querySelectorAll(".btn-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const itemEl = e.target.closest(".menu-item, .menu-card");
        if(!itemEl) return;
        const name = itemEl.dataset.name;
        const price = parseInt(itemEl.dataset.price) || 0;

        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(pos => {
                const userLat = pos.coords.latitude;
                const userLng = pos.coords.longitude;
                const shopLat = -1.2921;
                const shopLng = 36.8219;
                const distanceKm = calcDistanceKm(userLat,userLng,shopLat,shopLng);
                const deliveryFee = getDeliveryCharge(distanceKm);
                addToCart(name, price, deliveryFee, distanceKm);
            }, ()=> addToCart(name, price, 5000, 0));
        } else addToCart(name, price, 5000, 0);
    });
});

function addToCart(name, price, deliveryFee, distanceKm){
    const existing = window.cart.find(i=>i.name===name);
    const totalPrice = price + deliveryFee;
    const cartTotal = window.cart.reduce((sum,i)=>sum+i.price*(i.qty||1),0)+totalPrice;
    if(cartTotal>50000000) return alert("Cart cannot exceed UGX 50,000,000!");
    if(existing) existing.qty++;
    else window.cart.push({ name, price: totalPrice, qty:1, deliveryFee, distanceKm });
    updateCartPreview();
}

// ===== Update Cart Preview =====
function updateCartPreview(){
    if(!cartPreview) return;
    cartPreview.innerHTML = "";
    if(window.cart.length===0){
        cartPreview.innerHTML="<p class='empty-msg'>🛒 Your cart is empty.</p>";
        return;
    }

    let subtotal=0, totalDelivery=0;
    window.cart.forEach(item=>{
        subtotal += item.price*item.qty - item.deliveryFee*item.qty;
        totalDelivery += item.deliveryFee*item.qty;

        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <span class="name">${item.name}</span>
            <div class="controls">
                <button class="qty-btn" data-action="minus" data-name="${item.name}">-</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn" data-action="plus" data-name="${item.name}">+</button>
            </div>
            <span class="price">${item.price*item.qty} UGX</span>
            <p class="delivery-fee">Delivery: ${item.deliveryFee*item.qty} UGX</p>
        `;
        cartPreview.appendChild(div);
    });

    const total = subtotal+totalDelivery;
    const summary = document.createElement("div");
    summary.classList.add("summary");
    summary.innerHTML = `
        <hr>
        <p>Subtotal: <strong>${subtotal} UGX</strong></p>
        <p>Total Delivery Fee: <strong>${totalDelivery} UGX</strong></p>
        <p><strong>Total Amount to Pay: ${total} UGX</strong></p>
    `;
    cartPreview.appendChild(summary);

    cartPreview.querySelectorAll(".qty-btn").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const action = e.target.dataset.action;
            const name = e.target.dataset.name;
            const item = window.cart.find(i=>i.name===name);
            if(!item) return;
            if(action==="plus") item.qty++;
            else { item.qty--; if(item.qty<=0) window.cart=window.cart.filter(i=>i.name!==name); }
            updateCartPreview();
        });
    });
}

// ===== Generate WhatsApp Message =====
function generateCartMessage(name, location){
    let message = `✨ Coffee Life Order ✨\n\n👤 Name: ${name || "[Your Name]"}\n📍 Delivery: ${location || "[Your Location]"}\n\n🛒 Order Details:\n`;
    if(window.cart.length===0) message += "No items selected.\n";
    else{
        let subtotal=0, delivery=0;
        window.cart.forEach((item,i)=>{
            message += `${i+1}. ${item.name} x${item.qty} - ${item.price*item.qty} UGX\n`;
            subtotal += item.price*item.qty - item.deliveryFee*item.qty;
            delivery += item.deliveryFee*item.qty;
        });
        message += `\n💰 Subtotal: ${subtotal} UGX`;
        message += `\n🚚 Delivery Fee: +${delivery} UGX`;
        message += `\n📦 Total Amount to Pay: ${subtotal+delivery} UGX`;
    }
    message += "\n\n💵 Payment before delivery required.";
    message += "\n☕ Coffee Life — Crafted with Passion, Served with Care.";
    return message;
}

// ===== Send WhatsApp =====
function sendCartWhatsApp(){
    if(window.cart.length===0) return alert("Please add items to your cart before proceeding!");
    const name = prompt("Enter your name:")?.trim();
    if(!name) return alert("Name is required!");
    const location = prompt("Enter your delivery location:")?.trim();
    if(!location) return alert("Location is required!");
    const message = generateCartMessage(name, location);
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`,"_blank");
}

// ===== AI Chatbot =====
let chatStep=0; let userData={ name:"", location:"" };
function addMessage(text,sender="bot"){
    if(!chatMessages) return;
    const msg=document.createElement("div");
    msg.className=`msg ${sender}`;
    msg.textContent=text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop=chatMessages.scrollHeight;
}
function startChat(){
    if(!chatMessages) return;
    chatMessages.innerHTML="";
    chatStep=0;
    userData={ name:"", location:"" };
    addMessage("👋 Hello! Welcome to Coffee Life ☕");
    setTimeout(()=>addMessage("Can I have your name, please?"),1200);
}
function handleChat(){
    const input = chatInput?.value.trim();
    if(!input) return;
    addMessage(input,"user"); chatInput.value="";
    setTimeout(()=>{
        if(chatStep===0){ userData.name=input; addMessage(`Nice to meet you, ${userData.name}! 😊`); addMessage("Where should we deliver your order?"); chatStep++; }
        else if(chatStep===1){ userData.location=input; addMessage(`Got it! Delivery to ${userData.location}.`); addMessage("💡 Delivery fee depends on your location."); addMessage("Would you like to *view the menu* or *place your order*?"); chatStep++; }
        else if(chatStep===2){
            if(input.toLowerCase().includes("menu")){ addMessage("Opening the menu... 🍰☕"); setTimeout(()=>window.location.href="#menu",1000);}
            else{ addMessage("Preparing your order. Choose a payment option below 👇"); showPaymentOptions(); }
        }
    },1000);
}
function showPaymentOptions(){
    const wrapper=document.createElement("div");
    wrapper.className="payment-options";
    wrapper.innerHTML=`
        <button class="pay-btn mtn">MTN Mobile Money</button>
        <button class="pay-btn airtel">Airtel Money</button>
        <button class="pay-btn whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp Order</button>
    `;
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop=chatMessages.scrollHeight;
    wrapper.querySelector(".mtn").addEventListener("click",()=>addMessage("📲 MTN Payment: send to *0772 514 889* and confirm on WhatsApp."));
    wrapper.querySelector(".airtel").addEventListener("click",()=>addMessage("📲 Airtel Payment: send to *0702 514 889* and confirm on WhatsApp."));
    wrapper.querySelector(".whatsapp").addEventListener("click",sendCartWhatsApp);
}
chatSendBtnChat?.addEventListener("click", handleChat);
chatInput?.addEventListener("keypress", e=>{ if(e.key==="Enter") handleChat(); });

// ===== Hero & Footer WhatsApp Buttons =====
document.getElementById("discoverMenu")?.addEventListener("click", e=>{ e.preventDefault(); document.querySelector("#menu")?.scrollIntoView({behavior:"smooth"}); });
document.getElementById("orderWhatsApp")?.addEventListener("click", e=>{ e.preventDefault(); sendCartWhatsApp(); });

// ===== Footer Year =====
document.getElementById("year")?.textContent = new Date().getFullYear();

// ===== Initialize =====
updateCartPreview();
startChat();
