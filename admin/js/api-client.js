/**
 * THULIRVA Enterprise API Client
 * Centralized HTTP service with robust error handling, HTML response interception,
 * token injection, intelligent base URL resolution, and unified error notifications.
 *
 * Prevents "Unexpected token '<'" by verifying Content-Type and HTTP status before JSON parsing.
 */

(function (global) {
    "use strict";

    class ThulirvaApiClient {
        constructor() {
            this.tokenKey = "thulirva_admin_token";
            this.fallbackTokenKey = "token";
            this.timeoutMs = 25000;
        }

        /**
         * Resolve the active API base URL.
         * In production (thulirva.com), relative /api path is used for seamless reverse proxying.
         */
        getBaseUrl() {
            if (global.THULIRVA_API_BASE) {
                return global.THULIRVA_API_BASE.replace(/\/+$/, "");
            }

            // If accessed via file:// protocol in testing, point to local backend
            if (global.location && global.location.protocol === "file:") {
                return "http://localhost:5500";
            }

            // If accessed via localhost on another port (e.g. Live Server on 5501 or 3000), point to 5500
            if (global.location && (global.location.hostname === "localhost" || global.location.hostname === "127.0.0.1")) {
                if (global.location.port !== "5500") {
                    return "http://" + global.location.hostname + ":5500";
                }
            }

            // Default to same-origin relative path (production Nginx proxy handles /api)
            return "";
        }

        /**
         * Retrieve the active authentication token.
         */
        getToken() {
            try {
                return localStorage.getItem(this.tokenKey) || localStorage.getItem(this.fallbackTokenKey) || null;
            } catch (e) {
                return null;
            }
        }

        /**
         * Set the active authentication token.
         */
        setToken(token) {
            try {
                if (token) {
                    localStorage.setItem(this.tokenKey, token);
                    localStorage.setItem(this.fallbackTokenKey, token);
                } else {
                    localStorage.removeItem(this.tokenKey);
                    localStorage.removeItem(this.fallbackTokenKey);
                }
            } catch (e) {}
        }

        /**
         * Clean up session and redirect to login on 401 Unauthorized.
         */
        handleUnauthorized() {
            this.setToken(null);
            this.showToast("Your session has expired. Please sign in again.", "warning");

            if (global.location) {
                const path = global.location.pathname || "";
                if (!path.endsWith("index.html") && !path.endsWith("/admin/") && !path.endsWith("/admin")) {
                    setTimeout(() => {
                        global.location.href = "index.html";
                    }, 1400);
                }
            }
        }

        /**
         * Extract a readable error message from HTML response bodies.
         */
        extractHtmlError(htmlText, status, statusText) {
            if (!htmlText || typeof htmlText !== "string") {
                return `Server returned HTTP ${status} (${statusText || "Error"})`;
            }

            // Extract <title>...</title> if present
            const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
                const title = titleMatch[1].trim();
                return `Server returned HTTP ${status}: ${title}`;
            }

            // Extract <h1>...</h1> if present
            const h1Match = htmlText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            if (h1Match && h1Match[1]) {
                const h1 = h1Match[1].trim();
                return `Server returned HTTP ${status}: ${h1}`;
            }

            if (status === 502) {
                return "Backend service temporarily unavailable (502 Bad Gateway). Please try again shortly.";
            }
            if (status === 504) {
                return "Backend request timed out (504 Gateway Timeout). Please try again shortly.";
            }
            if (status === 404) {
                return `API endpoint not found (HTTP 404).`;
            }

            return `Server returned HTTP ${status} (${statusText || "Unexpected response"}).`;
        }

        /**
         * Core request dispatcher with comprehensive status and content-type checking.
         */
        async request(endpoint, options = {}) {
            const baseUrl = this.getBaseUrl();
            let fullUrl = endpoint.startsWith("http://") || endpoint.startsWith("https://")
                ? endpoint
                : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

            const headers = Object.assign({}, options.headers || {});

            // Auto-inject Authorization header if not skipped
            if (!options.skipAuth) {
                const token = this.getToken();
                if (token && !headers["Authorization"] && !headers["authorization"]) {
                    headers["Authorization"] = `Bearer ${token}`;
                }
            }

            // Default JSON header unless FormData is used
            const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
            if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
                if (options.method && options.method.toUpperCase() !== "GET" && options.method.toUpperCase() !== "HEAD") {
                    headers["Content-Type"] = "application/json";
                }
            }

            // Timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || this.timeoutMs);

            try {
                const fetchOptions = {
                    ...options,
                    headers,
                    signal: controller.signal
                };

                const response = await fetch(fullUrl, fetchOptions);
                clearTimeout(timeoutId);

                // Handle 401 Unauthorized
                if (response.status === 401 && !options.skipAuthRedirect) {
                    this.handleUnauthorized();
                    const err = new Error("Session expired. Please sign in again.");
                    err.status = 401;
                    throw err;
                }

                // Verify Content-Type before parsing JSON
                const contentType = (response.headers.get("content-type") || "").toLowerCase();

                if (!contentType.includes("application/json")) {
                    const rawText = await response.text();
                    const descriptiveError = this.extractHtmlError(rawText, response.status, response.statusText);
                    const err = new Error(descriptiveError);
                    err.status = response.status;
                    err.rawText = rawText;
                    err.isHtml = rawText.includes("<") && rawText.includes(">");
                    throw err;
                }

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data.message || data.error || `Request failed with HTTP status ${response.status}`;
                    const err = new Error(errorMsg);
                    err.status = response.status;
                    err.data = data;
                    throw err;
                }

                return data;
            } catch (err) {
                clearTimeout(timeoutId);
                if (err.name === "AbortError") {
                    const timeoutErr = new Error("Network request timed out. Please check your connection and try again.");
                    timeoutErr.isTimeout = true;
                    throw timeoutErr;
                }
                throw err;
            }
        }

        // HTTP Method shortcuts
        get(endpoint, options = {}) {
            return this.request(endpoint, { ...options, method: "GET" });
        }

        post(endpoint, body = {}, options = {}) {
            const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
            return this.request(endpoint, {
                ...options,
                method: "POST",
                body: isFormData ? body : JSON.stringify(body)
            });
        }

        put(endpoint, body = {}, options = {}) {
            const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
            return this.request(endpoint, {
                ...options,
                method: "PUT",
                body: isFormData ? body : JSON.stringify(body)
            });
        }

        patch(endpoint, body = {}, options = {}) {
            const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
            return this.request(endpoint, {
                ...options,
                method: "PATCH",
                body: isFormData ? body : JSON.stringify(body)
            });
        }

        delete(endpoint, options = {}) {
            return this.request(endpoint, { ...options, method: "DELETE" });
        }

        upload(endpoint, formData, options = {}) {
            return this.request(endpoint, {
                ...options,
                method: "POST",
                body: formData
            });
        }

        /**
         * User-friendly toast notifications with deduplication
         */
        showToast(message, type = "info") {
            if (!message) return;
            if (typeof global.showToast === "function" && global.showToast !== this.showToast) {
                try {
                    global.showToast(message, type);
                    return;
                } catch (_) {}
            }

            const msgText = typeof message === "string" ? message : (message.message || JSON.stringify(message));
            const dedupeKey = `${type}::${msgText.trim()}`;
            const now = Date.now();
            if (this._lastToastKey === dedupeKey && (now - (this._lastToastTime || 0) < 2500)) {
                return;
            }
            this._lastToastKey = dedupeKey;
            this._lastToastTime = now;

            let toastEl = document.getElementById("adminToast") || document.getElementById("toast");
            if (!toastEl) {
                toastEl = document.createElement("div");
                toastEl.id = "adminToast";
                toastEl.style.cssText = `
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #fff;
                    z-index: 99999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    opacity: 0;
                    transform: translateY(10px);
                    max-width: 380px;
                    line-height: 1.4;
                    pointer-events: none;
                `;
                document.body.appendChild(toastEl);
            }

            const colors = {
                success: "#2e7d32",
                danger: "#d32f2f",
                error: "#d32f2f",
                warning: "#ed6c02",
                info: "#1b4d3e"
            };

            toastEl.style.backgroundColor = colors[type] || colors.info;
            toastEl.textContent = message;
            toastEl.style.opacity = "1";
            toastEl.style.transform = "translateY(0)";

            clearTimeout(this._toastTimer);
            this._toastTimer = setTimeout(() => {
                toastEl.style.opacity = "0";
                toastEl.style.transform = "translateY(10px)";
            }, 4000);
        }
    }

    const instance = new ThulirvaApiClient();

    // Export globally
    global.ThulirvaApiClient = ThulirvaApiClient;
    global.ApiClient = instance;
    global.apiClient = instance;

    // Expose convenient apiFetch wrapper that replaces raw fetch with safe json parsing
    global.apiFetch = async function (endpoint, options = {}) {
        return instance.request(endpoint, options);
    };

})(typeof window !== "undefined" ? window : globalThis);

