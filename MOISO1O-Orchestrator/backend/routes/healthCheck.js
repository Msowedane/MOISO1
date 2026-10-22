const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')

router.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    }

    const isHealthy = dbState === 1;
    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'MOISO is running APi management is healthy' : 'services is not healthy',
        version: '1.0.0',
        timeStamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        status: dbStatus[dbState]
    })
})
router.get('/health-detailed', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const isHealthy = dbState === 1;
        let dbQuerySuccess = false;
        let dbQueryTime = null;

        if (isHealthy) {
            const startTime = Date.now();
            try {
                await mongoose.connection.db.admin().ping();
                dbQueryTime = Date.now() - startTime;
                dbQuerySuccess = true;
            } catch (error) {
                console.error('[Health Check] Database query failed:', error.message);
            }
        }

        res.status(isHealthy && dbQuerySuccess ? 200 : 503).json({
            success: isHealthy && dbQuerySuccess,
            message: isHealthy && dbQuerySuccess ? 'All systems operational' : 'Service degraded',
            service: 'Home Remittance Orchestrator',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            status: {
                api: {
                    status: 'healthy',
                    uptime: process.uptime()
                },
                database: {
                    status: dbStatus[dbState],
                    connected: isHealthy,
                    querySuccess: dbQuerySuccess,
                    responseTime: dbQueryTime ? `${dbQueryTime}ms` : 'N/A'
                },
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
                }
            }
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});
router.get('/frontend', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const isHealthy = dbState === 1;

    res.json({
        success: true,
        message: 'Backend is reached to frontend',
        timestamp: new Date().toISOString(),
        backend: {
            status: 'reached',
            apiVersion: '1.0.0'
        },
        database: {
            connected: isHealthy
        },
        cors: {
            origin: req.get('origin') || 'No origin header',
            allowed: true
        }
    });
});

module.exports = router