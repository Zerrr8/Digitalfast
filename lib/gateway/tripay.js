import axios from 'axios'
import crypto from 'node:crypto'
import moment from 'moment-timezone'
import qrcode from 'qrcode'

export default class Tripay {
   constructor(options = {}) {
      this.baseUrl = 'https://tripay.co.id'
      this.apiKey = process.env.TRIPAY_APIKEY
      this.privateKey = process.env.TRIPAY_PRIVATE_KEY
      this.merchant = process.env.TRIPAY_MERCHANT_ID
      this.client = axios.create({
         baseURL: this.baseUrl,
         headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
         },
         validateStatus: function (status) {
            return status < 999 // ignore http error
         }
      })
      this.expiration = options.expiration || 30
      this.prefix = options.prefix || 'NXR'
      this.sandbox = options.sandbox === true ? 'api-sandbox' : 'api'
   }

   createSignature = (refId, amount) => crypto.createHmac('sha256', this.privateKey)
      .update(this.merchant + refId + amount)
      .digest('hex')

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

   createPayment = async (amount, method = 'qris', options = {}) => new Promise(async resolve => {
      try {
         const ref = this.prefix + '-' + this.makeId(8)
         const json = await (await this.client.post(`/${this.sandbox}/transaction/create`, {
            method: method?.toUpperCase(),
            merchant_ref: ref,
            amount,
            customer_email: options?.email,
            order_items: [{
               "sku": options?.product_id,
               "name": options?.product_name,
               "price": amount,
               "quantity": 1,
               "subtotal": amount
            }],
            customer_name: options?.customer_name || 'Customer',
            expired_time: parseInt(Math.floor(new Date() / 1000) + (this.expiration * 60)),
            signature: this.createSignature(ref, amount)
         })).data

         if (!json?.success) throw new Error(json.message)

         resolve({
            creator: global.creator,
            status: true,
            data: {
               ...json.data,
               qr_image: method?.toUpperCase() === 'QRIS' ? await qrcode.toDataURL(json.data.qr_string, {
                  scale: 8
               }) : null
            }
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })

   checkPayment = id => new Promise(async resolve => {
      try {
         const json = await (await this.client.get(`/${this.sandbox}/transaction/detail?reference=${id}`, {
            id
         })).data
         if (!json?.success) throw new Error(json.message)

         resolve({
            creator: global.creator,
            status: true,
            data: json.data
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}