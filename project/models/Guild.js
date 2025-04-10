const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channels: {
    welcome: String,
    log: String,
    voice: String
  },
  botStatus: {
    type: String,
    default: "Developed by B🌹"
  },
  roles: {
    staff: {
      administrator: String,
      moderator: String
    },
    special: {
      vip: String,
      special: String
    },
    moderation: {
      muted: String
    },
    general: {
      member: String,
      unregistered: String
    }
  },
  kayitChannelId: String,       // 🔹 Kayıt mesajının atıldığı kanal
  kayitMessageId: String        // 🔹 Kayıt mesajının kendisi
});

module.exports = mongoose.model('Guild', guildSchema);
