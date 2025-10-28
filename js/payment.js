(() => {
    'use strict';

    /* ===========================
       CONFIG
    =========================== */
    const WA_NUMBER = '256709691395';
    const MTN_MERCHANT = '971714';
    const AIRTEL_MERCHANT = '4393386';
    const STORAGE_KEY = 'COFFEE_CART';

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

    const overlayCartContainer = qs('#cartItemsOverlay');
    const cartSubtotalOverlay = qs('#cartSubtotalOverlay');
    const deliveryFeeOverlay = qs('#deliveryFeeOverlay');
    const cartTotalOverlay = qs('#cartTotalOverlay');
    const addMoreBtn = qs('#addMoreBtn');

    const paymentOptions = qsa('.payment-option');
    const paymentNumberInput = qs('#paymentNumber');

    const merchantProviderEl = qs('#merchantProvider');
    const merchantCodeEl = qs('#merchantCode');
    const copyMerchantBtn = qs('#copyMerchant');
    const copyIndividualBtns = qsa('.copy-individual');
    const showUSSDBtn = qs('#showUSSD');

    const whatsappFloat = qs('#whatsappFloat');
    const toastEl = qs('#toast');

    const hamburger = qs('#hamburger');
    const navOverlay = qs('#navOverlay');

    /* ===========================
       STATE
    =========================== */
    let DELIVERY_FEE = 0;
    let selectedProvider = null;
    let cart = [];

    /* ===========================
       UTILS
    =========================== */
    const formatUGX = v => (Number(v) || 0).toLocaleString() + ' UGX';
    const persistCart = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    const loadCart = () => { const saved = localStorage.getItem(STORAGE_KEY); cart = saved ? JSON.parse(saved) : []; };

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

    const copyToClipboard = async text => {
        try { await navigator.clipboard.writeText(text); return true; }
        catch {
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
    const calcSubtotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCart = () => {
        [cartItemsContainer, overlayCartContainer].forEach(container => {
            if (!container) return;
            container.innerHTML = '';
            if (!cart.length) {
                container.innerHTML = `<p style="padding:12px;color:#f6eedd;">Your cart is empty.</p>`;
                if (container === overlayCartContainer) addMoreBtn.style.display = 'inline-block';
                return;
            } else if (container === overlayCartContainer) addMoreBtn.style.display = 'none';

            cart.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cart-item added';
                div.innerHTML = `
                    <img src="${item.img || 'images/logo.jpg'}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${formatUGX(item.price)} x ${item.qty}</p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="qty-controls">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty">${item.qty}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
                    </div>
                    <span class="cart-item-total">${formatUGX(item.price * item.qty)}</span>
                `;
                container.appendChild(div);

                // Quantity controls
                div.querySelector('.minus').addEventListener('click', () => {
                    const target = cart.find(i => i.id === item.id);
                    if (!target) return;
                    target.qty -= 1;
                    if (target.qty <= 0) cart = cart.filter(i => i.id !== target.id);
                    persistCart(); renderCart();
                    showToast('Quantity decreased');
                });
                div.querySelector('.plus').addEventListener('click', () => {
                    const target = cart.find(i => i.id === item.id);
                    if (!target) return;
                    target.qty += 1;
                    persistCart(); renderCart();
                    showToast('Quantity increased');
                });
                div.querySelector('.cart-item-remove').addEventListener('click', () => {
                    cart = cart.filter(i => i.id !== item.id);
                    persistCart(); renderCart();
                    showToast('Item removed');
                });
            });
        });

        const subtotal = calcSubtotal();
        cartSubtotalEl.textContent = formatUGX(subtotal);
        cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
        cartSubtotalOverlay.textContent = formatUGX(subtotal);
        deliveryFeeOverlay.textContent = formatUGX(DELIVERY_FEE);
        cartTotalOverlay.textContent = formatUGX(subtotal + DELIVERY_FEE);
    };

    const addToCart = item => {
        if (!item || !item.id) return;
        const exists = cart.find(i => i.id === item.id);
        if (!exists) cart.push({ ...item, qty: 1 });
        persistCart(); renderCart();
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
    const setSelectedProvider = provider => {
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
                `MTN: ${USSD_TEMPLATES
