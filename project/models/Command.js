const mongoose = require('mongoose');

const commandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    roleId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Command', commandSchema);