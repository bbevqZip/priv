const Guild = require('../models/Guild');

module.exports = {
    name: 'ban',
    adminOnly: true,
    async execute(message, args, client) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return;
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Bir kullanıcı etiketlemelisin!');

        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        try {
            await message.guild.members.ban(user, { reason });
            message.channel.send(`${user.tag} sunucudan yasaklandı. Sebep: ${reason}`);
        } catch (error) {
            message.reply('Kullanıcı yasaklanamadı!');
        }
    }
}