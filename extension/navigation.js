const Twig = require('twig');

Twig.extendFunction("is_active", (url, urlToTest) => {
    return url === urlToTest;
});
