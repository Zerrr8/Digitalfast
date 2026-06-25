import axios from 'axios'
import moment from 'moment-timezone'
import qrcode from 'qrcode'

export default class Xendit {
   constructor(options = {}) {
      this.baseUrl = 'https://api.xendit.co'
      this.headers = () => ({
         headers: {
            'Authorization': `Basic ${Buffer.from(process.env.XENDIT_APIKEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
         }
      })
      this.success_callback_url = options.success_callback_url
      this.failure_callback_url = options.failure_callback_url
      this.callback_with_id = options.callback_with_id ? true : false
      this.expiration = options.expiration || 30
      this.prefix = options.prefix || 'NXR'
   }

   uuid = () => {
      var dt = new Date().getTime()
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
         var r = (dt + Math.random() * 16) % 16 | 0;
         var y = Math.floor(dt / 16);
         return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid
   }

   makeId = (length) => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
   }

   makeTimestamp = minutes => {
      const now = moment.tz('Asia/Jakarta')
      const expiredAt = now.add(Number(minutes), 'minutes')
      const timestamp = expiredAt.toISOString()
      return timestamp
   }

   balance = () => new Promise(async resolve => {
      try {
         const json = await (await axios.get(this.baseUrl + '/balance', this.headers())).data
         resolve({
            creator: global.creator,
            status: true,
            data: json
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.response.data
         })
      }
   })

   transaction = (limit = 10) => new Promise(async resolve => {
      try {
         const json = await (await axios.get(this.baseUrl + '/transactions?limit=' + limit, this.headers())).data
         resolve({
            creator: global.creator,
            status: true,
            data: json
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.response.data
         })
      }
   })

   disbursement = (opts = {}) => new Promise(async resolve => {
      try {
         if (opts && opts.type && opts.type === 'GET_BANK') {
            const json = await (await axios.get(this.baseUrl + '/available_disbursements_banks', this.headers())).data
            resolve({
               creator: global.creator,
               status: true,
               data: json
            })
         } else if (opts && opts.type && opts.type === 'CREATE') {
            if (!opts.data) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data" is required`
            })
            if (!opts.data.amount) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data.amount" is required`
            })
            if (!opts.data.product_code) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data.product_code" is required`
            })
            if (!opts.data.number) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data.number" is required`
            })
            if (!opts.data.description) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data.description" is required`
            })

            const params = {
               external_id: 'disb-' + (new Date * 1),
               amount: Number(opts.data.amount),
               bank_code: opts.data.product_code.toUpperCase(),
               account_holder_name: process.env.AUTHOR_NAME || 'Yilzi Code',
               account_number: String(opts.data.number),
               description: opts.data.description
            }

            const json = await (await axios.post(this.baseUrl + '/disbursements', params, this.headers())).data
            resolve({
               creator: global.creator,
               status: true,
               data: json
            })
         } else if (opts && opts.type && opts.type === 'CHECK') {
            if (!opts.data) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data" is required`
            })
            if (!opts.data.id) return resolve({
               creator: global.creator,
               status: false,
               msg: `"data.id" is required`
            })

            const json = await (await axios.get(this.baseUrl + '/disbursements/' + opts.data.id, this.headers())).data
            resolve({
               creator: global.creator,
               status: true,
               data: json
            })
         }
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.response ? e.response.data : e.message
         })
      }
   })

   createPayment = (amount, channel, metadata = {}) => new Promise(async resolve => {
      try {
         const id = this.prefix + '-' + this.makeId(8)
         const params = (channel === 'qris') ? {
            'currency': 'IDR',
            'amount': Number(amount),
            'payment_method': {
               'type': 'QR_CODE',
               'reusability': 'ONE_TIME_USE',
               'reference_id': 'pm-level-' + this.uuid(),
               'qr_code': {
                  'channel_code': 'DANA',
                  'channel_properties': {
                     'expires_at': this.makeTimestamp(this.expiration)
                  }
               }
            },
            'metadata': {
               'sku': id,
               ...metadata
            }
         } : ['bri', 'mandiri', 'bni', 'permata', 'bca', 'bss', 'cimb', 'bjb', 'bsi'].includes(channel) ? {
            'currency': 'IDR',
            'amount': Number(amount),
            'payment_method': {
               'type': 'VIRTUAL_ACCOUNT',
               'reusability': 'ONE_TIME_USE',
               'reference_id': 'pm-level-' + this.uuid(),
               'virtual_account': {
                  'channel_code': channel.toUpperCase(),
                  'channel_properties': {
                     'customer_name': process.env.WEB_NAME || 'Digital Fast',
                     'expires_at': this.makeTimestamp(this.expiration)
                  }
               }
            },
            'metadata': {
               'sku': id,
               ...metadata
            }
         } : ['ovo', 'dana', 'linkaja', 'shopeepay', 'astrapay'].includes(channel) ? ({
            'currency': 'IDR',
            'amount': Number(amount),
            'payment_method': {
               'type': 'EWALLET',
               'reusability': 'ONE_TIME_USE',
               'reference_id': 'pm-level-' + this.uuid(),
               'ewallet': {
                  'channel_code': channel.toUpperCase(),
                  'channel_properties': {
                     'success_return_url': `${this.success_callback_url}${this.callback_with_id ? '?id=' + id : ''}`,
                     'failure_return_url': `${this.failure_callback_url}${this.callback_with_id ? '?id=' + id : ''}`,
                     'expires_at': this.makeTimestamp(this.expiration)
                  }
               }
            },
            'metadata': {
               'sku': id,
               ...metadata
            }
         }) : {}
         const json = await (await axios.post(this.baseUrl + '/payment_requests', params, this.headers())).data
         if (!json.payment_method) return resolve({
            creator: global.creator,
            status: false,
            msg: `Can't create payment!`
         })
         resolve({
            creator: global.creator,
            status: true,
            data: {
               ...json,
               qr_image: channel === 'qris' ? await qrcode.toDataURL(json.payment_method.qr_code.channel_properties.qr_string, {
                  scale: 8
               }) : null
            }
         })
      } catch (e) {
         console.error('[Xendit]:', e.response.data.message)
         resolve({
            creator: global.creator,
            status: false,
            msg: e.response.data.message
         })
      }
   })

   checkPayment = id => new Promise(async resolve => {
      try {
         const json = await (await axios.get(this.baseUrl + '/payment_requests/' + id, this.headers())).data
         if (!json.payment_method) return resolve({
            creator: global.creator,
            status: false,
            msg: `Transaction doesn't exist.`
         })
         resolve({
            creator: global.creator,
            status: true,
            data: json
         })
      } catch (e) {
         console.error('[Xendit]:', e.response.data.message)
         resolve({
            creator: global.creator,
            status: false,
            msg: e.response.data.message
         })
      }
   })
}
