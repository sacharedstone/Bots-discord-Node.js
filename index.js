const Discord = require("discord.js");
const token = require("./token.json");
const fs = require("fs");
const bdd = require("./bdd.json");
const fetch = require('node-fetch');
const ytdl = require("ytdl-core");
const CronJob = require('cron').CronJob;
const list = require("./youtube.json");
const queue = new Map();
const search = require('youtube-search');
const bot = new Discord.Client();
const imagebdd = require('./images.json')


    /****************************************************
    ********************** Canvas ***********************
    ****************************************************/

bot.on("guildMemberAdd", async member => {

    let user = member;
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext(`2d`);

    const background = await Canvas.loadImage(`./wallpaper.jpg`);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.font = `40px Calvert MT Std`;
    ctx.fillStyle = `#ffffff`;

    ctx.fillText(user.user.username, canvas.width / 2.2, canvas.height / 1.7);
    ctx.fillText((user.user.bot ? '🤖' : '🙎‍♂️'), canvas.width / 1.1, canvas.height / 4.2)
    ctx.fillText((moment(user.user.createdAt).format('DD/MM/YYYY')), canvas.width / 1.5, canvas.height / 1.05)

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    const avatar = await Canvas.loadImage(user.user.displayAvatarURL({ format: 'png' }))
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), './Welcome.jpg');


    bot.channels.cache.get('781609852748169256').send(attachment);
})


    /****************************************************
    ************ YOUTUBE CHANNEL NAME UPDATE ************
    *******************************************(((((*****/
var job = new CronJob('* * * * *', async function () {
    const data = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCWqPk07TBQAKy695NJMnlZg&key=' + token.youtube).then(response => response.json());
    bot.channels.cache.get('738660606621777940').setName('youtube│' + data.items[0].statistics.subscriberCount + 'abos')
}, null, true, 'America/Los_Angeles');
job.start();

bot.on("ready", async () => {
    
    let statuts = bdd.stats
    setInterval(function() {
        let stats = statuts[Math.floor(Math.random()*statuts.length)];
        bot.user.setActivity(stats, {type: "STREAMING"})
    }, 10000)
    
    console.log("Le bot est allumé")
    bot.user.setStatus("dnd");
    const opts = {
        maxResults: 1000,
        key: token.youtube,
        type: 'video',
        channelId: 'ID_CHANNEL_YOUTUBE'
    };
    /***********************************************
    ************ NOUVELLE VIDEO MESSAGE ************
    ************************************************/
    let channel_new_vid = bot.channels.cache.get("ID_CHANNEL_NOUVELLE_VIDEO_YOUTUBE");
    setInterval(function () {
        let result = search('', opts).catch(err => console.log(err));
        result.then(function (r) {
            r.results.forEach(element => {
                if (list['vidéos'].indexOf(element.id) == -1) {
                    console.log(element.id);
                    channel_new_vid.send("https://www.youtube.com/watch?v=" + element.id)
                    list['vidéos'].push(element.id);
                    fs.writeFile("./youtube.json", JSON.stringify(list, null, 4), (err) => {
                        if (err) message.channel.send("Une erreur est survenue.");
                    });
                }

            });
        })
    }, 2000)
});

    /***********************************************
    ******************* Captcha ********************
    ************************************************/

bot.on("guildMemberAdd", async member => {
    member.roles.add('701156465515167755');
    bdd["captcha"][member.id] = { "value": Math.floor(Math.random() * Math.floor(10000)), "statut": false }
    Savebdd();
    bot.channels.cache.get('789256968657043488').send(`Bonjour ${member} ! Ton code de captcha est : ${bdd["captcha"][member.id]["value"]}`)
})
bot.on('message', async message => {
    if(message.author.bot || message.member.permissions.has('ADMINISTRATOR')) return;
    if(message.channel.id == "789256968657043488") {
        message.delete();
        if(!bdd["captcha"][message.member.id]["statut"]){
            if (isNaN(message.content)) {
                return message.channel.send('Tu dois indiquer la valeur de la captcha envoyée au dessus').then(message=> message.delete({timeout: 15000}));
            }
            else {
                if(message.content == bdd["captcha"][message.member.id]["value"]){
                    bdd["captcha"][message.member.id]["statut"] = true;
                    Savebdd();
                    message.member.roles.remove('701156465515167755');
                    message.member.roles.add('786630910862295043');

                }
                else{
                    return message.channel.send('Tu dois indiquer la valeur de la captcha envoyée au dessus').then(message=> message.delete({timeout: 15000}));
                }
            }
        }
    }
})
bot.on('guildMemberRemove', async member => {
    delete bdd["captcha"][member.id]
    Savebdd();
})


bot.on("guildMemberAdd", member => {
    /*****************************************
    ************ MESSAGE BIENVENUE ***********
    ******************************************/
    if (bdd["message-bienvenue"]) {
        bot.channels.cache.get('ID_CHANNEL_DE_BIENVENUE').send(bdd["message-bienvenue"]);
    } else {
        bot.channels.cache.get('ID_CHANNEL_DE_BIENVENUE').send("Bienvenue sur le serveur");
    }
    member.roles.add('ID_ROLE_DE_BIENVENUE');

})

    /***********************************************
    ************ Enregistrer une image *************
    ************************************************/

bot.on('message', async message => {
    if (message.channel.id == bdd['channel-image']) {
        if (message.member.user.bot) return;
        if (message.attachments) {
            message.attachments.forEach(a => {
                download(a.url, message)
            });
        }
    }

})

function download(url, message) {
    var counter = 0;
    fs.readdirSync("./images").forEach(file => {
        counter++
    })
    counter++;
    ext = request.get(url).path.split(".").pop()
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream(`./images/${counter}.${ext}`));
    imagebdd.push(`${counter}.${ext}`)
    SaveImage();
    message.channel.send(`Image ajoutée avec succès !`).then(message => message.delete({ timeout: 10000 }).catch(err => console.log(err)))
}

bot.on("message", async message => {
    if (message.content == "!image") {
        if (message.member.user.bot) return;
        var counter = 0;
        imagebdd.forEach(file => {
            counter++
        })
        random = Math.floor(Math.random() * counter);
        message.channel.send({ files: [`./images/${imagebdd[random]}`] });
    }
});

bot.commands = new Discord.Collection();
// bot.aliases = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");

    if (jsfile.length <= 0) {
        return console.log("Impossible de trouver des commandes");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);

        bot.commands.set(pull.config.name, pull);

        // pull.config.aliases.forEach(alias => {

        //     bot.aliases.set(alias, pull.config.name)

        // });
    });
});
bot.on("message", async message => {

    if (message.author.bot || message.channel.type === "dm") return;
    
    let prefix = "!";
    let messagearray = message.content.split(" ")
    let cmd = messagearray[0];
    let args = message.content.trim().split(/ +/g);

    if (!message.content.startsWith(prefix)) return;
    let commandfile = bot.commands.get(cmd.slice(prefix.length))
    if (commandfile) commandfile.run(bot, message, args);
});


bot.on("message", async message => {

    if (message.author.bot) return;
    /*****************************************
    ************ COMMANDE HANDLER ************
    ******************************************/
    let commande = message.content.trim().split(" ")[0].slice(1)
    let args = message.content.trim().split(" ").slice(1);

    prefix = bdd[message.guild.id]["prefix"] || "!"
    
    if (message.content.startsWith("!info")) {
        if(message.mentions.users.first()) {
            user = message.mentions.users.first();
       } else{
            user = message.author;
        }
        const member = message.guild.member(user);

        const embed = new Discord.MessageEmbed() 
        .setColor('#ff5555')
        .setThumbnail(user.avatarURL)
        .setTitle(`Information sur ${user.username}#${user.discriminator} :`)
        .addField('ID du compte:', `${user.id}`, true)
        .addField('Pseudo sur le serveur :', `${member.nickname ? member.nickname : 'Aucun'}`, true)
        .addField('A crée son compte le :', `${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
        .addField('A rejoint le serveur le :', `${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
        .addField('Status:', `${user.presence.status}`, true)
        .addField('Joue a :', `${user.presence.game ? user.presence.game.name : 'Rien'}`, true)
        .addField('Roles :', member.roles.cache.map(roles => `${roles.name}`).join(', '), true)
        .addField(`En réponse a :`,`${message.author.username}#${message.author.discriminator}`)
    message.channel.send(embed).then(message => message.delete({ timeout: 15000 }));
    }
    
    /*****************************************
    ************ COMMANDE MUSIQUE ************
    ******************************************/
    const serverQueue = queue.get(message.guild.id);
    if (commande === "play") {
        execute(message, serverQueue, args);
        return;
    } 
    if (commande === "skip") {
        skip(message, serverQueue, args);
        return;
    } 
    if (commande === "stop") {
        stop(message, serverQueue, args);
        return;
    } 
    if (commande === "pause") {
        pause(message, serverQueue, args);
        return;
    } 

    if (commande === "prefix") {
        if (!arg[0]) return message.channel.send(`Vous devez indiquer un prefix`);
        bdd[message.guild.id]["prefix"] = arg[0];
        Savebdd();
        return message.channel.send(`Le prefix ${arg[0]} à bien été sauvegardé !`);
    }
    if (commande === "clear") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas les permissions");
        if (!args[0]) return message.channel.send("Vous devez mettre un nombre de messages à supprimer");
        if (isNan(args[0])) return message.channel.send("Le nombre de message est invalide");
        if (parseInt(args[0]) <= 0 || parseInt(args[0]) >= 99) return message.channel.send("Le nombre de messages à supprimer doit être compris entre 1 et 99.")
        message.channel.bulkDelete(parseInt(args[0]) + 1)
        message.channel.send(`Vous avez supprimé ${args[1]} message(s)`).then(msg => {
            setTimeout(() => {
                msg.delete()
            }, 5000);
        });
    }
    if (commande === "mb") {
        message.delete()
        if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Vous devez avoir les permissions pour pouvoir faire cette commande.")
        if (!args[0]) return message.channel.send("Vous devez inclure un message.")
        message_bienvenue = args.join(" ");
        bdd["message-bienvenue"] = message_bienvenue
        Savebdd()
    }
    if (commande === "warn") {
        if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("Tu n'as pas les permissions requises.")
        if (!args[0]) return message.channel.send("Vous devez mentionner quelqu'un.")
        let utilisateur = message.mentions.users.first() || message.guild.member(args[0])
        if (!bdd["warn"][utilisateur.id]) {
            bdd["warn"][utilisateur.id] = 1;
            Savebdd();
            return message.channel.send(`${utilisateur} a maintenant ${bdd['warn'][utilisateur.id]} avertissement.`)
        }
        if (bdd["warn"][utilisateur.id] == 2) {
            delete bdd["warn"][utilisateu.id]
            Savebdd();
            return message.guild.members.ban(utilisateur);

        } else {
            bdd["warn"][utilisateur.id]++
            Savebdd();
            return message.channel.send(`${utilisateur} a maintenant ${bdd['warn'][utilisateur.id]} avertissements.`)
        }
    }
    // commande de stats
    if (commande === "stats") {
        let onlines = message.guild.members.cache.filter(({
            presence
        }) => presence.status !== 'offline').size;
        let totalmembers = message.guild.members.cache.size;
        let totalservers = bot.guilds.cache.size;
        let totalbots = message.guild.members.cache.filter(member => member.user.bot).size;
        let total_news = message.guild.roles.cache.get('ID_ROLE_DES_NOUVEAUX_MEMBRES').members.size;

        const EmbedStats = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Statistiques')
            .setURL('https://discord.js.org/')
            .setAuthor('Mon Bot discord', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Voici les statistiques du serveur')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields({
                name: 'Nombre de membrs total',
                value: totalmembers,
                inline: true
            }, {
                name: 'Membres connéctés : ',
                value: onlines,
                inline: true
            }, {
                name: 'Nombre de serveurs auquel le bot appartient : ',
                value: totalservers,
                inline: true
            }, {
                name: 'Nombres de bots sur le serveur : ',
                value: totalbots,
                inline: true
            }, {
                name: 'Nombre d\'arrivants : ',
                value: total_news,
                inline: true
            }, )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(EmbedStats);
    }

    if (commande === 'youtube') {
        const {
            items
        } = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCWqPk07TBQAKy695NJMnlZg&key=AIzaSyDWDZMYQwGq5ON1u7s4ZNloxp0U5MRw0zo').then(response => response.json());
        const embedYoutube = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Youtube')
            .setURL('https://discord.js.org/')
            .setAuthor('Mon Bot discord', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Voici les statistiques youtube')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields({
                    name: 'Nombre d\'abonnés',
                    value: items[0].statistics.subscriberCount,
                    inline: true
                }, {
                    name: 'Nombre de vidéos : ',
                    value: items[0].statistics.videoCount,
                    inline: true
                }, {
                    name: 'Nombre de vues sur la chaîne : ',
                    value: items[0].statistics.viewCount,
                    inline: true
                },
                // { name: 'Nombres de bots sur le serveur : ', value: totalbots, inline: true },
                // { name: 'Nombre d\'arrivants : ', value: totalrole, inline: true },
            )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(embedYoutube);
    }
    if (commande === "ban") {
        message.delete()
        if (!message.member.hasPermission('BAN_MEMBERS')) return;
        let utilisateur = message.mentions.members.first() || message.guild.member(args[0])
        temps = arg[1];
        raison = args.splice(0, 1).join(" ");
        if (!utilisateur) return message.channel.send('Vous devez mentionner un utilisateur !');
        if (!temps || isNaN(temps)) return message.channel.send('Vous devez indiquer un temps en secondes !');
        if (!raison || !args[2]) return message.channel.send('Vous devez indiquer une raison du ban !');
        message.guild.members.ban(utilisateur.id);
        setTimeout(function () {
            message.guild.members.unban(utilisateur.id);
        }, temps * 1000);

    }


    /*****************************************
    ************ SYSTEME DE LEVEL ************
    ******************************************/
   if (commande === 'lvl') {
    if (bdd["statut-level"] == true) {
        bdd["statut-level"] = false
        Savebdd();
        return message.channel.send('Vous venez d\'arreter le système de level !');
    } else {
        bdd["statut-level"] = true;
        Savebdd();
        return message.channel.send('Vous venez d\'alumer le système de level !');
    }
}

if (bdd["statut-level"] == true) {
    if (commande === 'level') {
        if (!bdd["coins-utilisateurs"][message.member.id]) return message.channel.send(`Nous n'avez pas encore posté de message !`);
        return message.channel.send(`Vous avez ${bdd["coins-utilisateurs"][message.member.id]} points !\nEt vous êtes au level n°${bdd["level-utilisateurs"][message.member.id]}`)
    }
    if (!bdd["coins-utilisateurs"][message.member.id]) {
        bdd["coins-utilisateurs"][message.member.id] = Math.floor(Math.random() * (4 - 1) + 1);
        bdd["level-utilisateurs"][message.member.id] = 0;
        Savebdd();
    } else {
        let new_coins = bdd["coins-utilisateurs"][message.member.id] + Math.floor(Math.random() * (4 - 1) + 1);
        if (bdd["coins-utilisateurs"][message.member.id] < 100 && new_coins >= 100) {
            bdd["level-utilisateurs"][message.member.id] = 1;
            bdd["coins-utilisateurs"][message.member.id] = new_coins;
            Savebdd();
            return message.channel.send(`Bravo ${message.author} tu es passé niveau 1 !`);
        }
        if (bdd["coins-utilisateurs"][message.member.id] < 250 && new_coins >= 250) {
            bdd["level-utilisateurs"][message.member.id] = 2;
            bdd["coins-utilisateurs"][message.member.id] = new_coins;
            Savebdd();
            return message.channel.send(`Bravo ${message.author} tu es passé niveau 2 !`);
        }
        if (bdd["coins-utilisateurs"][message.member.id] < 500 && new_coins > 500) {
            bdd["level-utilisateurs"][message.member.id] = 3;
            bdd["coins-utilisateurs"][message.member.id] = new_coins;
            Savebdd();
            return message.channel.send(`Bravo ${message.author} tu es passé niveau 3 !`);
        }
        if (bdd["coins-utilisateurs"][message.member.id] < 1000 && new_coins > 1000) {
            bdd["level-utilisateurs"][message.member.id] = 4;
            bdd["coins-utilisateurs"][message.member.id] = new_coins;
            Savebdd();
            return message.channel.send(`Bravo ${message.author} tu es passé niveau 4 !`);
        }
    }
}
})
    /*******************************************
    ************ SYSTEME DE TICKETS ************
    *******************************************/
bot.on("messageReactionAdd", (reaction, user) => {
    if (user.bot) return
    if (reaction.emoji.name == "✅") {
        reaction.message.channel.send('Tu as réagi : ✅');
        reaction.message.guild.channels.create(`ticket de ${user.username}`, {
            type: 'text',
            parent: "ID_DE_LA_CATEGORY",
            permissionOverwrites: [{
                id: reaction.message.guild.id,
                deny: ['SEND_MESSAGES'],
                allow: ['ADD_REACTIONS']
            }]
        }).then(channel_ticket => {
            channel_ticket.send("Channel crée !")
        })
    }
})
    /****************************************
    ************ NOUVEAU SERVEUR ************
    *****************************************/
bot.on("guildCreate", guild => {
    bdd[guild.id] = {}
    Savebdd()
})

    /*******************************************
    ************ FONCTIONS EXTERNES ************
    ********************************************/
function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
}

function SaveImage() {
    fs.writeFile("./images.json", JSON.stringify(imagebdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
}

//Fonctions musique
async function execute(message, serverQueue, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        );
    }

    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.title,
        url: songInfo.video_url
    };

    if (!serverQueue) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);

        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}

function skip(message, serverQueue, args) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue, args) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}

function pause(message, serverQueue, args) {
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        );
    if (serverQueue.connection.dispatcher.paused) {
        serverQueue.connection.dispatcher.resume();
    } else {
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.pause();
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

bot.login(token.token);
