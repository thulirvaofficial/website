/* =========================================================
   CART PAGE JAVASCRIPT
========================================================= */

let cartDiscount = 0;
let appliedCartPromo = null;

function renderCartPage() {
    const layout = document.getElementById("cartLayout");
    if (!layout) return;

    const cart = getCart();
    const subtotal = getCartSubtotal();
    const delivery = subtotal >= 299 ? 0 : 30;

    // Check stored coupon
    try {
        const saved = sessionStorage.getItem("thulirva_applied_coupon");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.code) {
                appliedCartPromo = parsed.code;
                cartDiscount = Number(parsed.discount) || 0;
            }
        }
    } catch {}

    const total = Math.max(0, subtotal - cartDiscount + delivery);

    // Update hero count
    const countEl = document.getElementById("cartItemCount");
    if (countEl) countEl.textContent = cart.length
        ? `${cart.length} item${cart.length > 1 ? "s" : ""} in your cart`
        : "Your cart is empty";

    if (!cart.length) {
        layout.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;padding:80px 20px">
                <div class="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything yet.</p>
                <a href="shop.html" class="btn btn-primary" style="margin-top:24px">Start Shopping →</a>
            </div>`;
        return;
    }

    const discountRowHtml = (cartDiscount > 0 && appliedCartPromo) ? `
        <div class="summary-row" style="color:#2e7d32; font-weight:700;">
            <span>Promo Discount (${appliedCartPromo})</span>
            <span>-₹${cartDiscount} <button onclick="removeCartCoupon()" style="background:none; border:none; color:#c62828; cursor:pointer; font-size:11px; text-decoration:underline;">✕ Remove</button></span>
        </div>
    ` : '';

    layout.innerHTML = `
        <div class="cart-table-wrap">
            <div class="cart-table-header">
                <div>Product</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>Total</div>
                <div></div>
            </div>
            <div id="cartItemsList"></div>
        </div>
        <div class="order-summary">
            <h3>Order Summary</h3>
            <div class="summary-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
            ${discountRowHtml}
            <div class="summary-row"><span>Delivery Charge</span><span>${delivery === 0 ? '<span style="color:var(--natural-green)">FREE</span>' : '₹' + delivery}</span></div>
            ${delivery > 0 ? `<div style="font-size:11px;color:var(--text-muted);padding:6px 0">Add ₹${299 - subtotal} more for free delivery</div>` : ""}
            <div class="summary-row total"><span>Total</span><span>₹${total}</span></div>
            <div class="coupon-row" style="margin-top:14px;">
                <input type="text" class="coupon-input" id="couponInput" value="${appliedCartPromo || ''}" placeholder="Enter promo code (e.g. FARM10)" style="text-transform:uppercase; font-weight:700;">
                <button class="btn btn-outline btn-sm" onclick="applyCoupon()" style="font-weight:700;">${appliedCartPromo ? 'Re-Apply' : 'Apply'}</button>
            </div>
            <div id="cartOffersChips" style="display:flex; flex-wrap:wrap; gap:6px; margin:8px 0;"></div>
            <a href="checkout.html" class="btn btn-primary" style="width:100%;justify-content:center;font-size:15px;margin-top:8px">
                Proceed to Checkout →
            </a>
            <a href="shop.html" style="display:block;text-align:center;margin-top:14px;font-size:13px;color:var(--text-muted)">
                ← Continue Shopping
            </a>
        </div>
    `;

    loadCartQuickOffers();

    const listEl = document.getElementById("cartItemsList");
    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = item.id;
        let itemImg = item.emoji || "🥛";
        if (item.image) {
            let imgSrc = item.image;
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !imgSrc.startsWith('../')) {
                imgSrc = '../' + imgSrc;
            }
            itemImg = `<img src="${imgSrc}" alt="${item.name}">`;
        }

        row.innerHTML = `
            <div class="cart-product">
                <div class="cart-product-img">${itemImg}</div>
                <div>
                    <div class="cart-product-name">${item.name}</div>
                    <div class="cart-product-weight">${item.weight ? item.weight + ' • ' : ''}₹${item.price}</div>
                </div>
            </div>
            <div class="cart-price">₹${item.price}</div>
            <div class="cart-qty-control">
                <button class="cart-qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                <input class="cart-qty-num" value="${item.quantity}" id="qty-${item.id}"
                    onchange="setQty(${item.id}, this.value)" min="1" type="number">
                <button class="cart-qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
            <div class="cart-total">₹${item.price * item.quantity}</div>
            <button class="cart-remove" onclick="deleteItem(${item.id})" title="Remove">✕</button>
        `;
        listEl.appendChild(row);
    });
}

function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) { deleteItem(id); return; }
    updateCartQty(id, newQty);
    renderCartPage();
}

function setQty(id, val) {
    const qty = parseInt(val);
    if (isNaN(qty) || qty < 1) return;
    updateCartQty(id, qty);
    renderCartPage();
}

function deleteItem(id) {
    removeFromCart(id);
    renderCartPage();
    showToast("🗑️ Item removed from cart");
}

async function loadCartQuickOffers() {
    const container = document.getElementById("cartOffersChips");
    if (!container) return;

    let offers = [];
    try {
        const res = await fetch("/api/coupons");
        if (res.ok) {
            const data = await res.json();
            if (data.coupons && data.coupons.length > 0) {
                offers = data.coupons.filter(c => c.status === "active");
            }
        }
    } catch {}

    if (!offers.length) {
        offers = [
            { code: "FARM10", type: "percent", value: 10 },
            { code: "THULIRVA50", type: "flat", value: 50 }
        ];
    }

    container.innerHTML = offers.slice(0, 3).map(c => `
        <span onclick="setAndApplyCartCoupon('${c.code}')" style="background:#f1f8ed; border:1px solid #c8dbbf; color:#1a4a2e; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; cursor:pointer;" title="${c.description || ''}">
            🏷️ ${c.code} (${c.type === 'percent' ? c.value + '%' : '₹' + c.value} OFF)
        </span>
    `).join("");
}

function setAndApplyCartCoupon(code) {
    const input = document.getElementById("couponInput");
    if (input) input.value = code;
    applyCoupon(code);
}

async function applyCoupon(forcedCode) {
    const code = (forcedCode || document.getElementById("couponInput")?.value || "").trim().toUpperCase();
    if (!code) {
        showToast("Please enter a coupon code", "error");
        return;
    }

    const subtotal = getCartSubtotal();
    if (subtotal <= 0) {
        showToast("Cart is empty", "error");
        return;
    }

    let result = null;
    try {
        const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, order_amount: subtotal })
        });
        if (res.ok) {
            result = await res.json();
        }
    } catch {}

    if (!result) {
        if (code === "FARM10") {
            result = { valid: true, discount: Math.round(subtotal * 0.1), message: "10% farm discount applied!" };
        } else if (code === "THULIRVA50" && subtotal >= 300) {
            result = { valid: true, discount: 50, message: "₹50 discount applied!" };
        } else {
            result = { valid: false, message: "Coupon code is invalid or expired." };
        }
    }

    if (result.valid) {
        appliedCartPromo = code;
        cartDiscount = Number(result.discount) || 0;
        try {
            sessionStorage.setItem("thulirva_applied_coupon", JSON.stringify({ code, discount: cartDiscount }));
        } catch {}
        renderCartPage();
        showToast(`🎉 Coupon ${code} applied! ₹${cartDiscount} saved.`);
    } else {
        showToast(`❌ ${result.message || 'Invalid coupon'}`, "error");
    }
}

function removeCartCoupon() {
    appliedCartPromo = null;
    cartDiscount = 0;
    try {
        sessionStorage.removeItem("thulirva_applied_coupon");
    } catch {}
    renderCartPage();
    showToast("Coupon removed.");
}

// Init
document.addEventListener("DOMContentLoaded", renderCartPage);
