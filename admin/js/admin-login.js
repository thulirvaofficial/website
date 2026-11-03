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
                data.user.role === "admin"
            ) {

                localStorage.setItem(
                    "thulirva_admin_token",
                    data.token
                );

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
