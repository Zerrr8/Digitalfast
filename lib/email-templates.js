/**
 * Professional Email Templates
 * Centralized, modern, dark-themed email templates for all notifications
 */

const WEB_NAME = () => process.env.WEB_NAME || 'Digital Fast'
const DOMAIN = () => process.env.DOMAIN || 'https://digitalfast.vercel.app'
const LOGO_URL = () => process.env.EMAIL_ICON || `${DOMAIN()}/images/profile-yilzi.jpg`
const ACCENT = '#8B5CF6'
const ACCENT_DARK = '#7C3AED'
const BG_DARK = '#0f172a'
const CARD_BG = '#1e293b'
const TEXT_PRIMARY = '#f1f5f9'
const TEXT_SECONDARY = '#94a3b8'
const BORDER = '#334155'

function baseLayout(content, previewText = '') {
    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${WEB_NAME()}</title>
    <style>
        body { margin: 0; padding: 0; background-color: ${BG_DARK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
        .email-wrapper { background-color: ${BG_DARK}; padding: 40px 20px; }
        .email-container { max-width: 560px; margin: 0 auto; }
        .email-header { text-align: center; padding: 32px 0 24px; }
        .logo-img { width: 48px; height: 48px; border-radius: 50%; border: 2px solid ${ACCENT}; }
        .brand-name { font-size: 20px; font-weight: 800; color: ${TEXT_PRIMARY}; margin-top: 12px; letter-spacing: -0.5px; }
        .email-card { background: ${CARD_BG}; border: 1px solid ${BORDER}; border-radius: 16px; overflow: hidden; }
        .card-accent { height: 4px; background: linear-gradient(90deg, ${ACCENT}, #3b82f6, ${ACCENT_DARK}); }
        .card-body { padding: 32px; }
        .email-title { font-size: 22px; font-weight: 700; color: ${TEXT_PRIMARY}; margin: 0 0 8px; }
        .email-subtitle { font-size: 14px; color: ${TEXT_SECONDARY}; margin: 0 0 24px; line-height: 1.6; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid ${BORDER}; }
        .info-table tr:last-child td { border-bottom: none; }
        .info-label { color: ${TEXT_SECONDARY}; width: 140px; vertical-align: top; }
        .info-value { color: ${TEXT_PRIMARY}; font-weight: 600; }
        .highlight-box { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .highlight-value { font-size: 28px; font-weight: 800; color: ${ACCENT}; letter-spacing: 2px; }
        .highlight-label { font-size: 12px; color: ${TEXT_SECONDARY}; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .btn-primary { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK}); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; text-align: center; }
        .btn-outline { display: inline-block; padding: 12px 28px; border: 1px solid ${BORDER}; color: ${TEXT_PRIMARY}; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 13px; text-align: center; }
        .divider { height: 1px; background: ${BORDER}; margin: 24px 0; }
        .warning-text { font-size: 12px; color: #f59e0b; margin-top: 16px; }
        .danger-text { color: #ef4444; }
        .success-text { color: #22c55e; }
        .email-footer { text-align: center; padding: 24px 0; }
        .footer-text { font-size: 12px; color: ${TEXT_SECONDARY}; line-height: 1.6; }
        .footer-brand { font-weight: 600; color: ${TEXT_PRIMARY}; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-success { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .badge-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .badge-info { background: rgba(139, 92, 246, 0.15); color: ${ACCENT}; }
        .receipt-box { background: ${BG_DARK}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .receipt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px dashed ${BORDER}; }
        .receipt-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .receipt-total { border-top: 2px solid ${ACCENT}; padding-top: 12px; margin-top: 12px; }
        @media (max-width: 600px) {
            .email-wrapper { padding: 16px 12px; }
            .card-body { padding: 24px 20px; }
            .email-title { font-size: 18px; }
            .highlight-value { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <img src="${LOGO_URL()}" alt="${WEB_NAME()}" class="logo-img" style="width:48px;height:48px;border-radius:50%;border:2px solid ${ACCENT};">
                <div class="brand-name" style="font-size:20px;font-weight:800;color:${TEXT_PRIMARY};margin-top:12px;">${WEB_NAME()}</div>
            </div>
            <div class="email-card" style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
                <div class="card-accent" style="height:4px;background:linear-gradient(90deg,${ACCENT},#3b82f6,${ACCENT_DARK});"></div>
                <div class="card-body" style="padding:32px;">
                    ${content}
                </div>
            </div>
            <div class="email-footer" style="text-align:center;padding:24px 0;">
                <p class="footer-text" style="font-size:12px;color:${TEXT_SECONDARY};line-height:1.6;">
                    <span class="footer-brand" style="font-weight:600;color:${TEXT_PRIMARY};">${WEB_NAME()}</span><br>
                    ${process.env.EMAIL_FOOTER || `© ${new Date().getFullYear()} ${WEB_NAME()}. All Rights Reserved.`}
                </p>
            </div>
        </div>
    </div>
</body>
</html>`
}

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID').format(amount || 0)
}

function formatDate(date) {
    return new Date(date || Date.now()).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default {
    /**
     * OTP Verification Email
     */
    otp(code, type = 'register') {
        const titles = {
            register: 'Verifikasi Akun Anda',
            login: 'Verifikasi Login',
            reset: 'Reset Password'
        }
        const descriptions = {
            register: 'Gunakan kode di bawah untuk menyelesaikan pendaftaran akun Anda.',
            login: 'Gunakan kode di bawah untuk memverifikasi login Anda.',
            reset: 'Gunakan kode di bawah untuk mereset password Anda.'
        }
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">${titles[type] || 'Kode Verifikasi'}</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">${descriptions[type] || 'Gunakan kode di bawah untuk verifikasi.'}</p>
            
            <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
                <div style="font-size:36px;font-weight:800;color:${ACCENT};letter-spacing:8px;font-family:monospace;">${code}</div>
                <div style="font-size:12px;color:${TEXT_SECONDARY};margin-top:8px;text-transform:uppercase;letter-spacing:1px;">Kode Verifikasi</div>
            </div>
            
            <div style="height:1px;background:${BORDER};margin:24px 0;"></div>
            <p style="font-size:12px;color:#f59e0b;margin:0;">⚠️ Kode ini berlaku selama <strong>30 menit</strong>. Jangan bagikan kode ini kepada siapapun termasuk pihak yang mengatasnamakan ${WEB_NAME()}.</p>
        `)
    },

    /**
     * Registration Success Email
     */
    registrationSuccess(username, email) {
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">🎉 Selamat Datang!</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">Akun Anda berhasil dibuat dan diverifikasi. Anda siap berbelanja!</p>
            
            <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Username</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};font-weight:600;">${username}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Email</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};font-weight:600;">${email}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;color:${TEXT_SECONDARY};width:140px;">Status</td><td style="padding:10px 0;font-size:14px;"><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(34,197,94,0.15);color:#22c55e;">Terverifikasi ✓</span></td></tr>
            </table>
            
            <div style="text-align:center;margin:28px 0 8px;">
                <a href="${DOMAIN()}/products" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${ACCENT},${ACCENT_DARK});color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Mulai Belanja →</a>
            </div>
        `)
    },

    /**
     * Payment Receipt / Success Email
     */
    paymentSuccess(data) {
        const { customerName, email, invoiceId, items, totalAmount, date } = data
        const itemRows = (items || []).map(item => `
            <tr>
                <td style="padding:8px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};">${item.name || item.id}</td>
                <td style="padding:8px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};text-align:center;">${item.quantity || 1}</td>
                <td style="padding:8px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};text-align:right;font-weight:600;">Rp ${formatRupiah(item.price)}</td>
            </tr>
        `).join('')

        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">Pembayaran Berhasil ✓</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">Terima kasih, ${customerName}! Pembayaran Anda telah berhasil diproses.</p>
            
            <!-- Receipt -->
            <div style="background:${BG_DARK};border:1px solid ${BORDER};border-radius:12px;padding:24px;margin:20px 0;">
                <table style="width:100%;margin-bottom:16px;">
                    <tr>
                        <td style="font-size:16px;font-weight:700;color:${TEXT_PRIMARY};">STRUK PEMBAYARAN</td>
                        <td style="text-align:right;"><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(34,197,94,0.15);color:#22c55e;">LUNAS</span></td>
                    </tr>
                </table>
                <div style="height:1px;background:${BORDER};margin:0 0 16px;border-style:dashed;border-width:1px 0 0;"></div>
                
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:6px 0;font-size:13px;color:${TEXT_SECONDARY};width:100px;">Invoice</td><td style="padding:6px 0;font-size:13px;color:${TEXT_PRIMARY};font-weight:600;">#${invoiceId}</td></tr>
                    <tr><td style="padding:6px 0;font-size:13px;color:${TEXT_SECONDARY};width:100px;">Tanggal</td><td style="padding:6px 0;font-size:13px;color:${TEXT_PRIMARY};">${formatDate(date)}</td></tr>
                    <tr><td style="padding:6px 0;font-size:13px;color:${TEXT_SECONDARY};width:100px;">Customer</td><td style="padding:6px 0;font-size:13px;color:${TEXT_PRIMARY};">${customerName}</td></tr>
                </table>
                
                <div style="height:1px;background:${BORDER};margin:16px 0;border-style:dashed;border-width:1px 0 0;"></div>
                
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;padding:8px 0;font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid ${BORDER};">Produk</th>
                            <th style="text-align:center;padding:8px 0;font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid ${BORDER};">Qty</th>
                            <th style="text-align:right;padding:8px 0;font-size:12px;color:${TEXT_SECONDARY};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid ${BORDER};">Harga</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                
                <div style="border-top:2px solid ${ACCENT};padding-top:12px;margin-top:12px;">
                    <table style="width:100%;">
                        <tr>
                            <td style="font-size:16px;font-weight:800;color:${TEXT_PRIMARY};">TOTAL</td>
                            <td style="text-align:right;font-size:20px;font-weight:800;color:${ACCENT};">Rp ${formatRupiah(totalAmount)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <div style="text-align:center;margin:24px 0 8px;">
                <a href="${DOMAIN()}/invoice/${invoiceId}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${ACCENT},${ACCENT_DARK});color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Lihat Invoice →</a>
            </div>
        `)
    },

    /**
     * Payment Pending / Waiting for Payment Email
     */
    paymentPending(data) {
        const { customerName, invoiceId, productName, totalAmount } = data
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">⏳ Menunggu Pembayaran</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">Halo ${customerName}, pesanan Anda telah berhasil dibuat. Silakan selesaikan pembayaran sebelum batas waktu habis.</p>
            
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:20px;margin:20px 0;">
                <p style="font-size:12px;color:#f59e0b;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total Tagihan</p>
                <div style="font-size:28px;font-weight:800;color:#f59e0b;">Rp ${formatRupiah(totalAmount)}</div>
            </div>
            
            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Invoice</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};font-weight:600;">#${invoiceId}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Produk</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};">${productName}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;color:${TEXT_SECONDARY};width:140px;">Status</td><td style="padding:10px 0;font-size:14px;"><span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(245,158,11,0.15);color:#f59e0b;">Belum Dibayar</span></td></tr>
            </table>
            
            <div style="text-align:center;margin:28px 0 8px;">
                <a href="${DOMAIN()}/invoice/${invoiceId}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${ACCENT},${ACCENT_DARK});color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Bayar Sekarang →</a>
            </div>
        `)
    },

    /**
     * Owner Payment Notification Email
     */
    ownerPaymentNotification(data) {
        const { customerName, customerEmail, invoiceId, productName, totalAmount } = data
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">💰 Pembayaran Diterima!</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">Ada pembayaran baru masuk ke toko Anda.</p>
            
            <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Invoice</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};font-weight:600;">#${invoiceId}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Customer</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};font-weight:600;">${customerName}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Email</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};">${customerEmail}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_SECONDARY};width:140px;">Produk</td><td style="padding:10px 0;font-size:14px;border-bottom:1px solid ${BORDER};color:${TEXT_PRIMARY};">${productName}</td></tr>
                <tr><td style="padding:10px 0;font-size:14px;color:${TEXT_SECONDARY};width:140px;">Total</td><td style="padding:10px 0;font-size:20px;color:${ACCENT};font-weight:800;">Rp ${formatRupiah(totalAmount)}</td></tr>
            </table>
            
            <div style="text-align:center;margin:28px 0 8px;">
                <a href="${DOMAIN()}/dashboard/invoices" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${ACCENT},${ACCENT_DARK});color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Lihat Dashboard →</a>
            </div>
        `)
    },

    /**
     * Account Blocked/Unblocked Notification
     */
    accountStatus(name, action, reason = '') {
        const isBlocked = action === 'block'
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">${isBlocked ? '⚠️ Akun Diblokir' : '✅ Akun Diaktifkan Kembali'}</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">Halo <strong style="color:${TEXT_PRIMARY};">${name}</strong>,</p>
            
            ${isBlocked ? `
                <p style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;margin:0 0 16px;">Mohon maaf, profil Anda di <strong style="color:${TEXT_PRIMARY};">${WEB_NAME()}</strong> telah <span style="color:#ef4444;font-weight:700;">diblokir</span> oleh Administrator.</p>
                ${reason ? `
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:16px;margin:16px 0;">
                    <div style="font-size:12px;color:#ef4444;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600;">Alasan:</div>
                    <p style="font-size:14px;color:${TEXT_PRIMARY};margin:0;font-style:italic;">"${reason}"</p>
                </div>` : ''}
                <p style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;margin:16px 0 0;">Jika Anda merasa ini kesalahan, silakan hubungi Customer Service kami.</p>
            ` : `
                <p style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;margin:0 0 16px;">Kabar baik! Profil Anda di <strong style="color:${TEXT_PRIMARY};">${WEB_NAME()}</strong> telah <span style="color:#22c55e;font-weight:700;">berhasil diaktifkan kembali</span>.</p>
                <p style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;margin:0;">Anda sekarang dapat melakukan transaksi seperti biasa. Selamat berbelanja!</p>
                <div style="text-align:center;margin:28px 0 8px;">
                    <a href="${DOMAIN()}/products" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${ACCENT},${ACCENT_DARK});color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">Mulai Belanja →</a>
                </div>
            `}
        `)
    },

    /**
     * Password Reset Success Notification
     */
    passwordChanged(name) {
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">🔒 Password Diubah</h1>
            <p style="font-size:14px;color:${TEXT_SECONDARY};margin:0 0 24px;line-height:1.6;">Halo <strong style="color:${TEXT_PRIMARY};">${name}</strong>,</p>
            <p style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.6;margin:0 0 16px;">Password akun Anda di <strong style="color:${TEXT_PRIMARY};">${WEB_NAME()}</strong> baru saja berhasil diubah.</p>
            
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:16px;margin:16px 0;">
                <p style="font-size:13px;color:#f59e0b;margin:0;">⚠️ Jika Anda <strong>tidak</strong> melakukan perubahan ini, segera hubungi Administrator atau reset password Anda sekarang.</p>
            </div>
            
            <div style="text-align:center;margin:24px 0 8px;">
                <a href="${DOMAIN()}/reset-password" style="display:inline-block;padding:12px 28px;border:1px solid ${BORDER};color:${TEXT_PRIMARY};text-decoration:none;border-radius:12px;font-weight:600;font-size:13px;">Reset Password</a>
            </div>
        `)
    },

    /**
     * Broadcast Message Email  
     */
    broadcast(title, message, tag) {
        return baseLayout(`
            <h1 style="font-size:22px;font-weight:700;color:${TEXT_PRIMARY};margin:0 0 8px;">${title}</h1>
            ${tag ? `<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(139,92,246,0.15);color:${ACCENT};margin-bottom:16px;">${tag}</span>` : ''}
            <p style="font-size:14px;color:${TEXT_SECONDARY};line-height:1.8;margin:16px 0;">${message}</p>
        `)
    }
}
