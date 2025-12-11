const mongoose = require('mongoose');
const config = require('../config/config');

const connectDB = async () => {
    try {
        await mongoose.connect(config.dburl);
        console.log('Connected to MongoDB 🥳');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
