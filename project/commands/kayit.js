const Guild = require('../models/Guild');

module.exports = {
  name: 'kayit',
  ownerOnly: true,

  async execute(message, args, client) {
    const guildData = await Guild.findOne({ guildId: message.guild.id });
    if (!guildData || !guildData.roles?.general?.member) {
      return message.reply('Önce üye rolünü ayarlamalısın! `.setup member @rol`');
    }

    const kayitMsg = await message.channel.send('discord.gg/lonesca');
    await kayitMsg.react('<a:blackflame:1359266648032284822>');

    // Veritabanına mesaj ID ve kanal ID kaydet
    await Guild.findOneAndUpdate(
      { guildId: message.guild.id },
      {
        $set: {
          kayitMessageId: kayitMsg.id,
          kayitChannelId: kayitMsg.channel.id
        }
      },
      { new: true }
    );

    // Tepki toplayıcı başlat
    const filter = (reaction, user) =>
      reaction.emoji.id === '1359266648032284822' && !user.bot;

    const collector = kayitMsg.createReactionCollector({ filter, time: 0 });

    collector.on('collect', async (reaction, user) => {
      const member = await message.guild.members.fetch(user.id).catch(() => null);
      if (!member) return;

      try {
        if (guildData.roles?.general?.member) {
          await member.roles.add(guildData.roles.general.member).catch(() => null);
        }

        if (guildData.roles?.general?.unregistered) {
          await member.roles.remove(guildData.roles.general.unregistered).catch(() => null);
        }

        const welcomeEmbed = new EmbedBuilder()
        .setTitle('Hoş Geldin! <a:HosgeldinGif1:1129491505648779354>')
        .setDescription(`${member} kayıt işlemin tamamlandı!`)
        .setColor(0x00FF00)
        .setFooter({ text: 'Copyright © bevq' });
      
      await member.send({ embeds: [welcomeEmbed] }).catch(() => null);
      } catch (e) {
        console.error('Kayıt sırasında hata:', e);
      }
    });
  }
};
