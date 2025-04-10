const { MessageActionRow, MessageButton } = require('discord.js');
const settings = require('../models/Guild'); // Sunucu ayarlarını almak için

module.exports = {
  name: 'kontrol',
  async execute(message, args, client) {
    const targetMessageId = '1359258098275192964'; // Mesaj ID'si
    const guild = message.guild;
    
    // Mesajın var olup olmadığını kontrol et
    const targetMessage = await message.channel.messages.fetch(targetMessageId).catch(() => null);
    
    if (!targetMessage) {
      return message.reply('Belirtilen mesaj bulunamadı!');
    }

    // Eğer mesajda aktif tepki varsa, bu tepkiye basan kullanıcılara user rolü ver
    const collector = targetMessage.createReactionCollector({
      time: 86400000, // 24 saatlik süre
      dispose: true,  // Tepki kaldırıldığında da işlem yapabilmek için
    });

    collector.on('collect', async (reaction, user) => {
      if (user.bot) return; // Botların tepki vermesini engeller

      try {
        const member = guild.members.cache.get(user.id);
        
        // User rolünü ver
        if (settings.roles && settings.roles.user) {
          await member.roles.add(settings.roles.user);
          console.log(`${user.tag} kullanıcısına user rolü verildi.`);
        }
      } catch (err) {
        console.error('Tepki sırasında hata oluştu:', err);
      }
    });

    collector.on('remove', async (reaction, user) => {
      if (user.bot) return;

      try {
        const member = guild.members.cache.get(user.id);
        
        // Tepki kaldırıldığında bir işlem yapılması gerekirse buraya yazabilirsiniz
        console.log(`${user.tag} tepkiyi kaldırdı.`);
      } catch (err) {
        console.error('Tepki kaldırıldığında hata oluştu:', err);
      }
    });
  }
};
