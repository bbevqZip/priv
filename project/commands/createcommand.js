const Command = require('../models/Command');

module.exports = {
    name: 'createcommand',
    adminOnly: true,
    async execute(message, args, client) {
        if (!args[0]) return message.reply('Komut adı belirtmelisin!');
        if (!args[1]) return message.reply('Rol ID belirtmelisin!');
        if (!args[2]) return message.reply('Komut içeriği belirtmelisin!');

        const commandName = args[0].toLowerCase();
        const roleId = args[1];
        const content = args.slice(2).join(' ');

        // Komut adı kontrolü
        if (client.commands.has(commandName)) {
            return message.reply('Bu isimde bir komut zaten var!');
        }

        // Rol kontrolü
        const role = message.guild.roles.cache.get(roleId);
        if (!role) {
            return message.reply('Belirtilen rol bulunamadı!');
        }

        const helpEmbed = {
            title: '📝 Özel Komut Oluşturma',
            color: 'BLUE',
            fields: [
                {
                    name: '✨ Komut Adı',
                    value: commandName
                },
                {
                    name: '👥 Gerekli Rol',
                    value: `<@&${roleId}>`
                },
                {
                    name: '📄 İçerik',
                    value: content
                }
            ],
            footer: {
                text: 'Developed by B🌹'
            }
        };

        try {
            const command = new Command({
                name: commandName,
                guildId: message.guild.id,
                roleId: roleId,
                content: content
            });

            await command.save();
            message.channel.send({ embeds: [helpEmbed] });
        } catch (error) {
            console.error('Komut oluşturma hatası:', error);
            message.reply('Komut oluşturulurken bir hata oluştu!');
        }
    }
};