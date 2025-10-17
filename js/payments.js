// ----- ORDER HANDLER (WHATSAPP + MOBILE MONEY) -----
function handleOrderButton(paymentMethod = "Cash") {
  if (window.cart.length === 0) { alert("Please add items to your cart before proceeding."); return; }
  if (!deliverySelect?.value) { alert("Please select a delivery area."); return; }

  const name = prompt("Enter your full name:")?.trim();
  if (!name) { alert("Name required"); return; }
  const area = deliverySelect.value;

  let message = `✨ *Coffee Life Order* ✨\n\n👤 Customer: ${name}\n📍 Delivery Area: ${area}\n💰 Payment: ${paymentMethod}\n\n🛒 Order Details:\n`;
  message += window.cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`).join("\n");
  message += `\n\n🧾 Subtotal: ${formatUGX(calcTotal())}\n🚚 Delivery Fee: ${formatUGX(DELIVERY_FEE)}\n💰 Grand Total: ${formatUGX(calcTotal() + DELIVERY_FEE)}`;

  if (paymentMethod === "Airtel Money") {
    message += `\n\n📲 Airtel Payment Instructions:\n`;
    message += `1. Go to your Airtel Money menu.\n`;
    message += `2. Choose 'Pay Bill' and enter merchant code *971714* or *4393386*.\n`;
    message += `3. Enter amount: ${formatUGX(calcTotal() + DELIVERY_FEE)}\n`;
    message += `4. Confirm payment.\n`;
  } else if (paymentMethod === "MTN Mobile Money") {
    message += `\n\n📲 MTN Payment Instructions:\n`;
    message += `1. Go to your MTN Mobile Money menu.\n`;
    message += `2. Choose 'Pay Bill' or 'Send Money' as applicable.\n`;
    message += `3. Enter amount: ${formatUGX(calcTotal() + DELIVERY_FEE)}\n`;
    message += `4. Confirm payment.\n`;
  }

  message += `\n\n☕ Coffee Life — Crafted with Passion, Served with Care.`;

  window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`, "_blank");

  window.cart = []; persistCart(); renderCart();
}

// ----- PAYMENT BUTTONS -----
function addPaymentButtons() {
  paymentContainer.innerHTML = '';
  ["mtn", "airtel"].forEach(type => {
    const btn = document.createElement("button");
    btn.className = `payment-btn ${type}`;
    btn.textContent = type === "mtn" ? "Pay with MTN" : "Pay with Airtel";
    btn.addEventListener("click", () => handleOrderButton(type === "mtn" ? "MTN Mobile Money" : "Airtel Money"));
    paymentContainer.appendChild(btn);
  });
  const note = document.createElement("div");
  note.className = "payment-temp-note";
  note.textContent = "Select your preferred payment method above";
  paymentContainer.appendChild(note);
}
