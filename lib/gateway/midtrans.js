import axios from 'axios'
import moment from 'moment-timezone'
import qrcode from 'qrcode'

export default class Midtrans {
   constructor(options = {}) {
      this.baseUrl = options.sandbox ? 'https://api.sandbox.midtrans.com' : 'https://api.midtrans.com'
      this.headers = () => ({
         headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
         }
      })
      this.prefix = options.prefix || 'NXR'
      this.callback_url = options.callback_url
      this.expiration = options.expiration || 30
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

   makeTimestamp = () => {
      const now = moment.tz('Asia/Jakarta')
      const timestamp = moment(new Date() * 1).format('yyyy-MM-DD HH:mm:ss')
      return timestamp + ' +0700'
   }

   createPayment = (amount, channel, customer_details = {}, item_details = []) => {
      return new Promise(async resolve => {
         try {
            const id = this.prefix + '-' + this.makeId(8)
            const params = channel === 'qris' ? {
               'payment_type': 'qris',
               'transaction_details': {
                  'gross_amount': Number(amount),
                  'order_id': id
               },
               'gopay': {
                  'enable_callback': false,
                  'callback_url': this.callback_url
               },
               customer_details,
               'custom_expiry': {
                  'order_time': this.makeTimestamp(),
                  'expiry_duration': this.expiration,
                  'unit': 'minutes'
               }
            } : ['bri', 'bni', 'bca', 'cimb', 'permata'].includes(channel) ? {
               'payment_type': 'bank_transfer',
               'transaction_details': {
                  'gross_amount': Number(amount),
                  'order_id': id
               },
               'bank_transfer': {
                  'bank': channel.toLowerCase()
               },
               customer_details,
               'custom_expiry': {
                  'order_time': this.makeTimestamp(),
                  'expiry_duration': this.expiration,
                  'unit': 'minutes'
               }
            } : channel === 'mandiri' ? {
               'payment_type': 'echannel',
               'transaction_details': {
                  'gross_amount': Number(amount),
                  'order_id': id
               },
               'echannel': {
                  'bill_info1': 'Payment:',
                  'bill_info2': 'Online purchase'
               },
               customer_details,
               'custom_expiry': {
                  'order_time': this.makeTimestamp(),
                  'expiry_duration': this.expiration,
                  'unit': 'minutes'
               }
            } : channel === 'gopay' ? {
               'payment_type': 'gopay',
               'transaction_details': {
                  'gross_amount': Number(amount),
                  'order_id': id
               },
               'gopay': {
                  'enable_callback': true,
                  'callback_url': this.callback_url
               },
               customer_details,
               'custom_expiry': {
                  'order_time': this.makeTimestamp(),
                  'expiry_duration': this.expiration,
                  'unit': 'minutes'
               }
            } : {}
            const json = await (await axios.post(this.baseUrl + '/v2/charge', params, this.headers())).data
            if (json.status_code != 201) return resolve({
               creator: global.creator,
               status: false,
               msg: json.status_message || `Can't create payment!`
            })
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  ...json,
                  qr_image: channel === 'qris' ? await qrcode.toDataURL(json.qr_string, {
                     scale: 8
                  }) : null
               }
            })
         } catch (e) {
            console.error('[Midtrans]:', e.response.data.status_message)
            resolve({
               creator: global.creator,
               status: false,
               msg: e.response.data.status_message
            })
         }
      })
   }

   checkPayment = id => {
      return new Promise(async resolve => {
         try {
            const json = await (await axios.get(this.baseUrl + '/v2/' + id + '/status', this.headers())).data
            if (json.status_code != 200 && json.status_code != 201) return resolve({
               creator: global.creator,
               status: false,
               msg: json.status_message
            })
            resolve({
               creator: global.creator,
               status: true,
               data: json
            })
         } catch (e) {
            console.error('[Midtrans]:', e.response.data.status_message)
            resolve({
               creator: global.creator,
               status: false,
               msg: e.response.data.status_message
            })
         }
      })
   }
}