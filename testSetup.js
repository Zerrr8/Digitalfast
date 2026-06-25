import 'dotenv/config'
import bcrypt from 'bcryptjs'
import Database from './lib/database.js'

async function setup() {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('123456', salt)

    await Database.userAdd('testuser2@gmail.com', 'Test User', { password: hashedPassword, username: 'testuser123', phone: '081234567', registrationType: 'manual', verified: true, role: 'user' })

    const productAddResult = await Database.productAdd({ name: 'Produk Testing', price: 50000 })
    const productId = productAddResult.data._id

    await Database.invoiceAdd('testuser2@gmail.com', { id: 'INVTEST01', amount: 50000, method: 'QRIS', items: [{ id: productId }] })
    await Database.invoiceUpdate('INVTEST01', { status: 'Paid', paid_at: new Date().toISOString() })

    console.log('Test user & invoice created, Product ID:', productId)
    process.exit(0)
}

setup()
