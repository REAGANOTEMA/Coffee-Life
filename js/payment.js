/* payment.js — Coffee Life (final production)
   - Cart (localStorage)
   - Delivery fee parsing
   - MTN & Airtel merchant UI + copy
   - WhatsApp order construction (wa.me/256709691395)
   - Toasts, QR modal, animations
*/

(() => {
    'use strict';

    /* ===========================
       CONFIG
    =========================== */
    const WA_NUMBER = '256709691395'; // no plus for wa.me
    const MTN_MERCHANT = '971714';
    const AIRTEL_MERCHANT = '4393386';

    // Optional USSD instruction templates — used in the Instructions modal
    const USSD_TEMPLATES = {
        mtn: (amount) => `*165*3*${MTN_MERCHANT}*${amount}#`,
        airtel: (amount) => `*185*9*${AIRTEL_MERCHANT}*${amount}#`
    };

    const STORAGE_KEY = 'coffee_life_cart_v1';

    /* ===========================
       DOM SELECTORS (cached)
    =========================== */
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const deliverySelect = qs('#delivery-zone');
    const deliveryFeeEl = qs('#deliveryFee');
    const deliveryFeeSummaryEl = qs('#deliveryFeeSummary');

    const cartItemsContainer = qs('#cartItems');
    const cartSubtotalEl = qs('#cartSubtotal');
    const cartTotalEl = qs('#cartTotal');
    const cartCountEl = qs('#cart-count');

    const paymentOptions = qsa('.payment-option');
    const paymentSection = qs('#payment-section');
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
    let selectedProvider = null; // 'mtn' | 'airtel' | null

    // cart is an array of { id, name, price (number), qty (number), img }
    window.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    /* ===========================
       UTILS
    =========================== */
    const formatUGX = v => {
        const num = Number(v || 0);
        if (Number.isNaN(num)) return '0 UGX';
        return num.toLocaleString() + ' UGX';
    };

    const persistCart = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(window.cart));
        } catch (e) {
            console.warn('Failed to persist cart:', e);
        }
    };

    const flash = (el, cls = 'shaking', ms = 600) => {
        if (!el) return;
        el.classList.add(cls);
        setTimeout(() => el.classList.remove(cls), ms);
    };

    const showToast = (text, opts = {}) => {
        if (!toastEl) {
            // fallback to alert if no toast area
            if (opts.fallbackAlert !== false) alert(text);
            return;
        }
        toastEl.textContent = text;
        toastEl.style.display = 'block';
        toastEl.classList.add('toast-show');

        // optional color / timed hide
        setTimeout(() => {
            toastEl.classList.remove('toast-show');
            toastEl.style.display = 'none';
        }, opts.duration || 2500);
    };

    const copyToClipboard = async (text) => {
        if (!text) return false;
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // fallback: create temporary textarea
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    /* ===========================
       CART FUNCTIONS
    =========================== */
    function calcSubtotal() {
        return (window.cart || []).reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0);
    }

    function updateCartCountBadge() {
        if (!cartCountEl) return;
        const totalItems = (window.cart || []).reduce((s, i) => s + i.qty, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.remove('bounce');
        // trigger reflow to restart animation
        void cartCountEl.offsetWidth;
        cartCountEl.classList.add('bounce');
    }

    function addToCart(item) {
        if (!item || !item.id) {
            console.warn('addToCart requires item with id');
            return;
        }
        const existing = window.cart.find(x => x.id === item.id);
        if (existing) existing.qty += 1;
        else window.cart.push({ ...item, qty: 1 });
        persistCart();
        renderCart();
        updateCartCountBadge();
        showToast(`${item.name} added to cart`);
    }
    window.cartAdd = addToCart;

    function removeFromCart(id) {
        window.cart = window.cart.filter(i => i.id !== id);
        persistCart();
        renderCart();
        updateCartCountBadge();
        showToast('Item removed');
    }

    function updateQty(id, qty) {
        const it = window.cart.find(x => x.id === id);
        if (!it) return;
        it.qty = qty;
        if (it.qty <= 0) removeFromCart(id);
        else {
            persistCart();
            renderCart();
            updateCartCountBadge();
        }
    }

    /* ===========================
       RENDER CART
    =========================== */
    function renderCart() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        if (!window.cart || window.cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="cart-empty" style="padding:12px;color:#7a6b61;">Your cart is empty. <a href="index.html#menu">Add items</a>.</p>`;
            if (cartSubtotalEl) cartSubtotalEl.textContent = `0 UGX`;
            if (cartTotalEl) cartTotalEl.textContent = `0 UGX`;
            if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
            return;
        }

        let subtotal = 0;
        window.cart.forEach(item => {
            subtotal += Number(item.price) * Number(item.qty);
            const itemWrap = document.createElement('div');
            itemWrap.className = 'cart-item added';
            itemWrap.innerHTML = `
        <img src="${item.img || 'images/logo.jpg'}" alt="${escapeHtml(item.name)}" class="cart-item-img">
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>${formatUGX(item.price)} x ${item.qty}</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-controls">
            <button class="qty-btn" data-action="minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">&times;</button>
        </div>
      `.trim();

            // wire events
            itemWrap.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', (ev) => {
                    const action = btn.dataset.action;
                    const id = btn.dataset.id;
                    const target = window.cart.find(x => x.id === id);
                    if (!target) return;
                    if (action === 'plus') updateQty(id, target.qty + 1);
                    else updateQty(id, target.qty - 1);
                    flash(btn);
                });
            });

            itemWrap.querySelector('.cart-item-remove')?.addEventListener('click', (ev) => {
                const id = ev.currentTarget.dataset.id;
                removeFromCart(id);
            });

            cartItemsContainer.appendChild(itemWrap);
            // remove the "added" class after animation
            setTimeout(() => itemWrap.classList.remove('added'), 450);
        });

        if (cartSubtotalEl) cartSubtotalEl.textContent = formatUGX(subtotal);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        if (cartTotalEl) cartTotalEl.textContent = formatUGX(subtotal + DELIVERY_FEE);
    }

    /* ===========================
       DELIVERY HANDLING
    =========================== */
    function parseDeliveryFeeFromSelect() {
        if (!deliverySelect) return;
        const val = deliverySelect.value || '';
        // The HTML options use keys like "jinja-town", but show "— X,XXX UGX"
        // We have a mapping in JS for stable values in earlier code; attempt to extract numeric
        const text = deliverySelect.selectedOptions?.[0]?.text || '';
        const match = text.match(/([0-9,]+)\s*UGX/);
        if (match) {
            DELIVERY_FEE = parseInt(match[1].replace(/,/g, ''), 10) || 0;
        } else {
            // fallback: 0
            DELIVERY_FEE = 0;
        }
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatUGX(DELIVERY_FEE);
        if (deliveryFeeSummaryEl) deliveryFeeSummaryEl.textContent = formatUGX(DELIVERY_FEE);
        renderCart();
    }

    if (deliverySelect) {
        deliverySelect.addEventListener('change', () => {
            parseDeliveryFeeFromSelect();
            flash(deliveryFeeEl);
        });
        // init
        parseDeliveryFeeFromSelect();
    }

    /* ===========================
       MERCHANT / PROVIDER SELECTION
    =========================== */
    function setSelectedProvider(provider) {
        selectedProvider = provider || null;
        // UI: update merchant provider & code
        if (merchantProviderEl) merchantProviderEl.textContent = selectedProvider ? selectedProvider.toUpperCase() : 'None';
        if (merchantCodeEl) {
            if (selectedProvider === 'mtn') merchantCodeEl.textContent = `MTN: ${MTN_MERCHANT}`;
            else if (selectedProvider === 'airtel') merchantCodeEl.textContent = `Airtel: ${AIRTEL_MERCHANT}`;
            else merchantCodeEl.textContent = `MTN: ${MTN_MERCHANT} • Airtel: ${AIRTEL_MERCHANT}`;
        }

        // toggle selected class on payment option buttons
        paymentOptions.forEach(b => {
            if (b.dataset.provider === provider) b.classList.add('selected');
            else b.classList.remove('selected');
        });

        flash(merchantCodeEl);
    }

    // wire provider buttons
    paymentOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.dataset.provider;
            setSelectedProvider(p);
            // set placeholder hint
            if (paymentNumberInput) paymentNumberInput.placeholder = 'Enter your payment number (e.g. 0772XXXXXX)';
        });
        // also keyboard accessible
        btn.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                btn.click();
            }
        });
    });

    // copy main merchant code
    if (copyMerchantBtn) {
        copyMerchantBtn.addEventListener('click', async () => {
            const codeText = merchantCodeEl?.textContent?.trim();
            if (!codeText) { showToast('No merchant code to copy'); flash(copyMerchantBtn); return; }
            const ok = await copyToClipboard(codeText);
            if (ok) {
                showToast('Merchant code copied');
                merchantCodeEl?.classList.add('copied');
                setTimeout(() => merchantCodeEl?.classList.remove('copied'), 800);
            } else {
                showToast('Copy failed — please long-press to copy (mobile)');
            }
        });
    }

    // copy individual network codes
    copyIndividualBtns.forEach(b => {
        b.addEventListener('click', async () => {
            const code = b.dataset.code;
            const network = b.dataset.network || '';
            if (!code) return;
            const ok = await copyToClipboard(code);
            if (ok) {
                showToast(`${network} code copied: ${code}`);
                flash(b, 'shaking', 420);
            } else {
                showToast('Copy failed — try manually');
            }
        });
    });

    // Show USSD / instructions modal (simple alert fallback)
    if (showUSSDBtn) {
        showUSSDBtn.addEventListener('click', () => {
            const provider = selectedProvider;
            if (!provider) {
                // Show both options
                const both = `MTN: ${USSD_TEMPLATES.mtn('AMOUNT')}\nAirtel: ${USSD_TEMPLATES.airtel('AMOUNT')}\n\nReplace AMOUNT with the numeric amount you wish to pay.`;
                alert(`Payment USSD Instructions:\n\n${both}`);
                return;
            }
            const tmpl = provider === 'mtn' ? USSD_TEMPLATES.mtn('AMOUNT') : USSD_TEMPLATES.airtel('AMOUNT');
            alert(`To pay via ${provider.toUpperCase()} Mobile Money:\n\nDial: ${tmpl}\n\nReplace AMOUNT with the value you wish to pay.`);
        });
    }

    /* ===========================
       WHATSAPP SEND FLOW
    =========================== */
    function buildWhatsAppMessage(customerName, paymentNumber, paymentMethodLabel) {
        const name = (customerName || 'Customer').trim();
        const number = (paymentNumber || '').trim();

        const itemsText = (window.cart || []).map((it, i) => {
            return `${i + 1}. ${it.name} x${it.qty} = ${formatUGX(it.price * it.qty)}`;
        }).join('\n') || '—';

        const subtotal = calcSubtotal();
        const grand = subtotal + (DELIVERY_FEE || 0);

        const merchant = selectedProvider === 'mtn' ? MTN_MERCHANT : selectedProvider === 'airtel' ? AIRTEL_MERCHANT : '';

        let msg = '';
        msg += `✨ Coffee Life Order ✨\n\n`;
        msg += `👤 Customer: ${name}\n`;
        if (number) msg += `📱 Phone: ${number}\n`;
        msg += `📍 Delivery area: ${deliverySelect?.selectedOptions?.[0]?.text || 'N/A'}\n`;
        msg += `💳 Payment: ${paymentMethodLabel}${merchant ? ` (${merchant})` : ''}\n\n`;
        msg += `🛒 Items:\n${itemsText}\n\n`;
        msg += `🧾 Subtotal: ${formatUGX(subtotal)}\n`;
        msg += `🚚 Delivery: ${formatUGX(DELIVERY_FEE)}\n`;
        msg += `💰 TOTAL: ${formatUGX(grand)}\n\n`;
        msg += `Thank you — Coffee Life ☕️`;

        return msg;
    }

    // wrapper to calculate subtotal (exposed)
    function calcSubtotal() {
        return (window.cart || []).reduce((s, i) => s + (Number(i.price) * Number(i.qty)), 0);
    }

    async function sendWhatsAppFromUI(paymentMethodLabel) {
        if (!window.cart || window.cart.length === 0) {
            flash(cartItemsContainer || document.body);
            showToast('Your cart is empty. Add items first.');
            return;
        }
        if (!deliverySelect?.value) {
            flash(deliverySelect || document.body);
            showToast('Please select a delivery area.');
            return;
        }

        // prompt for customer name
        const customerName = prompt('Please enter your full name (for delivery):', '') || '';
        if (!customerName) { showToast('Name required'); flash(paymentNumberInput || document.body); return; }

        const paymentNum = paymentNumberInput?.value?.trim() || '';

        // Build message
        const message = buildWhatsAppMessage(customerName, paymentNum, paymentMethodLabel);

        // Open wa.me link
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        // Clear cart after sending
        window.cart = [];
        persistCart();
        renderCart();
        updateCartCountBadge();
        showToast('WhatsApp opened — we will receive your order.');
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            flash(whatsappBtn);
            const label = selectedProvider === 'mtn' ? 'MTN Mobile Money' : selectedProvider === 'airtel' ? 'Airtel Money' : 'Cash';
            sendWhatsAppFromUI(label);
        });
    }

    if (callSupportBtn) {
        callSupportBtn.addEventListener('click', () => {
            // Try opening telephony link (mobile). If desktop, open WhatsApp chat instead.
            const tel = 'tel:+256709691395';
            // On mobile, this will open dialer
            window.location.href = tel;
            // Also provide a fallback WA link in case the device can't dial
            setTimeout(() => {
                window.open(`https://wa.me/${WA_NUMBER}`, '_blank');
            }, 400);
        });
    }

    /* ===========================
       QR Modal (simple) — optional
    =========================== */
    // We'll create a small modal for QR (if needed). It will be created lazily.
    function createQRModal() {
        if (qs('#qrModal')) return qs('#qrModal');
        const modal = document.createElement('div');
        modal.id = 'qrModal';
        modal.style = `
      position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:2000;
      background:rgba(0,0,0,0.45);padding:20px;
    `;
        modal.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:18px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
        <button id="qrClose" style="float:right;background:transparent;border:none;font-size:18px;cursor:pointer;">&times;</button>
        <h3 style="margin:0 0 8px">Payment QR</h3>
        <p style="margin:0 0 12px;color:#444;">Scan the QR code with your mobile money app to pay (example).</p>
        <div id="qrImage" style="width:100%;height:260px;background:linear-gradient(180deg,#f7f5f2,#fff);display:flex;align-items:center;justify-content:center;border-radius:8px;">
          <!-- In a real product you would generate and insert a real QR image here -->
          <span style="color:#b89a66;">(QR placeholder)</span>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        modal.querySelector('#qrClose')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        return modal;
    }

    // optional method to show QR — developer can call window.CoffeeLife.showQR()
    function showQR() {
        const modal = createQRModal();
        // Set content if needed; currently placeholder
        modal.style.display = 'flex';
    }

    /* ===========================
       INITIALIZE & WIRING OUTSIDE BUTTONS
    =========================== */
    // Wire static "Add to cart" buttons if present in DOM
    function wireMenuAddButtons() {
        document.querySelectorAll('.menu-item .btn-add, .menu-item .add-to-cart-btn').forEach(btn => {
            if (btn.__wired) return;
            btn.__wired = true;
            btn.addEventListener('click', (e) => {
                const itemEl = e.target.closest('.menu-item');
                if (!itemEl) return;
                const id = itemEl.dataset.id || null;
                const name = itemEl.dataset.name || itemEl.querySelector('h4,h3')?.textContent?.trim() || 'Item';
                const price = parseInt(itemEl.dataset.price || itemEl.querySelector('.price')?.textContent?.replace(/\D/g, '') || 0, 10);
                const img = itemEl.querySelector('img')?.getAttribute('src') || 'images/logo.jpg';
                const safeId = id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
                addToCart({ id: safeId, name, price: Number(price), img });
                flash(btn, 'shaking', 420);
            });
        });
    }
    wireMenuAddButtons();

    // copy network buttons may be dynamically created, re-wire via event delegation
    document.addEventListener('click', (ev) => {
        const t = ev.target;
        if (t && t.matches && t.matches('.copy-individual')) {
            const code = t.dataset.code;
            const network = t.dataset.network || '';
            if (!code) return;
            copyToClipboard(code).then(ok => {
                if (ok) {
                    showToast(`${network} code copied: ${code}`);
                    flash(t);
                } else showToast('Copy failed');
            });
        }
    });

    // Keyboard accessibility: Enter on copy buttons
    qsa('.copy-individual, #copyMerchant, #showUSSD, #whatsapp-confirm, #callSupport').forEach(el => {
        el.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') el.click();
        });
    });

    /* ===========================
       EXPORT API
    =========================== */
    window.CoffeeLife = {
        addToCart,
        removeFromCart,
        updateQty,
        renderCart,
        setSelectedProvider,
        showQR,
        getCart: () => window.cart.slice()
    };

    /* ===========================
       BOOT
    =========================== */
    // initial render
    renderCart();
    updateCartCountBadge();
    // ensure merchant card shows both codes at start
    setSelectedProvider(null);

    // Swinging animation: set data-swing attribute on whatsapp float to toggle CSS class
    const waFloat = qs('#waFloat');
    if (waFloat && waFloat.dataset.swing !== undefined) {
        // Add periodic swing using CSS class toggle
        const SWING_CLASS = 'swinging';
        waFloat.classList.add('swing-enabled');
        // Class toggling to allow CSS to define animation on .swinging
        let swingOn = false;
        setInterval(() => {
            if (!waFloat) return;
            swingOn = !swingOn;
            waFloat.classList.toggle(SWING_CLASS, swingOn);
        }, 2200);
    }

    // small safety: if shipping select changed externally call parseDeliveryFeeFromSelect
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            try {
                window.cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                renderCart();
                updateCartCountBadge();
            } catch (err) { /* ignore */ }
        }
    });

    // small helper to escape HTML in names
    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/[&<>"']/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    // done
    // console.log('CoffeeLife payment.js initialized');
})();
