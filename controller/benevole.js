const express = require('express');
const synchOldBenevole = require('../service/synch_old_benevole.js');

const commandRouter = express.Router();

 commandRouter.get('/synch_old_benevoles', async (req, res) => {
    const listOldBenevoleSynch = await synchOldBenevole.synchronize();

    res.render('benevole/synch_old_benevole.html.twig', {
        listOldBenevoleSynch
    });
});

module.exports = commandRouter;
