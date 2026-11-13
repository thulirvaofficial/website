/**
 * THULIRVA Universal Client-Side Form Validators
 * Enforces Phase 3 specifications consistently across websites
 */

const ThulirvaValidators = {
    validatePhone(phone) {
        if (!phone || typeof phone !== 'string') return { valid: false, message: 'Mobile number is required' };
        const raw = phone.trim();
        if (/[a-zA-Z]/.test(raw)) return { valid: false, message: 'Mobile number must contain digits only' };
        let digits = raw.replace(/[\s\-\(\)\+]/g, '');
        if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
        else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

        if (digits.length !== 10) return { valid: false, message: 'Mobile number must be exactly 10 digits' };
        if (!/^[6-9]\d{9}$/.test(digits)) return { valid: false, message: 'Mobile number must start with 6, 7, 8, or 9' };
        return { valid: true, cleanPhone: digits };
    },

    validateEmail(email) {
        if (!email || typeof email !== 'string') return { valid: false, message: 'Email address is required' };
        const clean = email.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!emailRegex.test(clean)) return { valid: false, message: 'Please enter a valid email address (e.g. name@example.com)' };
        return { valid: true, cleanEmail: clean };
    },

    validatePassword(password) {
        if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required' };
        const missing = [];
        if (password.length < 8) missing.push('At least 8 characters');
        if (password.length > 64) missing.push('Maximum 64 characters');
        if (!/[A-Z]/.test(password)) missing.push('At least one uppercase letter (A-Z)');
        if (!/[a-z]/.test(password)) missing.push('At least one lowercase letter (a-z)');
        if (!/[0-9]/.test(password)) missing.push('At least one number (0-9)');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) missing.push('At least one special character (!@#$%^&*)');
        if (/\s/.test(password)) missing.push('No spaces allowed');

        if (missing.length > 0) {
            return {
                valid: false,
                message: `Password requires: ${missing.join(', ')}`,
                missingRequirements: missing
            };
        }
        return { valid: true };
    },

    getPasswordStrength(password) {
        if (!password) return { score: 0, label: 'Empty', color: '#ccc' };
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
        if (!/\s/.test(password)) score++;

        if (score <= 2) return { score, label: 'Weak', color: '#e74c3c' };
        if (score <= 4) return { score, label: 'Fair', color: '#f39c12' };
        if (score <= 6) return { score, label: 'Good', color: '#27ae60' };
        return { score, label: 'Strong', color: '#173F2D' };
    },

    validateName(name) {
        if (!name || typeof name !== 'string') return { valid: false, message: 'Name is required' };
        const clean = name.trim();
        if (clean.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
        if (clean.length > 60) return { valid: false, message: 'Name cannot exceed 60 characters' };
        if (!/[a-zA-Z\u0B80-\u0BFF]/.test(clean)) return { valid: false, message: 'Name must contain letters' };
        return { valid: true, cleanName: clean };
    },

    validatePincode(pincode) {
        if (!pincode) return { valid: false, message: 'PIN code is required' };
        const str = pincode.toString().trim();
        if (!/^[1-9]\d{5}$/.test(str)) return { valid: false, message: 'PIN code must be exactly 6 digits and not start with 0' };
        return { valid: true, cleanPincode: str };
    },

    validateAddress(address) {
        if (!address || typeof address !== 'string' || address.trim().length < 5) {
            return { valid: false, message: 'Address must be at least 5 characters long' };
        }
        return { valid: true, cleanAddress: address.trim() };
    },

    validateUtr(utr) {
        if (!utr || typeof utr !== 'string') return { valid: false, message: 'UTR / Transaction Reference is required' };
        const clean = utr.trim();
        if (clean.length < 6 || clean.length > 35) return { valid: false, message: 'UTR must be between 6 and 35 alphanumeric characters' };
        return { valid: true, cleanUtr: clean };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThulirvaValidators;
}

