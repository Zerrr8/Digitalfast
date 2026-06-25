import nodemailer from 'nodemailer'

export default {
    async sendMail(to, subject, htmlContent) {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            })

            await transporter.sendMail({
                from: `"${process.env.USER_NAME || process.env.WEB_NAME || 'Digital Fast'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to,
                subject,
                html: htmlContent
            })

            console.log(`[Email] Berhasil mengirim email ke ${to}`)
            return { status: true, msg: 'Email berhasil dikirim' }
        } catch (e) {
            console.error('[Email Error]:', e.message)
            return { status: false, msg: 'Gagal mengirim email: ' + e.message }
        }
    }
}
