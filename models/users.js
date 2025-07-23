const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    attempt: {
        type: Number,
        default: 0
    },
    timeout: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema);

module.exports = User;