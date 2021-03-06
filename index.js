const Discord = require('discord.js');
const client = new Discord.Client();
const secret = require('./config.json');
const db = require('quick.db');
const fs = require('fs');

client.on('ready', async () => {

    console.log("ready")

    setInterval(async () => {
    client.user.setPresence({ activity: { name: 's.setup | ' + client.guilds.cache.size + " sunucu" }, status: 'dnd' });
    }, 1000 * 20);

    // Renaming session
    setInterval(async () => {
        let gr = JSON.parse(fs.readFileSync("./guilds.json", "utf8"))
        Object.keys(gr).forEach(async r => {
            if (gr[r].channels.stats_category_id != "0") {
                if (gr[r].stats.member_count) {
                    if (gr[r].channels.member_count_channel_id != "0") {
                        let name = client.guilds.cache.get(r).channels.cache.get(gr[r].channels.member_count_channel_id).name;
                        let newName = name.replace( /\d+/g, client.guilds.cache.get(r).memberCount);
                        if (newName != name) {
                            client.guilds.cache.get(r).channels.cache.get(gr[r].channels.member_count_channel_id).setName(newName);
                        }
                    };
                };
                if (gr[r].stats.user_count) {
                    if (gr[r].channels.user_count_channel_id != "0") {
                        let name = client.guilds.cache.get(r).channels.cache.get(gr[r].channels.user_count_channel_id).name;
                        let newName = name.replace( /\d+/g, `${client.guilds.cache.get(r).memberCount - client.guilds.cache.get(r).members.cache.filter(m => m.user.bot).size}`);
                        if (newName != name) {
                            client.guilds.cache.get(r).channels.cache.get(gr[r].channels.user_count_channel_id).setName(newName);
                        }
                    };
                };
                if (gr[r].stats.bot_count) {
                    if (gr[r].channels.bot_count_channel_id != "0") {
                        let name = client.guilds.cache.get(r).channels.cache.get(gr[r].channels.bot_count_channel_id).name;
                        let newName = name.replace( /\d+/g, client.guilds.cache.get(r).members.cache.filter(m => m.user.bot).size);
                        if (newName != name) {
                            client.guilds.cache.get(r).channels.cache.get(gr[r].channels.bot_count_channel_id).setName(newName);
                        }
                    };
                };
                if (gr[r].stats.channel_count) {
                    if (gr[r].channels.channel_count_channel_id != "0") {
                        let name = client.guilds.cache.get(r).channels.cache.get(gr[r].channels.channel_count_channel_id).name;
                        let newName = name.replace( /\d+/g, client.guilds.cache.get(r).channels.cache.filter(c => c.type != 'category').size);
                        if (newName != name) { 
                            client.guilds.cache.get(r).channels.cache.get(gr[r].channels.channel_count_channel_id).setName(newName);
                        }
                    };
                };
                if (gr[r].stats.role_count) {
                    if (gr[r].channels.role_count_channel_id != "0") {
                        let name = client.guilds.cache.get(r).channels.cache.get(gr[r].channels.role_count_channel_id).name;
                        let newName = name.replace( /\d+/g, client.guilds.cache.get(r).roles.cache.filter(rz => !rz.managed).size);
                        if (newName != name) {
                            client.guilds.cache.get(r).channels.cache.get(gr[r].channels.role_count_channel_id).setName(newName);
                        }
                    }
                }; 
            };
        });
    }, 1000 * 60 * 10);

    // Checking if any problem occured in config files
    setInterval(async () => {
        let g = JSON.parse(fs.readFileSync("./guilds.json", "utf8"))
        client.guilds.cache.forEach(r => {
                if (!g[r.id]) {
                    g[r.id] = {
                        prefix: "s.",
                        premium: "0",
                        counter: false,
                        owner: r.ownerID,
                        channels: {
                            stats_category_id: "0",
                            member_count_channel_id: "0",
                            user_count_channel_id: "0",
                            bot_count_channel_id: "0",
                            channel_count_channel_id: "0",
                            role_count_channel_id: "0"
                        },
                        stats: {
                            member_count: true,
                            user_count: true,
                            bot_count: true,
                            channel_count: true,
                            role_count: true
                        }
                    }
                }

                fs.writeFile("./guilds.json", JSON.stringify(g), (err) => { });
        });
    }, 1000 * 30);
});

client.on('guildCreate', async (guild) => {

    const guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"))
    console.log("New guild!")

    if (!guilds[guild.id]) {
        guilds[guild.id] = {
            prefix: "s.",
            premium: "0",
            counter: false,
            owner: guild.ownerID,
            channels: {
                stats_category_id: "0",
                member_count_channel_id: "0",
                user_count_channel_id: "0",
                bot_count_channel_id: "0",
                channel_count_channel_id: "0",
                role_count_channel_id: "0"
            },
            stats: {
                member_count: true,
                user_count: true,
                bot_count: true,
                channel_count: true,
                role_count: true
            }
        }
        fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });
    }
});

client.on('message', async (message) => {

    const gds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
    const args = message.content.slice(gds[message.guild.id].prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (!message.content.startsWith(gds[message.guild.id].prefix) || message.author.bot || message.channel.type == "dm") return;

    if (command == "prefix") {
        if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Kanalları editlemek için yetkim yok! Lütfen bana kanalları editleme yetkisini verin.");
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Bu komutu kullanmak için kanalları ayarlama yetkinizin bulunması gerekmektedir!");

        let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
        if (!args[0]) message.reply("\n:warning: Herhangi bir prefix belirtmedin. Lütfen tekrar dene.");
        guilds[message.guild.id].prefix = args.slice(0).join(" ");
        fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });
        message.reply("\n:white_check_mark: Prefix, başarıyla **\`" + guilds[message.guild.id].prefix + "\`** olarak değişti!");
    };

    if (command == "setup") {
        if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Kanalları editlemek için yetkim yok! Lütfen bana kanalları editleme yetkisini verin.");
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Bu komutu kullanmak için kanalları ayarlama yetkinizin bulunması gerekmektedir!");
        
        let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
        if (guilds[message.guild.id].counter == false) return message.reply("\n:warning: Counter açık olmadığı için setup yapılamıyor! Açmak için: **\`" + guilds[message.guild.id].prefix + "counter\`**");
        
        // in development
        /*
        if (guilds[message.guild.id].premium == "1") {

        };
        */

        if (guilds[message.guild.id].premium == "0") {

            let Category = await message.guild.channels.create('📈 Üye Sayacı 📉', { type: 'category', permissionOverwrites: [{ id: message.guild.id, allow: ['VIEW_CHANNEL'], deny: ['CONNECT'] }, { id: client.user.id, allow: ['MANAGE_CHANNELS']}], reason: "Üye sayacı adlı kanal, setup komuduyla kurulmuştur!"})
            guilds[message.guild.id].channels.stats_category_id = Category.id;
            Category.setPosition(0)

            if (guilds[message.guild.id].stats.member_count) {
                // permissionOverwrites: [{ id: message.guild.id, allow: ['VIEW_CHANNEL'], deny: ['CONNECT'] }, { id: client.user.id, allow: ['MANAGE_CHANNELS'] }],
                let member_count = await message.guild.channels.create('Kişi Sayısı: ' + message.guild.memberCount, { type: 'voice', reason: "Kişi sayısı adlı kanal, setup komudu ile oluşturulmuştur!"})
                member_count.setParent(Category.id);
                guilds[message.guild.id].channels.member_count_channel_id = member_count.id;
            }

            if (guilds[message.guild.id].stats.user_count) {
                let user_count = await message.guild.channels.create('Üye Sayısı: ' + `${message.guild.memberCount - message.guild.members.cache.filter(m => m.user.bot).size}`, { type: 'voice', reason: "Üye sayısı adlı kanal, setup komudu ile oluşturulmuştur!"})
                user_count.setParent(Category.id);
                guilds[message.guild.id].channels.user_count_channel_id = user_count.id;
            }
            
            if (guilds[message.guild.id].stats.bot_count) { 
                let bot_count = await message.guild.channels.create('Bot Sayısı: ' + message.guild.members.cache.filter(m => m.user.bot).size, { type: 'voice', reason: "Bot sayısı adlı kanal, setup komudu ile oluşturulmuştur!"})
                bot_count.setParent(Category.id);
                guilds[message.guild.id].channels.bot_count_channel_id = bot_count.id;
            }

            if (guilds[message.guild.id].stats.channel_count) { 
                let channel_count = await message.guild.channels.create('Kanal Sayısı: ' + message.guild.channels.cache.filter(c => c.type != 'category').size, { type: 'voice', reason: "Kanal sayısı adlı kanal, setup komudu ile oluşturulmuştur!"})
                channel_count.setParent(Category.id);
                guilds[message.guild.id].channels.channel_count_channel_id = channel_count.id;
            }

            if (guilds[message.guild.id].stats.role_count) {
                let role_count = await message.guild.channels.create('Rol Sayısı: ' + message.guild.roles.cache.filter(r => r.id != message.guild.id).size, { type: 'voice', reason: "Rol sayısı adlı kanal, setup komudu ile oluşturulmuştur!"})
                role_count.setParent(Category.id);
                guilds[message.guild.id].channels.role_count_channel_id = role_count.id
            }

            guilds[message.guild.id].counter = true;

            fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });
            message.reply("\n:white_check_mark: Setup başarıyla oluşturuldu! \nHer 10 dakikada bir kanallar güncellenecektir!")

        };
    };

    if (command == "counter") {
        if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Kanalları editlemek için yetkim yok! Lütfen bana kanalları editleme yetkisini verin.");
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Bu komutu kullanmak için kanalları ayarlama yetkinizin bulunması gerekmektedir!");

        let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
        if (guilds[message.guild.id].counter == false) { guilds[message.guild.id].counter = true; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:white_check_mark: Counter başarıyla açılmıştır!");}
        if (guilds[message.guild.id].counter == true) { guilds[message.guild.id].counter = false; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:x: Counter başarıyla kapatılmıştır!");}
    };

    if (command == "count") {
        if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Kanalları editlemek için yetkim yok! Lütfen bana kanalları editleme yetkisini verin.");
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Bu komutu kullanmak için kanalları ayarlama yetkinizin bulunması gerekmektedir!");
        
        let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
        if (args[0] == "member_count") {
            if (guilds[message.guild.id].stats.member_count == true) { guilds[message.guild.id].stats.member_count = false; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:x: Member count başarıyla kapatılmıştır!");}
            if (guilds[message.guild.id].stats.member_count == false) { guilds[message.guild.id].stats.member_count = true; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:white_check_mark: Member count başarıyla açılmıştır!");}
        } else if (args[0] == "user_count") {
            if (guilds[message.guild.id].stats.user_count == true) { guilds[message.guild.id].stats.user_count = false; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:x: User count başarıyla kapatılmıştır!");}
            if (guilds[message.guild.id].stats.user_count == false) { guilds[message.guild.id].stats.user_count = true; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:white_check_mark: User count başarıyla açılmıştır!");}
        } else if (args[0] == "bot_count") {
            if (guilds[message.guild.id].stats.bot_count == true) { guilds[message.guild.id].stats.bot_count = false; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:x: Bot count başarıyla kapatılmıştır!");}
            if (guilds[message.guild.id].stats.bot_count == false) { guilds[message.guild.id].stats.bot_count = true; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:white_check_mark: Bot count başarıyla açılmıştır!");}
        } else if (args[0] == "channel_count") {
            if (guilds[message.guild.id].stats.channel_count == true) { guilds[message.guild.id].stats.channel_count = false; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:x: Channel count başarıyla kapatılmıştır!");}
            if (guilds[message.guild.id].stats.channel_count == false) { guilds[message.guild.id].stats.channel_count = true; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:white_check_mark: Channel count başarıyla açılmıştır!");}
        } else if (args[0] == "role_count") {
            if (guilds[message.guild.id].stats.role_count == true) { guilds[message.guild.id].stats.role_count = false; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:x: Role count başarıyla kapatılmıştır!");}
            if (guilds[message.guild.id].stats.role_count == false) { guilds[message.guild.id].stats.role_count = true; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { }); return message.reply("\n:white_check_mark: Role count başarıyla açılmıştır!");}
        } else {
            message.reply("\n:grey_question: Belirtilen argümanla alakalı komut bulunamadı!");
        }
    };

    if (command == "nasıl" || command == "nasil") {
        let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
        message.reply(`\n:grey_question: **${guilds[message.guild.id].prefix}setup** komudu ile setup yapın.\nİşlem bittikten sonra oluşan kanalları **istediğiniz gibi** düzenleyebilirsiniz.\nLütfen kanal isimlerine **sayaç sayısı harici sayı koymayın!**\nBot, otomatik olarak sayıları o kanalda bulunan sayaç sayısına çevirir.\nEğer kanallarda sayılmasını istemediğiniz bir şey varsa, kanalı silebilirsiniz. \n*(Yanlışlıkla kanalı silerseniz tüm sayaç kanallarını silip tekrardan setup yapın!)*\n\n**Bu botun tüm source kodlarına https://github.com/im-Nac/sayac ile ulaşabilirsiniz.**`)
    };

    if (command == "info") {
        message.reply(`\nversiyon: **pr17** (prelease 17)\nyapımcı: **nac#0001**\nson güncelleme tarihi: **7.09.2020 13:27**\ninvite: <https://discord.com/api/oauth2/authorize?client_id=751168368836608099&permissions=8&scope=bot>`)
    };

    if (command == "help") {
        let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
        message.reply(`\nKomutlar:\n${guilds[message.guild.id].prefix}setup | ${guilds[message.guild.id].prefix}nasil | ${guilds[message.guild.id].prefix}info | ${guilds[message.guild.id].prefix}counter | ${guilds[message.guild.id].prefix}count | ${guilds[message.guild.id].prefix}nuke`)
    };

    if (command == "nuke") {
        if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Kanalları editlemek için yetkim yok! Lütfen bana kanalları editleme yetkisini verin.");
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.reply(":warning: Bu komutu kullanmak için kanalları ayarlama yetkinizin bulunması gerekmektedir!");
   
        let position = message.channel.position;
        let newChannel = await message.channel.clone()
        message.channel.delete();
        newChannel.setPosition(position);
        newChannel.send("\n:white_check_mark: Kanal başarıyla nukelenmiştir!").then(m => m.delete({timeout: 12000}))
    };

    if (command == "newConfig") {
        
    };
});

client.on('channelDelete', async (channel) => {
    let guilds = JSON.parse(fs.readFileSync("./guilds.json", "utf8"));
    if (channel.type == "dm") return;

    if (!guilds[channel.guild.id]) {
        guilds[guild.id] = {
            prefix: "s.",
            premium: "0",
            counter: false,
            owner: guild.ownerID,
            channels: {
                stats_category_id: "0",
                member_count_channel_id: "0",
                user_count_channel_id: "0",
                bot_count_channel_id: "0",
                channel_count_channel_id: "0",
                role_count_channel_id: "0"
            },
            stats: {
                member_count: true,
                user_count: true,
                bot_count: true,
                channel_count: true,
                role_count: true
            }
        }

        fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });
    };

    if (guilds[channel.guild.id].channels.stats_category_id == channel.id) { guilds[channel.guild.id].channels.stats_category_id = "0"; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });}
    if (guilds[channel.guild.id].channels.member_count_channel_id == channel.id) { guilds[channel.guild.id].channels.member_count_channel_id = "0"; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });}
    if (guilds[channel.guild.id].channels.user_count_channel_id == channel.id) { guilds[channel.guild.id].channels.user_count_channel_id = "0"; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });}
    if (guilds[channel.guild.id].channels.bot_count_channel_id == channel.id) { guilds[channel.guild.id].channels.bot_count_channel_id = "0"; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });}
    if (guilds[channel.guild.id].channels.channel_count_channel_id == channel.id) { guilds[channel.guild.id].channels.channel_count_channel_id = "0"; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });}
    if (guilds[channel.guild.id].channels.role_count_channel_id == channel.id) { guilds[channel.guild.id].channels.role_count_channel_id = "0"; fs.writeFile("./guilds.json", JSON.stringify(guilds), (err) => { });}
    
});

client.login(secret.token);