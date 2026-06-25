/**
 * OTP Service
 * Generates, stores, and verifies OTP codes using Redis
 */
import RedisDB from '../system/redis.js'
import Fonnte from './fonnte.js'
import nodemailer from 'nodemailer'

const OTP_TTL = 1800 // 30 minutes in seconds
const OTP_LENGTH = 6

/**
 * Generate a random numeric OTP
 */
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export default {
    /**
     * Generate and send OTP
     * @param {string} identifier - email or phone
     * @param {string} method - 'wa' or 'email'
     * @param {string} type - 'register' | 'reset' | 'verify'
     */
    async send(identifier, method, type = 'register') {
        try {
            const otpKey = `otp:${type}:${identifier}`
            const rateLimitKey = `otp:ratelimit:${identifier}`

            // Rate limit: max 1 OTP per 60 seconds
            const existing = await RedisDB.client.get(rateLimitKey)
            if (existing) {
                // Don't generate a new code, don't overwrite! Just tell user to wait.
                return { status: false, msg: 'Tunggu 60 detik sebelum meminta OTP baru' }
            }

            const code = generateCode()
            console.log(`[OTP] Generated code for ${identifier}: ${code} (type: ${type})`)

            // Store OTP in Redis with TTL (explicitly as string to avoid type mismatch)
            await RedisDB.client.set(otpKey, String(code), { ex: OTP_TTL })
            // Rate limit
            await RedisDB.client.set(rateLimitKey, '1', { ex: 60 })

            // Send via chosen method
            if (method === 'wa') {
                const result = await Fonnte.sendOTP(identifier, code)
                return result
            } else if (method === 'email') {
                return await this.sendEmailOTP(identifier, code, type)
            }

            return { status: false, msg: 'Metode pengiriman tidak valid' }
        } catch (e) {
            console.error('[OTP] Error:', e.message)
            return { status: false, msg: 'Gagal mengirim OTP' }
        }
    },

    /**
     * Send OTP via email using Nodemailer
     */
    async sendEmailOTP(email, code, type) {
        try {
            const EmailTemplates = (await import('../email-templates.js')).default
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            })

            const subjects = {
                register: `Verifikasi Akun - ${process.env.WEB_NAME || 'Digital Fast'}`,
                login: `Verifikasi Login - ${process.env.WEB_NAME || 'Digital Fast'}`,
                reset: `Reset Password - ${process.env.WEB_NAME || 'Digital Fast'}`
            }
            const subject = subjects[type] || `Kode OTP - ${process.env.WEB_NAME || 'Digital Fast'}`
            const html = EmailTemplates.otp(code, type)

            await transporter.sendMail({
                from: `"${process.env.USER_NAME || process.env.WEB_NAME || 'Digital Fast'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: email,
                subject,
                html
            })

            console.log(`[OTP] Email sent to ${email}`)
            return { status: true, msg: 'OTP terkirim ke email' }
        } catch (e) {
            console.error('[OTP Email] Error:', e.message)
            return { status: false, msg: 'Gagal mengirim email OTP' }
        }
    },

    /**
     * Verify OTP code
     * @param {string} identifier - email or phone
     * @param {string} code - OTP code entered by user
     * @param {string} type - 'register' | 'reset' | 'verify'
     */
    async verify(identifier, code, type = 'register') {
        try {
            const otpKey = `otp:${type}:${identifier}`
            const storedCode = await RedisDB.client.get(otpKey)

            console.log(`[OTP Verify] Key: ${otpKey}`)
            console.log(`[OTP Verify] Stored: "${storedCode}" (type: ${typeof storedCode})`)
            console.log(`[OTP Verify] Input:  "${code}" (type: ${typeof code})`)

            if (!storedCode) {
                return { status: false, msg: 'Kode OTP sudah kedaluwarsa atau tidak ditemukan' }
            }

            const normalizedStored = String(storedCode).trim()
            const normalizedInput = String(code).trim()

            if (normalizedStored !== normalizedInput) {
                console.log(`[OTP Verify] MISMATCH: "${normalizedStored}" !== "${normalizedInput}"`)
                return { status: false, msg: 'Kode OTP salah' }
            }

            // Delete OTP after successful verification
            await RedisDB.client.del(otpKey)
            console.log(`[OTP Verify] SUCCESS for ${identifier}`)
            return { status: true, msg: 'Verifikasi berhasil' }
        } catch (e) {
            console.error('[OTP Verify] Error:', e.message)
            return { status: false, msg: 'Gagal memverifikasi OTP' }
        }
    }
}
