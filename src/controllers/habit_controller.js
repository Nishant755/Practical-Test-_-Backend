const mongoose = require('mongoose');
const Habit = require('../schemas/Habit');
const Completion = require('../schemas/Completion');

const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

const getTodayDate = () => {
    return formatDate(new Date());
};

exports.getHabits = async (req, res) => {
    try {
        const userHabits = await Habit.find({ userId: req.user.userId });

        const habitsWithStats = await Promise.all(
            userHabits.map(async (habit) => {
                const habitCompletions = await Completion.find({ habitId: habit._id });
                const totalCompletions = habitCompletions.length;
                const todayCompleted = habitCompletions.some(c => c.date === getTodayDate());

                return {
                    id: habit._id,
                    name: habit.name,
                    description: habit.description,
                    createdAt: habit.createdAt,
                    stats: {
                        totalCompletions,
                        completedToday: todayCompleted
                    }
                };
            })
        );

        res.json({ habits: habitsWithStats });
    } catch (error) {
        console.error('Get habits error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createHabit = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Habit name is required' });
        }

        const newHabit = new Habit({
            userId: req.user.userId,
            name: name.trim(),
            description: description || ''
        });

        await newHabit.save();

        res.status(201).json({
            message: 'Habit created successfully',
            habit: {
                id: newHabit._id,
                name: newHabit.name,
                description: newHabit.description,
                createdAt: newHabit.createdAt
            }
        });
    } catch (error) {
        console.error('Create habit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.completeHabit = async (req, res) => {
    try {
        const habitId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(habitId)) {
            return res.status(400).json({ error: 'Invalid habit ID' });
        }

        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.user.userId
        });

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const today = getTodayDate();

        const existingCompletion = await Completion.findOne({
            habitId: habitId,
            date: today
        });

        if (existingCompletion) {
            return res.status(400).json({
                error: 'Habit already completed for today',
                completion: {
                    id: existingCompletion._id,
                    date: existingCompletion.date,
                    completedAt: existingCompletion.completedAt
                }
            });
        }

        const newCompletion = new Completion({
            habitId: habitId,
            date: today
        });

        await newCompletion.save();

        res.json({
            message: 'Habit marked as complete for today',
            completion: {
                id: newCompletion._id,
                habitId: newCompletion.habitId,
                date: newCompletion.date,
                completedAt: newCompletion.completedAt
            }
        });
    } catch (error) {
        console.error('Complete habit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getHabitStatus = async (req, res) => {
    try {
        const habitId = req.params.id;
        const queryDate = req.query.date;

        if (!mongoose.Types.ObjectId.isValid(habitId)) {
            return res.status(400).json({ error: 'Invalid habit ID' });
        }

        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.user.userId
        });

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        if (!queryDate) {
            return res.status(400).json({
                error: 'Date parameter is required (format: YYYY-MM-DD)'
            });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(queryDate)) {
            return res.status(400).json({
                error: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const completion = await Completion.findOne({
            habitId: habitId,
            date: queryDate
        });

        res.json({
            habitId: habitId,
            habitName: habit.name,
            date: queryDate,
            completed: !!completion,
            completionDetails: completion ? {
                id: completion._id,
                completedAt: completion.completedAt
            } : null
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteHabit = async (req, res) => {
    try {
        const habitId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(habitId)) {
            return res.status(400).json({ error: 'Invalid habit ID' });
        }

        const habit = await Habit.findOneAndDelete({
            _id: habitId,
            userId: req.user.userId
        });

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        await Completion.deleteMany({ habitId: habitId });

        res.json({
            message: 'Habit deleted successfully',
            deletedHabit: {
                id: habit._id,
                name: habit.name
            }
        });
    } catch (error) {
        console.error('Delete habit error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getHabitHistory = async (req, res) => {
    try {
        const habitId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(habitId)) {
            return res.status(400).json({ error: 'Invalid habit ID' });
        }

        const habit = await Habit.findOne({
            _id: habitId,
            userId: req.user.userId
        });

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }

        const completions = await Completion.find({ habitId: habitId })
            .sort({ date: -1 });

        res.json({
            habitId: habitId,
            habitName: habit.name,
            totalCompletions: completions.length,
            completions: completions.map(c => ({
                id: c._id,
                date: c.date,
                completedAt: c.completedAt
            }))
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
