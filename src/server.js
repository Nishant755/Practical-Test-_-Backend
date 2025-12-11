const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const config = require('./config/config');
const authRoutes = require('./routes/auth_routes');
const habitRoutes = require('./routes/habit_routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Habit Tracker API is running',
        endpoints: {
            auth: ['POST /auth/signup', 'POST /auth/login'],
            habits: ['GET /habits', 'POST /habits', 'DELETE /habits/:id', 'POST /habits/:id/complete', 'GET /habits/:id/status', 'GET /habits/:id/history']
        }
    });
});

// Start server
app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port} 🙂`);
    console.log(`\n available Endpoints: 👉
        message: 'Habit Tracker API is running',
        endpoints: {
            auth: ['POST /auth/signup', 'POST /auth/login'],
            habits: ['GET /habits', 'POST /habits', 'DELETE /habits/:id', 'POST /habits/:id/complete', 'GET /habits/:id/status', 'GET /habits/:id/history']
        }
    })`)

});
module.exports = app;