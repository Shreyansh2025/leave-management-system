const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const managerRoutes = require('./routes/managerRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
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
