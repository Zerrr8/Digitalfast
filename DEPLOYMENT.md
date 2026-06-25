# Deployment Architecture

The application is structured into two main components:
1. **Backend** (Node.js/Express)
2. **Frontend** (Nuxt 3 / Vue 3)

In development, these run as separate processes (e.g., `PORT=3000` for backend, `PORT=5173` for Nuxt). 
For Production, Nuxt is built into a static site (or server-rendered bundle) and is served together with or separately from the Node.js backend.

## Deployment Options

### 1. Unified Server (VPS / Dedicated Server)
You can host both the Node.js backend and the Nuxt frontend on the same VPS (e.g., Ubuntu via DigitalOcean, Linode, AWS EC2).

**Steps:**
1. Clone the repository to the server.
2. Run `yarn install` in the root directory.
3. CD into the `nuxt` directory: `cd nuxt`.
4. Run `npm install` and then `npm run generate` or `npm run build` to compile the frontend.
5. Create a `.env` file and populate it with production keys.
6. Start the server using `pm2`:
   `pm2 start index.js --name "web-shop"`
7. Configure Nginx as a Reverse Proxy to map your domain to `localhost:3000`.

### 2. Vercel (Frontend) + Render/Railway (Backend)
If you prefer serverless/PaaS hosting:
- Deploy the **Frontend (`nuxt/`)** to Vercel. Nuxt 3 has excellent built-in support for Vercel.
- Deploy the **Backend (root folder)** to services like Render, Railway, or Heroku.
- Remember to configure `CORS` to allow requests from the Vercel URL to your Backend URL.

## Important Considerations

- **Environment Variables**: Never commit `.env` files to Git. Add secrets directly in your CI/CD platform or server environment variable settings.
- **Node.js Version**: Ensure your target server uses Node.js v18 or newer.
- **SSL/HTTPS**: You must use HTTPS in production. If deploying on a VPS, use Let's Encrypt (Certbot) to secure Nginx.
- **WebSockets**: The backend utilizes `Socket.io`. Ensure your proxy (like Nginx) is configured to handle WebSocket upgrade headers.

For a detailed step-by-step VPS deployment guide, refer to `/TUTORIALS/03_Deployment_Guide.md`.
