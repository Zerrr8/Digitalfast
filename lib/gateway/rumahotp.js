import axios from 'axios'
import QRCode from 'qrcode'

export default class RumahOTP {
    constructor(options = {}) {
        this.options = options
    }

    createPayment = async (amount, method = 'qris', customOptions) => {
        try {
            // Using v2 for more robust metadata according to new docs
            const json = await axios.get(`https://www.rumahotp.io/api/v2/deposit/create?amount=${amount}&payment_id=${method}`, {
                headers: {
                    'x-apikey': process.env.RUMAHOTP_API_KEY,
                    'Accept': 'application/json'
                }
            })

            console.log('RumahOTP API Response:', json.data)

            if (!json.data || !json.data.success) {
                throw new Error(json.data?.message || json.data?.msg || 'Gagal membuat pembayaran via RumahOTP')
            }

            let finalQrImage = null

            // Always prefer generating QR from qr_string for a reliable base64 data URL
            if (json.data.data.qr_string && method === 'qris') {
                finalQrImage = await QRCode.toDataURL(json.data.data.qr_string, {
                    width: 300,
                    margin: 2
                })
            } else if (json.data.data.qr_image) {
                // Fallback to qr_image URL if qr_string is not available or if it's a crypto address
                finalQrImage = json.data.data.qr_image
            }

            if (!finalQrImage) {
                throw new Error('QR code tidak tersedia dari payment gateway')
            }

            return {
                status: true,
                data: {
                    merchant_ref: json.data.data.id,
                    reference: json.data.data.id,
                    qr_image: finalQrImage
                }
            }
        } catch (e) {
            return {
                status: false,
                msg: e.response?.data?.message || e.message
            }
        }
    }

    checkPayment = async (receipt) => {
        try {
            const json = await axios.get(`https://www.rumahotp.io/api/v2/deposit/get_status?deposit_id=${receipt}`, {
                headers: {
                    'x-apikey': process.env.RUMAHOTP_API_KEY,
                    'Accept': 'application/json'
                }
            })

            if (!json.data || !json.data.success) {
                throw new Error(json.data?.message || 'Gagal memeriksa pembayaran via RumahOTP')
            }

            // Map the status back for the payment check logic
            return {
                status: true,
                data: {
                    status: json.data.data.status.toUpperCase() // SUCCESS, PENDING, CANCEL
                }
            }
        } catch (e) {
            return {
                status: false,
                msg: e.response?.data?.message || e.message
            }
        }
    }

    cancelPayment = async (receipt) => {
        try {
            const json = await axios.get(`https://www.rumahotp.io/api/v1/deposit/cancel?deposit_id=${receipt}`, {
                headers: {
                    'x-apikey': process.env.RUMAHOTP_API_KEY,
                    'Accept': 'application/json'
                }
            })

            if (!json.data || !json.data.success) {
                throw new Error(json.data?.message || 'Gagal membatalkan pembayaran via RumahOTP')
            }

            return {
                status: true,
                msg: 'Pembayaran berhasil dibatalkan.'
            }
        } catch (e) {
            return {
                status: false,
                msg: e.response?.data?.message || e.message
            }
        }
    }
}
