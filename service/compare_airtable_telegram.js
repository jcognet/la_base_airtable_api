require('dotenv').config();
const Airtable = require('airtable');
const listUserByAccount = require('../service/telegram/liste_user_accessible_by_account.js');

getBenevolesAirtable = () => {
    return new Promise((resolve, reject) => {

        const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BENEVOLE_TABLE_KEY);
        let listBenevolesAirtable = [];

        base('Bénévoles').select({
            view: 'Tous les bénévoles',
            filterByFormula: "{Actif} = 1"
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(function (record) {
                let telegramId = record.get('Id Telegram');
                if (telegramId !== undefined && telegramId.charAt(0) === '@') {
                    telegramId = telegramId.substring(1);
                }

                listBenevolesAirtable = [...listBenevolesAirtable, {
                    'username': telegramId,
                    'firstName': record.get('Prénom'),
                    'lastName': record.get('Nom'),
                }]
            });

            fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error(err);
                return;
            }

            return resolve(listBenevolesAirtable);
        });
    });
}

exports.compare = async () => {
    let listBenevolesAirtable = await getBenevolesAirtable();
    let listeBenevolesTelegram = await listUserByAccount.getTelegramBenevole();
    let listBenevolesBothAirtableTelegram = [];
    const nbAirtableTotal = listBenevolesAirtable.length;
    const nbTelegramTotal = listeBenevolesTelegram.length;

    listBenevolesAirtable = listBenevolesAirtable.map((benevoleAirTable) => {
        const benevoleIndex = listeBenevolesTelegram.findIndex((benevoleTelegram) => {
            if(benevoleTelegram.username && benevoleAirTable.username) {
                return benevoleTelegram.username.toLocaleLowerCase() === benevoleAirTable.username.toLocaleLowerCase();
            }
        });

        if (benevoleIndex >= 0) {
            listBenevolesBothAirtableTelegram = [...listBenevolesBothAirtableTelegram, {
                ...benevoleAirTable,
                origin: 'airtable+telegram'
            }];

            listeBenevolesTelegram.splice(benevoleIndex, 1);
            return null;
        }

        return benevoleAirTable;
    });

    listBenevolesAirtable = listBenevolesAirtable.filter(b => b !== null);

    const listMixBenevoles = [
        ...listBenevolesAirtable.map((b) => {
            return {...b, origin: 'airtable'};
        }),
        ...listeBenevolesTelegram.map((b) => {
            return {...b, origin: 'telegram'};
        })
    ];

    listMixBenevoles.sort((a, b) => {
        if (a.firstName && !b.firstName) {
            return -1;
        }

        if (!a.firstName && b.firstName) {
            return 1;
        }

        if (a.firstName < b.firstName) {
            return -1;
        }
        if (a.firstName > b.firstName) {
            return 1;
        }

        if (a.lastName && !b.lastName) {
            return -1;
        }

        if (!a.lastName && b.lastName) {
            return 1;
        }

        if (a.lastName < b.lastName) {
            return -1;
        }
        if (a.lastName > b.lastName) {
            return 1;
        }

        return 0;
    });

    return {
        listBenevolesBothAirtableTelegram,
        nbAirtableRemaining: listBenevolesAirtable.length,
        nbTelegramRemaining: listeBenevolesTelegram.length,
        nbAirtableTotal,
        nbTelegramTotal,
        listMixBenevoles
    };
};
