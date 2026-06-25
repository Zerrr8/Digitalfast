import Tripay from './gateway/tripay.js'
import Xendit from './gateway/xendit.js'
import Midtrans from './gateway/midtrans.js'
import RumahOTP from './gateway/rumahotp.js'

const options = {
   prefix: 'YSH',
   expiration: 10
}

const tripay = new Tripay({
   ...options
})

const xendit = new Xendit({
   success_callback_url: `${process.env.DOMAIN || 'https://shop.yilzicode.com'}/dashboard`,
   failure_callback_url: `${process.env.DOMAIN || 'https://shop.yilzicode.com'}/dashboard`,
   ...options
})

const midtrans = new Midtrans({
   ...options
})

const rumahotp = new RumahOTP({
   ...options
})

class Payment {
   constructor() {
      this.model = process.env.PAYMENT_GATEWAY
   }

   createPayment = async (amount, method = 'qris', options = {}) => {
      try {
         const json = await (
            this.model === 'rumahotp'
               ? rumahotp.createPayment(amount, method, options)
               : this.model === 'xendit'
                  ? xendit.createPayment(amount, method, options)
                  : this.model === 'midtrans'
                     ? midtrans.createPayment(amount, method, options)
                     : tripay.createPayment(amount, method, options)
         )

         if (!json.status) throw new Error(json.msg)

         const id = this.model === 'xendit'
            ? json.data.metadata.sku
            : this.model === 'midtrans'
               ? json.data.order_id
               : json.data.merchant_ref

         const receipt = this.model === 'xendit'
            ? json.data.id
            : this.model === 'midtrans'
               ? json.data.transaction_id
               : json.data.reference

         return ({
            creator: global.creator,
            status: true,
            data: { id, receipt, qr: json.data.qr_image || json.data.qr }
         })
      } catch (e) {
         return ({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   }

   checkPayment = async receipt => {
      try {
         const json = await (
            this.model === 'rumahotp'
               ? rumahotp.checkPayment(receipt)
               : this.model === 'xendit'
                  ? xendit.checkPayment(receipt)
                  : this.model === 'midtrans'
                     ? midtrans.checkPayment(receipt)
                     : tripay.checkPayment(receipt)
         )

         if (!json.status) throw new Error(json.msg)

         const result = this.model === 'rumahotp'
            ? json.data.status === 'SUCCESS'
            : this.model === 'xendit'
               ? json.data.status === 'SUCCEEDED'
               : this.model === 'midtrans'
                  ? json.data.transaction_status === 'settlement'
                  : json.data.status === 'PAID'

         if (!result) throw new Error('Transaksi belum terselesaikan.')

         return json
      } catch (e) {
         return ({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   }

   cancelPayment = async receipt => {
      try {
         const json = await (
            this.model === 'rumahotp'
               ? rumahotp.cancelPayment(receipt)
               : { status: false, msg: 'Metode pembatalan tidak didukung untuk gateway ini.' }
         )

         return json
      } catch (e) {
         return ({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   }
}

export default new Payment
