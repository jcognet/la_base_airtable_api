require('dotenv').config();

const {Api, TelegramClient} = require('telegram');
const {StringSession} = require('telegram/sessions');
const input = require('input');
const fs = require('fs');
const path = require('path');

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

const stringSession = new StringSession(process.env.TELEGRAM_USER_SESSION);

//  list of analyzed channel
const LIST_CHANNEL_ID = {
    '1286842538': 'GDB',
    '1231642142': 'Bénévoles',
    '1266573038': 'Bénévoles proches',
    '1175189547': 'Bar',
    '1458964230': 'Programmation',
    '1432464780': 'Logistique',
    '1227095545': 'Communication',
    '1180317259': 'Chaine de solidarité'
};

const benevoleFilePath = path.join(__dirname, '/../../data', 'benevole.json');

const fetchFromTelegram = async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text('number ?'),
        password: async () => await input.text('password?'),
        phoneCode: async () => await input.text('Code ?'),
        onError: err => console.log(err),
    });

    const result = await client.invoke(new Api.messages.GetDialogs({
        offsetPeer: 'username'
    }));

    const listAllBenevolesByChannel = Object.keys(LIST_CHANNEL_ID).map(async (channelId) => {
        try {
            const benevolesInChannel = client.iterParticipants(parseInt(channelId), {});

            let benevoles = [];
            for await (const benevole of benevolesInChannel) {
                let message;
                if (benevole.deleted) {
                    continue;
                }

                let lastSeenTimestamp;
                if (benevole.status) {
                    if (benevole.status.wasOnline !== undefined) {
                        lastSeenTimestamp = benevole.status.wasOnline * 1000;
                    }

                    if (lastSeenTimestamp === undefined) {
                        switch (benevole.status.className) {
                            case 'UserStatusRecently':
                            case 'UserStatusOnline':
                                lastSeenTimestamp = Date.now();
                                break;
                            case 'UserStatusLastWeek':
                                const dLastWeek = new Date();
                                lastSeenTimestamp = dLastWeek.setDate(dLastWeek.getDate() - 7);
                                break;
                            case 'UserStatusLastMonth':
                                const dLastMonth = new Date();
                                lastSeenTimestamp = dLastMonth.setDate(dLastMonth.getDate() - 30);
                                break;
                            default:
                                console.error(benevole);
                                throw new Error(`Unknown status: ${benevole.status.className} for benevole ${benevole.id}`);
                        }
                    }
                }

                if (lastSeenTimestamp === undefined) {
                    console.warn(benevole);
                    lastSeenTimestamp = benevole.participant.date * 1000;
                    message = 'Date inconnue de dernière connexion';
                }

                benevoles = [...benevoles, {
                    'username': benevole.username,
                    'firstName': benevole.firstName,
                    'lastName': benevole.lastName,
                    'id': benevole.id,
                    'lastConnection': new Date(lastSeenTimestamp),
                    'lastConnectionTimeStamp': lastSeenTimestamp,
                    'message': message,
                    'channelId': channelId
                }];
            }

            return benevoles;
        } catch (Error) {
            console.error(Error);
            console.error(`The account used for querying doesn't access to ${LIST_CHANNEL_ID[channelId]}`)
            return [];
        }
    });

    const resAllBenevolesByChannels = await Promise.all(listAllBenevolesByChannel);

//    client.disconnect();

    let benevolesWithChannels = [];
    resAllBenevolesByChannels.map((listAllBenevolesByChannel) => {
        listAllBenevolesByChannel.map((benevole) => {
            let currentBenevole = benevolesWithChannels.find(existingBenevole => existingBenevole.id === benevole.id);
            if (currentBenevole === undefined) {
                currentBenevole = {...benevole, channels: []};
                benevolesWithChannels = [...benevolesWithChannels, currentBenevole];
            }

            currentBenevole.channels = [...currentBenevole.channels, LIST_CHANNEL_ID[benevole.channelId]];
        });
    });

    benevolesWithChannels.sort((a, b) => a.lastConnectionTimeStamp - b.lastConnectionTimeStamp);

    return benevolesWithChannels;
};

exports.fetchFromTelegram = fetchFromTelegram;
exports.getTelegramBenevole = () => {
    if (fs.existsSync(benevoleFilePath)) {
        console.log('Got data from file.');
        return JSON.parse(fs.readFileSync(benevoleFilePath));
    }

    console.log('Got data from telegram API.');
    return fetchFromTelegram();
};
