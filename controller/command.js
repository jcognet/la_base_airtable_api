const express = require('express');
const {exec} = require("child_process");

const commandRouter = express.Router();

commandRouter.get('/synch_old_benevoles', (req, res) => {
    exec("npm run synch_old_benevole", (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
    });

    res.send('synch_old_benevoles');
});

module.exports = commandRouter;