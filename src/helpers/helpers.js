const timestamp = require('./timestamp.js');
const getStatus = require('./status.js')
module.exports = (app) => {
    app.locals.timestamp = timestamp;
    app.locals.getStatus = getStatus;
};



