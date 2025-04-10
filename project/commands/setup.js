const Guild = require('../models/Guild');

module.exports = {
    name: 'setup',
    ownerOnly: true,
    async execute(message, args, client) {
        if (!client.config.botOwners.includes(message.author.id)) {
            return message.reply('Bu komutu sadece bot sahipleri kullanabilir!');
        }

        if (!args[0]) {
            const setupHelp = {
                title: '⚙️ Setup Komutları',
                color: 'BLUE',
                fields: [
                    {
                        name: '🔧 Rol Kurulumları',
                        value: '`.setup vip @rol` - VIP rolünü ayarlar\n`.setup special @rol` - Özel rolü ayarlar\n`.setup admin @rol` - Admin rolünü ayarlar\n`.setup mod @rol` - Moderatör rolünü ayarlar\n`.setup muted @rol` - Muted rolünü ayarlar\n`.setup member @rol` - Üye rolünü ayarlar\n`.setup unregistered @rol` - Kayıtsız rolünü ayarlar'
                    },
                    {
                        name: '📝 Kanal Kurulumları',
                        value: '`.setup welcome #kanal` - Hoşgeldin kanalını ayarlar\n`.setup log #kanal` - Log kanalını ayarlar\n`.setup voice #kanal` - Ses kanalını ayarlar'
                    },
                    {
                        name: '🤖 Bot Ayarları',
                        value: '`.setup status <durum>` - Bot durumunu ayarlar'
                    }
                ],
                footer: {
                    text: 'Developed by Your Name'
                }
            };
            return message.channel.send({ embeds: [setupHelp] });
        }

        const type = args[0].toLowerCase();
        const guildData = await Guild.findOne({ guildId: message.guild.id }) || new Guild({ guildId: message.guild.id });

        if (type === 'status') {
            const status = args.slice(1).join(' ');
            if (!status) return message.reply('Bir durum belirtmelisin!');
            
            guildData.botStatus = status;
            await guildData.save();
            
            client.user.setActivity(status);
            return message.reply(`Bot durumu \`${status}\` olarak ayarlandı!`);
        }

        // Channel setup
        if (['welcome', 'log', 'voice'].includes(type)) {
            const channel = message.mentions.channels.first();
            if (!channel) return message.reply('Bir kanal etiketlemelisin!');

            guildData.channels[type] = channel.id;
            await guildData.save();

            return message.reply(`${type.charAt(0).toUpperCase() + type.slice(1)} kanalı ${channel} olarak ayarlandı!`);
        }

        // Role setup
        const mentionedRole = message.mentions.roles.first();
        if (!mentionedRole) {
            return message.reply('Bir rol etiketlemelisin!');
        }

        switch (type) {
            case 'vip':
                guildData.roles.special.vip = mentionedRole.id;
                break;
            case 'special':
                guildData.roles.special.special = mentionedRole.id;
                break;
            case 'admin':
                guildData.roles.staff.administrator = mentionedRole.id;
                break;
            case 'mod':
                guildData.roles.staff.moderator = mentionedRole.id;
                break;
            case 'muted':
                guildData.roles.moderation.muted = mentionedRole.id;
                break;
            case 'member':
                guildData.roles.general.member = mentionedRole.id;
                break;
            case 'unregistered':
                guildData.roles.general.unregistered = mentionedRole.id;
                break;
            default:
                return message.reply('Geçersiz rol tipi!');
        }

        await guildData.save();
        message.reply(`${type.toUpperCase()} rolü ${mentionedRole} olarak ayarlandı!`);
    }
};