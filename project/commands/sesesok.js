// commands/ssok.js
const { joinVoiceChannel } = require('@discordjs/voice');
const { Permissions } = require('discord.js');
const config = require('../config.js');

module.exports = {
  name: 'ssok',
  ownerOnly: true,
  description: 'Botu config.voiceChannelId ile tanımlı ses kanalına bağlar.',
  async execute(message, args, client) {
    if (!config.botOwners.includes(message.author.id)) {
      return message.reply('❌ Bu komutu sadece bot sahipleri kullanabilir!')
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    const channelId = config.voiceChannelId;
    if (!channelId) {
      return message.reply('❌ config.voiceChannelId tanımlı değil.')
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    let channel = message.guild.channels.cache.get(channelId);
    if (!channel) {
      try {
        channel = await message.guild.channels.fetch(channelId);
      } catch {
        channel = null;
      }
    }

    if (!channel || channel.type !== 'GUILD_VOICE') {
      return message.reply('❌ Geçersiz ses kanalı ID’si.')
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }

    try {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      return message.reply(`<a:kylockz_Onay:1282803575537401897> **${channel.name}** kanalına başarıyla bağlandım!`);
    } catch (err) {
      console.error('Ses kanalına bağlanırken hata:', err);
      return message.reply('<a:kylockz_Iptal:1282803772917026916> Ses kanalına bağlanırken bir hata oluştu: ' + err.message);
    }
  }
};
