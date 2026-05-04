const cors = require('cors');

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:4200',
  /^http:\/\/localhost:\d+$/
];

module.exports = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error('CORS bloqué'), allowed);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
