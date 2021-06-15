require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const compression = require('compression');
const errorhandler = require('errorhandler');
const basicAuth = require('express-basic-auth');
const user = require('./lib/user.js');

app.set('views', './views');
app.set("twig options", {
    allow_async: true, // Allow asynchronous compiling
    strict_variables: false
});

app.use(compression());
app.use(express.static('public'));
app.use(basicAuth({
    users: user.getListUsers(),
    unauthorizedResponse: getUnauthorizedResponse,
    challenge: true,
    realm: 'lasdBafse!Paris123',
}));
function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

if (process.env.NODE_ENV === 'development') {
    console.log('Start middleware error handler');
    app.use(errorhandler());
    require('express-debug')(app);
    console.log('Start middleware express debug');
}


app.get('/', (req, res) => {
    res.render('index.html.twig');
});
app.use('/benevole', require('./controller/benevole'));

app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});