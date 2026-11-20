const form = document.getElementById("adminLoginForm");

if (form) {
    // Clear any remembered or autofilled credentials
    try {
        localStorage.removeItem("thulirva_remembered_email");
    } catch (_) {}

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    admin_login: true,
                    is_admin_portal: true
                })
            });

            const data = await response.json();
            const role = (data.user?.role || data.admin?.role || "").toLowerCase();
            const isAdmin = role === "admin" || role === "super_admin" || role === "super admin";

            if (data.success && isAdmin) {
                localStorage.setItem("thulirva_admin_token", data.token);

                const adminData = {
                    id: data.admin?.id || data.user?.id || 1,
                    name: data.admin?.admin_name || data.admin?.name || data.user?.name || "Super Admin",
                    admin_name: data.admin?.admin_name || data.admin?.name || data.user?.name || "Super Admin",
                    email: data.admin?.email || data.user?.email || email || "admin@thulirva.com",
                    role: role === "super_admin" ? "Super Admin" : "Admin",
                    profile_photo: data.admin?.profile_photo || data.user?.profile_photo || ""
                };

                localStorage.setItem("thulirva_admin_user", JSON.stringify(adminData));
                localStorage.setItem("admin", JSON.stringify(adminData));
                window.location.href = "/admin/dashboard.html";
            } else {
                if (passwordInput) passwordInput.value = "";
                if (message) {
                    message.textContent = data.message || "Admin access denied.";
                    message.style.color = "red";
                }
            }
        } catch (error) {
            if (message) {
                message.textContent = "Server connection failed.";
                message.style.color = "red";
            }
        }
    });
}
