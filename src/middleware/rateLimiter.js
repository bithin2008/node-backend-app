const express = require('express');
const rateLimit = require('express-rate-limit');
const redis = require('redis');

const app = express();
const redisClient = redis.createClient();

// Function to create a rate limiter with a specified max limit
function createRateLimiter(maxRequests, windowMs) {
    return rateLimit({
        store: new RedisStore({
            client: redisClient,
            expiry: windowMs / 1000, // Convert windowMs to seconds for Redis
        }),
        max: maxRequests,
        windowMs: windowMs,
        message: `Too many requests from this IP, please try again later. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
    });
}

// Apply the rate limiter middleware to the authentication routes with a specific limit

// app.use('/auth/login', createRateLimiter(10, 15 * 60 * 1000)); // 10 requests per 15 minutes
// app.use('/auth/signup', createRateLimiter(5, 10 * 60 * 1000)); // 5 requests per 10 minutes



// Function to get login attempts for an IP address
async function getLoginAttempts(ip) {
    try {
        const attempts = await redis.get(ip); // Get the count for the IP key
        return attempts ? parseInt(attempts) : 0; // Parse to integer, default to 0 if not found
    } catch (error) {
        console.error(`Error getting login attempts for ${ip}:`, error);
        return 0;
    }
}

// Simulated function to detect anomalies
async function detectAnomaly(request) {
    // Implement your anomaly detection logic here
    // Example: Detect a spike in login attempts from the same IP
    const ip = request.ip;
    const loginAttempts = await getLoginAttempts(ip); // Get the number of recent login attempts for this IP from Redis

    // If unusual behavior is detected, return true
    if (loginAttempts > 10) {
        return true;
    }

    return false;
}

// Middleware to check for anomalies and adjust the rate limit accordingly
app.use((req, res, next) => {
    if (detectAnomaly(req)) {
        // Temporarily increase the rate limit
        const limiter = createRateLimiter(5, 5 * 60 * 1000); // 15 requests per 5 minutes
        req.rateLimiter = limiter;
        limiter(req, res, next);
    } else {
        next();
    }
});

