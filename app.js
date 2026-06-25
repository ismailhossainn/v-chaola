/* ============================================================
   ভ্রাম্যমাণ চা ওয়ালা — Vrammoman Cha Wala
   Interactive Prototype Logic
============================================================ */

// ----- 1. STATE -----
const state = {
    currentScreen: 'splash',
    selectedProduct: null,
    productQty: 1,
    productAddons: [],
    cart: [],            // each: {id, name, nameEn, img, base, qty, addons:[{name,price}], unitPrice}
    address: 'House 24, Block C, Mirpur 10, Dhaka',
    paymentMethod: 'cod',
    orderId: null,
    grandTotal: 0,
    deliveryFee: 15,
    serviceCharge: 5
};

// ----- 2. PRODUCT CATALOG -----
const PRODUCTS = [
    { id: 'p1', name: 'রং চা',      nameEn: 'Raw Tea',      price: 15, cat: 'tea',    img: 'images/image2.png', tag: 'Popular',
      desc: 'Authentic local roadside tea with strong flavor — a perfect everyday pick-me-up brewed the traditional Bangladeshi way.' },
    { id: 'p2', name: 'দুধ চা',     nameEn: 'Milk Tea',     price: 25, cat: 'tea',    img: 'images/image3.png', tag: 'Hot',
      desc: 'Creamy milk tea brewed with full-cream milk, sugar, and the finest Assam leaves. The classic taste of Bangla street corners.' },
    { id: 'p3', name: 'মসলা চা',    nameEn: 'Masala Tea',   price: 35, cat: 'tea',    img: 'images/image4.png', tag: 'Bestseller',
      desc: 'A warming blend of cardamom, ginger, cinnamon, and cloves brewed with milk and tea — the perfect cup for cold evenings.' },
    { id: 'p4', name: 'কফি',        nameEn: 'Coffee',       price: 40, cat: 'coffee', img: 'images/image5.png', tag: 'New',
      desc: 'Fresh ground coffee made the local way — strong, aromatic, and surprisingly affordable.' },
    { id: 'p5', name: 'সিঙ্গারা',    nameEn: 'Singara',      price: 10, cat: 'snack',  img: 'images/image8.png', tag: '',
      desc: 'Crispy triangular pastries stuffed with spiced potato and peas — Bangladesh\'s favorite tea-time snack.' },
    { id: 'p6', name: 'সমুচা',      nameEn: 'Samucha',      price: 12, cat: 'snack',  img: 'images/image9.png', tag: '',
      desc: 'Golden-fried savory pastries filled with minced meat or vegetables, served piping hot.' },
    { id: 'p7', name: 'বিস্কুট',     nameEn: 'Biscuit',      price: 8,  cat: 'snack',  img: 'images/image10.png', tag: '',
      desc: 'Classic salty-sweet local biscuits, perfect for dipping in your hot chai.' },
    { id: 'p8', name: 'রসগোল্লা',    nameEn: 'Rosogolla',    price: 20, cat: 'dessert',img: 'images/image11.png', tag: 'Sweet',
      desc: 'Soft spongy cottage-cheese balls soaked in fragrant sugar syrup — a Bengali classic.' }
];

const ADDON_PRESETS = [
    { name: 'Extra Milk',   nameBn: 'অতিরিক্ত দুধ',   price: 5 },
    { name: 'Less Sugar',   nameBn: 'কম চিনি',       price: 0 },
    { name: 'Extra Spices', nameBn: 'অতিরিক্ত মসলা', price: 8 },
    { name: 'Ginger Boost', nameBn: 'আদা',          price: 3 },
    { name: 'Lemon',        nameBn: 'লেবু',          price: 2 }
];

// ----- 3. DOM HELPERS -----
const $  = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

function go(screenName) {
    if (screenName === state.currentScreen) return;
    const current = $(`.screen.active`);
    const next = $(`.screen[data-screen="${screenName}"]`);
    if (!next) return;

    current?.classList.remove('active');
    current?.classList.add('exit-left');

    // Force reflow & activate
    requestAnimationFrame(() => {
        next.scrollTop = 0;
        next.classList.add('active');
    });

    // Cleanup exit class after animation
    setTimeout(() => current?.classList.remove('exit-left'), 500);

    state.currentScreen = screenName;

    // Per-screen hooks
    if (screenName === 'cart')     renderCart();
    if (screenName === 'payment')  renderPaymentTotals();
    if (screenName === 'tracking') startTracking();
    if (screenName === 'success')  renderSuccess();
}

function toast(msg, ms=2200) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

function fmt(n) { return Math.round(n).toLocaleString('en-BD'); }

function bumpCartBadge() {
    const b = $('#cartBadge');
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
}

function updateCartBadge() {
    const total = state.cart.reduce((s,i) => s + i.qty, 0);
    const b = $('#cartBadge');
    b.textContent = total;
    b.style.display = total > 0 ? 'grid' : 'none';
}

/* ==========================================================
   SCREEN 1 — SPLASH (auto advance)
========================================================== */
window.addEventListener('load', () => {
    setTimeout(() => go('login'), 2500);
});

/* ==========================================================
   SCREEN 2 — LOGIN / SIGNUP
========================================================== */
$$('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isSignup = tab.dataset.tab === 'signup';
        $$('[data-tab-only="signup"]').forEach(el => el.style.display = isSignup ? 'flex' : 'none');
        $('.btn-label').textContent = isSignup ? 'Sign Up / সাইন আপ' : 'Login / লগইন';
    });
});

$('#loginBtn').addEventListener('click', () => {
    const btn = $('#loginBtn');
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'Logging in...';
    setTimeout(() => {
        btn.disabled = false;
        btn.querySelector('.btn-label').textContent = 'Login / লগইন';
        go('home');
    }, 700);
});

/* ==========================================================
   SCREEN 3 — HOME
========================================================== */
let currentCat = 'all';

function renderProducts() {
    const grid = $('#productGrid');
    const items = currentCat === 'all'
        ? PRODUCTS
        : PRODUCTS.filter(p => p.cat === currentCat);

    grid.innerHTML = items.map((p, i) => `
        <div class="product-card" data-id="${p.id}" style="animation-delay:${i*0.05}s">
            ${p.tag ? `<span class="pc-tag">${p.tag}</span>` : ''}
            <img src="${p.img}" alt="${p.nameEn}" />
            <div class="pc-info">
                <p class="pc-name">${p.name}</p>
                <p class="pc-name-en">${p.nameEn}</p>
                <div class="pc-bottom">
                    <p class="pc-price"><span class="taka">৳</span>${p.price}</p>
                    <div class="qty-mini" data-id="${p.id}">
                        <button class="add">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Card click → details
    grid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.qty-mini')) return;
            openProduct(card.dataset.id);
        });
    });

    // Quick-add buttons
    grid.querySelectorAll('.qty-mini .add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.parentElement.dataset.id;
            const product = PRODUCTS.find(p => p.id === id);
            // Quick add: 1 unit, no addons
            state.cart.push({
                id: product.id,
                name: product.name,
                nameEn: product.nameEn,
                img: product.img,
                base: product.price,
                qty: 1,
                addons: [],
                unitPrice: product.price,
                cartKey: Date.now() + Math.random()
            });
            updateCartBadge();
            bumpCartBadge();
            toast(`✓ ${product.name} added to cart`);
        });
    });
}

// Category filter
$$('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        $$('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCat = pill.dataset.cat;
        renderProducts();
    });
});

// Location selector (just a toast for demo)
$('#locSelector').addEventListener('click', () => {
    const locations = ['Mirpur 10, Dhaka', 'Dhanmondi 27, Dhaka', 'Gulshan 2, Dhaka', 'Banani 11, Dhaka', 'Uttara Sector 7'];
    const cur = $('#locName').firstChild.textContent.trim();
    const idx = locations.findIndex(l => l.startsWith(cur.split(',')[0]));
    const next = locations[(idx+1) % locations.length];
    $('#locName').innerHTML = `${next} <span class="caret">▾</span>`;
    toast(`📍 Location changed to ${next}`);
});

// Cart icon
$('#cartBtn').addEventListener('click', () => go('cart'));

// Init
renderProducts();

/* ==========================================================
   SCREEN 4 — PRODUCT DETAILS
========================================================== */
function openProduct(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    state.selectedProduct = product;
    state.productQty = 1;
    state.productAddons = [];

    $('#prodImg').src = product.img;
    $('#prodName').textContent = product.name;
    $('#prodEn').textContent = product.nameEn;
    $('#prodPrice').textContent = product.price;
    $('#prodDesc').textContent = product.desc;
    $('#prodQty').textContent = 1;

    // Reset checkboxes
    $$('#customList input').forEach(cb => cb.checked = false);
    updateAddTotal();

    go('product');
}

function updateAddTotal() {
    const addonSum = $$('#customList input:checked')
        .reduce((s, cb) => s + Number(cb.dataset.price), 0);
    const unit = (state.selectedProduct?.price || 0) + addonSum;
    const total = unit * state.productQty;
    $('#addTotal').textContent = fmt(total);
}

$$('#customList input').forEach(cb => cb.addEventListener('change', updateAddTotal));

$('#prodMinus').addEventListener('click', () => {
    if (state.productQty > 1) {
        state.productQty--;
        $('#prodQty').textContent = state.productQty;
        updateAddTotal();
    }
});
$('#prodPlus').addEventListener('click', () => {
    if (state.productQty < 10) {
        state.productQty++;
        $('#prodQty').textContent = state.productQty;
        updateAddTotal();
    }
});

$('#addToCartBtn').addEventListener('click', () => {
    const p = state.selectedProduct;
    const addons = $$('#customList input:checked').map(cb => {
        const row = cb.closest('.custom-row');
        return {
            name: row.querySelector('.c-info b').textContent,
            price: Number(cb.dataset.price)
        };
    });
    const addonSum = addons.reduce((s, a) => s + a.price, 0);
    const unitPrice = p.price + addonSum;

    state.cart.push({
        id: p.id,
        name: p.name,
        nameEn: p.nameEn,
        img: p.img,
        base: p.price,
        qty: state.productQty,
        addons,
        unitPrice,
        cartKey: Date.now() + Math.random()
    });

    updateCartBadge();
    bumpCartBadge();
    toast(`✓ ${state.productQty} × ${p.name} added`);
    setTimeout(() => go('home'), 350);
});

/* ==========================================================
   SCREEN 5 — CART
========================================================== */
function calcTotals() {
    const subtotal = state.cart.reduce((s,i) => s + i.unitPrice * i.qty, 0);
    const grand = subtotal + (subtotal > 0 ? state.deliveryFee + state.serviceCharge : 0);
    return { subtotal, grand };
}

function renderCart() {
    const empty = $('#cartEmpty');
    const content = $('#cartContent');

    if (state.cart.length === 0) {
        empty.classList.add('show');
        content.classList.remove('show');
        return;
    }
    empty.classList.remove('show');
    content.classList.add('show');

    const list = $('#cartList');
    list.innerHTML = state.cart.map(item => `
        <div class="cart-item" data-key="${item.cartKey}">
            <img src="${item.img}" alt="" />
            <div class="ci-info">
                <p class="ci-name">${item.name} · ${item.nameEn}</p>
                ${item.addons.length ? `<p class="ci-addons">+ ${item.addons.map(a => a.name).join(', ')}</p>` : ''}
                <p class="ci-price">৳ ${fmt(item.unitPrice * item.qty)}</p>
            </div>
            <div class="ci-controls">
                <button class="ci-remove" data-action="remove" data-key="${item.cartKey}">✕</button>
                <div class="qty-mini">
                    <button data-action="dec" data-key="${item.cartKey}">−</button>
                    <span class="q">${item.qty}</span>
                    <button class="add" data-action="inc" data-key="${item.cartKey}">+</button>
                </div>
            </div>
        </div>
    `).join('');

    list.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const item = state.cart.find(i => i.cartKey == key);
            if (!item) return;
            if (btn.dataset.action === 'inc') item.qty++;
            else if (btn.dataset.action === 'dec') { if (item.qty > 1) item.qty--; }
            else if (btn.dataset.action === 'remove') {
                state.cart = state.cart.filter(i => i.cartKey != key);
                toast(`Removed ${item.name}`);
            }
            updateCartBadge();
            renderCart();
        });
    });

    const { subtotal, grand } = calcTotals();
    $('#subtotal').textContent = fmt(subtotal);
    $('#deliveryFee').textContent = fmt(state.deliveryFee);
    $('#service').textContent = fmt(state.serviceCharge);
    $('#grandTotal').textContent = fmt(grand);
}

$('#clearCart').addEventListener('click', () => {
    if (state.cart.length === 0) return;
    state.cart = [];
    updateCartBadge();
    renderCart();
    toast('Cart cleared');
});

$$('.addr-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        $$('.addr-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
    });
});

$('#addrInput').addEventListener('input', e => state.address = e.target.value);

$('#proceedPay').addEventListener('click', () => {
    if (state.cart.length === 0) {
        toast('Cart is empty!');
        return;
    }
    if (!state.address.trim()) {
        toast('Please enter delivery address');
        return;
    }
    go('payment');
});

/* ==========================================================
   SCREEN 6 — PAYMENT
========================================================== */
function renderPaymentTotals() {
    const { grand } = calcTotals();
    state.grandTotal = grand;
    $('#payTotal').textContent = fmt(grand);
}

$$('.pay-method').forEach(pm => {
    pm.addEventListener('click', () => {
        state.paymentMethod = pm.dataset.method;
        $$('.pay-method input').forEach(i => i.checked = false);
        pm.querySelector('input').checked = true;
    });
});

$('#confirmPay').addEventListener('click', () => {
    const loading = $('#payLoading');
    loading.classList.add('show');

    const steps = $$('.proc-steps .ps');
    let idx = 0;
    steps.forEach(s => s.classList.remove('active'));
    steps[0].classList.add('active');

    const stepTimer = setInterval(() => {
        idx++;
        if (idx >= steps.length) {
            clearInterval(stepTimer);
            return;
        }
        steps[idx-1].classList.remove('active');
        steps[idx].classList.add('active');
    }, 700);

    setTimeout(() => {
        loading.classList.remove('show');
        clearInterval(stepTimer);
        // Generate order ID
        state.orderId = String(Math.floor(Math.random() * 900000) + 100000);
        go('tracking');
    }, 2400);
});

/* ==========================================================
   SCREEN 7 — LIVE TRACKING
========================================================== */
let trackTimers = [];
function clearTracking() {
    trackTimers.forEach(t => clearTimeout(t));
    trackTimers.forEach(t => clearInterval(t));
    trackTimers = [];
}

function startTracking() {
    clearTracking();

    // Set order id & items summary
    $('#orderId').textContent = state.orderId || '000000';
    const summary = state.cart.map(i => `${i.qty}× ${i.name}`).join(' · ');
    $('#orderItems').textContent = summary || '—';

    // Animated rider movement: start at (15%, 90%) -> end at (80%, 23%)
    const rider = $('#riderPin');
    const distEl = $('#distMeters');
    const etaEl = $('#etaMin');
    const fill = $('#progressFill');

    // Reset
    rider.style.top = '90%';
    rider.style.left = '15%';
    fill.style.width = '50%';

    // Path waypoints (percentages)
    const path = [
        { left: 15, top: 90, dist: 450, eta: 5 },
        { left: 30, top: 75, dist: 380, eta: 4 },
        { left: 45, top: 60, dist: 280, eta: 3 },
        { left: 58, top: 45, dist: 180, eta: 2 },
        { left: 70, top: 32, dist: 80,  eta: 1 },
        { left: 80, top: 23, dist: 0,   eta: 0 }
    ];

    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step >= path.length) {
            clearInterval(interval);
            // Mark home as reached
            $('#msHome').classList.add('done');
            $('#msRider').classList.remove('current');
            $('#msRider').classList.add('done');
            distEl.textContent = '0';
            etaEl.textContent = '0';
            // Auto navigate to success after a short pause
            const t = setTimeout(() => go('success'), 1600);
            trackTimers.push(t);
            return;
        }
        const p = path[step];
        rider.style.top  = p.top + '%';
        rider.style.left = p.left + '%';
        distEl.textContent = p.dist;
        etaEl.textContent  = p.eta;
        // Update progress fill (steps 1..5 → 50% .. 100%)
        const pct = 50 + (step / (path.length - 1)) * 50;
        fill.style.width = pct + '%';
    }, 1500);
    trackTimers.push(interval);
}

/* ==========================================================
   SCREEN 8 — SUCCESS
========================================================== */
const PAY_LABEL = {
    bkash:  'bKash',
    nagad:  'Nagad',
    rocket: 'Rocket',
    cod:    'Cash on Delivery'
};

function renderSuccess() {
    $('#successOrderId').textContent = state.orderId || '000000';
    $('#successTotal').textContent = fmt(state.grandTotal);
    $('#paidVia').textContent = PAY_LABEL[state.paymentMethod] || 'Cash on Delivery';

    const body = $('#receiptBody');
    body.innerHTML = state.cart.map(i =>
        `<div class="r-line"><span>${i.qty}× ${i.name}</span><span>৳ ${fmt(i.unitPrice * i.qty)}</span></div>`
    ).join('')
    + `<div class="r-line"><span>Delivery Fee</span><span>৳ ${fmt(state.deliveryFee)}</span></div>`
    + `<div class="r-line"><span>Service</span><span>৳ ${fmt(state.serviceCharge)}</span></div>`;

    // Reset star rating display
    $$('#rateStars span').forEach(s => s.classList.remove('lit'));
}

// Star rating
$$('#rateStars span').forEach(star => {
    star.addEventListener('click', () => {
        const r = Number(star.dataset.r);
        $$('#rateStars span').forEach((s, i) => {
            s.classList.toggle('lit', i < r);
        });
        toast(`⭐ Thanks for rating ${r}/5!`);
    });
});

// Reset & order more
function resetApp() {
    state.cart = [];
    state.selectedProduct = null;
    state.productQty = 1;
    state.orderId = null;
    state.grandTotal = 0;
    state.paymentMethod = 'cod';
    updateCartBadge();
    // Reset payment radios
    $$('.pay-method input').forEach((r, i) => r.checked = i === 3); // cod default
    // Reset category to all
    $$('.cat-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
    currentCat = 'all';
    renderProducts();
    clearTracking();
}

$('#orderMoreBtn').addEventListener('click', () => {
    resetApp();
    go('home');
});
$('#goHomeBtn').addEventListener('click', () => {
    resetApp();
    go('home');
});

/* ==========================================================
   GLOBAL NAVIGATION HOOKS — any [data-go] button
========================================================== */
document.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) {
        e.preventDefault();
        go(goBtn.dataset.go);
    }
});

// Init cart badge
updateCartBadge();
