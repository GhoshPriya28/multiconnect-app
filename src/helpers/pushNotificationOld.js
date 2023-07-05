require('dotenv').config();
const { FCM_KEY } = process.env;
const db = require("../models");
const connectDB = require('../config/db.config.js');

const queryHelper = require('../helpers/common-query')
const Op = db.Sequelize.Op;
var FCM = require('fcm-node');

exports.sentNotificationSingle = function (recaver_id = null, title = null, dataO = null) {
    var serverKey = FCM_KEY;
    var fcm = new FCM(serverKey);
    var send_id = recaver_id;
    var message = {
        to: send_id.trim(),
        collapse_key: '',
        notification: {
            title: title,
            body: 'Your collection name:' + dataO.collect_name
        },
        data: {
            collect_id: dataO.collect_id,
            collect_name: dataO.collect_name,
            initiate_id: dataO.initiate_id
        }
    };
    fcm.send(message, function (err, response) {
        console.log(err);
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}
exports.sentNotificationMultiple = async (receiver_id = null, title = null, data0 = null, notificationID = null, platform = null) => {
    var serverKey = FCM_KEY;
    var fcm = new FCM(serverKey);
    var message = {
        registration_ids: receiver_id,
        notification: {
            title: title,
            body: data0.comment
        },
        data: {
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    };
    console.log('platform',platform)
    const sequelize = await connectDB.connectDb(platform);
    fcm.send(message, async function (err, response) {
        if (err) {
            var resErr = JSON.parse(err);
            let save = JSON.stringify(resErr);
            let updateData = {
                log: save
            }
            let notificationUpdateData = "UPDATE notification_details set log='" + save + "' where id=" + notificationID + "";
            sequelize.query(notificationUpdateData).then(queryData => {
            })
                .catch(err => {
                    console.log(err);
                });
        } else {
            let resSuccess = JSON.parse(response);
            let save = JSON.stringify(resSuccess);
            let updateData = {
                log: save
            }
            let UpdateData = "UPDATE notification_details set log='" + save + "' where id=" + notificationID + "";
            sequelize.query(UpdateData).then(Data => {
            })
                .catch(err => {
                    console.log(err);
                });
        }
    })
}