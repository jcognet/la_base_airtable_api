require('dotenv').config();

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;

const stringSession = new StringSession('');

run = async () =>{
    console.log('Getting user hash for Telegram ');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text('number ?'),
        password: async () => await input.text('password?'),
        phoneCode: async () => await input.text('Code ?'),
        onError: err => console.log(err),
    });

    console.log('You should now be connected. User hash: ');
    console.log(client.session.save());
    await client.sendMessage('me', {message: 'Nous avons récupéré ton token de connexion, on va pouvoir l\'utiliser pour requêter Telegram :) Merci ! '});

    client.disconnect();
}

run();
