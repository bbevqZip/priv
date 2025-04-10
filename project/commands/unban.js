module.exports = {
    name: 'unban',
    adminOnly: true,
    async execute(message, args, client) {
        if (!message.member.permissions.has('ADMINISTRATOR')) return;
        
        const userId = args[0];
        if (!userId) return message.reply('Bir kullanıcı ID\'si girmelisin!');

        try {
            await message.guild.members.unban(userId);
            message.channel.send(`<@${userId}> kullanıcısının yasaklaması kaldırıldı.`);
        } catch (error) {
            message.reply('Kullanıcının yasaklaması kaldırılamadı!');
        }
    }
}