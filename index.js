import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// __dirname equivalent in ESM modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function start() {
   const args = [path.join(__dirname, 'app.js'), ...process.argv.slice(2)]
   const p = spawn(process.argv[0], args, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
   })

   p.on('message', data => {
      if (data === 'reset') {
         console.log('Restarting...')
         p.kill()
      }
   })

   p.on('exit', code => {
      console.error('Exited with code:', code)
      start()
   })
}

start()
