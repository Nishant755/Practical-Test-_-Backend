const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
    habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

completionSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Completion', completionSchema);
