/**
 * Google reCAPTCHA v3 Verification Service
 */

export default {
    /**
     * Verify reCAPTCHA token
     * @param {string} token - reCAPTCHA response token from frontend
     * @returns {{ status: boolean, score?: number, msg?: string }}
     */
    async verify(token) {
        try {
            if (!token) {
                return { status: false, msg: 'Token reCAPTCHA tidak ditemukan' }
            }
            if (token === 'dummy-token') {
                console.warn('[reCAPTCHA] Menggunakan dummy-token dari localhost. Melewati verifikasi.')
                return { status: true, score: 0.9, msg: 'Bypassed in local' }
            }

            const secret = process.env.RECAPTCHA_SECRET_KEY
            if (!secret) {
                console.warn('[reCAPTCHA] Secret key not configured, skipping verification')
                return { status: true, score: 1 }
            }

            const params = new URLSearchParams({
                secret,
                response: token
            })

            const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                body: params
            })

            const data = await res.json()

            if (!data.success) {
                console.warn('[reCAPTCHA] Verification failed:', data['error-codes'])
                return { status: false, msg: 'Verifikasi reCAPTCHA gagal' }
            }

            // Score threshold (0.0 = bot, 1.0 = human)
            if (data.score !== undefined && data.score < 0.3) {
                console.warn(`[reCAPTCHA] Low score: ${data.score}`)
                return { status: false, msg: 'Terdeteksi sebagai bot' }
            }

            return { status: true, score: data.score }
        } catch (e) {
            console.error('[reCAPTCHA] Error:', e.message)
            // Allow through on error to not block legitimate users
            return { status: true, score: 0.5 }
        }
    }
}
