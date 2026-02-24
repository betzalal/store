const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const fileUpload = require('express-fileupload');
const path = require('path');

// Security Middlewares
app.use(helmet({
    crossOriginResourcePolicy: false, // Important to allow images to be loaded cross-origin if needed
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*';
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const storeRoutes = require('./routes/stores');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const memoryRoutes = require('./routes/memory');
const setupRoutes = require('./routes/setup'); // Import setup routes
const systemRoutes = require('./routes/system');
const expenseRoutes = require('./routes/expenses');

app.use('/api/stores', storeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/products', require('./routes/products')); // New Products Route
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/setup', setupRoutes); // Use setup routes
app.use('/api/system', systemRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/upload', require('./routes/upload'));
app.use('/api/promo', require('./routes/promo'));

app.get('/', (req, res) => {
    res.send('Store Management API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
