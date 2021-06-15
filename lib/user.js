const fs = require('fs');
const path = require('path');

const userPath = path.join(__dirname, '/../data', 'user12.json');

exports.getListUsers = () => {

    try {
        if (fs.existsSync(path)) {
            return JSON.parse(data);
        }
    } catch(err) {
        console.warn(err);
        console.warn('Switch to env var.')
    }

    return JSON.parse(process.env.LIST_USER);
};