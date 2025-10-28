/* payment.js — Coffee Life (Final Premium Production)
   - Fully professional cart handling
   - MTN & Airtel merchant UI + copy
   - WhatsApp order construction (wa.me/256709691395)
   - Toasts, animations, remove/edit items
   - Persistent localStorage cart
   - Starts empty every session, luxury UX/UI
*/

(() => {
    'use strict';

    /* ===========================
       CONFIG
    =========================== */
    const WA_NUMBER = '256709691395';
    const MTN_MERCHANT = '971714';
    const AIRTEL_MERCHANT = '4393386';
    const STORAGE_KEY = 'coffee_life_cart_v1';

    const USSD_TEMPLATES = {
        mtn: (amount) => `*165*3*${MTN_MERCHANT}*${amount}#`,
        airtel: (amount) => `*185*9*${AIRTEL_MERCHANT}*${amount}#`
    };

    /* ===========================
       DOM SELECTORS
    =========================== */
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const deliverySelect = qs('#delivery-zone');
    const deliveryFeeEl = qs('#deliveryFee');
    const deliveryFeeSummaryEl = qs('#deliveryFeeSummary');

    const cartItemsContainer = qs('#cartItems');
    const cartSubtotalEl = qs('#cartSubtotal');
    const cartTotalEl = qs('#cartTotal');

    const paymentOptions = qsa('.payment-option');
    const paymentNumberInput = qs('#paymentNumber');

    const merchantProviderEl = qs('#merchantProvider');
    const merchantCodeEl = qs('#merchantCode');
    const copyMerchantBtn = qs('#copyMerchant');
    const copyIndividualBtns = qsa('.copy-individual');
    const showUSSDBtn = qs('#showUSSD');

    const whatsappBtn = qs('#whatsapp-confirm');
    const callSupportBtn = qs('#callSupport');

    const toastEl = qs('#toast');

    /* ===========================
       STATE
    =========================== */
    let DELIVERY_FEE = 0;
    let selectedProvider = null;

    // Start with empty cart for every session
    window.cart = [];
    localStorage.removeItem(STORAGE_KEY);

    /* ===========================
       UTILS
    =========================== */
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';

    const persistCart = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cart));
        } catch (e) {
            console.warn('Cart save failed:', e);
        }
    };

    const showToast = (text, duration = 2500) => {
        if (!toastEl) return alert(text);
        toastEl.textContent = text;
        toastEl.style.display = 'block';
        toastEl.classList.add('toast-show');
        setTimeout(() => {
            toastEl.classList.remove('toast-show');
            toastEl.style.display = 'none';
        }, duration);
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return true;
        }
    };

    /* ===========================
       CART FUNCTIONS
    =========================== */
    const calcSubtotal = () => window.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        if (!window.cart.length) {
            cartItemsContainer.innerHTML = `
                <p style="padding:12px;color:#7a6b61;">Your cart is empty.</p>
                <button class="btn small" onclick="window.location.href='index.html#menu'">Add Items</button>
            `;
            cartSubtotalEl.textContent = '0 UGX';
            cartTotalEl.textContent = formatUGX(DELIVERY_FEE);
            deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
            return;
        }

        let subtotal = 0;
        window.cart.forEach(item => {
            subtotal += item.price * item.qty;
            const itemWrap = document.createElement('div');
            itemWrap.className = 'cart-item added';
            itemWrap.innerHTML = `
                <img src="${item.img || 'images/logo.jpg'}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${formatUGX(item.price)} x ${item.qty}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="qty-controls">
                        <button class="qty-btn" data-action="minus" data-id="${item.id}">-</button>
                        <span class="qty">${item.qty}</span>
                        <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                </div>
            `.trim();

            // Quantity buttons
            itemWrap.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const target = window.cart.find(x => x.id === btn.dataset.id);
                    if (!target) return;
                    if (btn.dataset.action === 'plus') target.qty += 1;
                    else target.qty -= 1;
                    if (target.qty <= 0) window.cart = window.cart.filter(i => i.id !== target.id);
                    persistCart();
                    renderCart();
                });
            });

            // Remove button
            itemWrap.querySelector('.cart-item-remove')?.addEventListener('click', () => {
                window.cart = window.cart.filter(i => i.id !== item.id);
                persistCart();
                renderCart();
                showToast('Item removed');
            });

            cartItemsContainer.appendChild(itemWrap);
        });

        cartSubtotalEl.textContent = formatUGX(subtotal);
        deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
    };

    const addToCart = (item) => {
        if (!item || !item.id) return;
        const exists = window.cart.find(x => x.id === item.id);
        if (!exists) window.cart.push({ ...item, qty: 1 });
        persistCart();
        renderCart();
        showToast(`${item.name} added`);
    };

    window.CoffeeLife = { addToCart, renderCart };

    /* ===========================
       DELIVERY HANDLING
    =========================== */
    const parseDeliveryFeeFromSelect = () => {
        if (!deliverySelect) return;
        const text = deliverySelect.selectedOptions?.[0]?.text || '';
        const match = text.match(/([0-9,]+)\s*UGX/);
        DELIVERY_FEE = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
        deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    };

    deliverySelect?.addEventListener('change', parseDeliveryFeeFromSelect);
    parseDeliveryFeeFromSelect();

    /* ===========================
       PAYMENT PROVIDER
    =========================== */
    const setSelectedProvider = (provider) => {
        selectedProvider = provider || null;
        merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        merchantCodeEl.textContent = selectedProvider === 'mtn' ? `MTN: ${MTN_MERCHANT}` :
            selectedProvider === 'airtel' ? `Airtel: ${AIRTEL_MERCHANT}` :
                `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        paymentOptions.forEach(b => b.classList.toggle('selected', b.dataset.provider === provider));
    };

    paymentOptions.forEach(btn => btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider)));

    copyMerchantBtn?.addEventListener('click', async () => {
        if (await copyToClipboard(merchantCodeEl.textContent)) showToast('Merchant code copied');
    });
    copyIndividualBtns.forEach(b => b.addEventListener('click', async () => {
        if (await copyToClipboard(b.dataset.code)) showToast(`${b.dataset.network} code copied`);
    }));
    showUSSDBtn?.addEventListener('click', () => {
        const tmpl = selectedProvider === 'mtn' ? USSD_TEMPLATES.mtn('AMOUNT') :
            selectedProvider === 'airtel' ? USSD_TEMPLATES.airtel('AMOUNT') :
                `MTN: ${USSD_TEMPLATES.mtn('AMOUNT')}\nAirtel: ${USSD_TEMPLATES.airtel('AMOUNT')}`;
        alert(`USSD Instructions:\n${tmpl}\nReplace AMOUNT with payment value`);
    });

    /* ===========================
       WHATSAPP SEND FLOW
    =========================== */
    const buildWhatsAppMessage = (customerName, paymentNumber, paymentMethodLabel) => {
        const itemsText = window.cart.map((it, i) => `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`).join('\n') || '—';
        const subtotal = calcSubtotal();
        const grand = subtotal + DELIVERY_FEE;
        const merchant = selectedProvider === 'mtn' ? MTN_MERCHANT : selectedProvider === 'airtel' ? AIRTEL_MERCHANT : '';
        return `✨ Coffee Life Order ✨\n\n👤 Customer: ${customerName}\n📱 Phone: ${paymentNumber || 'N/A'}\n📍 Delivery area: ${deliverySelect.selectedOptions[0].text}\n💳 Payment: ${paymentMethodLabel}${merchant ? ` (${merchant})` : ''}\n\n🛒 Items:\n${itemsText}\n\n🧾 Subtotal: ${formatUGX(subtotal)}\n🚚 Delivery: ${formatUGX(DELIVERY_FEE)}\n💰 TOTAL: ${formatUGX(grand)}\n\nThank you — Coffee Life ☕️`;
    };

    whatsappBtn?.addEventListener('click', () => {
        if (!window.cart.length) return showToast('Cart is empty');
        const customerName = prompt('Enter your full name for delivery:');
        if (!customerName) return showToast('Name required');
        const paymentNum = paymentNumberInput.value.trim();
        const methodLabel = selectedProvider === 'mtn' ? 'MTN Mobile Money' :
            selectedProvider === 'airtel' ? 'Airtel Money' : 'Cash';
        const msg = buildWhatsAppMessage(customerName, paymentNum, methodLabel);
        window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        window.cart = [];
        persistCart();
        renderCart();
        showToast('WhatsApp opened — we received your order.');
    });

    callSupportBtn?.addEventListener('click', () => {
        window.location.href = `tel:+256${WA_NUMBER}`;
        setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}`, '_blank'), 400);
    });

    /* ===========================
       INIT
    =========================== */
    renderCart();
    setSelectedProvider(null);

})();
