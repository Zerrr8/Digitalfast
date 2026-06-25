import axios from 'axios'

export const sendTelegramAlert = async (message) => {
    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
        const TELEGRAM_OWNER_ID = process.env.TELEGRAM_OWNER_ID

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_OWNER_ID) {
            console.warn('TELEGRAM_BOT_TOKEN atau TELEGRAM_OWNER_ID tidak diatur.')
            return
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
        await axios.post(url, {
            chat_id: TELEGRAM_OWNER_ID,
            text: `🔔 *SYSTEM ALERT*\n\n${message}`,
            parse_mode: 'Markdown'
        })
    } catch (e) {
        console.error('Gagal mengirim notifikasi Telegram:', e.response?.data || e.message)
    }
}
