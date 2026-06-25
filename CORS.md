# CORS Configuration

Cross-Origin Resource Sharing (CORS) determines which external websites or addresses can interact with our Backend Server.

## Current Setup
In this project, CORS is handled globally via the `cors` package in Express (`app.js`).

```javascript
import cors from 'cors'

// ...
app.use(cors())
```
By default, calling `cors()` without any options means your backend will accept requests from **ANY** origin (`*`). This is highly useful during development.

## Production Recommendation
For a production environment, you **must** restrict the CORS domains to only allow requests from your specific Frontend domain to prevent unauthorized websites from hitting your API.

### Example for Production `app.js`:

```javascript
const allowedOrigins = [
  'https://shop.yilzicode.com',
  'http://localhost:5173', // Nuxt dev server
  process.env.NUXT_PUBLIC_BASE_URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
```

Make sure that `credentials: true` is included if you are managing sessions or cookies across the frontend and backend.
