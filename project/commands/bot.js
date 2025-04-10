const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const config = require('../config.js');

module.exports = {
  name: 'bot',
  ownerOnly: true,
  async execute(message, args, client) {
    if (!config.botOwners.includes(message.author.id)) {
      return message.reply('Bu komutu sadece bot sahibi kullanabilir.');
    }

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('bot_options')
          .setPlaceholder('Bir seçenek seçin…')
          .addOptions([
            {
              label: 'Bot Adını Değiştir',
              description: 'Botun adını değiştirmek için tıklayın',
              value: 'change_name',
            },
            {
              label: 'Profil Fotoğrafını Değiştir',
              description: 'Botun profil fotoğrafını değiştirmek için tıklayın',
              value: 'change_pp',
            },
            {
              label: 'Banner’ı Değiştir',
              description: 'Botun banner’ını değiştirmek için tıklayın',
              value: 'change_banner',
            },
          ])
      );

    await message.reply({
      content: 'Lütfen bir işlem seçin:',
      components: [row]
    });
  }
};
