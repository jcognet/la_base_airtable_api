require('dotenv').config();
const Airtable = require('airtable');
const oldBenevole = require('../lib/old_benevole.js');

exports.synchronize = () => {
    return new Promise((resolve, reject) => {

        const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BENEVOLE_TABLE_KEY);
        const OLD_BENEVOLE_TABLE = 'Anciens bénévoles à synchro';

        let listOldBenevoleNotSynch = [];
        let nbOldBenevoleFoundFromRequest = 0;
        base(OLD_BENEVOLE_TABLE).select({
            view: "Liste",
            filterByFormula: "AND(NOT({Email} = ''), {Synchronisé ?} = 0)"
        }).eachPage(function page(records, fetchNextPage) {

            records.forEach(function (record) {
                if (oldBenevole.benevoleIsValid(record)) {
                    console.log('Retrieved', record.get('Email'));
                    listOldBenevoleNotSynch = [...listOldBenevoleNotSynch, record];
                }
                nbOldBenevoleFoundFromRequest++;
            });

            fetchNextPage();

        }, function done(err) {
            if (err) {
                console.error(err);
                return err;
            }

            console.log(`Found old bénévoles: ${listOldBenevoleNotSynch.length}`);
            if (listOldBenevoleNotSynch.length !== nbOldBenevoleFoundFromRequest) {
                console.error(`Error: old bénévole valid ${listOldBenevoleNotSynch.length} is different from found old bénévole. Some are not valid :(`)
            }

            listOldBenevoleNotSynch.map((oldBenevole) => {
                const benevoleAirTable = {
                    id: oldBenevole.get('Bénévoles')[0],
                    fields: {
                        'Email': oldBenevole.get('Email'),
                        'Téléphone': oldBenevole.get('Téléphone'),
                        'Id Telegram': oldBenevole.get('Id telegram'),
                    }
                };

                base('Bénévoles').update([
                    benevoleAirTable
                ]);

                /* TODO : remove comment
                base(OLD_BENEVOLE_TABLE).update([{
                    id: oldBenevole.id,
                    fields: {
                        "Synchronisé ?": true
                    }
                }]);

                 */
            });

            return resolve(listOldBenevoleNotSynch);
        });
    });
};
