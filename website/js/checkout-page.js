/**
 * THULIRVA - Checkout Page Logic with Themed UPI QR Gateway, Proof Verification & Delivery Locations
 */

let cart = [];
let subtotal = 0;
let deliveryCharge = 30;
let grandTotal = 0;
let checkoutDiscount = 0;
let appliedCheckoutPromo = null;
let orderProofBase64 = "";
let availableLocations = [];
let currentCheckoutStep = 1;
let isSubmittingOrder = false;
let isPickupMode = false;
let storeSettings = null;

const DEFAULT_LOCATIONS = [
    { name: "Oragadam", pincode: "603109" },
    { name: "Padapai", pincode: "601301" },
    { name: "Sriperumbudur", pincode: "602105" },
    { name: "Valasaravakkam", pincode: "600087" },
    { name: "Porur", pincode: "600116" },
    { name: "Virugambakkam", pincode: "600092" },
    { name: "Vadapalani", pincode: "600026" },
    { name: "Koyambedu", pincode: "600107" },
    { name: "KK Nagar", pincode: "600078" },
    { name: "Alapakkam", pincode: "600116" },
    { name: "Maduravoyal", pincode: "600095" }
];

document.addEventListener("DOMContentLoaded", () => {
    loadCart();
    prefillUserData();
    loadCheckoutLocations();
    loadCheckoutOffers();
    restorePreAppliedCoupon();
    checkStorePickupMode();
});

async function checkStorePickupMode() {
    try {
        const res = await fetch("/api/settings/store");
        if (res.ok) {
            const data = await res.json();
            if (data.settings) {
                storeSettings = data.settings;
                isPickupMode = Boolean(data.settings.pickup_mode);
                applyPickupModeUI();
            }
        }
    } catch (e) { }
}

function applyPickupModeUI() {
    if (!isPickupMode) return;
    const step1Container = document.getElementById("checkoutStep1Container");
    if (step1Container && !document.getElementById("pickupNoticeBanner")) {
        const banner = document.createElement("div");
        banner.id = "pickupNoticeBanner";
        banner.style.cssText = "background:#e8f5e9; border:2px solid #2d6a4f; border-radius:12px; padding:16px; margin-bottom:18px; color:#1b4332; box-shadow:0 2px 8px rgba(0,0,0,0.05);";
        banner.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                <span style="font-size:22px;">🏪</span>
                <div>
                    <strong style="font-size:15px; color:#1b4332;">STORE PICKUP MODE IS ACTIVE</strong>
                    <div style="font-size:12px; color:#2d6a4f;">Normal doorstep delivery is temporarily paused. Your order will be packed for self-pickup.</div>
                </div>
            </div>
            <div style="font-size:12.5px; line-height:1.5; margin-top:8px; padding-top:8px; border-top:1px dashed #a5d6a7;">
                <strong>📍 Pickup Store Location:</strong> ${storeSettings?.store_address || 'No 1, Mayana Salai, Thimmarajampettai, Kanchipuram - 631601'}<br>
                <strong>⏰ Store Pickup Hours:</strong> ${storeSettings?.store_timings || '7:00 AM - 8:00 PM (All Days)'} &bull; 📞 ${storeSettings?.store_phone || '+91 93606 71533'}
            </div>
        `;
        step1Container.prepend(banner);
    }
    const addrInput = document.getElementById("address");
    const cityInput = document.getElementById("city");
    const pinInput = document.getElementById("pincode");
    if (addrInput && !addrInput.value) {
        addrInput.value = "THULIRVA Farm Store (Self Pickup)";
    }
    if (cityInput && !cityInput.value) {
        cityInput.value = "Kanchipuram";
    }
    if (pinInput && !pinInput.value) {
        pinInput.value = "631601";
    }
    updateCheckoutTotalsDisplay();
}

async function loadCheckoutLocations() {
    try {
        const res = await fetch("/api/locations");
        if (res.ok) {
            const data = await res.json();
            if (data.locations && data.locations.length > 0) {
                availableLocations = data.locations.filter(l => l.status === "active" || !l.status);
            }
        }
    } catch {
        // fallback
    }

    if (!availableLocations || availableLocations.length === 0) {
        availableLocations = [...DEFAULT_LOCATIONS];
    }

    const selectEl = document.getElementById("deliveryLocation");
    if (!selectEl) return;

    let html = `<option value="">Select your delivery area...</option>`;
    availableLocations.forEach(loc => {
        html += `<option value="${loc.name}" data-pin="${loc.pincode || ''}">📍 ${loc.name} ${loc.pincode ? '(' + loc.pincode + ')' : ''}</option>`;
    });
    selectEl.innerHTML = html;
}

function onDeliveryLocationChange(locName) {
    if (!locName) return;
    const loc = availableLocations.find(l => l.name.toLowerCase() === locName.toLowerCase());
    const pinEl = document.getElementById("pincode");
    const cityEl = document.getElementById("city");

    if (loc && loc.pincode && pinEl) {
        pinEl.value = loc.pincode;
    }
    if (cityEl && !cityEl.value) {
        cityEl.value = "Chennai / Kanchipuram";
    }
}

function updateCheckoutTotalsDisplay() {
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const discountRow = document.getElementById("checkoutDiscountRow");
    const discountEl = document.getElementById("checkoutDiscount");
    const promoBadge = document.getElementById("appliedPromoBadge");
    const deliveryEl = document.getElementById("checkoutDelivery");
    const totalEl = document.getElementById("checkoutTotal");
    const qrTotalEl = document.getElementById("qrTotalDisplay");

    deliveryCharge = isPickupMode ? 0 : (subtotal >= 299 ? 0 : 30);
    grandTotal = Math.max(0, subtotal - checkoutDiscount + deliveryCharge);

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (checkoutDiscount > 0 && appliedCheckoutPromo) {
        if (discountRow) discountRow.style.display = "flex";
        if (promoBadge) promoBadge.textContent = appliedCheckoutPromo;
        if (discountEl) discountEl.textContent = `-₹${checkoutDiscount.toFixed(2)}`;
    } else {
        if (discountRow) discountRow.style.display = "none";
    }
    if (deliveryEl) {
        if (isPickupMode) {
            deliveryEl.innerHTML = `<span style="color:#2e7d32;font-weight:700">🏪 STORE PICKUP (FREE)</span>`;
        } else {
            deliveryEl.innerHTML = deliveryCharge === 0 
                ? `<span style="color:#2e7d32;font-weight:700">FREE</span>` 
                : `₹${deliveryCharge.toFixed(2)}`;
        }
    }
    if (totalEl) totalEl.textContent = `₹${grandTotal.toFixed(2)}`;
    if (qrTotalEl) qrTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
}

const FALLBACK_COUPONS = [
    { code: "FARM10", type: "percent", value: 10, min_order: 100, description: "10% OFF on all pure farm dairy orders" },
    { code: "THULIRVA50", type: "flat", value: 50, min_order: 300, description: "₹50 Instant OFF on orders above ₹300" },
    { code: "PUREMILK", type: "flat", value: 100, min_order: 500, description: "₹100 Flat Savings on large orders" },
    { code: "SUPER20", type: "percent", value: 20, min_order: 400, max_discount: 150, description: "20% OFF up to ₹150" }
];

async function loadCheckoutOffers() {
    const container = document.getElementById("checkoutOffersPills");
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
    } catch {
        // fallback
    }

    if (!offers.length) {
        offers = FALLBACK_COUPONS;
    }

    container.innerHTML = offers.slice(0, 3).map(c => `
        <span onclick="quickApplyPromo('${c.code}')" style="background:#f1f8ed; border:1px solid #c8dbbf; color:#1a4a2e; font-size:11px; font-weight:700; padding:3px 8px; border-radius:12px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;" onmouseover="this.style.background='#d8edd0'" onmouseout="this.style.background='#f1f8ed'" title="${c.description || ''}">
            🏷️ ${c.code} (${c.type === 'percent' ? c.value + '% OFF' : '₹' + c.value + ' OFF'})
        </span>
    `).join("");
}

function restorePreAppliedCoupon() {
    try {
        const saved = sessionStorage.getItem("thulirva_applied_coupon");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.code) {
                const input = document.getElementById("checkoutPromoInput");
                if (input) input.value = parsed.code;
                applyCheckoutPromo(parsed.code, true);
            }
        }
    } catch {}
}

function quickApplyPromo(code) {
    const input = document.getElementById("checkoutPromoInput");
    if (input) input.value = code;
    applyCheckoutPromo(code);
}

async function applyCheckoutPromo(forcedCode, silent = false) {
    const input = document.getElementById("checkoutPromoInput");
    const msgEl = document.getElementById("checkoutPromoMsg");
    const btn = document.getElementById("applyPromoBtn");
    const code = (forcedCode || (input ? input.value : "")).trim().toUpperCase();

    if (!code) {
        if (!silent) showToast("Please enter a promo code", "error");
        return;
    }

    if (subtotal <= 0) {
        if (!silent) showToast("Add items to your cart first", "error");
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
    } catch {
        // fallback
    }

    // Client-side fallback if server offline
    if (!result) {
        const found = FALLBACK_COUPONS.find(c => c.code.toUpperCase() === code);
        if (found) {
            if (subtotal < (found.min_order || 0)) {
                result = { valid: false, message: `Minimum cart value of ₹${found.min_order} required for ${found.code}` };
            } else {
                let disc = found.type === "percent" ? (subtotal * found.value / 100) : found.value;
                if (found.max_discount && disc > found.max_discount) disc = found.max_discount;
                disc = Math.min(disc, subtotal);
                result = { valid: true, discount: Math.round(disc), coupon: found, message: `Promo code ${found.code} applied!` };
            }
        } else {
            result = { valid: false, message: `Coupon code '${code}' is invalid or expired.` };
        }
    }

    if (result.valid) {
        checkoutDiscount = Number(result.discount) || 0;
        appliedCheckoutPromo = code;
        updateCheckoutTotalsDisplay();

        if (msgEl) {
            msgEl.innerHTML = `<span style="color:#2e7d32; font-weight:700;">✓ ${result.message || 'Promo applied!'} You saved ₹${checkoutDiscount}</span> <a href="javascript:void(0)" onclick="removeCheckoutPromo()" style="color:#c62828; margin-left:6px; text-decoration:underline; font-size:11px;">Remove</a>`;
            msgEl.style.display = "block";
        }
        if (btn) {
            btn.textContent = "Applied ✓";
            btn.style.background = "#2e7d32";
        }

        try {
            sessionStorage.setItem("thulirva_applied_coupon", JSON.stringify({ code, discount: checkoutDiscount }));
        } catch {}

        if (!silent) {
            showToast(`🎉 Coupon ${code} applied! ₹${checkoutDiscount} saved.`);
        }
    } else {
        checkoutDiscount = 0;
        appliedCheckoutPromo = null;
        updateCheckoutTotalsDisplay();

        if (msgEl) {
            msgEl.innerHTML = `<span style="color:#c62828; font-weight:600;">✕ ${result.message || 'Invalid promo code'}</span>`;
            msgEl.style.display = "block";
        }
        if (btn) {
            btn.textContent = "Apply";
            btn.style.background = "";
        }
        if (!silent) {
            showToast(result.message || "Invalid promo code", "error");
        }
    }
}

function removeCheckoutPromo() {
    checkoutDiscount = 0;
    appliedCheckoutPromo = null;
    const input = document.getElementById("checkoutPromoInput");
    const msgEl = document.getElementById("checkoutPromoMsg");
    const btn = document.getElementById("applyPromoBtn");
    if (input) input.value = "";
    if (msgEl) msgEl.style.display = "none";
    if (btn) {
        btn.textContent = "Apply";
        btn.style.background = "";
    }
    try {
        sessionStorage.removeItem("thulirva_applied_coupon");
    } catch {}
    updateCheckoutTotalsDisplay();
    showToast("Promo code removed.");
}

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem("thulirva_cart")) || [];
    } catch {
        cart = [];
    }

    const itemsContainer = document.getElementById("checkoutItems");
    const placeBtn = document.getElementById("placeOrderBtn");

    if (!cart || cart.length === 0) {
        if (itemsContainer) {
            itemsContainer.innerHTML = `
                <div style="text-align:center;padding:30px 10px;color:var(--text-muted)">
                    <p style="font-size:32px;margin-bottom:8px">🛒</p>
                    <p style="font-size:14px;font-weight:600;margin-bottom:12px">Your cart is currently empty</p>
                    <a href="shop.html" class="btn btn-primary" style="font-size:13px;padding:8px 16px;">Browse Farm Fresh Products</a>
                </div>
            `;
        }
        if (placeBtn) placeBtn.disabled = true;
        updateCheckoutTotalsDisplay();
        return;
    }

    subtotal = cart.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

    if (itemsContainer) {
        itemsContainer.innerHTML = cart.map(item => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f0f0f0;gap:12px">
                <div style="display:flex;align-items:center;gap:12px;flex:1">
                    <img src="${item.image || '../assets/images/products/fresh_cow_milk.jpg'}" alt="${item.name}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;border:1px solid #e0e0e0;">
                    <div>
                        <div style="font-size:14px;font-weight:600;color:var(--text-dark);">${item.name}</div>
                        <div style="font-size:12px;color:var(--text-muted);">₹${item.price} &times; ${item.quantity}</div>
                    </div>
                </div>
                <div style="font-size:14px;font-weight:700;color:var(--forest-green)">
                    ₹${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </div>
            </div>
        `).join("");
    }

    updateCheckoutTotalsDisplay();
    if (placeBtn) placeBtn.disabled = false;
}

function prefillUserData() {
    try {
        const userStr = localStorage.getItem("thulirva_user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.name) {
                const parts = user.name.split(" ");
                const fName = document.getElementById("firstName");
                const lName = document.getElementById("lastName");
                if (fName && !fName.value) fName.value = parts[0] || "";
                if (lName && !lName.value && parts.length > 1) lName.value = parts.slice(1).join(" ");
            }
            const phoneEl = document.getElementById("phone");
            if (phoneEl && !phoneEl.value && user.phone) phoneEl.value = user.phone;

            const emailEl = document.getElementById("email");
            if (emailEl && !emailEl.value && user.email) emailEl.value = user.email;

            const addrEl = document.getElementById("address");
            if (addrEl && !addrEl.value && user.address) addrEl.value = user.address;
        }
    } catch {
        // ignore
    }
}

function copyCheckoutUpi() {
    const upi = "7904880944@superyes";
    navigator.clipboard.writeText(upi).then(() => {
        showToast("✓ UPI ID copied to clipboard: " + upi);
    }).catch(() => {
        showToast("UPI ID: " + upi);
    });
}

function handleOrderProofChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        orderProofBase64 = evt.target.result;
        const box = document.getElementById("orderProofPreviewBox");
        const img = document.getElementById("orderProofPreviewImg");
        const nameEl = document.getElementById("orderProofFileName");
        if (box && img) {
            img.src = orderProofBase64;
            if (nameEl) nameEl.textContent = file.name;
            box.style.display = "flex";
        }
        showToast("✓ Screenshot proof selected!");
    };
    reader.readAsDataURL(file);
}

function validateAddressStep() {
    const fName = (document.getElementById("firstName")?.value || "").trim();
    const phone = (document.getElementById("phone")?.value || "").trim();
    const deliveryArea = (document.getElementById("deliveryLocation")?.value || "").trim();
    const streetAddress = (document.getElementById("address")?.value || "").trim();
    const city = (document.getElementById("city")?.value || "").trim();
    const pincode = (document.getElementById("pincode")?.value || "").trim();

    if (!fName) {
        showToast("Please enter your First Name", "error");
        document.getElementById("firstName")?.focus();
        return false;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
        showToast("Please enter a valid 10-digit mobile number", "error");
        document.getElementById("phone")?.focus();
        return false;
    }
    if (!deliveryArea) {
        showToast("Please select your delivery area from available locations", "error");
        document.getElementById("deliveryLocation")?.focus();
        return false;
    }
    if (!streetAddress) {
        showToast("Please enter your street / house address", "error");
        document.getElementById("address")?.focus();
        return false;
    }
    if (!city) {
        showToast("Please enter your city", "error");
        document.getElementById("city")?.focus();
        return false;
    }
    if (!pincode || pincode.replace(/\D/g, '').length < 6) {
        showToast("Please enter a valid 6-digit PIN code", "error");
        document.getElementById("pincode")?.focus();
        return false;
    }
    if (!cart || cart.length === 0) {
        showToast("Your cart is empty! Add products before checkout.", "error");
        return false;
    }
    return true;
}

function goToPaymentStep() {
    if (!validateAddressStep()) return;

    currentCheckoutStep = 2;
    const step1El = document.getElementById("checkoutStep1Container");
    const step2El = document.getElementById("checkoutStep2Container");
    if (step1El) step1El.style.display = "none";
    if (step2El) step2El.style.display = "block";

    // Stepper styling
    const stepCircle1 = document.getElementById("stepCircle1");
    const stepCircle2 = document.getElementById("stepCircle2");
    const stepIndicator2 = document.getElementById("stepIndicator2");
    const stepText2 = document.getElementById("stepText2");
    const stepProgressLine = document.getElementById("stepProgressLine");
    const sidebarActionBtn = document.getElementById("sidebarActionBtn");

    if (stepCircle1) {
        stepCircle1.innerHTML = "✓";
        stepCircle1.style.background = "#2e7d32";
    }
    if (stepProgressLine) stepProgressLine.style.width = "100%";
    if (stepIndicator2) stepIndicator2.style.opacity = "1";
    if (stepCircle2) {
        stepCircle2.style.background = "var(--forest-green)";
        stepCircle2.style.color = "white";
    }
    if (stepText2) stepText2.style.color = "var(--forest-green)";
    if (sidebarActionBtn) sidebarActionBtn.innerHTML = "Verify &amp; Place Farm Order &rarr;";

    // Populate Delivery Address Summary Pill in Step 2
    const fName = (document.getElementById("firstName")?.value || "").trim();
    const lName = (document.getElementById("lastName")?.value || "").trim();
    const phone = (document.getElementById("phone")?.value || "").trim();
    const deliveryArea = (document.getElementById("deliveryLocation")?.value || "").trim();
    const streetAddress = (document.getElementById("address")?.value || "").trim();
    const city = (document.getElementById("city")?.value || "").trim();
    const pincode = (document.getElementById("pincode")?.value || "").trim();

    const summaryEl = document.getElementById("step2AddressSummary");
    if (summaryEl) {
        summaryEl.textContent = `${fName} ${lName} • 📞 ${phone} • 📍 ${deliveryArea}, ${streetAddress}, ${city} (${pincode})`;
    }

    window.scrollTo({ top: 120, behavior: "smooth" });
    showToast("✓ Address verified. Please scan UPI QR and enter UTR.");
}

function goToAddressStep() {
    currentCheckoutStep = 1;
    const step1El = document.getElementById("checkoutStep1Container");
    const step2El = document.getElementById("checkoutStep2Container");
    if (step1El) step1El.style.display = "block";
    if (step2El) step2El.style.display = "none";

    const stepCircle1 = document.getElementById("stepCircle1");
    const stepCircle2 = document.getElementById("stepCircle2");
    const stepIndicator2 = document.getElementById("stepIndicator2");
    const stepText2 = document.getElementById("stepText2");
    const stepProgressLine = document.getElementById("stepProgressLine");
    const sidebarActionBtn = document.getElementById("sidebarActionBtn");

    if (stepCircle1) {
        stepCircle1.innerHTML = "1";
        stepCircle1.style.background = "var(--forest-green)";
    }
    if (stepProgressLine) stepProgressLine.style.width = "0%";
    if (stepIndicator2) stepIndicator2.style.opacity = "0.6";
    if (stepCircle2) {
        stepCircle2.style.background = "#e0e0e0";
        stepCircle2.style.color = "#555";
    }
    if (stepText2) stepText2.style.color = "#555";
    if (sidebarActionBtn) sidebarActionBtn.innerHTML = "Proceed to UPI Payment &rarr;";

    window.scrollTo({ top: 120, behavior: "smooth" });
}

function handleSidebarAction() {
    if (currentCheckoutStep === 1) {
        goToPaymentStep();
    } else {
        placeOrder();
    }
}

async function placeOrder() {
    if (isSubmittingOrder) {
        console.warn("Order submission already in progress.");
        return;
    }

    if (!validateAddressStep()) {
        goToAddressStep();
        return;
    }

    const transactionId = (document.getElementById("orderTransactionId")?.value || "").trim();
    if (!transactionId) {
        showToast("Please enter the UPI Transaction ID / UTR Number", "error");
        document.getElementById("orderTransactionId")?.focus();
        return;
    }
    if (!orderProofBase64) {
        showToast("Please upload your payment screenshot proof", "error");
        document.getElementById("orderProofFile")?.focus();
        return;
    }

    const fName = (document.getElementById("firstName")?.value || "").trim();
    const lName = (document.getElementById("lastName")?.value || "").trim();
    const phone = (document.getElementById("phone")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const deliveryArea = (document.getElementById("deliveryLocation")?.value || "").trim();
    const streetAddress = (document.getElementById("address")?.value || "").trim();
    const city = (document.getElementById("city")?.value || "").trim();
    const state = document.getElementById("state")?.value || "Tamil Nadu";
    const pincode = (document.getElementById("pincode")?.value || "").trim();

    const customerName = `${fName} ${lName}`.trim();
    const fullAddress = `${streetAddress}, ${deliveryArea}`;

    // LOCK: Prevent double clicks
    isSubmittingOrder = true;
    const placeBtn = document.getElementById("placeOrderBtn");
    const sidebarBtn = document.getElementById("sidebarActionBtn");
    if (placeBtn) {
        placeBtn.disabled = true;
        placeBtn.innerHTML = "Verifying &amp; Placing Farm Order... 🌿";
    }
    if (sidebarBtn) {
        sidebarBtn.disabled = true;
        sidebarBtn.innerHTML = "Verifying &amp; Placing Farm Order... 🌿";
    }

    // Include user id if logged in
    let userId = null;
    try {
        const u = JSON.parse(localStorage.getItem("thulirva_user") || "{}");
        userId = u.id || null;
    } catch {}

    await submitOrderBackend({
        user_id: userId,
        customer_name: customerName,
        customer_phone: phone,
        customer_email: email,
        address: fullAddress,
        delivery_location: deliveryArea,
        city: city,
        state: state,
        pincode: pincode,
        items: [...cart],
        order_type: isPickupMode ? "pickup" : "delivery",
        is_pickup: isPickupMode,
        delivery_charge: deliveryCharge,
        payment_method: "UPI QR (7904880944@superyes)",
        transaction_id: transactionId,
        payment_proof: orderProofBase64,
        promo_code: appliedCheckoutPromo || null,
        discount_amount: checkoutDiscount || 0,
        total: grandTotal,
        total_price: grandTotal,
        order_status: "pending"
    });
}

let latestPlacedOrder = null;

async function submitOrderBackend(orderPayload) {
    try {
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        });
        const data = await res.json();
        if (data.success) {
            // Save to local user orders cache so user account displays it immediately
            let localOrders = [];
            try {
                localOrders = JSON.parse(localStorage.getItem("thulirva_my_orders")) || [];
            } catch {
                localOrders = [];
            }
            const orderRecord = {
                ...orderPayload,
                ...(data.order || {}),
                id: (data.order && data.order.id) || ("ORD-" + Math.floor(1000 + Math.random() * 9000)),
                transaction_id: orderPayload.transaction_id,
                transactionId: orderPayload.transaction_id,
                payment_proof: orderPayload.payment_proof,
                paymentProof: orderPayload.payment_proof,
                customer_name: orderPayload.customer_name,
                customerName: orderPayload.customer_name,
                promo_code: orderPayload.promo_code,
                discount_amount: orderPayload.discount_amount,
                total: orderPayload.total || grandTotal,
                total_price: orderPayload.total || grandTotal,
                totalPrice: orderPayload.total || grandTotal,
                order_status: (data.order && data.order.order_status) || "pending",
                created_at: (data.order && data.order.created_at) || new Date().toLocaleString('en-IN')
            };
            localOrders.unshift(orderRecord);
            localStorage.setItem("thulirva_my_orders", JSON.stringify(localOrders));

            // Also save address into user session if logged in
            try {
                const userStr = localStorage.getItem("thulirva_user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.address = `${orderPayload.address}, ${orderPayload.city}, ${orderPayload.pincode}`;
                    localStorage.setItem("thulirva_user", JSON.stringify(user));
                }
            } catch {}

            // Clear Cart Completely & Session Promo
            localStorage.removeItem("thulirva_cart");
            try { sessionStorage.removeItem("thulirva_applied_coupon"); } catch {}
            cart = [];
            if (typeof updateCartCount === 'function') updateCartCount();
            document.querySelectorAll("#cartCount").forEach(el => el.textContent = "0");

            latestPlacedOrder = orderRecord;

            // Populate & Open Order Placed Confirmed Modal
            const modalDetails = document.getElementById("orderSuccessDetails");
            if (modalDetails) {
                const discountNote = orderRecord.promo_code 
                    ? `<div style="margin-bottom:6px; color:#2e7d32;"><strong>Promo Discount:</strong> 🎟️ ${orderRecord.promo_code} (-₹${orderRecord.discount_amount})</div>` 
                    : '';
                modalDetails.innerHTML = `
                    <div style="margin-bottom:6px;"><strong>Order ID:</strong> <span style="font-family:monospace; color:#1a4a2e; font-weight:700;">#${orderRecord.id}</span></div>
                    <div style="margin-bottom:6px;"><strong>Customer:</strong> ${orderRecord.customer_name} ${orderRecord.user_id ? `(#${orderRecord.user_id})` : ''}</div>
                    <div style="margin-bottom:6px;"><strong>Delivery Location:</strong> 📍 ${orderRecord.delivery_location || 'Selected Area'} (${orderRecord.pincode})</div>
                    <div style="margin-bottom:6px;"><strong>Doorstep Address:</strong> ${orderRecord.address}</div>
                    <div style="margin-bottom:6px;"><strong>Delivery Slot:</strong> ⏰ Early Morning (5:30 AM - 7:30 AM)</div>
                    <div style="margin-bottom:6px;"><strong>UPI Transaction ID (UTR):</strong> <span style="font-family:monospace; color:#1a4a2e; font-weight:700; background:#e8f5e9; padding:2px 8px; border-radius:4px;">${orderRecord.transaction_id}</span></div>
                    ${discountNote}
                    <div style="margin-top:10px; padding-top:8px; border-top:1px dashed var(--border); font-size:14.5px; font-weight:800; color:var(--forest-green);">
                        Total Paid: ₹${orderRecord.total} (Pure Farm Dispatch)
                    </div>
                `;
            }

            const successModal = document.getElementById("orderSuccessModal");
            if (successModal) {
                successModal.classList.add("active");
            }

            // Update items container to show confirmed
            const itemsContainer = document.getElementById("checkoutItems");
            if (itemsContainer) {
                itemsContainer.innerHTML = `
                    <div style="text-align:center;padding:24px 10px;color:var(--forest-green)">
                        <p style="font-size:28px;margin-bottom:6px">🌿</p>
                        <p style="font-size:14px;font-weight:700;">Order #${orderRecord.id} Confirmed!</p>
                        <p style="font-size:12px;color:var(--text-muted);">Cart has been emptied.</p>
                    </div>
                `;
            }

            const placeBtn = document.getElementById("placeOrderBtn");
            const sidebarBtn = document.getElementById("sidebarActionBtn");
            if (placeBtn) {
                placeBtn.disabled = true;
                placeBtn.innerHTML = "Order Confirmed ✓";
            }
            if (sidebarBtn) {
                sidebarBtn.disabled = true;
                sidebarBtn.innerHTML = "Order Confirmed ✓";
            }

            showToast("🎉 Farm order confirmed successfully!", "success");
        } else {
            showToast("Failed to place order: " + (data.message || "Unknown error"), "error");
            resetPlaceBtn();
        }
    } catch (err) {
        console.error("Order error:", err);
        showToast("Error processing order. Please try again.", "error");
        resetPlaceBtn();
    }
}

function printOrderInvoice() {
    if (!latestPlacedOrder) return;
    const o = latestPlacedOrder;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Tax Invoice - #${o.id}</title>
            <style>
                body { font-family: sans-serif; padding: 30px; color: #333; line-height: 1.5; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a4a2e; padding-bottom: 15px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
                th { background: #f4f6f0; }
                .total-row { font-size: 16px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h2 style="color:#1a4a2e; margin:0;">THULIRVA DAIRY &amp; FARMS</h2>
                    <p style="margin:4px 0; font-size:12px;">Rooted in Nature &bull; 100% Pure Farm Produce</p>
                </div>
                <div style="text-align:right;">
                    <h3 style="margin:0;">TAX INVOICE</h3>
                    <p style="margin:4px 0; font-size:13px;"><strong>Order #:</strong> #${o.id}</p>
                    <p style="margin:0; font-size:13px;"><strong>Date:</strong> ${o.created_at}</p>
                </div>
            </div>
            <div>
                <strong>Billed &amp; Delivered To:</strong><br>
                ${o.customer_name} ${o.user_id ? `(#${o.user_id})` : ''}<br>
                Phone: ${o.customer_phone}<br>
                Address: ${o.address}, ${o.city} - ${o.pincode}
            </div>
            <table>
                <thead>
                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>
                    ${(o.items || []).map(i => `
                        <tr>
                            <td>${i.name || i.product_name}</td>
                            <td>${i.quantity || 1}</td>
                            <td>₹${i.price}</td>
                            <td>₹${((Number(i.price) || 0) * (Number(i.quantity) || 1)).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="3" style="text-align:right;">Grand Total:</td>
                        <td>₹${o.total}</td>
                    </tr>
                </tbody>
            </table>
            <p style="font-size:12px; color:#555;"><strong>Payment Method:</strong> UPI Transfer &bull; <strong>UTR:</strong> ${o.transaction_id} &bull; <strong>Status:</strong> Verified &amp; Paid</p>
            <script>window.print();<\/script>
        </body>
        </html>
    `);
    printWin.document.close();
}

function resetPlaceBtn() {
    isSubmittingOrder = false;
    const placeBtn = document.getElementById("placeOrderBtn");
    const sidebarBtn = document.getElementById("sidebarActionBtn");
    if (placeBtn) {
        placeBtn.disabled = false;
        placeBtn.innerHTML = "Verify &amp; Place Farm Order &rarr;";
    }
    if (sidebarBtn) {
        sidebarBtn.disabled = false;
        sidebarBtn.innerHTML = currentCheckoutStep === 1 ? "Proceed to UPI Payment &rarr;" : "Verify &amp; Place Farm Order &rarr;";
    }
}
