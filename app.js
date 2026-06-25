import 'dotenv/config' // Reloading ENV variables to ensure they're available before any other imports
import './lib/system/config.js'
import { Utils, Database } from './lib/index.js'
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import requestIp from 'request-ip'
import os from 'node:os'
import CFonts from 'cfonts'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'cookie-session'
import createRouter from './lib/system/defineRoute.js'

import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
   console.error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are not set.')
   process.exit(1)
}

const PORT = process.env.PORT || 3000

const runServer = async () => {
   const app = express()

   const httpServer = createServer(app)
   const io = new SocketIOServer(httpServer, {
      cors: {
         origin: '*'
      }
   })

   // Log interceptor for Admin Dashboard monitoring
   const originalLog = console.log
   const originalError = console.error
   const originalWarn = console.warn

   const broadcastLog = (type, args) => {
      const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
      io.emit('server-log', {
         type,
         message: msg,
         timestamp: new Date().toISOString()
      })
   }

   console.log = function (...args) {
      originalLog.apply(console, args)
      broadcastLog('info', args)
   }
   console.error = function (...args) {
      originalError.apply(console, args)
      broadcastLog('error', args)
   }
   console.warn = function (...args) {
      originalWarn.apply(console, args)
      broadcastLog('warn', args)
   }

   const { exec } = await import('child_process')

   io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`)

      socket.on('execute-command', async (cmd) => {
         console.log(`> Executing admin command: ${cmd}`)
         try {
            if (cmd.startsWith('npm') || cmd.startsWith('node') || cmd.startsWith('pm2') || cmd.startsWith('ping') || cmd.startsWith('ls') || cmd.startsWith('dir') || cmd.startsWith('clear')) {
               exec(cmd, { cwd: process.cwd(), shell: 'powershell.exe' }, (error, stdout, stderr) => {
                  if (error) {
                     broadcastLog('error', [error.message])
                     return
                  }
                  if (stderr) broadcastLog('warn', [stderr])
                  if (stdout) broadcastLog('info', [stdout])
               })
            } else if (cmd.startsWith('eval ')) {
               // Allows direct node javascript evaluation
               const code = cmd.replace('eval ', '')
               const result = await eval(`(async () => { return ${code} })()`)
               broadcastLog('info', [result])
            } else {
               exec(cmd, { cwd: process.cwd(), shell: 'powershell.exe' }, (error, stdout, stderr) => {
                  if (error) {
                     broadcastLog('error', [error.message])
                     return
                  }
                  if (stderr) broadcastLog('warn', [stderr])
                  if (stdout) broadcastLog('info', [stdout])
               })
            }
         } catch (error) {
            broadcastLog('error', [error.message || String(error)])
         }
      })

      const system = async () => {
         const cpuUsage = os.loadavg()[0]
         const totalMemory = os.totalmem()
         const freeMemory = os.freemem()
         const usedMemory = totalMemory - freeMemory
         const diskUsage = 0

         const information = {
            device: `${os.type()} (${os.arch()})`,
            cpuUsage: cpuUsage.toFixed(2),
            memory: {
               total: totalMemory,
               used: usedMemory,
               free: freeMemory,
               usage: ((usedMemory / totalMemory) * 100).toFixed(2)
            },
            runtime: Utils.toTime(process.uptime() * 1000),
            processor: `${os.cpus()[0].model}`,
            diskUsage: diskUsage.toFixed(2)
         }
         socket.emit('system', information)
      }

      const interval = setInterval(system, 1000)

      socket.on('disconnect', () => {
         clearInterval(interval)
         console.log('Client disconnected')
      })
   })

   app.set('json spaces', 3)
      .use(cors({
         origin: true,
         credentials: true
      }))
      .use((req, res, next) => {
         if (!req.timedout) next()
      })
      .use(express.json())
      .use(requestIp.mw())
      .use(bodyParser.json({ limit: '50mb' }))
      .use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
      .use(cookieParser())
      .use(session({
         name: 'khafa_session',
         keys: [process.env.SESSION_SECRET || 'khafa_secret_key'],
         maxAge: 72 * 60 * 60 * 1000, // 3 days
         httpOnly: true,
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production'
      }))
      // Only serve static files in production
      .use((req, res, next) => {
         if (process.env.NODE_ENV === 'production') {
            express.static(path.join(process.cwd(), 'public'))(req, res, () => {
               express.static(path.join(process.cwd(), 'nuxt/dist'))(req, res, next)
            })
         } else {
            next()
         }
      })
      .use((req, res, next) => {
         req.io = io
         next()
      })

   // Dynamically import the request handler module
   await (new createRouter(app)).load(path.join(process.cwd(), 'routers'))

   // In production, serve the Nuxt app for all non-API routes
   // In development, let the Nuxt dev server handle frontend
   if (process.env.NODE_ENV === 'production') {
      app.use('*', (req, res) => {
         res.sendFile(path.join(process.cwd(), 'nuxt/dist', '404.html'))
      })
   }

   app.disable('x-powered-by')
   app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'Khafa Shop Server')
      next()
   })

   const startInvoiceCleanupScheduler = () => {
      const cleanupInterval = 60 * 1000 * 5
      setInterval(async () => {
         await Database.cleanupPendingInvoices()
      }, cleanupInterval)
   }

   startInvoiceCleanupScheduler()

   httpServer.listen(PORT, () => {
      console.clear()
      CFonts.say(process.env.WEB_NAME || 'Khafa Shop', {
         font: 'tiny',
         align: 'center',
         colors: ['system']
      })
      CFonts.say(`Web Store : ${process.env.DOMAIN || 'https://shop.khafacode.my.id'}`, {
         colors: ['system'],
         font: 'console',
         align: 'center'
      })
      console.log(chalk.yellowBright.bold('Server listening on PORT --->', `http://localhost:${PORT}`))
   })
}

runServer().catch(() => runServer())
