const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot treo voice 24/7 đang chạy!'));
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server running on port ' + (process.env.PORT || 3000));
});

// Tắt kiểm tra update để tránh rác log
const client = new Client({
  checkUpdate: false,
});

process.on('unhandledRejection', (error) => {
  console.error('Lỗi Unhandled Rejection:', error);
});

client.on('ready', async () => {
  console.log(`=== ĐÃ ĐĂNG NHẬP THÀNH CÔNG: ${client.user.tag} ===`);
  
  const voiceChannelId = process.env.VOICE_CHANNEL_ID;
  if (!voiceChannelId) {
    console.error('LỖI: Chưa cài đặt VOICE_CHANNEL_ID trong Environment Variables!');
    return;
  }

  try {
    const channel = await client.channels.fetch(voiceChannelId);
    if (!channel) {
      console.error('LỖI: Không tìm thấy kênh voice!');
      return;
    }

    console.log(`Đang vào kênh: ${channel.name} (${channel.guild.name})`);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('===> ĐÃ KẾT NỐI VÀO KÊNH VOICE THÀNH CÔNG! <===');
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        console.log('Mất kết nối voice, đang kết nối lại...');
        connection.destroy();
        setTimeout(() => client.emit('ready'), 5000);
      }
    });

  } catch (err) {
    console.error('LỖI KHI VÀO VOICE:', err);
  }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('LỖI TOKEN: Không thể đăng nhập!', err);
});
