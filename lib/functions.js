import Jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

class Functions {
   makeId = length => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
   }

   toTime = (ms) => {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
   }

   toMs = time => {
      const timeValue = parseInt(time.slice(0, -1))
      const timeUnit = time.slice(-1).toLowerCase()

      switch (timeUnit) {
         case 'h':
            return timeValue * 3600000; // 1 jam = 3600000 ms
         case 'm':
            return timeValue * 60000; // 1 menit = 60000 ms
         case 's':
            return timeValue * 1000; // 1 detik = 1000 ms
         default:
            throw new Error("Unit not recognized! Use 'h', 'm', or 's'.")
      }
   }

   calculatePriceWithTax = (basePrice, taxPercent = 10) => {
      const tax = basePrice * (taxPercent / 100)
      const total = basePrice + tax

      return {
         basePrice: parseInt(basePrice?.toFixed(0)),
         tax: parseInt(tax?.toFixed(0)),
         total: parseInt(total?.toFixed(0))
      }
   }

   genTokenFromUrl = (url, filename, cookie) => {
      try {
         const expiresIn = 60 * 60
         const token = Jwt.sign({
            url: url,
            filename: encodeURIComponent(filename),
            cookie: cookie
         }, process.env.JWT_SECRET, { expiresIn })
         return token
      } catch (error) {
         return false
      }
   }

   formatBytes = (bytes, decimals = 2) => {
      if (!+bytes) return '0 Bytes'
      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
   }

   emailService = async (options = {}) => {
      try {
         const { to, subject, data } = options
         const html = `<!doctypehtml><html lang=en xmlns=http://www.w3.org/1999/xhtml xmlns:o=urn:schemas-microsoft-com:office:office xmlns:v=urn:schemas-microsoft-com:vml><title></title><meta charset=UTF-8><meta content="text/html; charset=UTF-8"http-equiv=Content-Type><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content=""name=x-apple-disable-message-reformatting><meta content="target-densitydpi=device-dpi"name=viewport><meta content=true name=HandheldFriendly><meta content="width=device-width"name=viewport><meta content="telephone=no, date=no, address=no, email=no, url=no"name=format-detection><style>table{border-collapse:separate;table-layout:fixed;mso-table-lspace:0;mso-table-rspace:0}table td{border-collapse:collapse}.ExternalClass{width:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}a,body,h1,h2,h3,li,p{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}html{-webkit-text-size-adjust:none!important}#innerTable,body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}#innerTable img+div{display:none;display:none!important}img{Margin:0;padding:0;-ms-interpolation-mode:bicubic}a,h1,h2,h3,p{line-height:inherit;overflow-wrap:normal;white-space:normal;word-break:break-word}a{text-decoration:none}h1,h2,h3,p{min-width:100%!important;width:100%!important;max-width:100%!important;display:inline-block!important;border:0;padding:0;margin:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}u+#body a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}a[href^=mailto],a[href^=sms],a[href^=tel]{color:inherit;text-decoration:none}</style><style>@media (min-width:481px){.hd{display:none!important}}</style><style>@media (max-width:480px){.hm{display:none!important}}</style><style>@media (max-width:480px){.t45,.t50{mso-line-height-alt:0!important;line-height:0!important;display:none!important}.t46{padding:40px!important}.t48{border-radius:0!important;width:480px!important}.t19,.t43,.t9{width:398px!important}.t36{text-align:left!important}.t29{display:revert!important}.t31,.t35{vertical-align:top!important;width:auto!important;max-width:100%!important}.t13{font-weight:400!important}}</style><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Share+Tech:wght@400;700&family=Open+Sans:wght@500;600&display=swap"rel=stylesheet><body class=t53 id=body style=min-width:100%;Margin:0;padding:0;background-color:#fff><div style=background-color:#fff class=t52><table cellpadding=0 cellspacing=0 role=presentation align=center border=0 width=100%><tr><td class=t51 style=font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#fff align=center valign=top><table cellpadding=0 cellspacing=0 role=presentation align=center border=0 width=100% id=innerTable><tr><td><div style=mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block class=t45>  </div><tr><td align=center><table cellpadding=0 cellspacing=0 role=presentation class=t49 style=Margin-left:auto;Margin-right:auto><tr><td class=t48 style="background-color:#fff;border:1px solid #ebebeb;overflow:hidden;width:600px;border-radius:3px 3px 3px 3px"><table cellpadding=0 cellspacing=0 role=presentation class=t47 style=width:100% width=100%><tr><td class=t46 style="padding:44px 42px 32px 42px"><table cellpadding=0 cellspacing=0 role=presentation style=width:100%!important width=100%><tr><td align=left><table cellpadding=0 cellspacing=0 role=presentation class=t4 style=Margin-right:auto><tr><td class=t3 style=width:42px><table cellpadding=0 cellspacing=0 role=presentation class=t2 style=width:100% width=100%><tr><td class=t1><div style=font-size:0><img alt=""class=t0 height=42 src=${process.env.EMAIL_ICON} style=display:block;border:0;height:auto;width:100%;Margin:0;max-width:100% width=42></div></table></table><tr><td><div style=mso-line-height-rule:exactly;mso-line-height-alt:42px;line-height:42px;font-size:1px;display:block class=t5>  </div><tr><td align=center><table cellpadding=0 cellspacing=0 role=presentation class=t10 style=Margin-left:auto;Margin-right:auto><tr><td class=t9 style="border-bottom:1px solid #eff1f4;width:514px"><table cellpadding=0 cellspacing=0 role=presentation class=t8 style=width:100% width=100%><tr><td class=t7 style="padding:0 0 18px 0"><h1 class=t6 style="margin:0;Margin:0;font-family:Montserrat,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:-1px;direction:ltr;color:#141414;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px">Payment Received</h1></table></table><tr><td><div style=mso-line-height-rule:exactly;mso-line-height-alt:18px;line-height:18px;font-size:1px;display:block class=t11>  </div><tr><td align=center><table cellpadding=0 cellspacing=0 role=presentation class=t20 style=Margin-left:auto;Margin-right:auto><tr><td class=t19 style=width:514px><table cellpadding=0 cellspacing=0 role=presentation class=t18 style=width:100% width=100%><tr><td class=t17><p class=t16 style="margin:0;Margin:0;font-family:Share Tech,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:25px;font-weight:400;font-style:normal;font-size:15px;text-decoration:none;text-transform:none;letter-spacing:-.1px;direction:ltr;color:#141414;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px">Anda telah menerima pembayaran sebesar <span class=t12 style=margin:0;Margin:0;font-weight:700;mso-line-height-rule:exactly>Rp. ${data?.amount?.toLocaleString()},- (${data?.item}) </span><span class=t14 style=margin:0;Margin:0;mso-line-height-rule:exactly><span class=t13 style=margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly>dari :</span></span><span class=t15 style=margin:0;Margin:0;font-weight:400;mso-line-height-rule:exactly> ${data?.customer}</span></table></table><tr><td><div style=mso-line-height-rule:exactly;mso-line-height-alt:24px;line-height:24px;font-size:1px;display:block class=t22>  </div><tr><td align=left><table cellpadding=0 cellspacing=0 role=presentation class=t26 style=Margin-right:auto><tr><td class=t25 style="background-color:#222;overflow:hidden;width:auto;border-radius:40px 40px 40px 40px"><table cellpadding=0 cellspacing=0 role=presentation class=t24 style=width:auto><tr><td class=t23 style="text-align:center;line-height:34px;mso-line-height-rule:exactly;mso-text-raise:5px;padding:0 23px 0 23px"><a class=t21 href="${process.env.DOMAIN}/invoice/${data?.invoice}"style="display:block;margin:0;Margin:0;font-family:Share Tech,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:34px;font-weight:700;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#fff;text-align:center;mso-line-height-rule:exactly;mso-text-raise:5px"target=_blank>View</a></table></table><tr><td><div style=mso-line-height-rule:exactly;mso-line-height-alt:40px;line-height:40px;font-size:1px;display:block class=t40>  </div><tr><td align=center><table cellpadding=0 cellspacing=0 role=presentation class=t44 style=Margin-left:auto;Margin-right:auto><tr><td class=t43 style="border-top:1px solid #dfe1e4;width:514px"><table cellpadding=0 cellspacing=0 role=presentation class=t42 style=width:100% width=100%><tr><td class=t41 style="padding:24px 0 0 0"><div style=width:100%;text-align:left class=t39><div style=display:inline-block class=t38><table cellpadding=0 cellspacing=0 role=presentation class=t37 align=left valign=top><tr class=t36><td><td class=t31 valign=top><table cellpadding=0 cellspacing=0 role=presentation class=t30 style=width:auto width=100%><tr><td class=t28 style=background-color:#fff;text-align:center;line-height:20px;mso-line-height-rule:exactly;mso-text-raise:2px><span class=t27 style="display:block;margin:0;Margin:0;font-family:Open Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:20px;font-weight:600;font-style:normal;font-size:14px;text-decoration:none;direction:ltr;color:#222;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px">${process.env.EMAIL_FOOTER}</span><td class=t29 style=width:20px width=20></table><td class=t35 valign=top><table cellpadding=0 cellspacing=0 role=presentation class=t34 style=width:auto width=100%><tr><td class=t33 style=background-color:#fff;text-align:center;line-height:20px;mso-line-height-rule:exactly;mso-text-raise:2px><span class=t32 style="display:block;margin:0;Margin:0;font-family:Open Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:20px;font-weight:500;font-style:normal;font-size:14px;text-decoration:none;direction:ltr;color:#b4becc;text-align:center;mso-line-height-rule:exactly;mso-text-raise:2px">オートメーション</span></table><td></table></div></div></table></table></table></table></table><tr><td><div style=mso-line-height-rule:exactly;mso-line-height-alt:50px;line-height:50px;font-size:1px;display:block class=t50>  </div></table></table></div><div style="display:none;white-space:nowrap;font:15px courier;line-height:0"class=gmail-fix>                                                           </div>`
         const transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.EMAIL_PASSWORD
            }
         })
         const mailOptions = {
            from: {
               name: process.env.USER_NAME,
               address: process.env.EMAIL_FROM || process.env.EMAIL_USER
            },
            to: to.trim(),
            subject: subject.trim(),
            html
         }
         transport.sendMail(mailOptions, function (err, data) {
            if (err) return ({
               creator: global.creator,
               status: false,
               msg: err.message
            })
            return ({
               creator: global.creator,
               status: true,
               msg: 'Email sent successfully'
            })
         })
      } catch (e) {
         return ({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   }
}

export default new Functions