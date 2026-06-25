import axios from 'axios'

export default class WhatsApp {
    static async send(target, message) {
        if (!process.env.FONNTE_TOKEN) {
            console.warn('FONNTE_TOKEN tidak diatur. Notifikasi WA dinonaktifkan.')
            return false
        }

        try {
            const response = await axios.post('https://api.fonnte.com/send', {
                target: target,
                message: message,
                countryCode: '62'
            }, {
                headers: {
                    Authorization: process.env.FONNTE_TOKEN
                }
            })

            return response.data.status
        } catch (error) {
            console.error('Gagal mengirim WhatsApp:', error.message)
            return false
        }
    }
}
