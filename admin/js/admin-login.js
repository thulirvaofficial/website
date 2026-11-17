const form =
    document.getElementById(
        "adminLoginForm"
    );


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            document.getElementById(
                "email"
            ).value;

        const password =
            document.getElementById(
                "password"
            ).value;

        const message =
            document.getElementById(
                "loginMessage"
            );


        try {

            const response =
                await fetch(
                    "/api/auth/login",
                    {

                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email,
                                password
                            })

                    }
                );


            const data =
                await response.json();


            if (
                data.success &&
                (data.user?.role === "admin" || data.admin?.role === "admin" || data.user?.role === "Super Admin")
            ) {

                localStorage.setItem(
                    "thulirva_admin_token",
                    data.token
                );

                const adminData = {
                    id: data.admin?.id || data.user?.id || 1,
                    name: data.admin?.admin_name || data.admin?.name || data.user?.name || "Super Admin",
                    admin_name: data.admin?.admin_name || data.admin?.name || data.user?.name || "Super Admin",
                    email: data.admin?.email || data.user?.email || email || "admin@thulirva.com",
                    role: data.admin?.role || data.user?.role || "Super Admin",
                    profile_photo: data.admin?.profile_photo || data.user?.profile_photo || ""
                };

                localStorage.setItem("thulirva_admin_user", JSON.stringify(adminData));
                localStorage.setItem("admin", JSON.stringify(adminData));

                window.location.href =
                    "/admin/dashboard.html";

            } else {

                message.textContent =
                    "Admin access denied.";

                message.style.color =
                    "red";

            }

        } catch (error) {

            message.textContent =
                "Server connection failed.";

            message.style.color =
                "red";

        }

    }
);
