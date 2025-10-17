// ============================
// COFFEE LIFE Menu + WhatsApp + Dynamic Delivery — FINAL 2025
// ============================

const menuData = { /* your menu JSON here */ };

const menuContainer = document.getElementById("menu-container");
const menuButtons = document.querySelectorAll(".menu-btn");
const cartPreview = document.querySelector(".whatsapp-cart-preview");
const deliverySelect = document.getElementById("delivery-zone");
const orderNowBtn = document.getElementById("orderNow");
const footerOrderBtn = document.getElementById("orderWhatsApp");

function formatUGX(amount){ return "UGX " + Number(amount).toLocaleString(); }
function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const HQ_LAT = 0.44;  
const HQ_LNG = 33.2;

function calculateDistance(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}

function getDeliveryCharge(distanceKm){
  return distanceKm<=5?5000:distanceKm<=10?8000:distanceKm<=20?13000:20000;
}

window.cart = window.cart || [];

function addToCart(item,distanceKm=0){
  const deliveryFee = getDeliveryCharge(distanceKm);
  const existing = window.cart.find(i=>i.id===item.id);

  if(existing){
    existing.qty++;
  } else {
    window.cart.push({...item, qty:1, deliveryFee, distanceKm});
  }

  const cartTotal = window.cart.reduce((sum,i)=>sum+(i.price*i.qty + i.deliveryFee*i.qty),0);
  if(cartTotal>50000000){ 
    alert("Cart cannot exceed UGX 50,000,000!"); 
    if(existing) existing.qty--; else window.cart.pop();
    return; 
  }

  updateCartPreview();
  flashAddButton(item.id);
}

function updateCartPreview(){
  if(!cartPreview) return;
  cartPreview.innerHTML="";
  if(window.cart.length===0){ 
    cartPreview.innerHTML="<p class='empty-msg'>🛒 Your cart is empty.</p>"; 
    return; 
  }

  let subtotal=0, totalDelivery=0;
  window.cart.forEach(item=>{
    subtotal += item.price*item.qty;
    totalDelivery += item.deliveryFee*item.qty;

    const div=document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML=`
      <span class="name">${item.name}</span>
      <div class="controls">
        <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
        <span class="qty">${item.qty}</span>
        <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
      </div>
      <span class="price">${formatUGX(item.price*item.qty)}</span>
      <p class="delivery-fee">Delivery: ${formatUGX(item.deliveryFee*item.qty)}</p>
      <span class="cart-item-remove" data-id="${item.id}">&times;</span>
    `;
    cartPreview.appendChild(div);
  });

  const total = subtotal + totalDelivery;
  const summary=document.createElement("div");
  summary.classList.add("cart-total");
  summary.innerHTML=`
    <hr>
    <p>Subtotal: <strong>${formatUGX(subtotal)}</strong></p>
    <p>Total Delivery Fee: <strong>${formatUGX(totalDelivery)}</strong></p>
    <p>Total Amount to Pay: <strong>${formatUGX(total)}</strong></p>
  `;
  cartPreview.appendChild(summary);

  cartPreview.querySelectorAll(".qty-btn").forEach(btn=>{
    btn.addEventListener("click",e=>{
      const action = e.dataset.action;
      const id = e.dataset.id;
      const item = window.cart.find(i=>i.id==id);
      if(!item) return;
      if(action==="plus") item.qty++;
      else{ 
        item.qty--; 
        if(item.qty<=0) window.cart = window.cart.filter(i=>i.id!=id);
      }
      updateCartPreview();
    });
  });

  cartPreview.querySelectorAll(".cart-item-remove").forEach(btn=>{
    btn.addEventListener("click", e=>{
      const id = e.dataset.id;
      window.cart = window.cart.filter(i=>i.id!=id);
      updateCartPreview();
    });
  });
}

function flashAddButton(itemId){
  const btn=document.querySelector(`.menu-item[data-id="${itemId}"] .btn-add`);
  if(!btn) return;
  btn.classList.add("shake","glow");
  setTimeout(()=>btn.classList.remove("shake"),600);
  setTimeout(()=>btn.classList.remove("glow"),1400);
}

function generateCartMessage(name,location){
  let msg=`✨ Coffee Life Order ✨\n\n👤 Name: ${name}\n📍 Delivery: ${location}\n\n🛒 Order Details:\n`;
  if(window.cart.length===0) msg+="No items selected.\n";
  else{
    let subtotal=0,delivery=0;
    window.cart.forEach((item,i)=>{
      msg+=`${i+1}. ${item.name} x${item.qty} - ${formatUGX(item.price*item.qty)}\n`;
      subtotal+=item.price*item.qty;
      delivery+=item.deliveryFee*item.qty;
    });
    msg+=`\n💰 Subtotal: ${formatUGX(subtotal)}`;
    msg+=`\n🚚 Delivery Fee: +${formatUGX(delivery)}`;
    msg+=`\n📦 Total: ${formatUGX(subtotal+delivery)}`;
  }
  msg+="\n\n💵 Payment before delivery required.";
  msg+="\n☕ Coffee Life — Crafted with Passion, Served with Care.";
  return msg;
}

function sendCartWhatsApp(){
  if(window.cart.length===0){ alert("Please add items to your cart before proceeding!"); return; }
  if(deliverySelect && !deliverySelect.value){ alert("Please select your delivery area!"); return; }
  const name=prompt("Enter your name:")?.trim(); if(!name){ alert("Name is required!"); return; }
  const location=deliverySelect?deliverySelect.value:prompt("Enter delivery location:")?.trim(); if(!location){ alert("Delivery location is required!"); return; }
  const msg=generateCartMessage(name,location);
  window.open(`https://wa.me/256772514889?text=${encodeURIComponent(msg)}`,"_blank");
  window.cart=[]; updateCartPreview();
}

function renderMenu(category){
  menuContainer.innerHTML="";
  const items=menuData[category]||[];
  menuContainer.style.display="grid";
  menuContainer.style.gridTemplateColumns="repeat(auto-fit,minmax(250px,1fr))";
  menuContainer.style.gap="16px";

  items.forEach(item=>{
    const card=document.createElement("div");
    card.classList.add("menu-item");
    card.dataset.id=item.id;
    card.innerHTML=`
      <div class="menu-media"><img src="${item.img}" alt="${item.name}"></div>
      <div class="menu-body">
        <h4>${escapeHtml(item.name)}</h4>
        <p class="desc">${escapeHtml(item.description)}</p>
        <p class="price">${formatUGX(item.price)}</p>
        <div class="actions">
          <button class="btn-add">Add to Cart</button>
          <button class="btn-whatsapp"><i class="fab fa-whatsapp"></i> Order via WhatsApp</button>
        </div>
      </div>
    `;
    menuContainer.appendChild(card);

    const btnAdd=card.querySelector(".btn-add");
    const btnWA=card.querySelector(".btn-whatsapp");

    btnAdd.addEventListener("click",()=>{ 
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          const dist=calculateDistance(pos.coords.latitude,pos.coords.longitude,HQ_LAT,HQ_LNG);
          addToCart(item,dist);
        },()=>addToCart(item,0));
      } else addToCart(item,0);
    });

    btnWA.addEventListener("click",()=>sendCartWhatsApp());
  });
}

menuButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    renderMenu(btn.dataset.category);
    menuButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
  });
});

orderNowBtn?.addEventListener("click",sendCartWhatsApp);
footerOrderBtn?.addEventListener("click",sendCartWhatsApp);

renderMenu("food");
updateCartPreview();
