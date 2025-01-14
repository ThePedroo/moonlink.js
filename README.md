# Imagine a Music...

![MoonImage](https://media.discordapp.net/attachments/979497984481972335/1182079622939156490/48_Sem_Titulo_20231206190210.png?ex=65836470&is=6570ef70&hm=4012795219214609661e20e10ed16105c5ba8fe9e76867e01a0ef4a2d50f959e&)
[![NPM](https://nodei.co/npm/moonlink.js.png)](https://nodei.co/npm/moonlink.js)

[![Made with ♥️ in - Brazil](https://img.shields.io/badge/Made_with_♥️_in-Brazil-ED186A?style=for-the-badge)](https://github.com/1Lucas1apk)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7dd9288acdc94dacaa11ad80f36a9bd3)](https://www.codacy.com/gh/1Lucas1apk/moonlink.js/dashboard?utm_source=github.com&utm_medium=referral&utm_content=1Lucas1apk/moonlink.js&utm_campaign=Badge_Grade) [![Downloads](https://img.shields.io/npm/dt/moonlink.js.svg?color=3884FF)](https://www.npmjs.com/package/moonlink.js) [![Version](https://img.shields.io/npm/v/moonlink.js.svg?color=3884FF&label=version)](https://www.npmjs.com/package/moonlink.js) [![install size](https://packagephobia.com/badge?p=moonlink.js)](https://packagephobia.com/result?p=moonlink.js) ![node](https://img.shields.io/node/v/moonlink.js) [![Netlify Status](https://api.netlify.com/api/v1/badges/4f4a2a64-a8db-4db3-ad1d-0c4ac7274d0e/deploy-status)](https://app.netlify.com/sites/moonlinkjs/deploys)

Envision a musical journey where creativity knows no bounds, accompanied by the enchantment of the holiday season. 🌌 Moonlink.js invites you to unlock your complete musical potential, designed exclusively for Lavalink clients. Step into a world of seamless communication and fluid interaction, where Moonlink.js elevates your projects to new heights, sprinkled with holiday charm. With full TypeScript support, it empowers your creativity and productivity. 🎵

## Table of Contents

-   [Features](#features)
-   [Documentation](#documentation)
-   [Installation](#installation)
-   [How to Use](#how-to-use)
-   [Attributions](#attributions)
-   [Contributors](#contributors)
-   [Final Thanks](#final-thanks)
-   [License](#license)
-   [Support](#support)

## Features

**Moonlink.js** offers essential features for creating exceptional music bots:

1. **Seamless Communication:** Developed for Lavalink clients, it ensures an uninterrupted musical experience. 🎧

2. **Full TypeScript Support:** Enjoy complete TypeScript support to enhance your productivity and creativity. 💻

3. **Active Community:** Be part of a community of passionate developers and benefit from our active support system. Our project is not just about minimizing package size but maximizing its quality and potential for developers. 🤝

## Documentation

For comprehensive documentation and more examples, visit [moonlink.js.org](https://moonlink.js.org). 📖

## Installation

```bash
npm install moonlink.js
yarn add moonlink.js
pnpm install moonlink.js
bun install moonlink.js
```

## How to Use

```javascript
// Creating an instance of the Discord.js clien
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Configuring the Moonlink.js package
client.moon = new MoonlinkManager(
    [
        {
            host: "localhost",
            port: 2333,
            secure: true,
            password: "password"
        }
    ],
    {
        /* Options */
    },
    (guild, sPayload) => {
        // Sending payload information to the server
        client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload));
    }
);

// Event: Node created
client.moon.on("nodeCreate", node => {
    console.log(`${node.host} was connected, and the magic is in the air`);
});

// Event: Track start
client.moon.on("trackStart", async (player, track) => {
    // Sending a message when the track starts playing
    client.channels.cache
        .get(player.textChannel)
        .send(`${track.title} is playing now, bringing holiday joy`);
});

// Event: Track end
client.moon.on("trackEnd", async (player, track) => {
    // Sending a message when the track finishes playing
    client.channels.cache
        .get(player.textChannel)
        .send(`The track is over, but the magic continues`);
});

// Event: Ready
client.on("ready", () => {
    // Initializing the Moonlink.js package with the client's user ID
    client.moon.init(client.user.id);
});

// Event: Raw data
client.on("raw", data => {
    // Updating the Moonlink.js package with the necessary data
    client.moon.packetUpdate(data);
});

// Event: Interaction created
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    let commandName = interaction.commandName;
    if (commandName === "play") {
        if (!interaction.member.voice.channel) {
            // Responding with a message if the user is not in a voice channel
            return interaction.reply({
                content: `You are not in a voice channel`,
                ephemeral: true
            });
        }

        let query = interaction.options.getString("query");
        let player = client.moon.players.create({
            guildId: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
            autoPlay: true
        });

        if (!player.connected) {
            // Connecting to the voice channel if not already connected
            player.connect({
                setDeaf: true,
                setMute: false
            });
        }

        let res = await client.moon.search({
            query,
            source: "youtube",
            requester: interaction.user.id
        });

        if (res.loadType === "loadfailed") {
            // Responding with an error message if loading fails
            return interaction.reply({
                content: `:x: Load failed - the system is not cooperating.`
            });
        } else if (res.loadType === "empty") {
            // Responding with a message if the search returns no results
            return interaction.reply({
                content: `:x: No matches found!`
            });
        }

        if (res.loadType === "playlist") {
            interaction.reply({
                content: `${res.playlistInfo.name} This playlist has been added to the waiting list, spreading joy`
            });

            for (const track of res.tracks) {
                // Adding tracks to the queue if it's a playlist
                player.queue.add(track);
            }
        } else {
            player.queue.add(res.tracks[0]);
            interaction.reply({
                content: `${res.tracks[0].title} was added to the waiting list`
            });
        }

        if (!player.playing) {
            // Starting playback if not already playing
            player.play();
        }
});

// Logging in with the Discord token
client.login(process.env["DISCORD_TOKEN"]);
```

## Contributors

We would like to express our gratitude to the amazing individuals who contributed to this project. Their hard work and dedication have been instrumental in making it a success. 🎉

1. **1Lucas1apk** - Lead Developer, responsible for project architecture and key feature implementation. 🚀

2. **MotoG.js** - Project Ideator and Designer, contributing to the concept and visual design. 🎨

3. **WilsontheWolf** - Contributed to the track position logic in real time, rather than just receiving the payload from lavalink.

4. **PiscesXD** - First sponsor and contributed to making the shuffle method reversible, and autoLeave.

5. **Suryansh** - Second contributor and helped discover bugs 🌷

Other contributors: Nah, ItzGG, SuperPlayerBot, ddemile, Tasty-Kiwi, rrm, WilsontheWolf, Aertic, 'Forster, Fireball, Ghos't, loulou310 - Xotak

We sincerely thank all the contributors mentioned above and everyone who contributed to this project in any way. Your support is truly appreciated. 🙏

## Final Thanks

Thank you to everyone who contributed to the growth of moonlink.js, reporting bugs, installing the package and everyone else's patience, I apologize for any time I wasn't able to help someone

have a great day :)

## License

This project is licensed under the [Open Software License ("OSL") v. 3.0](LICENSE) - see the [LICENSE](LICENSE) file for details.

## Support

Join our Discord server at [Moonlink.js - Imagine a Music Bot](https://discord.com/invite/xQq2A8vku3) to connect with other users, ask questions, and participate in discussions. 🤝

For any inquiries or assistance, we're here to help! 🌟
