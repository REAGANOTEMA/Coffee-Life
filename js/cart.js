(() => {
  // ===== CONFIG =====
  const WA_PHONE = "256772514889";
  const MTN_MERCHANT_CODE = "TEMP_MERCHANT_CODE_MTN";
  const AIRTEL_MERCHANT_CODE = "TEMP_MERCHANT_CODE_AIRTEL";
  let DELIVERY_FEE = 0;

  // ===== DOM SELECTORS =====
  const cartBtn = document.querySelector(".cart-btn");
  const cartClose = document.querySelector(".cart-close");
  const cartContainer = document.querySelector(".cart-container");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotalEl = document.querySelector(".cart-total");
  const cartOrderBtn = document.querySelector(".cart-order-btn");
  const whatsappModal = document.querySelector(".whatsapp-modal");
  const whatsappClose = document.querySelector(".close-whatsapp");
  const whatsappSendBtn = document.querySelector(".btn-whatsapp-send");
  const cartPreview = document.querySelector(".whatsapp-cart-preview");
  const whatsappBtnFooter = document.querySelector(".btn-whatsapp-send-footer");

  // ===== GLOBAL CART =====
  window.cart = JSON.parse(localStorage.getItem("coffee_life_cart") || "[]");
  function persistCart() { localStorage.setItem("coffee_life_cart", JSON.stringify(window.cart)); }
  function formatUGX(v){ return "UGX " + Number(v).toLocaleString(); }
  function calcTotal(){ return window.cart.reduce((s,it)=>s+(it.price*it.qty),0); }

  // ===== CART MODAL =====
  cartBtn?.addEventListener("click",()=>cartContainer?.classList.toggle("active"));
  cartClose?.addEventListener("click",()=>cartContainer?.classList.remove("active"));

  // ===== ADD TO CART =====
  function addToCart(item){
    if(!item||!item.id) return console.warn("addToCart requires item with id");
    const existing = window.cart.find(i=>i.id===item.id);
    if(existing) existing.qty++; else window.cart.push({...item,qty:1});
    persistCart(); renderCart(); updateCartPreview(); flashAddButton(item.id);
  }
  window.cartAdd = addToCart;

  // ===== STATIC ADD BUTTONS =====
  function wireStaticAddButtons(){
    document.querySelectorAll(".menu-item .btn-add, .menu-item .add-to-cart-btn").forEach(btn=>{
      if(btn.__wired) return; btn.__wired=true;
      btn.addEventListener("click",e=>{
        const itemEl = e.target.closest(".menu-item");
        const id = itemEl?.dataset.id || null;
        const name = itemEl?.dataset.name || itemEl?.querySelector("h4,h3")?.textContent?.trim() || "Item";
        const price = parseInt(itemEl?.dataset.price || itemEl?.querySelector(".price")?.textContent?.replace(/\D/g,"") || 0);
        const img = itemEl?.querySelector("img")?.getAttribute("src") || "";
        const safeId = id || name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9\-]/g,"");
        addToCart({id:safeId,name,price:Number(price),img});
      });
    });
  }

  // ===== BUTTON ANIMATIONS =====
  function flashAddButton(itemId){
    const btn=document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`) || document.querySelector(`.add-to-cart-btn[data-id="${itemId}"]`);
    if(!btn) return; btn.classList.add("shake","glow");
    setTimeout(()=>btn.classList.remove("shake"),600);
    setTimeout(()=>btn.classList.remove("glow"),1400);
  }

  // ===== REMOVE / UPDATE QTY =====
  function removeFromCart(id){ window.cart = window.cart.filter(i=>i.id!==id); persistCart(); renderCart(); updateCartPreview(); }
  function updateQty(id,qty){ const it = window.cart.find(i=>i.id===id); if(!it) return; it.qty=qty; if(it.qty<=0) removeFromCart(id); persistCart(); renderCart(); updateCartPreview(); }

  // ===== RENDER CART =====
  function renderCart(){
    if(!cartItemsContainer) return; cartItemsContainer.innerHTML="";
    let total=0;
    if(window.cart.length===0){ cartItemsContainer.innerHTML=`<p class="cart-empty">Your cart is empty.</p>`; cartTotalEl&&(cartTotalEl.textContent=`Total: UGX 0`); return; }
    window.cart.forEach(item=>{
      total += item.price*item.qty;
      const div=document.createElement("div"); div.className="cart-item";
      div.innerHTML=`
        <img src="${item.img||'menu-images/placeholder.jpg'}" alt="${escapeHtml(item.name)}">
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>${formatUGX(item.price*item.qty)} x ${item.qty}</p>
        </div>
        <div class="cart-controls">
          <button class="qty-btn small" data-action="minus" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn small" data-action="plus" data-id="${item.id}">+</button>
          <button class="cart-item-remove" data-id="${item.id}" title="Remove">&times;</button>
        </div>
      `;
      div.querySelectorAll(".qty-btn").forEach(b=>b.addEventListener("click",e=>{
        const action=e.currentTarget.dataset.action,id=e.currentTarget.dataset.id,it2=window.cart.find(i=>i.id===id);
        if(!it2) return; if(action==="plus") updateQty(id,it2.qty+1); else updateQty(id,it2.qty-1);
      }));
      div.querySelector(".cart-item-remove")?.addEventListener("click",e=>removeFromCart(e.currentTarget.dataset.id));
      cartItemsContainer.appendChild(div);
    });
    const grandTotal = total + (DELIVERY_FEE || 0);
    if(cartTotalEl) cartTotalEl.textContent=`Total: ${formatUGX(grandTotal)}`;
  }

  // ===== WHATSAPP CART PREVIEW =====
  function updateCartPreview(){
    if(!cartPreview) return; cartPreview.innerHTML="";
    if(window.cart.length===0){ cartPreview.innerHTML="<p>Your cart is empty.</p>"; return; }
    window.cart.forEach(item=>{
      const div=document.createElement("div"); div.className="item";
      div.innerHTML=`
        <span class="name">${escapeHtml(item.name)}</span>
        <div class="controls">
          <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
        </div>
        <span class="price">${formatUGX(item.price*item.qty)}</span>
      `;
      cartPreview.appendChild(div);
    });
    cartPreview.querySelectorAll(".qty-btn").forEach(btn=>{
      btn.addEventListener("click",e=>{
        const action=e.currentTarget.dataset.action,id=e.currentTarget.dataset.id,it=window.cart.find(x=>x.id===id);
        if(!it) return; if(action==="plus") updateQty(id,it.qty+1); else updateQty(id,it.qty-1);
      });
    });
  }

  // ===== UPDATE DELIVERY FEE FROM LOCATION =====
  window.cartUpdateDistance = function(distanceKm){
    DELIVERY_FEE = Math.ceil(distanceKm * 1000);
    renderCart();
    updateCartPreview();
  }

  // ===== GENERATE WHATSAPP MESSAGE =====
  async function generateCartMessageWithLocation(name,location,paymentMethod){
    let locStr = location;
    try{
      if(navigator.geolocation){
        const pos=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{timeout:5000}));
        locStr+=` (Lat: ${pos.coords.latitude.toFixed(5)}, Lon: ${pos.coords.longitude.toFixed(5)})`;
      }
    }catch(e){}
    let message=`✨ Coffee Life Order ✨\n\n👤 Customer: ${name}\n📍 Delivery: ${locStr}\n\n🛒 Order Details:\n`;
    let total=0; window.cart.forEach((item,i)=>{ message+=`${i+1}. ${item.name} x${item.qty} - ${formatUGX(item.price*item.qty)}\n`; total+=item.price*item.qty; });
    message+=`\n🧾 Subtotal: ${formatUGX(total)}\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}\n\n💰 Grand Total: ${formatUGX(total+DELIVERY_FEE)}\n\n💳 Payment Method: ${paymentMethod}\n\n💵 Payment before delivery required.\n☕ Coffee Life — Crafted with Passion, Served with Care.`;
    return message;
  }

  // ===== SEND CART TO WHATSAPP =====
  async function sendCartWhatsApp(){
    if(window.cart.length===0){ alert("Cart empty"); return; }
    const name = prompt("Enter your name:")?.trim(); if(!name){ alert("Name required"); return; }
    const location = prompt("Enter delivery location:")?.trim(); if(!location){ alert("Location required"); return; }
    const pm = prompt("Payment method? WHATSAPP/MTN/AIRTEL").trim()?.toUpperCase()||"WHATSAPP";
    if(pm==="MTN"||pm==="AIRTEL"){ handleTemporaryMobileMoney(pm,name,location); return; }
    const message = await generateCartMessageWithLocation(name,location,"WhatsApp Order (pay on delivery)");
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`,"_blank");
  }

  // ===== TEMP MOBILE MONEY =====
  function handleTemporaryMobileMoney(provider,name,location){
    const ref=`CL-${provider}-${Date.now().toString().slice(-6)}`;
    const total=calcTotal()+DELIVERY_FEE;
    alert(`TEMP ${provider} PAYMENT\nMerchant Code: ${provider==="MTN"?MTN_MERCHANT_CODE:AIRTEL_MERCHANT_CODE}\nReference: ${ref}\nAmount: ${formatUGX(total)}`);
    generateCartMessageWithLocation(name,location,`${provider} MM - PENDING (ref: ${ref})`).then(msg=>{
      const fullMsg=msg+`\n\n🔖 Payment reference: ${ref}`;
      window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(fullMsg)}`,"_blank");
    });
  }

  // ===== WHATSAPP EVENT LISTENERS =====
  cartOrderBtn?.addEventListener("click",sendCartWhatsApp);
  whatsappSendBtn?.addEventListener("click",sendCartWhatsApp);
  whatsappBtnFooter?.addEventListener("click",sendCartWhatsApp);
  whatsappModal && whatsappClose?.addEventListener("click",()=>whatsappModal.classList.remove("active"));

  // ===== INIT =====
  renderCart(); updateCartPreview(); wireStaticAddButtons();
  const observer=new MutationObserver(()=>wireStaticAddButtons());
  observer.observe(document.body,{childList:true,subtree:true});

  window.__coffeeLife={
    getCart:()=>window.cart,
    clearCart:()=>{window.cart=[]; persistCart(); renderCart(); updateCartPreview();},
    addToCart, removeFromCart, updateQty,
    DELIVERY_FEE, MTN_MERCHANT_CODE, AIRTEL_MERCHANT_CODE
  };

})();
