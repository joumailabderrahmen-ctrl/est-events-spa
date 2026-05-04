require('dotenv').config();
const http       = require('http');
const path       = require('path');
const express    = require('express');
const morgan     = require('morgan');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const corsMiddleware = require('./middleware/cors');
const { initWebSocket } = require('./websocket/chatServer');

const eventsRouter       = require('./routes/events');
const reservationsRouter = require('./routes/reservations');
const authRouter         = require('./routes/auth');
const eventCtrl          = require('./controllers/eventController');

const app    = express();
const server = http.createServer(app);

connectDB();
initWebSocket(server);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(corsMiddleware);
app.use(morgan('dev'));
app.use(express.json());

// serve uploaded images statically — header explicite pour éviter le CORB
app.use('/uploads', (req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' }
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/events',       eventsRouter);
app.use('/api/reservations', reservationsRouter);
app.get('/api/stats',        eventCtrl.getStats);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
