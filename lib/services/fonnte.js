/**
 * Fonnte WhatsApp Service
 * Sends OTP codes and purchase notifications via WhatsApp
 */

const BASE_URL = process.env.FONNTE_BASE_URL || 'https://api.fonnte.com'
const TOKEN = process.env.FONNTE_TOKEN

export default {
    /**
     * Send OTP code via WhatsApp
     * @param {string} phone - Phone number (e.g. 6281xxx)
     * @param {string} code - OTP code
     */
    async sendOTP(phone, code) {
        try {
            const message = `🔐 *Verifikasi Akun ${process.env.WEB_NAME || 'Digital Fast'}*\n\nKode OTP Anda: *${code}*\n\n⚠️ Jangan bagikan kode ini kepada siapapun.\n⏰ Kode berlaku selama 30 menit.\n\n~ ${process.env.WEB_NAME || 'Digital Fast'} ~`

            const res = await fetch(`${BASE_URL}/send`, {
                method: 'POST',
                headers: { 'Authorization': TOKEN },
                body: new URLSearchParams({ target: phone, message })
            })
            const data = await res.json()

            if (data.status) {
                console.log(`[Fonnte] OTP sent to ${phone}`)
                return { status: true, msg: 'OTP terkirim' }
            } else {
                console.error(`[Fonnte] Failed: ${data.reason}`)
                return { status: false, msg: data.reason || 'Gagal mengirim OTP' }
            }
        } catch (e) {
            console.error('[Fonnte] Error:', e.message)
            return { status: false, msg: 'Gagal mengirim OTP via WhatsApp' }
        }
    },

    /**
     * Send purchase notification to owner
     * @param {object} data - { productName, amount, buyerEmail, invoiceId }
     */
    async sendPurchaseNotification(data) {
        try {
            if (process.env.NOTIFY_PURCHASE_WA !== 'on') return
            const ownerPhone = process.env.OWNER_PHONE
            if (!ownerPhone) return

            const message = `🛒 *Pembelian Baru!*\n\n📦 Produk: ${data.productName}\n💰 Total: Rp ${Number(data.amount).toLocaleString('id-ID')}\n👤 Pembeli: ${data.buyerEmail}\n🆔 Invoice: ${data.invoiceId}\n\n~ ${process.env.WEB_NAME || 'Digital Fast'} Dashboard ~`

            const res = await fetch(`${BASE_URL}/send`, {
                method: 'POST',
                headers: { 'Authorization': TOKEN },
                body: new URLSearchParams({ target: ownerPhone, message })
            })
            const result = await res.json()
            if (result.status) {
                console.log(`[Fonnte] Purchase notification sent to owner`)
            }
        } catch (e) {
            console.error('[Fonnte] Notification error:', e.message)
        }
    },

    /**
     * Send password reset OTP
     * @param {string} phone 
     * @param {string} code 
     */
    async sendResetOTP(phone, code) {
        try {
            const message = `🔑 *Reset Password - ${process.env.WEB_NAME || 'Digital Fast'}*\n\nKode verifikasi: *${code}*\n\n⚠️ Jangan bagikan kode ini.\n⏰ Berlaku 30 menit.\n\n~ ${process.env.WEB_NAME || 'Digital Fast'} ~`

            const res = await fetch(`${BASE_URL}/send`, {
                method: 'POST',
                headers: { 'Authorization': TOKEN },
                body: new URLSearchParams({ target: phone, message })
            })
            const data = await res.json()
            return { status: !!data.status, msg: data.status ? 'OTP terkirim' : (data.reason || 'Gagal') }
        } catch (e) {
            return { status: false, msg: 'Gagal mengirim OTP' }
        }
    }
}
