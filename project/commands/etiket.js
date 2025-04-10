const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'reklamkanallar.json'); // Dosya yolunu mutlak yapıyoruz

function loadChannels() {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      return new Map(JSON.parse(data).map(([key, value]) => [key, value]));
    } else {
      console.log('Kanal veri dosyası bulunamadı. Yeni dosya oluşturulacak.');
      return new Map();
    }
  } catch (err) {
    console.error('Kanal verileri yüklenirken bir hata oluştu:', err);
    return new Map();
  }
}

function saveChannels(channels) {
  try {
    const data = JSON.stringify(Array.from(channels.entries()));
    fs.writeFileSync(dataFile, data, 'utf8');
    console.log('Kanal verileri başarıyla kaydedildi.');
  } catch (err) {
    console.error('Kanal verileri kaydedilirken bir hata oluştu:', err);
  }
}

const reklamChannels = loadChannels();

module.exports = {
    name: "etiket",
    ownerOnly: true,
  
    // onLoad fonksiyonu artık async
    onLoad: async function(client) {
      client.on('guildMemberAdd', async (member) => {
        const guild = member.guild;
        const kanalIDs = reklamChannels.get(guild.id);
  
        if (kanalIDs) {
          for (const kanalID of kanalIDs) {
            const kanal = guild.channels.cache.get(kanalID);
            if (kanal && kanal.type === ChannelType.GuildText) {
              try {
                const message = await kanal.send(`${member}`);
                setTimeout(() => {
                  message.delete();
                }, 3000); // 3 saniye sonra mesajı sil
              } catch (error) {
                console.error('Mesaj silinirken bir hata oluştu:', error);
              }
            }
          }
        }
      });
    },

  onRequest: async function(client, message, args) {
    console.log('etiket komutu tetiklendi', args);  // Burada komutun tetiklendiğini kontrol edelim.

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embedPermissionError = new EmbedBuilder()
        .setColor(getRandomColor())
        .setTitle('İzin Hatası')
        .setDescription('Bu komutu kullanma izniniz yok.')
        .setTimestamp();

      return message.channel.send({ embeds: [embedPermissionError] });
    }

    const guild = message.guild;

    if (args[0] === "liste") {
      const kanalIDs = reklamChannels.get(guild.id);
      if (!kanalIDs || kanalIDs.length === 0) {
        const embedNoChannels = new EmbedBuilder()
          .setColor(getRandomColor())
          .setTitle('Kanal Listesi')
          .setDescription('Hiçbir kanal etiketlenmemiş.')
          .setTimestamp();

        return message.channel.send({ embeds: [embedNoChannels] });
      }

      const embedChannels = new EmbedBuilder()
        .setColor(getRandomColor())
        .setTitle('Etiketlenen Kanallar Listesi')
        .setDescription(kanalIDs.map(id => `<#${id}>`).join('\n'))
        .setTimestamp();

      return message.channel.send({ embeds: [embedChannels] });
    } else if (args[0] === "kaldir") {
      if (args.length !== 2) {
        const embedUsageError = new EmbedBuilder()
          .setColor(getRandomColor())
          .setTitle('Kullanım Hatası')
          .setDescription('Kullanım: `.etiketkaldir kanalID`')
          .setTimestamp();

        return message.channel.send({ embeds: [embedUsageError] });
      }

      const kanalID = args[1];
      if (!guild.channels.cache.has(kanalID)) {
        const embedInvalidChannel = new EmbedBuilder()
          .setColor(getRandomColor())
          .setTitle('Geçersiz Kanal ID')
          .setDescription('Geçerli bir kanal ID\'si belirtmelisiniz.')
          .setTimestamp();

        return message.channel.send({ embeds: [embedInvalidChannel] });
      }

      const kanalIDs = reklamChannels.get(guild.id);
      if (!kanalIDs || !kanalIDs.includes(kanalID)) {
        const embedNotTagged = new EmbedBuilder()
          .setColor(getRandomColor())
          .setTitle('Kanal Etiketlenmemiş')
          .setDescription('Bu kanal etiketlenmemiş.')
          .setTimestamp();

        return message.channel.send({ embeds: [embedNotTagged] });
      }

      const filteredKanalIDs = kanalIDs.filter(id => id !== kanalID);
      reklamChannels.set(guild.id, filteredKanalIDs);
      saveChannels(reklamChannels);

      const embedSuccess = new EmbedBuilder()
        .setColor(getRandomColor())
        .setDescription(`<#${kanalID}> adlı kanal başarıyla Etiketlenen kanallar listesinden kaldırıldı.`)
        .setTimestamp();

      return message.channel.send({ embeds: [embedSuccess] });
    }
  }
};

// Yardımcı fonksiyon
function getRandomColor() {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FFD700'];
  return colors[Math.floor(Math.random() * colors.length)];
}
