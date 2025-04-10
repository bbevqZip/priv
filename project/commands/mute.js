const Guild = require('../models/Guild');
const ms = require('ms');

module.exports = {
    name: 'mute',
    adminOnly: true,
    async execute(message, args, client) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return;
        
        const user = message.mentions.users.first();
        if (!user) return message.reply('Bir kullanıcı etiketlemelisin!');

        const time = args[1];
        if (!time) return message.reply('Bir süre belirtmelisin! (Örnek: 1s, 1m, 1h, 1d)');

        const duration = ms(time);
        if (!duration) return message.reply('Geçersiz süre formatı! Örnek: 1s, 1m, 1h, 1d');

        const guildData = await Guild.findOne({ guildId: message.guild.id });
        if (!guildData || !guildData.roles.moderation.muted) {
            return message.reply('Muted rolü ayarlanmamış!');
        }

        const member = message.guild.members.cache.get(user.id);
        const muteRole = message.guild.roles.cache.get(guildData.roles.moderation.muted);
        const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';

        try {
            await member.roles.add(muteRole);
            message.channel.send(`${user.tag} ${time} süreyle susturuldu. Sebep: ${reason}`);

            setTimeout(async () => {
                try {
                    if (member.roles.cache.has(muteRole.id)) {
                        await member.roles.remove(muteRole);
                        message.channel.send(`${user.tag} kullanıcısının susturulması otomatik olarak kaldırıldı.`);
                    }
                } catch (error) {
                    console.error('Otomatik unmute hatası:', error);
                }
            }, duration);
        } catch (error) {
            message.reply('Kullanıcı susturulamadı!');
        }
    }
};