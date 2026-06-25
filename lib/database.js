import fs from 'fs/promises'
import path from 'path'
import RedisDB from './system/redis.js'
import Utils from './functions.js'

class Database {
   constructor() {
      this.redis = RedisDB.client
   }

   // ═══════════════════════════════════════
   //  NOTIFICATIONS & INBOX
   // ═══════════════════════════════════════

   addInbox = async (email, { title, message, tag = 'Info' }) => {
      try {
         const id = `inb-${Date.now()}`
         const data = { id, title, message, tag, timestamp: new Date().toISOString(), read: false }
         await this.redis.lpush(`inbox:${email}`, JSON.stringify(data))
         return { status: true, msg: 'Inbox added.' }
      } catch (e) {
         return { status: false, msg: e.message }
      }
   }

   getInbox = async (email) => {
      try {
         const list = await this.redis.lrange(`inbox:${email}`, 0, -1)
         const inboxes = list.map(item => typeof item === 'string' ? JSON.parse(item) : item)
         return { status: true, data: inboxes }
      } catch (e) {
         return { status: false, msg: e.message }
      }
   }

   markInboxRead = async (email) => {
      try {
         const list = await this.redis.lrange(`inbox:${email}`, 0, -1)
         await this.redis.del(`inbox:${email}`)
         for (let i = list.length - 1; i >= 0; i--) {
            let item = typeof list[i] === 'string' ? JSON.parse(list[i]) : list[i]
            item.read = true
            await this.redis.lpush(`inbox:${email}`, JSON.stringify(item))
         }
         return { status: true }
      } catch (e) {
         return { status: false, msg: e.message }
      }
   }

   // ═══════════════════════════════════════
   //  USER OPERATIONS
   // ═══════════════════════════════════════

   getUser = async (input) => {
      try {
         // Try by email (primary key)
         let user = await this.redis.get(`user:${input}`)
         if (user) {
            if (typeof user === 'string') user = JSON.parse(user)
            return { creator: global.creator, status: true, data: { ...user, _id: user._id || input } }
         }

         // Try by username (scan all users)
         const userKeys = await this.redis.smembers('users:all')
         for (const key of userKeys) {
            let u = await this.redis.get(`user:${key}`)
            if (u) {
               if (typeof u === 'string') u = JSON.parse(u)
               if (u.username === input) {
                  return { creator: global.creator, status: true, data: { ...u, _id: u._id || key } }
               }
            }
         }

         throw new Error('Pengguna tidak ditemukan')
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getAllUsers = async (options = {}) => {
      try {
         const { query = {}, sort = { joined_at: -1 }, limit = 0, skip = 0 } = options
         const userKeys = await this.redis.smembers('users:all')

         let users = []
         for (const key of userKeys) {
            let user = await this.redis.get(`user:${key}`)
            if (user) {
               if (typeof user === 'string') user = JSON.parse(user)
               user._id = user._id || key
               // Apply query filters
               let match = true
               for (const [field, value] of Object.entries(query)) {
                  if (user[field] !== value) { match = false; break }
               }
               if (match) users.push(user)
            }
         }

         // Sort
         const sortField = Object.keys(sort)[0] || 'joined_at'
         const sortOrder = Object.values(sort)[0] || -1
         users.sort((a, b) => {
            const aVal = new Date(a[sortField] || 0).getTime()
            const bVal = new Date(b[sortField] || 0).getTime()
            return sortOrder === -1 ? bVal - aVal : aVal - bVal
         })

         // Pagination
         if (skip > 0) users = users.slice(skip)
         if (limit > 0) users = users.slice(0, limit)

         return { creator: global.creator, status: true, data: users }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   userAdd = async (email, name, extras = {}) => {
      try {
         let existing = await this.redis.get(`user:${email}`)
         if (existing) {
            if (typeof existing === 'string') existing = JSON.parse(existing)
            if (existing.role === 'banned') throw new Error('Akun Anda telah ditangguhkan')
            throw new Error('Email sudah terdaftar')
         }

         const isAdmin = email === process.env.ADMIN_EMAIL
         const user = {
            _id: email,
            name: name || 'User',
            username: extras.username || name || email.split('@')[0],
            phone: extras.phone || '',
            role: isAdmin ? 'admin' : 'user',
            joined_at: new Date().toISOString(),
            verified: extras.verified !== undefined ? extras.verified : isAdmin,
            registrationType: extras.registrationType || 'google',
            last_activity: new Date().toISOString()
         }

         // Add password if provided (manual registration)
         if (extras.password) {
            user.password = extras.password
         }

         await this.redis.set(`user:${email}`, JSON.stringify(user))
         await this.redis.sadd('users:all', email)

         return { creator: global.creator, status: true, msg: 'Pendaftaran berhasil' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   userEdit = async (userId, updateData) => {
      try {
         let user = await this.redis.get(`user:${userId}`)
         if (!user) throw new Error('Pengguna tidak ditemukan')
         if (typeof user === 'string') user = JSON.parse(user)

         delete updateData._id
         delete updateData.email
         delete updateData.role
         delete updateData.joined_at
         updateData.last_activity = new Date().toISOString()

         const updated = { ...user, ...updateData }
         await this.redis.set(`user:${userId}`, JSON.stringify(updated))

         return { creator: global.creator, status: true, msg: 'Profil pengguna berhasil diperbarui' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   userDelete = async (userId) => {
      try {
         let user = await this.redis.get(`user:${userId}`)
         if (!user) throw new Error('Pengguna tidak ditemukan')
         if (typeof user === 'string') user = JSON.parse(user)
         if (user._id === process.env.ADMIN_EMAIL) throw new Error('Tidak dapat menghapus akun administrator utama')

         await this.redis.del(`user:${userId}`)
         await this.redis.srem('users:all', userId)

         return { creator: global.creator, status: true, msg: 'Pengguna berhasil dihapus' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   // ═══════════════════════════════════════
   //  TAG OPERATIONS
   // ═══════════════════════════════════════

   tagAdd = async (tagName) => {
      try {
         if (!tagName) throw new Error('Nama tag wajib diisi')

         // Check duplicate
         const tagKeys = await this.redis.smembers('tags:all')
         for (const key of tagKeys) {
            let tag = await this.redis.get(`tag:${key}`)
            if (tag) {
               if (typeof tag === 'string') tag = JSON.parse(tag)
               if (tag.name === tagName) throw new Error('Tag dengan nama tersebut sudah ada')
            }
         }

         const tagId = Utils.makeId(8)
         const tagData = { _id: tagId, name: tagName }

         await this.redis.set(`tag:${tagId}`, JSON.stringify(tagData))
         await this.redis.sadd('tags:all', tagId)

         return { creator: global.creator, status: true, msg: 'Tag berhasil ditambahkan', data: tagData }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getAllTags = async () => {
      try {
         const tagKeys = await this.redis.smembers('tags:all')
         let tags = []

         for (const key of tagKeys) {
            let tag = await this.redis.get(`tag:${key}`)
            if (tag) {
               if (typeof tag === 'string') tag = JSON.parse(tag)
               tag._id = tag._id || key
               tags.push(tag)
            }
         }

         tags.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
         return { creator: global.creator, status: true, data: tags }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   tagDelete = async (tagId) => {
      try {
         if (!tagId) throw new Error('ID Tag tidak valid')

         // Cascade delete products with this tag
         const productKeys = await this.redis.smembers('products:all')
         let deletedProductsCount = 0
         for (const key of productKeys) {
            let product = await this.redis.get(`product:${key}`)
            if (product) {
               if (typeof product === 'string') product = JSON.parse(product)
               if (product.tag_id === tagId) {
                  await this.productDelete(key)
                  deletedProductsCount++
               }
            }
         }

         await this.redis.del(`tag:${tagId}`)
         await this.redis.srem('tags:all', tagId)

         return {
            creator: global.creator,
            status: true,
            msg: `Tag berhasil dihapus. ${deletedProductsCount} produk terkait juga telah dihapus.`
         }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   // ═══════════════════════════════════════
   //  PRODUCT OPERATIONS
   // ═══════════════════════════════════════

   productAdd = async (productData = {}) => {
      try {
         const { name, description, price, original_price, tag_id, imageUrl, preview_images, file, additional_information, stock, show, is_featured } = productData
         if (!name || !price) throw new Error('Nama dan harga produk wajib diisi')

         // If featured, unset others
         if (is_featured) {
            const allKeys = await this.redis.smembers('products:all')
            for (const key of allKeys) {
               let p = await this.redis.get(`product:${key}`)
               if (p) {
                  if (typeof p === 'string') p = JSON.parse(p)
                  if (p.is_featured) {
                     p.is_featured = false
                     await this.redis.set(`product:${key}`, JSON.stringify(p))
                  }
               }
            }
         }

         const allKeys = await this.redis.smembers('products:all')
         const totalProducts = allKeys.length

         const productId = Utils.makeId(4)
         const newProduct = {
            _id: productId,
            name,
            description: description || '',
            price: Number(price),
            original_price: Number(original_price) || 0,
            sales: 0,
            tag_id: tag_id || null,
            imageUrl: imageUrl || null,
            preview_images: preview_images || [],
            file: file || null,
            additional_information: additional_information || [],
            stock: Number(stock) || -1,
            show: show !== undefined ? show : true,
            is_featured: is_featured || false,
            order: totalProducts + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
         }

         await this.redis.set(`product:${productId}`, JSON.stringify(newProduct))
         await this.redis.sadd('products:all', productId)

         return { creator: global.creator, status: true, msg: 'Produk berhasil ditambahkan', data: newProduct }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   productUpdateOrder = async (orderedIds) => {
      try {
         if (!Array.isArray(orderedIds)) throw new Error("Data urutan tidak valid.")

         let modifiedCount = 0
         for (let i = 0; i < orderedIds.length; i++) {
            let product = await this.redis.get(`product:${orderedIds[i]}`)
            if (product) {
               if (typeof product === 'string') product = JSON.parse(product)
               product.order = i + 1
               await this.redis.set(`product:${orderedIds[i]}`, JSON.stringify(product))
               modifiedCount++
            }
         }

         return { creator: global.creator, status: true, msg: `Urutan ${modifiedCount} produk berhasil diperbarui.` }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   productUpdate = async (productId, updateData) => {
      try {
         if (!productId) throw new Error('Format ID Produk tidak valid')

         let product = await this.redis.get(`product:${productId}`)
         if (!product) throw new Error('Produk tidak ditemukan')
         if (typeof product === 'string') product = JSON.parse(product)

         // If setting featured, unset others
         if (updateData.is_featured === true) {
            const allKeys = await this.redis.smembers('products:all')
            for (const key of allKeys) {
               if (key !== productId) {
                  let p = await this.redis.get(`product:${key}`)
                  if (p) {
                     if (typeof p === 'string') p = JSON.parse(p)
                     if (p.is_featured) {
                        p.is_featured = false
                        await this.redis.set(`product:${key}`, JSON.stringify(p))
                     }
                  }
               }
            }
         }

         if (updateData.tag_id === '') updateData.tag_id = null
         if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock)

         delete updateData._id
         delete updateData.id
         delete updateData.badge
         delete updateData.label
         delete updateData.created_at
         updateData.updated_at = new Date().toISOString()

         const updated = { ...product, ...updateData }
         await this.redis.set(`product:${productId}`, JSON.stringify(updated))

         return { creator: global.creator, status: true, msg: 'Produk berhasil diperbarui' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   productDecrementStock = async (productId, quantity = 1) => {
      try {
         if (!productId) throw new Error('ID Produk wajib diisi')

         let product = await this.redis.get(`product:${productId}`)
         if (!product) throw new Error('Produk tidak ditemukan saat akan mengurangi stok')
         if (typeof product === 'string') product = JSON.parse(product)

         if (product.stock !== -1) {
            product.stock -= quantity
            product.updated_at = new Date().toISOString()
            await this.redis.set(`product:${productId}`, JSON.stringify(product))
            return { creator: global.creator, status: true, msg: `Stok produk berhasil dikurangi sebanyak ${quantity}` }
         }

         return { creator: global.creator, status: true, msg: 'Produk memiliki stok tidak terbatas, tidak ada pengurangan.' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   /**
    * Populate tag data for a product
    */
   _populateTag = async (product) => {
      if (product.tag_id) {
         let tag = await this.redis.get(`tag:${product.tag_id}`)
         if (tag) {
            if (typeof tag === 'string') tag = JSON.parse(tag)
            product.tag = tag
         } else {
            product.tag = null
         }
      } else {
         product.tag = null
      }
      return product
   }

   getProduct = async (productId) => {
      try {
         let product = await this.redis.get(`product:${productId}`)
         if (!product) throw new Error('Produk tidak ditemukan')
         if (typeof product === 'string') product = JSON.parse(product)

         // Remove sensitive file data
         const productCopy = { ...product }
         if (productCopy.file) {
            productCopy.file = { ...productCopy.file }
            delete productCopy.file.data
         }

         await this._populateTag(productCopy)
         return { creator: global.creator, status: true, data: productCopy }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getAllProducts = async (options = {}) => {
      try {
         const { query = {}, sort = { order: 1, created_at: -1 }, limit = 10, skip = 0 } = options
         const productKeys = await this.redis.smembers('products:all')

         let products = []
         for (const key of productKeys) {
            let product = await this.redis.get(`product:${key}`)
            if (product) {
               if (typeof product === 'string') product = JSON.parse(product)
               product._id = product._id || key

               // Apply query filters
               let match = true
               for (const [field, value] of Object.entries(query)) {
                  if (product[field] !== value) { match = false; break }
               }
               if (!match) continue

               // Remove sensitive data
               const productCopy = { ...product }
               delete productCopy.sales
               if (productCopy.file) {
                  productCopy.file = { ...productCopy.file }
                  delete productCopy.file.data
               }

               await this._populateTag(productCopy)
               products.push(productCopy)
            }
         }

         // Multi-field sort
         const sortFields = Object.entries(sort)
         products.sort((a, b) => {
            for (const [field, order] of sortFields) {
               let aVal = a[field]
               let bVal = b[field]
               if (typeof aVal === 'string' && !isNaN(Date.parse(aVal))) {
                  aVal = new Date(aVal).getTime()
                  bVal = new Date(bVal).getTime()
               }
               aVal = aVal || 0
               bVal = bVal || 0
               if (aVal !== bVal) {
                  return order === 1 ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
               }
            }
            return 0
         })

         const total = products.length
         if (skip > 0) products = products.slice(skip)
         if (limit > 0) products = products.slice(0, limit)

         return { creator: global.creator, status: true, data: { products, total } }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getAllProductsForAdmin = async (options = {}) => {
      try {
         const { query = {}, sort = { created_at: -1 }, limit = 10, skip = 0 } = options
         const productKeys = await this.redis.smembers('products:all')

         let products = []
         for (const key of productKeys) {
            let product = await this.redis.get(`product:${key}`)
            if (product) {
               if (typeof product === 'string') product = JSON.parse(product)
               product._id = product._id || key

               let match = true
               for (const [field, value] of Object.entries(query)) {
                  if (product[field] !== value) { match = false; break }
               }
               if (!match) continue

               if (product.file) {
                  product.file = { ...product.file }
                  delete product.file.data
               }

               await this._populateTag(product)
               products.push(product)
            }
         }

         const sortField = Object.keys(sort)[0] || 'created_at'
         const sortOrder = Object.values(sort)[0] || -1
         products.sort((a, b) => {
            let aVal = new Date(a[sortField] || 0).getTime()
            let bVal = new Date(b[sortField] || 0).getTime()
            return sortOrder === -1 ? bVal - aVal : aVal - bVal
         })

         const total = products.length
         if (skip > 0) products = products.slice(skip)
         if (limit > 0) products = products.slice(0, limit)

         return { creator: global.creator, status: true, data: { products, total } }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getFeaturedProduct = async () => {
      try {
         const productKeys = await this.redis.smembers('products:all')

         for (const key of productKeys) {
            let product = await this.redis.get(`product:${key}`)
            if (product) {
               if (typeof product === 'string') product = JSON.parse(product)
               if (product.is_featured && product.show) {
                  const productCopy = { ...product }
                  delete productCopy.sales
                  if (productCopy.file) {
                     productCopy.file = { ...productCopy.file }
                     delete productCopy.file.data
                  }
                  await this._populateTag(productCopy)
                  return { creator: global.creator, status: true, data: productCopy }
               }
            }
         }

         return { creator: global.creator, status: true, data: null }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getProductWithFile = async (productId) => {
      try {
         let product = await this.redis.get(`product:${productId}`)
         if (!product) throw new Error('Produk internal tidak ditemukan')
         if (typeof product === 'string') product = JSON.parse(product)
         return { creator: global.creator, status: true, data: product }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   productIncrementSales = async (productId, amount = 1) => {
      try {
         if (!productId) throw new Error('ID Produk wajib diisi')

         let product = await this.redis.get(`product:${productId}`)
         if (!product) throw new Error('Produk tidak ditemukan')
         if (typeof product === 'string') product = JSON.parse(product)

         product.sales = (product.sales || 0) + amount
         product.updated_at = new Date().toISOString()
         await this.redis.set(`product:${productId}`, JSON.stringify(product))

         return { creator: global.creator, status: true, msg: `Penjualan produk berhasil ditambah sebanyak ${amount}` }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   productDelete = async (productId) => {
      try {
         if (!productId) throw new Error('Format ID Produk tidak valid')

         let product = await this.redis.get(`product:${productId}`)
         if (!product) throw new Error('Produk tidak ditemukan atau sudah dihapus')
         if (typeof product === 'string') product = JSON.parse(product)

         // Delete local file
         if (product.file && product.file.type === 'local' && product.file.data) {
            try {
               const filePath = path.join(process.cwd(), 'public', product.file.data)
               await fs.unlink(filePath)
               console.log(`File lokal berhasil dihapus: ${filePath}`)
            } catch (fileError) {
               if (fileError.code === 'ENOENT') {
                  console.warn(`File lokal tidak ditemukan: ${fileError.path}`)
               } else {
                  console.error(`Gagal menghapus file lokal:`, fileError)
               }
            }
         }

         // Delete preview images
         if (product.preview_images && Array.isArray(product.preview_images)) {
            for (const imgPath of product.preview_images) {
               if (!imgPath.startsWith('http')) {
                  try {
                     const fullPath = path.join(process.cwd(), 'public', imgPath)
                     await fs.unlink(fullPath)
                  } catch (err) { console.error("Gagal hapus preview:", err.message) }
               }
            }
         }

         await this.redis.del(`product:${productId}`)
         await this.redis.srem('products:all', productId)

         return { creator: global.creator, status: true, msg: 'Produk dan file terkait berhasil dihapus' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   // ═══════════════════════════════════════
   //  INVOICE OPERATIONS
   // ═══════════════════════════════════════

   invoiceAdd = async (customer, data = {}) => {
      try {
         const newInvoice = {
            _id: data.id,
            email: customer || null,
            amount: data.amount || 0,
            items: data.items || [],
            qr: data.qr || null,
            va: data.va || null,
            redirect: data.redirect || null,
            status: 'Pending',
            additional_information: data.additional_information || [],
            created_at: new Date().toISOString(),
            paid_at: null,
            payment_method: data.method || null,
            receipt: data.receipt || null
         }

         await this.redis.set(`invoice:${data.id}`, JSON.stringify(newInvoice))
         await this.redis.sadd('invoices:all', data.id)
         if (customer) {
            await this.redis.sadd(`invoices:user:${customer}`, data.id)
         }

         return { creator: global.creator, status: true, msg: 'Invoice berhasil dibuat', data: newInvoice }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getInvoice = async (invoiceId) => {
      try {
         let invoice = await this.redis.get(`invoice:${invoiceId}`)
         if (!invoice) throw new Error('Invoice tidak ditemukan')
         if (typeof invoice === 'string') invoice = JSON.parse(invoice)
         return { creator: global.creator, status: true, data: invoice }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getAllInvoices = async (options = {}) => {
      try {
         const { filter = {}, sort = { created_at: -1 }, limit = 10, skip = 0, search = '' } = options

         let invoiceKeys
         if (filter.email) {
            invoiceKeys = await this.redis.smembers(`invoices:user:${filter.email}`)
         } else {
            invoiceKeys = await this.redis.smembers('invoices:all')
         }

         let invoices = []
         for (const key of invoiceKeys) {
            let invoice = await this.redis.get(`invoice:${key}`)
            if (invoice) {
               if (typeof invoice === 'string') invoice = JSON.parse(invoice)
               invoice._id = invoice._id || key

               // Apply status filter
               if (filter.status && invoice.status !== filter.status) continue

               // Populate product names
               const productNames = []
               if (invoice.items && Array.isArray(invoice.items)) {
                  for (const item of invoice.items) {
                     if (item.id) {
                        let product = await this.redis.get(`product:${item.id}`)
                        if (product) {
                           if (typeof product === 'string') product = JSON.parse(product)
                           productNames.push(product.name)
                        }
                     }
                  }
               }

               // Apply search filter
               if (search) {
                  const searchLower = search.toLowerCase()
                  const matchSearch =
                     productNames.some(n => n.toLowerCase().includes(searchLower)) ||
                     (invoice.email && invoice.email.toLowerCase().includes(searchLower)) ||
                     (invoice._id && invoice._id.toLowerCase().includes(searchLower))

                  if (!matchSearch) continue
               }

               invoices.push({
                  _id: invoice._id,
                  email: invoice.email,
                  amount: invoice.amount,
                  productNames,
                  items: invoice.items || [], // Added so we can get item IDs
                  status: invoice.status,
                  created_at: invoice.created_at,
                  paid_at: invoice.paid_at
               })
            }
         }

         // Sort
         const sortField = Object.keys(sort)[0] || 'created_at'
         const sortOrder = Object.values(sort)[0] || -1
         invoices.sort((a, b) => {
            const aVal = new Date(a[sortField] || 0).getTime()
            const bVal = new Date(b[sortField] || 0).getTime()
            return sortOrder === -1 ? bVal - aVal : aVal - bVal
         })

         const total = invoices.length
         if (skip > 0) invoices = invoices.slice(skip)
         if (limit > 0) invoices = invoices.slice(0, limit)

         return { creator: global.creator, status: true, data: { invoices, total } }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   invoiceUpdate = async (invoiceId, updateData) => {
      try {
         let invoice = await this.redis.get(`invoice:${invoiceId}`)
         if (!invoice) throw new Error('Invoice tidak ditemukan')
         if (typeof invoice === 'string') invoice = JSON.parse(invoice)

         delete updateData._id
         delete updateData.items
         delete updateData.amount
         delete updateData.created_at

         if (updateData.status === 'Paid' && !updateData.paid_at) {
            updateData.paid_at = new Date().toISOString()
         }

         const updated = { ...invoice, ...updateData }
         await this.redis.set(`invoice:${invoiceId}`, JSON.stringify(updated))

         return { creator: global.creator, status: true, msg: 'Invoice berhasil diperbarui' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   invoiceDelete = async (invoiceId) => {
      try {
         let invoice = await this.redis.get(`invoice:${invoiceId}`)
         if (invoice) {
            if (typeof invoice === 'string') invoice = JSON.parse(invoice)
            if (invoice.status === 'Paid') {
               throw new Error('Tidak dapat menghapus invoice yang sudah lunas')
            }
            // Remove from user's invoice set
            if (invoice.email) {
               await this.redis.srem(`invoices:user:${invoice.email}`, invoiceId)
            }
         } else {
            throw new Error('Gagal menghapus invoice')
         }

         await this.redis.del(`invoice:${invoiceId}`)
         await this.redis.srem('invoices:all', invoiceId)

         return { creator: global.creator, status: true, msg: 'Invoice berhasil dihapus' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   cleanupPendingInvoices = async () => {
      try {
         const tenMinutesAgo = Date.now() - 10 * 60 * 1000
         const invoiceKeys = await this.redis.smembers('invoices:all')
         let deletedCount = 0

         for (const key of invoiceKeys) {
            let invoice = await this.redis.get(`invoice:${key}`)
            if (invoice) {
               if (typeof invoice === 'string') invoice = JSON.parse(invoice)
               if (invoice.status === 'Pending' && new Date(invoice.created_at).getTime() < tenMinutesAgo) {
                  if (invoice.email) {
                     await this.redis.srem(`invoices:user:${invoice.email}`, key)
                  }
                  await this.redis.del(`invoice:${key}`)
                  await this.redis.srem('invoices:all', key)
                  deletedCount++
               }
            }
         }

         if (deletedCount > 0) {
            console.log(`[Scheduler] Berhasil menghapus ${deletedCount} invoice yang kadaluarsa.`)
         }

         return {
            creator: global.creator,
            status: true,
            msg: `${deletedCount} invoice(s) kadaluarsa berhasil dihapus.`
         }
      } catch (e) {
         return { creator: global.creator, status: true, msg: e.message }
      }
   }

   // ═══════════════════════════════════════
   //  REVIEW OPERATIONS
   // ═══════════════════════════════════════

   reviewAdd = async (productId, userEmail, userName, rating, comment) => {
      try {
         if (!productId || !userEmail || !rating) throw new Error('Data review tidak lengkap')

         const reviewId = `${productId}_${userEmail}`
         let existing = await this.redis.get(`review:${reviewId}`)
         if (existing) {
            throw new Error('Anda sudah memberikan ulasan untuk produk ini')
         }

         const newReview = {
            _id: reviewId,
            productId,
            userEmail,
            userName,
            rating: Number(rating),
            comment: comment || '',
            created_at: new Date().toISOString()
         }

         await this.redis.set(`review:${reviewId}`, JSON.stringify(newReview))
         await this.redis.sadd(`reviews:product:${productId}`, reviewId)
         await this.redis.sadd('reviews:all', reviewId)

         return { creator: global.creator, status: true, msg: 'Ulasan berhasil ditambahkan', data: newReview }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getReviews = async (productId) => {
      try {
         const reviewKeys = await this.redis.smembers(`reviews:product:${productId}`)
         let reviews = []

         for (const key of reviewKeys) {
            let rev = await this.redis.get(`review:${key}`)
            if (rev) {
               try {
                  if (typeof rev === 'string') rev = JSON.parse(rev)
                  reviews.push(rev)
               } catch (e) {
                  console.warn(`[getReviews] Skipping malformed review ${key}`)
               }
            }
         }

         reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

         return { creator: global.creator, status: true, data: reviews }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   getAllReviews = async () => {
      try {
         let keys = await this.redis.smembers('reviews:all')
         if (keys.length === 0) {
            const productKeys = await this.redis.smembers('products:all')
            for (const pk of productKeys) {
               const pRevs = await this.redis.smembers(`reviews:product:${pk}`)
               for (const pr of pRevs) {
                  keys.push(pr)
                  await this.redis.sadd('reviews:all', pr)
               }
            }
         }
         let reviews = []
         for (const key of keys) {
            let rev = await this.redis.get(`review:${key}`)
            if (rev) {
               try {
                  let parseRev = typeof rev === 'string' ? JSON.parse(rev) : rev
                  if (parseRev.productId) {
                     try {
                        let product = await this.redis.get(`product:${parseRev.productId}`)
                        if (product) {
                           let parsedProduct = typeof product === 'string' ? JSON.parse(product) : product
                           parseRev.productName = parsedProduct.name
                        }
                     } catch (err) {
                        console.error('Failed to parse product for review:', parseRev.productId)
                     }
                  }
                  reviews.push(parseRev)
               } catch (e) {
                  console.warn(`[getAllReviews] Skipping malformed review ${key}`);
               }
            }
         }
         reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
         return { creator: global.creator, status: true, data: reviews }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

   reviewDelete = async (reviewId, productId) => {
      try {
         if (!reviewId) throw new Error('ID Review tidak valid')

         await this.redis.del(`review:${reviewId}`)
         if (productId) {
            await this.redis.srem(`reviews:product:${productId}`, reviewId)
         }
         await this.redis.srem('reviews:all', reviewId)

         return { creator: global.creator, status: true, msg: 'Ulasan berhasil dihapus' }
      } catch (e) {
         return { creator: global.creator, status: false, msg: e.message }
      }
   }

}

export default new Database