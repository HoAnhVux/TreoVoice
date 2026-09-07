const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
const express = require('express');

// Express server giữ cho Render không crash
const app = express();
app.get('/', (req, res) => res.send('Bot treo voice 24/7 đang hoạt động!'));
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server running on port ' + (process.env.PORT || 3000));
});

const client = new Client();

// Bắt các lỗi chưa được xử lý để tránh crash ứng dụng
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

client.on('ready', async () => {
  console.log(`Đã đăng nhập thành công: ${client.user.tag}`);
  
  try {
    const channel = await client.channels.fetch(process.env.VOICE_CHANNEL_ID);
    if (channel) {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });
      console.log(`Đã kết nối vào kênh voice: ${channel.name}`);
    } else {
      console.error('Không tìm thấy Voice Channel với ID đã cung cấp.');
    }
  } catch (err) {
    console.error('Lỗi khi tham gia kênh voice:', err);
  }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Lỗi đăng nhập Token:', err);
});
