import { Groq } from 'groq-sdk'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import Database from './database.js'
import { memory, products } from './system/mapping.js'

class Assistant {
   constructor() {
      this.client = new Groq({
         apiKey: process.env.GROQ_API
      })

      this.SYSTEM_PROMPT = []
      this.init()
   }

   init = async () => {
      try {
         await this.reloadProductData()
      } catch (e) {
         console.error(e)
      }
   }

   reloadProductData = async () => {
      try {
         const limitNum = 20 // product limit for AI data
         const skip = (1 - 1) * limitNum

         const options = {
            query: { show: true },
            sort: { order: 1, created_at: -1 },
            limit: limitNum,
            skip: skip
         }

         const json = await Database.getAllProducts(options)
         if (json.status) {
            products.set('all', json.data)

            const trimmedData = json.data.products ? json.data.products.map(p => ({
               name: p.name,
               price: p.price,
               stock: p.stock,
               tag: p.tag?.name || '',
               desc: p.description ? p.description.replace(/(<([^>]+)>)/gi, "").substring(0, 150) + '...' : ''
            })) : []

            const __filename = fileURLToPath(import.meta.url)
            const __dirname = path.dirname(__filename)
            const promptPath = path.join(__dirname, 'prompt.txt')

            this.SYSTEM_PROMPT = [{
               role: 'system',
               content: fs.readFileSync(promptPath, 'utf-8') + '\n\nData:\n' + JSON.stringify(trimmedData)
            }]
            console.log('Product data reloaded successfully.')
         } else {
            console.warn('Failed to reload product data:', json.msg)
         }
      } catch (e) {
         console.error('Error reloading product data:', e)
      }
   }

   chat = (prompt, id = null) => new Promise(async resolve => {
      try {
         if (!id) {
            id = crypto.randomUUID()
         }

         if (!memory.has(id)) {
            memory.set(id, [...this.SYSTEM_PROMPT])
         }

         let history = memory.get(id)

         history.push({
            role: 'user',
            content: prompt
         })

         const json = await this.client.chat.completions.create({
            messages: history,
            model: 'openai/gpt-oss-20b',
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            reasoning_effort: 'medium'
         })

         if (!json?.choices?.[0]?.message?.content) {
            throw new Error('Sorry, assistant not available right now...')
         }

         history.push({
            role: 'assistant',
            content: json.choices[0].message.content,
         })

         memory.set(id, history)

         resolve({
            creator: global.creator,
            status: true,
            data: {
               id,
               reply: json.choices[0].message.content,
               history
            }
         })
      } catch (e) {
         console.error(e)
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}

export default new Assistant