const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit_controller');
const authenticateToken = require('../middlewares/auth_middleware');

// Apply middleware to all habit routes
router.use(authenticateToken);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/complete', habitController.completeHabit);
router.get('/:id/status', habitController.getHabitStatus);
router.get('/:id/history', habitController.getHabitHistory);

module.exports = router;
