const { Client, Intents, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const config = require('./config.js');
const Guild = require('./models/Guild');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});

client.commands = new Collection();
client.config = config;

// MongoDB bağlantısı
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB!'))
.catch(console.error);

// Komutları yükle
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Bot hazır olduğunda
client.once('ready', async () => {
  console.log(`${client.user.tag} is ready!`);

  try {
    const guilds = await Guild.find();

    // Bot durumu ayarla
    for (const guildData of guilds) {
      if (guildData.botStatus) {
        client.user.setActivity(guildData.botStatus);
        break;
      }
    }

    // Yeni üyelere unregistered rolü ver
    for (const guildData of guilds) {
      const guild = client.guilds.cache.get(guildData.guildId);
      if (!guild) continue;

      const members = await guild.members.fetch();
      for (const member of members.values()) {
        if (member.roles.cache.size === 1 && guildData.roles?.general?.unregistered) {
          await member.roles.add(guildData.roles.general.unregistered);
        }
      }
    }

    // 🔁 Kayıt mesajına gelen tepkileri yeniden dinlemeye başla
    for (const guildData of guilds) {
      const guild = client.guilds.cache.get(guildData.guildId);
      if (!guild || !guildData.kayitChannelId || !guildData.kayitMessageId) continue;

      const channel = guild.channels.cache.get(guildData.kayitChannelId);
      if (!channel || !channel.isText()) continue;

      const kayitMsg = await channel.messages.fetch(guildData.kayitMessageId).catch(() => null);
      if (!kayitMsg) continue;

      // Kaydeden emoji tepkisini yeniden ekle
      await kayitMsg.react('<a:blackflame:1359266648032284822>');

      const filter = (reaction, user) =>
        reaction.emoji.id === '1359266648032284822' && !user.bot;

      const collector = kayitMsg.createReactionCollector({ filter, time: 0 });

      collector.on('collect', async (reaction, user) => {
        const member = await guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        // Rol ver / kaldır
        if (guildData.roles?.general?.member) {
          await member.roles.add(guildData.roles.general.member).catch(() => null);
        }
        if (guildData.roles?.general?.unregistered) {
          await member.roles.remove(guildData.roles.general.unregistered).catch(() => null);
        }

        // DM ile bilgi gönder
        const welcomeEmbed = {
          title: '🎉 Hoş Geldin!',
          description: `${member} kayıt işlemin tamamlandı!`,
          color: 'GREEN'
        };
        await member.send({ embeds: [welcomeEmbed] }).catch(() => null);
      });
    }

  } catch (error) {
    console.error('Error during bot setup:', error);
  }
});

// Yeni üye katıldığında
client.on('guildMemberAdd', async (member) => {
  try {
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    if (!guildData) return;

    if (guildData.roles?.general?.unregistered) {
      await member.roles.add(guildData.roles.general.unregistered);
    }

    if (guildData.channels?.welcome) {
      const welcomeChannel = member.guild.channels.cache.get(guildData.channels.welcome);
      if (welcomeChannel) {
        const welcomeEmbed = {
          title: '<:kylockz_resp:1206374364526673920> Yeni Üye!',
          description: `${member} sunucumuza hoş geldin!\nKayıt olmak için kayıt kanalındaki butona tıklayabilirsin.`,
          color: 'BLUE',
          timestamp: new Date()
        };
        welcomeChannel.send({ embeds: [welcomeEmbed] });
      }
    }
  } catch (error) {
    console.error('Error while handling guildMemberAdd:', error);
  }
});

// Komutları çalıştır
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  if (command.ownerOnly && !config.botOwners.includes(message.author.id)) {
    return message.reply('Bu komutu sadece bot sahipleri kullanabilir!');
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('Komut çalıştırılırken bir hata oluştu!');
  }
});

// interactionCreate (select menu)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.customId !== 'bot_options') return;

  if (!config.botOwners.includes(interaction.user.id)) {
    return interaction.reply({ content: 'Bu işlemi sadece bot sahibi yapabilir.', ephemeral: true });
  }

  await interaction.deferUpdate();

  const choice = interaction.values[0];
  const userId = interaction.user.id;
  const channel = interaction.channel;

  if (choice === 'change_name') {
    await interaction.followUp({ content: 'Lütfen yeni bot adını giriniz:', ephemeral: true });
    const filter = m => m.author.id === userId;
    const collector = channel.createMessageCollector({ filter, time: 30000 });
    collector.on('collect', async msg => {
      try {
        await client.user.setUsername(msg.content);
        msg.reply('✅ Bot adı başarıyla değiştirildi!');
      } catch (err) {
        msg.reply('❌ Bot adı değiştirilemedi: ' + err.message);
      }
      collector.stop();
    });

  } else if (choice === 'change_pp') {
    await interaction.followUp({ content: 'Lütfen yeni profil fotoğrafı olarak bir resim gönderin:', ephemeral: true });
    const filter = m => m.author.id === userId && m.attachments.size > 0;
    const collector = channel.createMessageCollector({ filter, time: 30000 });
    collector.on('collect', async msg => {
      const url = msg.attachments.first().url;
      try {
        await client.user.setAvatar(url);
        msg.reply('✅ Profil fotoğrafı başarıyla değiştirildi!');
      } catch (err) {
        msg.reply('❌ Profil fotoğrafı değiştirilemedi: ' + err.message);
      }
      collector.stop();
    });

  } else if (choice === 'change_banner') {
    await interaction.followUp({ content: '⚠️ Bot banner değiştirme şu an desteklenmiyor.', ephemeral: true });
  }
});

client.login(config.token);
