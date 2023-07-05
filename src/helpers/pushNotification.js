require('dotenv').config();
const { SCANAMAZE_FCM_KEY, POINT_PRE_KEY,TYCHOSTREAM_KEY } = process.env;
const db = require("../models");
const connectDB = require('../config/db.config.js');

const queryHelper = require('../helpers/common-query')
const Op = db.Sequelize.Op;
var FCM = require('fcm-node');

exports.sentNotificationSingle = function (receiver_id = null, title = null, dataO = null) {
    var serverKey = FCM_KEY;
    var fcm = new FCM(serverKey);
    var send_id = receiver_id;
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
exports.sentNotificationMultipleOld = async (receiver_id = null, title = null, data0 = null, notificationID = null, platform = null) => {
    // console.log("platform", platform);
    if (platform == '/scanamaze-notification') {
        var serverKey = SCANAMAZE_FCM_KEY;
    }
    else if (platform == '/pointprecise-notification') {
        var serverKey = POINT_PRE_KEY;
    }
    var fcm = new FCM(serverKey);
    console.log("fcm", fcm);
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


exports.sentNotificationMultiple = async (receiver_id = null, title = null, data0 = null, notificationID = null, platform = null,users_ids=null) => {
    if (platform == '/scanamaze-notification') {
        var serverKey = SCANAMAZE_FCM_KEY;
    }
    else if (platform == '/pointprecise-notification') {
        var serverKey = POINT_PRE_KEY;
    }
    var fcm = new FCM(serverKey);
    console.log("fcm", users_ids);
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
    const sequelize = await connectDB.connectDb(platform);
    fcm.send(message, async function (err, response) {
        // console.log("response",response);
        if (err) {
            var resErr =err;
            console.log("resErr",resErr);
            let save = resErr;
            let updateData = {
                log: save
            }
            console.log('users_ids',users_ids);

            let notificationUpdateData = "UPDATE notification_details set log='" + save + "',users_ids='"+users_ids+"' where id=" + notificationID + "";
            console.log('platform',platform);
            console.log('notificationUpdateData',notificationUpdateData);
            
            sequelize.query(notificationUpdateData).then(queryData => {
                
            })
                .catch(err => {
                    console.log(err);
                });
        } else {
            let resSuccess = response;
            console.log("resSuccess",resSuccess);
            let save = resSuccess;
            let updateData = {
                log: save
            }
            let UpdateData = "UPDATE notification_details set log='" + save + "',users_ids='"+users_ids+"' where id=" + notificationID + "";
            console.log("UpdateData",UpdateData);
            sequelize.query(UpdateData).then(Data => {
            })
                .catch(err => {
                    console.log(err);
                });
        }
    })
}


//for tycho stream
exports.sentNotificationMultipleTychoStream = async (receiver_id = null, title = null, data0 = null, notificationID = null, platform = null,users_ids=null) => {
    if (platform == '/tychostream-notification') {
        var serverKey = TYCHOSTREAM_KEY;
        console.log("serverKey",serverKey);
    }
    var fcm = new FCM(serverKey);
    console.log("fcm", fcm);
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
    const sequelize = await connectDB.connectDb(platform);
    fcm.send(message, function (err, response) {
        // console.log("message",message);
        
        if (err) {
            console.log("err",err);
            var resErr =err;
            console.log("resErr",resErr);
            let save = resErr;
            let updateData = {
                log: save
            }
            // console.log('users_ids',users_ids);

            let notificationUpdateData = "UPDATE notification_details set log='" + save + "',users_ids='"+users_ids+"' where id=" + notificationID + "";
            // console.log('platform',platform);
            console.log('notificationUpdateData',notificationUpdateData);
            
            sequelize.query(notificationUpdateData).then(queryData => {
                
            })
                .catch(err => {
                    console.log(err);
                });
        } else {
            let resSuccess = response;
            console.log("resSuccess",resSuccess);
            let save = resSuccess;
            let updateData = {
                log: save
            }
            console.log("updateData",updateData);
            let UpdateData = "UPDATE notification_details set log='" + save + "',users_ids='"+users_ids+"' where id=" + notificationID + "";
            sequelize.query(UpdateData).then(Data => {
            })
                .catch(err => {
                    console.log(err);
                });
        }
    })
}