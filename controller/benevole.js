const express = require('express');
const synchOldBenevole = require('../service/synch_old_benevole.js');
const listUserByAccount = require('../service/telegram/liste_user_accessible_by_account.js');
const compareAirtableTelegram = require('../service/compare_airtable_telegram');

const commandRouter = express.Router();

 commandRouter.get('/synch_old_benevoles', async (req, res) => {
    const listOldBenevoleSynch = await synchOldBenevole.synchronize();

    res.render('benevole/synch_old_benevole.html.twig', {
        listOldBenevoleSynch
    });
});

commandRouter.get('/benevole_from_telegram', async (req, res) => {
    const listeBenevoles = await listUserByAccount.getTelegramBenevole();

    res.render('benevole/benevole_from_telegram.html.twig', {
        listeBenevoles
    });
});

commandRouter.get('/compare_telegram_airtable', async (req, res) => {
    res.render('benevole/compare_telegram_airtable.html.twig',
        await compareAirtableTelegram.compare()
    );
});


module.exports = commandRouter;
