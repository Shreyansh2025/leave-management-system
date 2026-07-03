const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const managerRoutes = require('./routes/managerRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// --- NEW CORS CONFIGURATION ---
const corsOptions = {
  origin: [
    'http://localhost:5173', // For your local development
    'https://leave-management-system-phi-dun.vercel.app' // For your live Vercel frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
// ------------------------------

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ success: true, message: 'API is up.' }));

app.use('/api/auth', authRoutes);
app.use('/api', employeeRoutes); // /api/employees, /api/dashboard/*
app.use('/api/leaves', leaveRoutes);
app.use('/api', managerRoutes); // /api/pending-leaves, /api/leaves/:id/approve|reject

app.use(notFound);
app.use(errorHandler);

module.exports = app;