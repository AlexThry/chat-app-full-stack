const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_picture: { type: String},
});

module.exports = mongoose.model('User', userSchema);