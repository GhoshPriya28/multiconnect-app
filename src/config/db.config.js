require('dotenv').config();
const Sequelize = require("sequelize");
var appConnection;

const connectDb = async (token) => {
  const pointPreSubstring = '/platform-detail-pointprecise'
  // const tychoStreamSubstring = '/platform-detail-tychostream';
  const scanamazeSubstring = '/platform-detail-scanamaze'

  const pointPreDownloadAsset = '/downloadAssets-pointpre';
  const scanamazeDownloadAsset = '/downloadAssets-scanamaze';

  const pointPreReupload = '/reupload-pointpre';
  // const reconReupload = '/reupload-recon';
  const scanamazeReupload = '/reupload-scanamaze';

  const pointpreciseNotificationReport = '/pointprecise-notificatiomaster';
  const tychoStreamNotificationReport = '/tychostream-notificatiomaster';
  const scanamazeNotificationReport = '/scanamaze-notificatiomaster';

  const pointpreciseUserReport = '/pointprecise-user-report';
  const scanamazeUserReport = '/scanamaze-user-report';
  const tychoStreamUserReport = '/tychostream-user-report';

  if ((token === '/pointprecise') || (token === '/pointprecise-notification') || (token === '/pointprecise-notification-detail') || (token.includes(pointPreSubstring) === true) || (token.includes(pointPreDownloadAsset) == true) || (token.includes(pointPreReupload) === true) || (token.includes(pointpreciseNotificationReport) === true) || (token.includes(pointpreciseUserReport) === true)) {
    const pointPreciseConnection = new Sequelize(process.env.POINT_PRE_DB_NAME, process.env.POINT_PRE_DB_USERNAME, process.env.POINT_PRE_DB_PASSWORD, {
      host: process.env.POINT_PRE_DB_HOST,
      dialect: "mysql",
      operatorsAliases: 0,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    });
    try {
      await pointPreciseConnection.authenticate()
      console.log('PointPrecise Connection has been established successfully.');
      appConnection = pointPreciseConnection;
      return pointPreciseConnection;
    } catch (err) {
      console.error('Unable to connect to the PointPrecise database:', err)
    }
  }
  //tychostream
  else if ((token === '/tychostream') || (token === '/tychostream-notification') || (token === '/tychostream-notification-detail') || (token.includes(tychoStreamNotificationReport) === true) || (token.includes(tychoStreamUserReport) === true)) {
    const tychostreamConnection = new Sequelize(process.env.TYCHOSTREAM_DB_NAME, process.env.TYCHOSTREAM_DB_USERNAME, process.env.TYCHOSTREAM_DB_PASSWORD, {
      host: process.env.TYCHOSTREAM_DB_HOST,
      dialect: "mysql",
      operatorsAliases: 0,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    });
    try {
      await tychostreamConnection.authenticate()
      console.log('Tycho Stream Connection has been established successfully.');
      appConnection = tychostreamConnection;
      return tychostreamConnection;
    } catch (err) {
      console.error('Unable to connect to the Tycho Stream database:', err)
    }
  }
  else if ((token === '/scanamaze') || (token === '/scanamaze-notification') || (token === '/scanamaze-notification-detail') || (token.includes(scanamazeSubstring) === true) || (token.includes(scanamazeDownloadAsset) == true) || (token.includes(scanamazeReupload) === true) || (token.includes(scanamazeNotificationReport) === true) || (token.includes(scanamazeUserReport) === true)) {
    const scanamazeConnection = new Sequelize(process.env.SCANAMAZE_DB_NAME, process.env.SCANAMAZE_DB_USERNAME, process.env.SCANAMAZE_DB_PASSWORD, {
      host: process.env.SCANAMAZE_DB_HOST,
      dialect: "mysql",
      operatorsAliases: 0,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    });
    try {
      await scanamazeConnection.authenticate()
      console.log('Scanamaze Connection has been established successfully.');
      appConnection = scanamazeConnection;
      return scanamazeConnection;
    } catch (err) {
      console.error('Unable to connect to the Scanamaze database:', err)
    }
  }
  else {
    console.log("Not able to connect");
  }
}
module.exports = {
  URCHOST: process.env.URC_DB_HOST,
  URCUSER: process.env.URC_DB_USERNAME,
  URCPASSWORD: process.env.URC_DB_PASSWORD,
  URCDB: process.env.URC_DB_NAME,
  dialect: "mysql",
  logging: false,
  freezeTableName: true,
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  connectDb,
  appConnection
};