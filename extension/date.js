const Twig = require('twig');

Twig.extendFunction("timestamp_to_date", (timestamp) => {
    return new Date(timestamp);
});
