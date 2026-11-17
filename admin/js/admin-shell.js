/**
 * THULIRVA Admin Enterprise Navigation Shell & Component System
 * Unifies Sidebar, Top Navigation, Notifications, Global Search, and Modals
 */

// Zero-Flicker RBAC: lock page visibility immediately for protected admin pages
(function() {
    const isLogin = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/admin/") || window.location.pathname.endsWith("/admin");
    if (!isLogin && document.documentElement) {
        document.documentElement.classList.add("auth-verifying");
    }
})();

const NAV_GROUPS = [
    {
        title: "Overview",
        items: [
            { key: "dashboard", label: "Dashboard", url: "dashboard.html", icon: "layout-dashboard" },
            { key: "reports", label: "Reports & Analytics", url: "reports.html", icon: "bar-chart-3" }
        ]
    },
    {
        title: "Commerce & Store",
        items: [
            { key: "orders", label: "Orders & Verification", url: "orders.html", icon: "shopping-bag", badgeId: "badge-orders" },
            { key: "subscriptions", label: "Subscriptions", url: "subscriptions.html", icon: "calendar-clock" },
            { key: "payments", label: "Payment Verification", url: "payment-verification.html", icon: "credit-card", badgeId: "badge-payments" },
            { key: "payment-qr", label: "QR Code Management", url: "qr-management.html", icon: "qr-code" },
            { key: "delivery-charges", label: "Delivery Charge Management", url: "delivery-charges.html", icon: "truck" },
            { key: "products", label: "Products Catalog", url: "products.html", icon: "package" },
            { key: "categories", label: "Categories", url: "categories.html", icon: "tags" },
            { key: "customers", label: "Customer Directory", url: "customers.html", icon: "users" }
        ]
    },
    {
        title: "Logistics & Fleet",
        items: [
            { key: "partners", label: "Delivery Partners", url: "delivery-partners.html", icon: "truck" },
            { key: "fleet-tracking", label: "Live Fleet 3D Map", url: "fleet-tracking.html", icon: "navigation" },
            { key: "attendance", label: "Partner Attendance", url: "partner-attendance.html", icon: "clipboard-check" },
            { key: "kyc", label: "Partner KYC", url: "partner-kyc.html", icon: "shield-check", badgeId: "badge-kyc" },
            { key: "earnings", label: "Partner Earnings", url: "partner-earnings.html", icon: "wallet" },
            { key: "withdrawals", label: "Partner Withdrawals", url: "partner-withdrawals.html", icon: "arrow-up-right", badgeId: "badge-withdrawals" },
            { key: "locations", label: "Delivery Locations", url: "locations.html", icon: "map-pin" }
        ]
    },
    {
        title: "Marketing & Content",
        items: [
            { key: "announcements", label: "Announcement Management", url: "announcements.html", icon: "megaphone" },
            { key: "coupons", label: "Promo Codes", url: "coupons.html", icon: "ticket" },
            { key: "recipes", label: "Farm Recipes", url: "recipes.html", icon: "utensils" },
            { key: "notifications", label: "News & Notifications", url: "notifications.html", icon: "bell" }
        ]
    },
    {
        title: "System",
        items: [
            { key: "settings", label: "Store Settings", url: "settings.html", icon: "sliders" },
            { key: "profile", label: "Admin Profile", url: "profile.html", icon: "user-cog" }
        ]
    }
];

// SVG Icon fallbacks for crisp rendering without external network dependency
const SVG_ICONS = {
    "layout-dashboard": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
    "bar-chart-3": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    "shopping-bag": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    "calendar-clock": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><circle cx="16" cy="16" r="6"/><path d="M16 14v2l1 1"/></svg>',
    "credit-card": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
    "qr-code": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>',
    "megaphone": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    "package": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    "tags": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.42 2.42 0 0 0 3.42 0l3.58-3.58a2.42 2.42 0 0 0 0-3.42l-5.7-5.7Z"/><circle cx="6.5" cy="8.5" r=".5" fill="currentColor"/></svg>',
    "users": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    "truck": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.28a1 1 0 0 0-.29-.71l-3.42-3.42A1 1 0 0 0 17.58 7H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    "clipboard-check": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    "shield-check": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    "wallet": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
    "arrow-up-right": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>',
    "map-pin": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
    "navigation": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
    "ticket": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
    "utensils": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 11v11"/><path d="M5 2v14a3 3 0 0 0 3 3v3"/><path d="M8 2v7"/></svg>',
    "bell": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    "sliders": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>',
    "user-cog": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/></svg>',
    "menu": '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    "search": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    "chevron-left": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    "chevron-right": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    "log-out": '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>'
};

function getIcon(name) {
    return SVG_ICONS[name] || `<i data-lucide="${name}"></i>`;
}

function getApiBaseUrl() {
    if (window.THULIRVA_API_BASE) return window.THULIRVA_API_BASE.replace(/\/+$/, "");
    if (window.location && window.location.protocol === "file:") return "http://localhost:5500";
    if (window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        if (window.location.port && window.location.port !== "5500" && window.location.port !== "80" && window.location.port !== "443") {
            return "http://" + window.location.hostname + ":5500";
        }
    }
    return "";
}

/**
 * Safe Admin Profile & Session Provider
 * Guarantees admin.admin_name is never undefined across the entire ecosystem
 */
window.getSafeAdmin = function() {
    let admin = null;
    try {
        const raw = localStorage.getItem("thulirva_admin_user") || localStorage.getItem("admin");
        if (raw) {
            admin = JSON.parse(raw);
        }
    } catch (_) {}

    // Check if stored admin role is customer or delivery partner
    if (admin && admin.role && (admin.role.toLowerCase() === "customer" || admin.role.toLowerCase() === "delivery_partner")) {
        localStorage.removeItem("thulirva_admin_token");
        localStorage.removeItem("thulirva_admin_user");
        localStorage.removeItem("admin");
        return {
            id: 0,
            name: "Unauthorized",
            admin_name: "Unauthorized",
            email: "",
            role: "unauthorized"
        };
    }

    if (!admin || typeof admin !== "object") {
        admin = {
            id: 1,
            name: "Super Admin",
            admin_name: "Super Admin",
            email: "admin@thulirva.com",
            role: "Super Admin",
            profile_photo: ""
        };
    } else {
        if (!admin.admin_name) admin.admin_name = admin.name || "Super Admin";
        if (!admin.name) admin.name = admin.admin_name;
        if (!admin.email) admin.email = "admin@thulirva.com";
        if (!admin.role) admin.role = "Super Admin";
    }

    window.admin = admin;
    return admin;
};

window.admin = window.getSafeAdmin();
window.getAdminName = function() {
    return window.getSafeAdmin().admin_name || "Super Admin";
};

window.AdminProfile = {
    get: window.getSafeAdmin,
    getName: window.getAdminName,
    sync: async function() {
        const token = localStorage.getItem("thulirva_admin_token");
        if (!token) return window.getSafeAdmin();
        try {
            let res = await fetch(getApiBaseUrl() + "/api/admin/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.success) {
                    const src = data.admin || data.user || {};
                    const role = (src.role || "").toLowerCase();
                    if (role === "customer" || role === "delivery_partner") {
                        localStorage.removeItem("thulirva_admin_token");
                        localStorage.removeItem("thulirva_admin_user");
                        localStorage.removeItem("admin");
                        window.location.replace("../index.html");
                        return window.getSafeAdmin();
                    }
                    const adminObj = {
                        id: src.id || 1,
                        name: src.name || src.admin_name || "Super Admin",
                        admin_name: src.admin_name || src.name || "Super Admin",
                        email: src.email || "admin@thulirva.com",
                        role: role === "super_admin" || role === "super admin" ? "Super Admin" : "Admin",
                        profile_photo: src.profile_photo || ""
                    };
                    localStorage.setItem("thulirva_admin_user", JSON.stringify(adminObj));
                    localStorage.setItem("admin", JSON.stringify(adminObj));
                    window.admin = adminObj;
                    window.AdminProfile.updateUI(adminObj);
                    return adminObj;
                }
            } else if (res.status === 403) {
                localStorage.removeItem("thulirva_admin_token");
                localStorage.removeItem("thulirva_admin_user");
                localStorage.removeItem("admin");
                window.location.replace("../index.html");
            }
        } catch (_) {}
        return window.getSafeAdmin();
    },
    updateUI: function(admin) {
        if (!admin) admin = window.getSafeAdmin();
        const safeName = admin.admin_name || admin.name || "Super Admin";
        const safeEmail = admin.email || "admin@thulirva.com";
        const initials = safeName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "AD";

        const sideAvatar = document.querySelector(".sidebar-admin-avatar");
        const sideName = document.querySelector(".sidebar-admin-name");
        const sideRole = document.querySelector(".sidebar-admin-role");
        if (sideAvatar) sideAvatar.textContent = initials[0] || "A";
        if (sideName) sideName.textContent = safeName;
        if (sideRole) sideRole.textContent = admin.role || "Super Admin";

        const topAvatar = document.querySelector(".topbar-user-avatar");
        const topName = document.querySelector(".topbar-user-name");
        if (topAvatar) topAvatar.textContent = initials;
        if (topName) topName.textContent = safeName;

        const userDropdown = document.getElementById("userDropdownMenu");
        if (userDropdown) {
            const strongEl = userDropdown.querySelector("strong");
            if (strongEl) strongEl.textContent = safeEmail;
        }
    }
};

/**
 * Initialize the unified Admin Shell
 */
async function initAdminShell({ activePage = "dashboard", breadcrumbs = [] } = {}) {
    const isLogin = window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/admin/") || window.location.pathname.endsWith("/admin");
    const token = localStorage.getItem("thulirva_admin_token");

    // 1. Unauthenticated Gate: redirect missing token to admin login page
    if (!token) {
        if (!isLogin) {
            document.documentElement.classList.remove("auth-verifying");
            window.location.replace("index.html");
            return;
        }
    }

    // 2. Strict Server-Side Role Verification
    if (token) {
        try {
            const verifyRes = await fetch(getApiBaseUrl() + "/api/admin/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (verifyRes.status === 403) {
                // Customer or Delivery Partner account trying to access admin console
                localStorage.removeItem("thulirva_admin_token");
                localStorage.removeItem("thulirva_admin_user");
                localStorage.removeItem("admin");
                if (!isLogin) {
                    alert("Access Denied: Customer accounts are not authorized to access the Administrative Console.");
                    window.location.replace("../index.html");
                    return;
                }
            } else if (verifyRes.status === 401) {
                // Session expired or invalid token - redirect to admin login
                localStorage.removeItem("thulirva_admin_token");
                localStorage.removeItem("thulirva_admin_user");
                localStorage.removeItem("admin");
                if (!isLogin) {
                    window.location.replace("index.html");
                    return;
                }
            } else if (verifyRes.ok) {
                const data = await verifyRes.json();
                const role = (data.admin?.role || data.user?.role || "").toLowerCase();
                if (role !== "admin" && role !== "super_admin" && role !== "super admin") {
                    localStorage.removeItem("thulirva_admin_token");
                    localStorage.removeItem("thulirva_admin_user");
                    localStorage.removeItem("admin");
                    if (!isLogin) {
                        alert("Access Denied: Customer accounts are not permitted to access the Administrative Console.");
                        window.location.replace("../index.html");
                        return;
                    }
                } else {
                    const verifiedAdmin = {
                        id: data.admin?.id || data.user?.id || 1,
                        name: data.admin?.admin_name || data.admin?.name || data.user?.name || "Super Admin",
                        admin_name: data.admin?.admin_name || data.admin?.name || data.user?.name || "Super Admin",
                        email: data.admin?.email || data.user?.email || "admin@thulirva.com",
                        role: role === "super_admin" || role === "super admin" ? "Super Admin" : "Admin",
                        profile_photo: data.admin?.profile_photo || data.user?.profile_photo || ""
                    };
                    localStorage.setItem("thulirva_admin_user", JSON.stringify(verifiedAdmin));
                    localStorage.setItem("admin", JSON.stringify(verifiedAdmin));
                    window.admin = verifiedAdmin;
                }
            }
        } catch (netErr) {
            console.warn("Admin verification network warning:", netErr);
        }
    }

    // Unlock zero-flicker view
    document.documentElement.classList.remove("auth-verifying");

    const currentAdmin = window.getSafeAdmin();
    if (currentAdmin.role === "unauthorized" && !isLogin) {
        window.location.replace("../index.html");
        return;
    }

    const safeAdminName = currentAdmin.admin_name || currentAdmin.name || "Super Admin";
    const safeAdminEmail = currentAdmin.email || "admin@thulirva.com";
    const safeAdminRole = currentAdmin.role || "Super Admin";
    const safeInitials = safeAdminName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "AD";

    // 2. Build Sidebar
    const sidebarEl = document.querySelector(".sidebar") || document.getElementById("adminSidebar");
    if (sidebarEl) {
        const isCollapsed = localStorage.getItem("thulirva_sidebar_collapsed") === "true";
        if (isCollapsed) sidebarEl.classList.add("collapsed");

        let navHtml = `
            <div class="sidebar-header">
                <a href="dashboard.html" class="sidebar-logo-brand">
                    <img src="images/logo.jpg" alt="THULIRVA Emblem">
                    <div class="sidebar-logo-text">
                        <span class="brand-title">THULIRVA</span>
                        <span class="brand-sub">Enterprise Ops</span>
                    </div>
                </a>
                <button class="sidebar-toggle-btn" id="sidebarCollapseToggle" title="Collapse / Expand Sidebar">
                    ${isCollapsed ? getIcon("chevron-right") : getIcon("chevron-left")}
                </button>
            </div>
            <nav class="sidebar-nav">
        `;

        NAV_GROUPS.forEach(group => {
            navHtml += `<div class="nav-group-title">${group.title}</div><ul class="nav-items">`;
            group.items.forEach(item => {
                const isActive = item.key === activePage ? "active" : "";
                const badgeMarkup = item.badgeId ? `<span class="nav-badge" id="${item.badgeId}" style="display:none;">0</span>` : "";
                navHtml += `
                    <li>
                        <a href="${item.url}" class="nav-link ${isActive}" title="${item.label}">
                            ${getIcon(item.icon)}
                            <span class="nav-text">${item.label}</span>
                            ${badgeMarkup}
                        </a>
                    </li>
                `;
            });
            navHtml += `</ul>`;
        });

        navHtml += `
            </nav>
            <div class="sidebar-footer">
                <div class="sidebar-admin-avatar">${safeInitials[0] || 'A'}</div>
                <div class="sidebar-admin-info">
                    <div class="sidebar-admin-name">${safeAdminName}</div>
                    <div class="sidebar-admin-role">${safeAdminRole}</div>
                </div>
                <button class="sidebar-logout-btn" onclick="logoutAdmin()" title="Sign Out">
                    ${getIcon("log-out")}
                </button>
            </div>
        `;

        sidebarEl.innerHTML = navHtml;

        // Toggle Listener
        const toggleBtn = document.getElementById("sidebarCollapseToggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                const collapsed = sidebarEl.classList.toggle("collapsed");
                localStorage.setItem("thulirva_sidebar_collapsed", collapsed ? "true" : "false");
                toggleBtn.innerHTML = collapsed ? getIcon("chevron-right") : getIcon("chevron-left");
            });
        }
    }

    // 3. Build Top Navigation Bar
    const topbarEl = document.querySelector(".topbar") || document.getElementById("adminTopbar");
    if (topbarEl) {
        let breadcrumbsHtml = `<span class="breadcrumbs"><a href="dashboard.html">Admin</a>`;
        breadcrumbs.forEach((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            breadcrumbsHtml += `<span class="sep">/</span>`;
            if (isLast) {
                breadcrumbsHtml += `<span class="current">${b.label}</span>`;
            } else {
                breadcrumbsHtml += `<a href="${b.url || '#'}">${b.label}</a>`;
            }
        });
        breadcrumbsHtml += `</span>`;

        topbarEl.innerHTML = `
            <div class="topbar-left">
                <button class="mobile-menu-btn" id="mobileMenuToggle" title="Open Navigation Menu">
                    ${getIcon("menu")}
                </button>
                ${breadcrumbsHtml}
            </div>

            <div class="topbar-search">
                <span class="search-icon">${getIcon("search")}</span>
                <input type="text" id="globalSearchInput" placeholder="Search orders, customers, partners..." onclick="openGlobalSearchModal()">
                <span class="kbd-shortcut">Ctrl K</span>
            </div>

            <div class="topbar-right">
                <div class="system-status-pill" title="Operational on Port 5500">
                    <span class="pulse-dot"></span>
                    <span>Live Fleet GPS</span>
                </div>

                <div style="position:relative;">
                    <button class="topbar-btn" id="notifBellBtn" title="Notifications" onclick="toggleNotificationsMenu()">
                        ${getIcon("bell")}
                        <span class="badge-dot" id="notifBadgeDot"></span>
                    </button>
                    <div class="dropdown-menu" id="notifDropdownMenu" style="width: 320px;">
                        <div style="padding: 12px 16px; border-bottom: 1px solid var(--thulirva-border); display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: var(--thulirva-forest-deep); font-size: 13px;">Notifications</strong>
                            <a href="notifications.html" style="font-size: 11px; color: var(--thulirva-forest); font-weight: 700;">View All &rarr;</a>
                        </div>
                        <div id="quickNotifsList" style="max-height: 240px; overflow-y: auto; padding: 6px 0;">
                            <div style="padding: 16px; text-align: center; color: var(--thulirva-text-muted); font-size: 12px;">Loading recent alerts...</div>
                        </div>
                    </div>
                </div>

                <div style="position:relative;">
                    <div class="topbar-user" id="userMenuBtn" onclick="toggleUserDropdown()">
                        <div class="topbar-user-avatar">${safeInitials}</div>
                        <span class="topbar-user-name">${safeAdminName}</span>
                        ${getIcon("chevron-right")}
                    </div>
                    <div class="dropdown-menu" id="userDropdownMenu">
                        <div style="padding: 10px 16px; border-bottom: 1px solid var(--thulirva-border); font-size: 11.5px; color: var(--thulirva-text-muted);">
                            Signed in as<br><strong style="color: var(--thulirva-forest-deep);">${safeAdminEmail}</strong>
                        </div>
                        <a href="profile.html" class="dropdown-item">${getIcon("user-cog")} Admin Profile</a>
                        <a href="settings.html" class="dropdown-item">${getIcon("sliders")} Store Settings</a>
                        <a href="/" target="_blank" class="dropdown-item">${getIcon("arrow-up-right")} View Storefront</a>
                        <div class="dropdown-divider"></div>
                        <a href="javascript:void(0)" onclick="logoutAdmin()" class="dropdown-item" style="color:#CF1322;">
                            ${getIcon("log-out")} Sign Out
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Mobile drawer toggle & backdrop
        let backdropEl = document.querySelector(".sidebar-backdrop");
        if (!backdropEl) {
            backdropEl = document.createElement("div");
            backdropEl.className = "sidebar-backdrop";
            document.body.appendChild(backdropEl);
            backdropEl.addEventListener("click", () => {
                if (sidebarEl) sidebarEl.classList.remove("mobile-open");
                backdropEl.classList.remove("active");
            });
        }

        const mobBtn = document.getElementById("mobileMenuToggle");
        if (mobBtn && sidebarEl) {
            mobBtn.addEventListener("click", () => {
                const isOpen = sidebarEl.classList.toggle("mobile-open");
                if (isOpen) backdropEl.classList.add("active");
                else backdropEl.classList.remove("active");
            });
        }
    }

    // 4. Injected Toast Container
    if (!document.getElementById("toast-container")) {
        const toastBox = document.createElement("div");
        toastBox.id = "toast-container";
        document.body.appendChild(toastBox);
    }

    // 5. Global Hotkey for Search (Ctrl + K / Cmd + K)
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            openGlobalSearchModal();
        }
    });

    // 6. Close dropdowns on outside click
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#notifBellBtn") && !e.target.closest("#notifDropdownMenu")) {
            const notifMenu = document.getElementById("notifDropdownMenu");
            if (notifMenu) notifMenu.classList.remove("show");
        }
        if (!e.target.closest("#userMenuBtn") && !e.target.closest("#userDropdownMenu")) {
            const userMenu = document.getElementById("userDropdownMenu");
            if (userMenu) userMenu.classList.remove("show");
        }
        if (e.target.classList && (e.target.classList.contains("modal") || e.target.classList.contains("modal-overlay"))) {
            closeModal(e.target);
        }
    });

    // 7. Load Live Notification & Badge Counters
    loadShellBadges();

    // 8. Safely synchronize active Admin Profile
    window.AdminProfile.sync();
}

/**
 * Universal Modal Management Helpers
 */
window.openModal = function(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (el) {
        el.classList.add('active', 'show');
        el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(modalId) {
    if (!modalId) {
        document.querySelectorAll('.modal, .modal-overlay').forEach(m => {
            m.classList.remove('active', 'show');
            m.style.display = '';
        });
        document.body.style.overflow = '';
        return;
    }
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (el) {
        el.classList.remove('active', 'show');
        el.style.display = '';
        document.body.style.overflow = '';
    }
};

/**
 * Enterprise Empty State Renderer
 */
window.renderEmptyState = function(container, { icon, title, message, actionText, actionFn, actionUrl } = {}) {
    const target = typeof container === 'string' ? document.getElementById(container) : container;
    if (!target) return;
    
    const iconMarkup = icon || SVG_ICONS["package"] || "📦";
    const actionBtn = actionText ? (actionUrl ? 
        `<a href="${actionUrl}" class="btn btn-primary btn-sm">${actionText}</a>` :
        `<button class="btn btn-primary btn-sm" onclick="${actionFn}">${actionText}</button>`) : '';
        
    const html = `
        <div class="empty-state-card">
            <div class="empty-state-icon">${iconMarkup}</div>
            <h3 class="empty-state-title">${title || "No Records Found"}</h3>
            <p class="empty-state-desc">${message || "There are currently no items available in this view."}</p>
            ${actionBtn}
        </div>
    `;
    
    if (target.tagName === 'TBODY') {
        const colSpan = target.closest('table')?.querySelectorAll('thead th')?.length || 8;
        target.innerHTML = `<tr><td colspan="${colSpan}" style="padding:0; border:none;">${html}</td></tr>`;
    } else {
        target.innerHTML = html;
    }
};

/**
 * Enterprise Error State Renderer with Retry
 */
window.renderErrorState = function(container, { title, message, onRetry } = {}) {
    const target = typeof container === 'string' ? document.getElementById(container) : container;
    if (!target) return;

    const retryBtn = onRetry ? `<button class="btn btn-secondary btn-sm" onclick="${onRetry}">↻ Try Again</button>` : '';
    const html = `
        <div class="error-state-card">
            <div class="error-state-icon">⚠️</div>
            <h4 class="error-state-title">${title || "Unable to Load Data"}</h4>
            <p class="error-state-desc">${message || "An error occurred while connecting to the backend server. Please verify your connection or retry."}</p>
            ${retryBtn}
        </div>
    `;

    if (target.tagName === 'TBODY') {
        const colSpan = target.closest('table')?.querySelectorAll('thead th')?.length || 8;
        target.innerHTML = `<tr><td colspan="${colSpan}" style="padding:0; border:none;">${html}</td></tr>`;
    } else {
        target.innerHTML = html;
    }
};

/**
 * Safe HTML error extractor to prevent "Unexpected token '<'"
 */
function extractHtmlError(htmlText, status, statusText) {
    if (!htmlText || typeof htmlText !== "string") {
        return `Server returned HTTP ${status} (${statusText || "Error"})`;
    }
    const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        return `Server returned HTTP ${status}: ${titleMatch[1].trim()}`;
    }
    const h1Match = htmlText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1]) {
        return `Server returned HTTP ${status}: ${h1Match[1].trim()}`;
    }
    if (status === 502) return "Backend service temporarily unavailable (502 Bad Gateway). Please retry shortly.";
    if (status === 504) return "Backend gateway timed out (HTTP 504). Please retry shortly.";
    if (status === 404) return `API endpoint not found (HTTP 404).`;
    return `Server returned HTTP ${status} (${statusText || "Unexpected response"}).`;
}

/**
 * Universal safe response wrapper that intercepts HTML error pages
 */
function wrapSafeResponse(res) {
    const originalJson = res.json.bind(res);
    res.json = async function() {
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (!ct.includes("application/json")) {
            const rawText = await res.text();
            const msg = extractHtmlError(rawText, res.status, res.statusText);
            const err = new Error(msg);
            err.status = res.status;
            err.isHtml = true;
            err.rawText = rawText;
            throw err;
        }
        return await originalJson();
    };
    return res;
}

/**
 * Global fetch wrapper: Automatically protects all direct fetch calls
 * from throwing SyntaxError: Unexpected token '<' when receiving HTML.
 */
if (typeof window !== "undefined" && window.fetch && !window._thulirvaFetchWrapped) {
    const _nativeFetch = window.fetch;
    window._thulirvaFetchWrapped = true;
    window.fetch = async function(...args) {
        const res = await _nativeFetch.apply(this, args);
        return wrapSafeResponse(res);
    };
}

/**
 * Centralized Authorized Fetch Client
 */
window.apiFetch = async function(url, options = {}) {
    const token = localStorage.getItem("thulirva_admin_token");
    const headers = Object.assign({
        "Content-Type": "application/json"
    }, options.headers || {});
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, Object.assign({}, options, { headers }));
        if (res.status === 401 && !window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("/admin/")) {
            localStorage.removeItem("thulirva_admin_token");
            window.location.href = "index.html";
            return null;
        }
        return wrapSafeResponse(res);
    } catch (err) {
        console.error("apiFetch network failure:", err);
        throw err;
    }
};

/**
 * Direct JSON fetch helper that returns parsed data directly
 */
window.apiFetchJson = async function(url, options = {}) {
    const res = await window.apiFetch(url, options);
    if (!res) return null;
    return await res.json();
};

/**
 * Toast Notifications Manager with Automatic Deduplication
 */
const _toastDedupeCache = new Map();

function showToast(message, type = "success") {
    if (!message) return;
    const msgStr = typeof message === "string" ? message : (message.message || JSON.stringify(message));
    const normalizedType = type === "danger" ? "error" : type;
    const dedupeKey = `${normalizedType}::${msgStr.trim()}`;
    const now = Date.now();

    // Prevent duplicate toast within 2500ms
    if (_toastDedupeCache.has(dedupeKey) && (now - _toastDedupeCache.get(dedupeKey) < 2500)) {
        return;
    }
    _toastDedupeCache.set(dedupeKey, now);

    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-msg ${normalizedType}`;
    
    let iconSvg = '';
    if (normalizedType === "success") iconSvg = '<span style="color:#1E6F43; font-weight:800;">✓</span>';
    else if (normalizedType === "error") iconSvg = '<span style="color:#B91C1C; font-weight:800;">✕</span>';
    else iconSvg = '<span style="color:#0D5C75; font-weight:800;">ℹ</span>';

    toast.innerHTML = `
        ${iconSvg}
        <div style="flex:1; line-height:1.35;">${msgStr}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.25s, transform 0.25s";
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 250);
    }, 3800);
}

function toggleNotificationsMenu() {
    const menu = document.getElementById("notifDropdownMenu");
    if (menu) menu.classList.toggle("show");
}

function toggleUserDropdown() {
    const menu = document.getElementById("userDropdownMenu");
    if (menu) menu.classList.toggle("show");
}

function logoutAdmin() {
    if (confirm("Are you sure you want to sign out of the THULIRVA Admin Console?")) {
        localStorage.removeItem("thulirva_admin_token");
        localStorage.removeItem("thulirva_admin_user");
        localStorage.removeItem("admin");
        window.location.href = "index.html";
    }
}

/**
 * Global Search Modal
 */
function openGlobalSearchModal() {
    let modal = document.getElementById("globalSearchModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "globalSearchModal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 580px;">
                <div class="modal-header" style="background:#FAF8F2;">
                    <div style="display:flex; align-items:center; gap:8px; width:100%;">
                        <span style="color:var(--thulirva-forest);">${getIcon("search")}</span>
                        <input type="text" id="omniSearchInput" placeholder="Type order number, customer name, partner ID, or phone..." style="flex:1; border:none; background:transparent; font-size:15px; font-weight:600; outline:none; color:var(--thulirva-forest-deep);" onkeyup="executeOmniSearch(this.value)">
                    </div>
                    <button class="modal-close-btn" onclick="closeGlobalSearchModal()">✕</button>
                </div>
                <div class="modal-body" id="omniSearchResults" style="padding:16px 20px; max-height:360px; overflow-y:auto;">
                    <div style="color:var(--thulirva-text-muted); font-size:12.5px; text-align:center; padding:20px;">Quickly jump to any record. Try searching "Padur", "THU-", or an order ID.</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeGlobalSearchModal();
        });
    }
    modal.classList.add("active");
    const input = document.getElementById("omniSearchInput");
    if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 100);
    }
}

function closeGlobalSearchModal() {
    const modal = document.getElementById("globalSearchModal");
    if (modal) modal.classList.remove("active");
}

async function executeOmniSearch(query) {
    const resultsBox = document.getElementById("omniSearchResults");
    if (!resultsBox) return;
    const q = query.trim().toLowerCase();
    if (!q) {
        resultsBox.innerHTML = `<div style="color:var(--thulirva-text-muted); font-size:12.5px; text-align:center; padding:20px;">Type a keyword to search across orders, partners, and customers.</div>`;
        return;
    }

    let extraJumps = '';
    if ('announcements'.includes(q) || 'banners'.includes(q)) {
        extraJumps += `<a href="announcements.html" class="dropdown-item" style="border-radius:6px; background:#E8F5E9; color:#1B4332; font-weight:700;">${getIcon("megaphone")} Jump to Announcement Management</a>`;
    }
    if ('qr'.includes(q) || 'payment'.includes(q) || 'upi'.includes(q)) {
        extraJumps += `<a href="qr-management.html" class="dropdown-item" style="border-radius:6px; background:#E8F5E9; color:#1B4332; font-weight:700;">${getIcon("qr-code")} Jump to QR Code Management</a>`;
    }
    if ('delivery'.includes(q) || 'charge'.includes(q) || 'fee'.includes(q) || 'rate'.includes(q)) {
        extraJumps += `<a href="delivery-charges.html" class="dropdown-item" style="border-radius:6px; background:#E8F5E9; color:#1B4332; font-weight:700;">${getIcon("truck")} Jump to Delivery Charge Management</a>`;
    }

    resultsBox.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:6px;">
            ${extraJumps}
            <a href="orders.html" class="dropdown-item" style="border-radius:6px; background:#FAF7F0;">
                ${getIcon("shopping-bag")} Search Orders for "<strong>${q}</strong>"
            </a>
            <a href="customers.html" class="dropdown-item" style="border-radius:6px; background:#FAF7F0;">
                ${getIcon("users")} Search Customers for "<strong>${q}</strong>"
            </a>
            <a href="delivery-partners.html" class="dropdown-item" style="border-radius:6px; background:#FAF7F0;">
                ${getIcon("truck")} Search Delivery Fleet for "<strong>${q}</strong>"
            </a>
            <a href="products.html" class="dropdown-item" style="border-radius:6px; background:#FAF7F0;">
                ${getIcon("package")} Search Catalog for "<strong>${q}</strong>"
            </a>
        </div>
    `;
}

/**
 * Fetch and update dynamic badges in the sidebar
 */
async function loadShellBadges() {
    const token = localStorage.getItem("thulirva_admin_token");
    if (!token) return;

    try {
        // 1. Pending Orders
        const ordRes = await fetch("/api/v1/orders?status=pending", {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        if (ordRes && ordRes.ok) {
            const data = await ordRes.json();
            const badge = document.getElementById("badge-orders");
            if (badge && data.total > 0) {
                badge.textContent = data.total;
                badge.style.display = "inline-block";
            }
        }

        // 2. Pending KYC
        const kycRes = await fetch("/api/v1/kyc/admin/pending", {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        if (kycRes && kycRes.ok) {
            const data = await kycRes.json();
            const badge = document.getElementById("badge-kyc");
            if (badge && data.count > 0) {
                badge.textContent = data.count;
                badge.style.display = "inline-block";
            }
        }

        // 3. Pending Withdrawals
        const wdrRes = await fetch("/api/v1/withdrawals/admin/all?status=pending", {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        if (wdrRes && wdrRes.ok) {
            const data = await wdrRes.json();
            const badge = document.getElementById("badge-withdrawals");
            if (badge && data.total > 0) {
                badge.textContent = data.total;
                badge.style.display = "inline-block";
            }
        }
    } catch (_) {}
}

