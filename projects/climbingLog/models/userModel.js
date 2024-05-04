const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const {getDatabaseConnection} = require('../config/database');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
}, { timestamps: true });

/**
 * Executed before saving the user to the database.
 */
userSchema.pre('save', async function (next) {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next()
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    next();
});

/**
 * Compare the password of the user with the given password.
 */
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

/**
 * Generate an authentication token for the user.
 */
userSchema.methods.generateAuthToken = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id, username: user.username }, process.env.TOKEN_KEY)
    return token;
};

const User = getDatabaseConnection().model('User', userSchema);

module.exports = User;