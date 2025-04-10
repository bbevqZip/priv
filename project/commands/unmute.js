const Guild = require('../models/Guild');

module.exports = {
    name: 'unmute',
    adminOnly: true,
    async execute(message, args, client) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return;
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Bir kullanıcı etiketlemelisin!');

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData || !guildData.roles.moderation.muted) {
            return message.reply('Muted rolü ayarlanmamış!');
        }

        const member = message.guild.members.cache.get(user.id);
        const muteRole = message.guild.roles.cache.get(guildData.roles.moderation.muted);

        try {
            await member.roles.remove(muteRole);
            message.channel.send(`${user.tag} kullanıcısının susturulması kaldırıldı.`);
        } catch (error) {
            message.reply('Kullanıcının susturulması kaldırılamadı!');
        }
    }
}