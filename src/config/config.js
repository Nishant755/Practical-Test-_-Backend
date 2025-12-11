require('dotenv').config();
const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    dburl: process.env.DB_URL || 'mongodb://localhost:27017/habit-tracker',
    
}

module.exports = config;    