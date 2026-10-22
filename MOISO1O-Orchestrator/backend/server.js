const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


const connectDB = require('./config/database');
const app = express();

connectDB();
const corsButtons = {
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};

app.set('trust proxy', 1);
app.use(cors(corsButtons));
app.use(helmet());
app.use(compression());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.buttons(/.*/, cors(corsButtons));
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 500),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    skip: (req) => {
        return req.path.includes('/payment_status')
    }
});
app.use(limiter);
const pollingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/polling', pollingLimiter);

const verificationPollingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Verification polling rate limit exceeded. Please wait a moment.',
        code: "VERIFICATION_RATE_LIMIT_EXCEEDED"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/health', require('./routes/healthCheck'))
app.use('/api/verification_polling', verificationPollingLimiter);
app.use('/api/admin', require('./routes/adminAuth'));
app.use('/api/admin', require('./routes/directPricing'));
app.use('/api/admin', require('./routes/complianceOverview'));
app.use('/api/admin/ip-whitelist', require('./routes/adminIpWhitelist'));
app.use('/api/ip-blacklist', require('./routes/adminIpBlacklist'));
app.use('/api/admin/remitter', require('./routes/remitterRouter'))
app.use('/api/admin/beneficiary', require('./routes/beneficiaryRouter'))
app.use('/api/admin/transactions', require('./routes/transactionRouter'))
app.use((req, res, next) => {
    if (req.path === '/api/agent/forgot-password' && req.method === 'POST') {
        express.text({ type: 'application/json' })(req, res, (err) => {
            if (err) return next(err);
            try {
                if (typeof req.body === 'string') {
                    let parsed = JSON.parse(req.body);
                    if (typeof parsed === 'string') {
                        parsed = JSON.parse(parsed);
                        console.warn('[WORKAROUND] Fixed double-encoded JSON for forgot-password');
                    }
                    req.body = parsed;
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON in request body'
                });
            }
            next();
        });
    } else {
        next();
    }
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║             MOISO ORCHESTRATOR            ║
╠══════════════════════════════════════════════╣
║ Environment : ${process.env.NODE_ENV || 'development'}
║ Port        : ${PORT}
║ Database    : ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Pending'}
║ WebSocket   : ✅ Enabled
╚══════════════════════════════════════════════╝
`);
})
console.log(`✓ Server running on http://localhost:${PORT}`)
console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
module.exports = server;