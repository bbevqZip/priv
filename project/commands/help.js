module.exports = {
    name: 'help',
    async execute(message, args, client) {
        const helpEmbed = {
            title: '🤖 Bot Komutları',
            color: 'BLUE',
            fields: [
                {
                    name: '👑 Bot Sahibi Komutları',
                    value: '`!setup roles` - Rol ayarlarını yapar\n`!setup register` - Kayıt sistemini kurar'
                },
                {
                    name: '⚡ Yetkili Komutları',
                    value: '`!ban @kullanıcı sebep` - Kullanıcıyı yasaklar\n`!unban ID` - Yasaklamayı kaldırır\n`!mute @kullanıcı süre` - Kullanıcıyı susturur (örn: 1s, 1m, 1h)\n`!unmute @kullanıcı` - Susturmayı kaldırır\n`!createcommand komut_adı rol_id içerik` - Özel komut oluşturur'
                },
                {
                    name: '📝 Diğer Komutlar',
                    value: '`!help` - Bu menüyü gösterir'
                },
                {
                    name: '⏰ Süre Formatları',
                    value: '`s` - Saniye\n`m` - Dakika\n`h` - Saat\n`d` - Gün\nÖrnek: `!mute @kullanıcı 1h`'
                }
            ],
            footer: {
                text: 'Developed by B🌹'
            },
            timestamp: new Date()
        };

        message.channel.send({ embeds: [helpEmbed] });
    }
};