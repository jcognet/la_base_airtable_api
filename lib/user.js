const fs = require('fs');
const path = require('path');

const userPath = path.join(__dirname, '/../data', 'user.json');

exports.getListUsers = () => {
    const data = fs.readFileSync(userPath);
    return JSON.parse(data);
};