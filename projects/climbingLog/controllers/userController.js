const User = require('../models/userModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.register = [async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const user = new User({ username, password });
        await user.save();

        const token = user.generateAuthToken();
        res.status(201).json({ token });
    } catch (error) {
        next(error)
    }
}]

exports.login = [async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Create a token 
        const token = user.generateAuthToken();
        res.status(200).json({ token });
    } catch (error) {
        next(error)
    }
}]

exports.updatePassword = [
    async (req, res, next) => {
        try {
            const { username, currentPassword, newPassword } = req.body;
            const user = await User.findOne({ username });

            // Check if the user exists
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the current password is correct
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            // Update the password
            user.password = newPassword;
            await user.save();

            res.status(200).json({ message: 'Password updated' });
        } catch (error) {
            next(error)
        }
    }
]