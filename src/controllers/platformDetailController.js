"use strict";
const bcrypt = require("bcryptjs");
var aws = require('aws-sdk')
const connectDB = require('../config/db.config.js')
const dateTime = require("../helpers/timestamp.js")
const db = require("../models");
const queryHelper = require('../helpers/common-query')
const Op = db.Sequelize.Op;
require('dotenv').config();
const s3Zip = require('s3-zip');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const path = require('path');
const join = require('path').join;
const apiResponse = require("../helpers/apiResponse");
const mailer = require("../helpers/mailer.js")
var session = require('express-session');
const notificationUtility = require("../helpers/pushNotification.js");


const pointpreRegion = process.env.POINT_PRE_BUCKET_REGION;
const pointpreAccessKeyId = process.env.POINT_PRE_ACCESS_KEY;
const pointpreSecretAccessKey = process.env.POINT_PRE_SECRET_ACCESS_KEY;

const scanamazeRegion = process.env.POINT_PRE_BUCKET_REGION;
const scanamazeAccessKeyId = process.env.POINT_PRE_ACCESS_KEY;
const scanamazeSecretAccessKey = process.env.POINT_PRE_SECRET_ACCESS_KEY;

const pointpreS3 = new S3({
    region: pointpreRegion,
    accessKeyId: pointpreAccessKeyId,
    secretAccessKey: pointpreSecretAccessKey,
});
const scanamazeS3 = new S3({
    region: scanamazeRegion,
    accessKeyId: scanamazeAccessKeyId,
    secretAccessKey: scanamazeSecretAccessKey,
});

const userDetailView = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var userDetails = "SELECT * FROM `app_users`";
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    const userData = await queryHelper.getDataFromQuery(userDetails, sequelize)
    res.render("admin/pages/userDetails", { userData, uri: uri });
}
const platformDetailView = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var scanDetails = "SELECT * FROM `file_tasks` WHERE user_id = " + req.params.id;
    const scanData = await queryHelper.getDataFromQuery(scanDetails, sequelize);
    if (scanData) {
        res.render("admin/pages/platform-detail", { scanData, uri: req.url });
    }
    else {
        res.render("admin/pages/dashboard");
    }
}
const downloadAssets = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    let platformName = req.query.platformName;
    var initiateId = req.query.initiate_id;
    var name = req.query.name;
    var query = "SELECT s3_file_url FROM `file_tasks` WHERE initiate_id = " + req.query.initiate_id;
    var s3_3d_url_query = "SELECT s3_3d_url FROM `file_tasks` WHERE initiate_id = " + req.query.initiate_id;
    const scanInitiateId = await queryHelper.getDataFromQuery(query, sequelize);
    const scanS3DUrl = await queryHelper.getDataFromQuery(s3_3d_url_query, sequelize)
    // for scanamaze
    if (platformName === "scanamaze") {

        if (name === "Asset") {
            const scanamazeBucket = {
                Bucket: process.env.SCANAMAZE_BUCKET_NAME,
                Prefix: initiateId + "/"
            }
            const filesArray = []
            const files = await scanamazeS3.listObjectsV2(scanamazeBucket).promise()
            await files.Contents.forEach((item, index) => {
                let text = item.Key;
                let position = text.search("3DObject");
                if (position == '-1') {
                    filesArray.push(item.Key.split("/").pop());
                }
            });
            var pathAsset = process.env.BASE_URL + 'downloads/' + initiateId + '-assets.zip';
            pathAsset = {
                path: pathAsset,
            }
            await createZipFileFromS3(filesArray, initiateId + '/', initiateId, { s3: scanamazeS3, bucket: process.env.SCANAMAZE_BUCKET_NAME, debug: true }).then(async (data) => {
                var resP = '';
                if (data.path) {
                    resP = {
                        path: process.env.BASE_URL + data.path.replace(/\\/g, "/"),
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
                else {
                    resP = {
                        path: '',
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
            }).catch(err => {
                console.log('ErrrS3', err);
            });
        }
        else if (name === "3d_object") {
            const scanamaze3DBucket = {
                Bucket: process.env.SCANAMAZE_BUCKET_NAME,
                Prefix: initiateId + "/3DObject/"
            }
            const filesArray = []
            const files = await scanamazeS3.listObjectsV2(scanamaze3DBucket).promise()
            await files.Contents.forEach((item, index) => {
                filesArray.push(item.Key.split("/").pop());
            });
            var pathAsset = process.env.BASE_URL + 'downloads/' + initiateId + '-assets.zip';
            pathAsset = {
                path: pathAsset,
            }
            await createZipFileFromS3(filesArray, initiateId + '/3DObject/', initiateId, { s3: scanamazeS3, bucket: process.env.SCANAMAZE_BUCKET_NAME, debug: true }).then(async (data) => {
                var resP = '';
                if (data.path) {
                    resP = {
                        path: process.env.BASE_URL + data.path.replace(/\\/g, "/"),
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
                else {
                    resP = {
                        path: '',
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
            }).catch(err => {
                console.log('ErrrS3', err);
            });
        }
    }
    // for pointprecise
    else if (platformName === "pointprecise") {
        if (name === "Asset") {
            const pointpreBucket = {
                Bucket: process.env.POINT_PRE_BUCKET_NAME,
                Prefix: initiateId + "/"
            }
            const filesArray = []
            const files = await pointpreS3.listObjectsV2(pointpreBucket).promise()
            await files.Contents.forEach((item, index) => {
                let text = item.Key;
                let position = text.search("3DObject");
                if (position == '-1') {
                    filesArray.push(item.Key.split("/").pop());
                }
            });
            var pathAsset = process.env.BASE_URL + 'downloads/' + initiateId + '-assets.zip';
            if (fs.existsSync(pathAsset)) {
                pathAsset = {
                    path: pathAsset,
                }
                return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
            }
            else {
                pathAsset = {
                    path: pathAsset,
                }
                await createZipFileFromS3(filesArray, initiateId + '/', initiateId, { s3: pointpreS3, bucket: process.env.POINT_PRE_BUCKET_NAME, debug: true }).then(async (data) => {
                    var resP = '';
                    if (data.path) {
                        resP = {
                            path: process.env.BASE_URL + data.path.replace(/\\/g, "/"),
                        }
                        return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                    }
                    else {
                        resP = {
                            path: '',
                        }
                        return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                    }
                }).catch(err => {
                    console.log('ErrrS3', err);
                });
            }
        }
        else if (name === "3d_object") {
            const pointpre3DBucket = {
                Bucket: process.env.POINT_PRE_BUCKET_NAME,
                Prefix: initiateId + "/3DObject/"
            }
            const filesArray = []
            const files = await pointpreS3.listObjectsV2(pointpre3DBucket).promise()
            await files.Contents.forEach((item, index) => {
                filesArray.push(item.Key.split("/").pop());
            });
            var pathAsset = process.env.BASE_URL + 'downloads/' + initiateId + '-assets.zip';
            pathAsset = {
                path: pathAsset,
            }
            await createZipFileFromS3(filesArray, initiateId + '/3DObject/', initiateId, { s3: scanamazeS3, bucket: process.env.POINT_PRE_BUCKET_NAME, debug: true }).then(async (data) => {
                var resP = '';
                if (data.path) {
                    resP = {
                        path: process.env.BASE_URL + data.path.replace(/\\/g, "/"),
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
                else {
                    resP = {
                        path: '',
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
            }).catch(err => {
                console.log('ErrrS3', err);
            });
        }
    }

    // for recon
    //  else if (platformName === "recon") {
    if (name === "Asset") {
        const pointpreBucket = {
            Bucket: process.env.POINT_PRE_BUCKET_NAME,
            Prefix: initiateId + "/"
        }
        const filesArray = []
        const files = await pointpreS3.listObjectsV2(pointpreBucket).promise()
        await files.Contents.forEach((item, index) => {
            let text = item.Key;
            let position = text.search("3DObject");
            if (position == '-1') {
                filesArray.push(item.Key.split("/").pop());
            }
        });
        var pathAsset = process.env.BASE_URL + 'downloads/' + initiateId + '-assets.zip';
        if (fs.existsSync(pathAsset)) {
            pathAsset = {
                path: pathAsset,
            }
            return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
        }
        else {
            pathAsset = {
                path: pathAsset,
            }
            await createZipFileFromS3(filesArray, initiateId + '/', initiateId, { s3: pointpreS3, bucket: process.env.POINT_PRE_BUCKET_NAME, debug: true }).then(async (data) => {
                var resP = '';
                if (data.path) {
                    resP = {
                        path: process.env.BASE_URL + data.path.replace(/\\/g, "/"),
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
                else {
                    resP = {
                        path: '',
                    }
                    return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
                }
            }).catch(err => {
                console.log('ErrrS3', err);
            });
        }
    }
    else if (name === "3d_object") {
        const pointpre3DBucket = {
            Bucket: process.env.POINT_PRE_BUCKET_NAME,
            Prefix: initiateId + "/3DObject/"
        }
        const filesArray = []
        const files = await pointpreS3.listObjectsV2(pointpre3DBucket).promise()
        await files.Contents.forEach((item, index) => {
            filesArray.push(item.Key.split("/").pop());
        });
        var pathAsset = process.env.BASE_URL + 'downloads/' + initiateId + '-assets.zip';
        pathAsset = {
            path: pathAsset,
        }
        await createZipFileFromS3(filesArray, initiateId + '/3DObject/', initiateId, { s3: scanamazeS3, bucket: process.env.POINT_PRE_BUCKET_NAME, debug: true }).then(async (data) => {
            var resP = '';
            if (data.path) {
                resP = {
                    path: process.env.BASE_URL + data.path.replace(/\\/g, "/"),
                }
                return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
            }
            else {
                resP = {
                    path: '',
                }
                return apiResponse.successResponseWithDataInstant(res, "File Details..", pathAsset);
            }
        }).catch(err => {
            console.log('ErrrS3', err);
        });
    }
    // }
    else {
        console.log("Not connected");
    }
}
//create zip file from s3 bucket
const createZipFileFromS3 = async (files, folderName, initiateId, platformDetails) => {
    const output = fs.createWriteStream(join('./src/downloads', `${initiateId}-assets.zip`))
    return new Promise((resolve, reject) => {
        var stream = s3Zip.archive(platformDetails, folderName, files).pipe(output)
        stream.on('error', function (error) {
            reject(error);
        })
        stream.on('finish', function () {
            return resolve(output);
        })
    }).catch(err => {
        console.log('Error', err);
    });
};
//enable reupload 
const enableReupload = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    let platformName = req.query.platformName
    var initiateId = req.query.initiate_id;
    var attempts = req.body.attempts;
    var name = req.query.name;
    var query = "SELECT file_tasks.initiate_id,app_users.email from file_tasks JOIN app_users ON app_users.id=file_tasks.user_id where file_tasks.initiate_id= " + req.query.initiate_id;
    var query1 = "SELECT * FROM `max_tries` WHERE initiate_id = " + req.query.initiate_id;
    const queryData = await queryHelper.getDataFromQuery(query, sequelize);
    const quer1Data = await queryHelper.getDataFromQuery(query1, sequelize);
    if (platformName === "pointprecise") {
        if (name === "reupload") {
            if (queryData) {
                if (quer1Data && quer1Data.length > 0) {
                    if (quer1Data[0].attempts < 5) {
                        var attemptF = quer1Data[0].attempts + 1;
                        const maxRetry = {
                            attemptF: attemptF
                        }
                        var subject = "ReUpload"
                        var html = `<!DOCTYPE>
                            <html>
                            <body>
                            <h1>Hello User this is from pointprecise</h1>
                            </body>
                            </html>`;
                        var from = process.env.EMAIL_SMTP_USERNAME;
                        var to = queryData[0].email;
                        mailer.send(
                            from,
                            to,
                            subject,
                            html
                        ).then(function () {
                            return apiResponse.successResponse(res, "Email send Successfully.");
                        }).catch(err => {
                            return apiResponse.ErrorResponse(res, err);
                        });

                        let updateQ = "UPDATE max_tries set attempts=" + attemptF + " where initiate_id=" + initiateId + "";
                        sequelize.query(updateQ).then(queryData => {
                        });
                    }
                    else {
                        return apiResponse.successResponse(res, "Reupload attempts exid to lmit 5");
                    }
                }
                else {
                    var attemptttt = 1;
                    let insertQ = "INSERT INTO max_tries (initiate_id, attempts) VALUES (" + initiateId + "," + attemptttt + ")";
                    sequelize.query(insertQ).then(queryData => {
                    });
                    var subject = "ReUpload"
                    var html = `<!DOCTYPE>
                            <html>
                            <body>
                            <h1>Inserted</h1>
                            </body>
                            </html>`;
                    var from = process.env.EMAIL_SMTP_USERNAME;
                    var to = queryData[0].email;
                    mailer.send(
                        from,
                        to,
                        subject,
                        html
                    ).then(function () {
                        return apiResponse.successResponse(res, "Email send Successfully.");
                    }).catch(err => {
                        return apiResponse.ErrorResponse(res, err);
                    });
                }
            }
        }
    }
    else if (platformName === "scanamaze") {
        if (name === "reupload") {
            if (queryData) {
                if (quer1Data && quer1Data.length > 0) {
                    if (quer1Data[0].attempts < 5) {
                        var attemptF = quer1Data[0].attempts + 1;
                        const maxRetry = {
                            attemptF: attemptF
                        }
                        var subject = "ReUpload"
                        var html = `<!DOCTYPE>
                            <html>
                            <body>
                            <h1>Hello User you can upload</h1>
                            </body>
                            </html>`;
                        var from = process.env.EMAIL_SMTP_USERNAME;
                        var to = queryData[0].email;
                        mailer.send(
                            from,
                            to,
                            subject,
                            html
                        ).then(function () {
                            return apiResponse.successResponse(res, "Email send Successfully.");
                        }).catch(err => {
                            return apiResponse.ErrorResponse(res, err);
                        });

                        let updateQ = "UPDATE max_tries set attempts=" + attemptF + " where initiate_id=" + initiateId + "";
                        sequelize.query(updateQ).then(queryData => {
                        });
                    }
                    else {
                        return apiResponse.successResponse(res, "Reupload attempts exid to lmit 5");
                    }
                }
                else {
                    var attemptttt = 1;
                    let insertQ = "INSERT INTO max_tries (initiate_id, attempts) VALUES (" + initiateId + "," + attemptttt + ")";
                    sequelize.query(insertQ).then(queryData => {
                    });
                    var subject = "ReUpload"
                    var html = `<!DOCTYPE>
                            <html>
                            <body>
                            <h1>Inserted</h1>
                            </body>
                            </html>`;
                    var from = process.env.EMAIL_SMTP_USERNAME;
                    var to = queryData[0].email;
                    mailer.send(
                        from,
                        to,
                        subject,
                        html
                    ).then(function () {
                        return apiResponse.successResponse(res, "Email send Successfully.");
                    }).catch(err => {
                        return apiResponse.ErrorResponse(res, err);
                    });
                }
            }
        }
    }
}
const userlistdataNotification = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var user_sql = "SELECT *,(select user_id from users_notifications where user_id=app_users.id ORDER by id DESC LIMIT 1) as sent,(select createdAt from users_notifications where user_id=app_users.id ORDER by id DESC LIMIT 1) as sent_time FROM `app_users` where user_firebase_id IS NOT NULL and user_firebase_id!='' ";
    const userData = await queryHelper.getDataFromQuery(user_sql, sequelize)
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    res.render("admin/pages/userLists", { userData, uri: uri });
}
const usersReport = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var user_id = req.params.id;
    var sql = "select app_users.id,app_users.first_name,app_users.last_name, notification,title, notification_details.log,notification_details.users_ids, users_notifications.createdAt FROM app_users LEFT JOIN users_notifications ON app_users.id = users_notifications.user_id LEFT JOIN notification_details ON notification_details.id = users_notifications.notification_id WHERE app_users.id=" + user_id + " ORDER by users_notifications.createdAt desc";
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    const userData = await queryHelper.getDataFromQuery(sql, sequelize);
    // console.log(userData);
    let UserReport = userData.map((r) => {
        console.log("r",r);
        let statusArr = JSON.parse(r.log);
        console.log("statusArr",statusArr);
        let statusRes = statusArr.results;
        console.log("statusRes",statusRes);
        let msgsArr = []; let sendStatus = '';
        statusRes.forEach(function (value, index) {

            msgsArr.push(Object.keys(value));
        });
        //console.log(msgsArr);
        if (r.users_ids) {
            let users = r.users_ids;
            var userL = users.split(',');
            let i = 0; let c = 0;
            userL.forEach(function myFunction(element) {
                // console.log(element);
                let sts = msgsArr[i++][0];
                if (element == user_id) {
                    sendStatus = sts == 'message_id' ? 'Success' : 'Failure';
                }

            });
        }
        let id = r.id;
        let title = r.title;
        let createdAt = r.createdAt;
        let status = JSON.parse(r.log);
        var first_name = r.first_name ? r.first_name : '';
        var last_name = r.last_name ? r.last_name : '';
        var invData =
        {
            id: id,
            title: title,
            first_name: first_name,
            last_name: last_name,
            createdAt: createdAt,
            // status: status == null?"not found":"success " + status.success + " " + " " + " failure " + status.failure
            status: sendStatus,
        }

        return invData;


    });
    res.render("admin/pages/userReport", { UserReport, uri: uri });
}
const send_notification = async (req, res) => {
    var plateform = req.body.platformName;
    const sequelize = await connectDB.connectDb(plateform);
    var userId = req.body.user_ids;
    var firebaseIds = [];
    var usersIDS = [];
    var title = req.body.title;
    var comment = req.body.comment;
    var data = {
        title: title,
        comment: comment
    }
    var userId = "SELECT * FROM `app_users` WHERE id IN (" + req.body.user_ids + ")";

    const userData = await queryHelper.getDataFromQuery(userId, sequelize);
    var notificationInsert = "INSERT INTO notification_details (notification, title) VALUES ('" + comment + "','" + title + "') ";
    await sequelize.query(notificationInsert).then(async insertN => {
        var maxIdQ = "SELECT MAX(id) as notification_id FROM `notification_details` ";
        const max_id = await queryHelper.getDataFromQuery(maxIdQ, sequelize);
        const notification_id = max_id[0].notification_id;
        var insertArr = [];
        userData.forEach(async function (value, index) {
            let user_firebase_id = value.user_firebase_id ? value.user_firebase_id : 'NO ID';
            firebaseIds.push(user_firebase_id);

            usersIDS.push(value.id);
            insertArr.push("('" + value.id + "','" + value.user_firebase_id + "','" + notification_id + "')");
            // var userNotification = "INSERT INTO users_notifications (user_id, user_device_id,notification_id) VALUES ('" + value.id + "','" + value.user_firebase_id + "','" + notification_id + "')";

        });

        const returnData = notificationUtility.sentNotificationMultiple(firebaseIds, title, data, notification_id, plateform, usersIDS);
        var implodeArr = insertArr.join();
        var userNotification = "INSERT INTO users_notifications (user_id, user_device_id,notification_id) VALUES " + implodeArr + "";
        //console.log(userNotification);

        await sequelize.query(userNotification).then(async insertN => {
        });
    });
    return apiResponse.successResponseWithData(res, "Created Successfully.");
}
const notificationdetail = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var userDetails = "SELECT * FROM `notification_details` order by id desc";
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    const userData = await queryHelper.getDataFromQuery(userDetails, sequelize)
    res.render("admin/pages/notificationdetail", { userData, uri: uri });
}
const notificatiomaster = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var notification_id = req.params.id;
    var notification_sql = "select u.first_name,u.last_name,n.id,n.title,n.notification,n.log from users_notifications d JOIN app_users u ON u.id=d.user_id JOIN notification_details n ON n.id=d.notification_id WHERE n.id=" + notification_id + " ";
    const userData = await queryHelper.getDataFromQuery(notification_sql, sequelize)
    let statusArr = JSON.parse(userData[0].log);
    let statusRes = statusArr.results;
    let msgsArr = [];
    statusRes.forEach(function (value, index) {

        msgsArr.push(Object.keys(value));
    });
    let i = 0; let c = 0;
    let UserListAr = userData.map((r) => {
        let f = r.first_name ? r.first_name : '';
        let l = r.last_name ? r.last_name : '';
        let name = f + " " + l;
        let sts = msgsArr[i++][0];
        var invData =
        {
            name: name,
            status: sts == 'message_id' ? 'Success' : 'Failure'
        }
        return invData;
    });

    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    res.render('admin/pages/notificationReport', { UserListAr, uri: uri });
}


//  **************************************************stream part start******************************************************************

//tycho stream api
//user detail view for tycho stream
const tychoUserDetailView = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var userDetails = "SELECT * FROM `users`";
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    const userData = await queryHelper.getDataFromQuery(userDetails, sequelize)
    res.render("admin/pages/tychoStreamUserDetails", { userData, uri: uri });
}

// for tychostream userlistdata notification
const tychoUserlistdataNotification = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var user_sql = "SELECT *,(select user_id from users_notifications where user_id=users.id ORDER by id DESC LIMIT 1) as sent,(select created_at from users_notifications where user_id=users.id ORDER by id DESC LIMIT 1) as sent_time FROM `users` where user_firebase_id IS NOT NULL and user_firebase_id!='' ";
    const userData = await queryHelper.getDataFromQuery(user_sql, sequelize)
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    res.render("admin/pages/tychoStreamUserLists", { userData, uri: uri });
}
//user report for tycho stream
const tychoUsersReport = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var user_id = req.params.id;
    var sql = "select users.id,users.name, notification,title, notification_details.log,notification_details.users_ids, users_notifications.created_at FROM users LEFT JOIN users_notifications ON users.id = users_notifications.user_id LEFT JOIN notification_details ON notification_details.id = users_notifications.notification_id WHERE users.id=" + user_id + " ORDER by users_notifications.created_at desc";
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    const userData = await queryHelper.getDataFromQuery(sql, sequelize);
    // console.log(userData);
    let UserReport = userData.map((r) => {
console.log("r",r);
        let statusArr = JSON.parse(r.log);
        console.log("statusArr",statusArr);
        let statusRes = statusArr.results;
        console.log("statusRes",statusRes);
        let msgsArr = []; let sendStatus = '';
        statusRes.forEach(function (value, index) {

            msgsArr.push(Object.keys(value));
        });
        //console.log(msgsArr);
        if (r.users_ids) {
            let users = r.users_ids;
            var userL = users.split(',');
            let i = 0; let c = 0;
            userL.forEach(function myFunction(element) {
                // console.log(element);
                let sts = msgsArr[i++][0];
                if (element == user_id) {
                    sendStatus = sts == 'message_id' ? 'Success' : 'Failure';
                }

            });
        }
        let id = r.id;
        let title = r.title;
        let created_at = r.created_at;
        let status = JSON.parse(r.log);
        var name = r.name ? r.name : '';
        var invData =
        {
            id: id,
            title: title,
            name: name,
            created_at: created_at,
            // status: status == null?"not found":"success " + status.success + " " + " " + " failure " + status.failure
            status: sendStatus,
        }

        return invData;


    });
    res.render("admin/pages/tychoStreamUserReport", { UserReport, uri: uri });
}
//send_notification for tychostream
const send_notification_tychostream = async (req, res) => {
    var plateform = req.body.platformName;
    const sequelize = await connectDB.connectDb(plateform);
    var userId = req.body.user_ids;
    var firebaseIds = [];
    var usersIDS = [];
    var title = req.body.title;
    var comment = req.body.comment;
    var data = {
        title: title,
        comment: comment
    }
    var userId = "SELECT * FROM `users` WHERE id IN (" + req.body.user_ids + ")";

    const userData = await queryHelper.getDataFromQuery(userId, sequelize);
    var notificationInsert = "INSERT INTO notification_details (notification, title) VALUES ('" + comment + "','" + title + "') ";
    await sequelize.query(notificationInsert).then(async insertN => {
        var maxIdQ = "SELECT MAX(id) as notification_id FROM `notification_details` ";
        const max_id = await queryHelper.getDataFromQuery(maxIdQ, sequelize);
        const notification_id = max_id[0].notification_id;
        var insertArr = [];
        userData.forEach(async function (value, index) {
            let user_firebase_id = value.user_firebase_id ? value.user_firebase_id : 'NO ID';
            firebaseIds.push(user_firebase_id);

            usersIDS.push(value.id);
            insertArr.push("('" + value.id + "','" + value.user_firebase_id + "','" + notification_id + "')");
            // var userNotification = "INSERT INTO users_notifications (user_id, user_device_id,notification_id) VALUES ('" + value.id + "','" + value.user_firebase_id + "','" + notification_id + "')";

        });

        const returnData = notificationUtility.sentNotificationMultipleTychoStream(firebaseIds, title, data, notification_id, plateform, usersIDS);
        var implodeArr = insertArr.join();
        var userNotification = "INSERT INTO users_notifications (user_id, user_device_id,notification_id) VALUES " + implodeArr + "";
        //console.log(userNotification);

        await sequelize.query(userNotification).then(async insertN => {
        });
    });
 
    return apiResponse.successResponseWithData(res, "Created Successfully.");
}
// tycho stream notification detail
const notificationDetailTychoStream = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var userDetails = "SELECT * FROM `notification_details`";
    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    const userData = await queryHelper.getDataFromQuery(userDetails, sequelize)
    res.render("admin/pages/tychoStreamNotificationdetail", { userData, uri: uri });
}
//notification master for tycho stream
const notificatioMasterTychoStream = async (req, res) => {
    const sequelize = await connectDB.connectDb(req.url);
    var notification_id = req.params.id;
    var notification_sql = "select u.name,n.id,n.title,n.notification,n.log from users_notifications d JOIN users u ON u.id=d.user_id JOIN notification_details n ON n.id=d.notification_id WHERE n.id=" + notification_id + " ";
    const userData = await queryHelper.getDataFromQuery(notification_sql, sequelize)
    console.log("userData",userData);
    let statusArr = JSON.parse(userData[0].log);
    let statusRes = statusArr.results;
    let msgsArr = [];
    statusRes.forEach(function (value, index) {

        msgsArr.push(Object.keys(value));
    });
    let i = 0; let c = 0;
    let UserListAr = userData.map((r) => {
        let name = r.name ? r.name : '';
        let sts = msgsArr[i++][0];
        var invData =
        {
            name: name,
            status: sts == 'message_id' ? 'Success' : 'Failure'
        }
        return invData;
    });

    let requestSegments = req.path.split('/');
    let uri = requestSegments[1];
    res.render('admin/pages/tychoStreamNotificationReport', { UserListAr, uri: uri });
}


module.exports = { platformDetailView, userDetailView, downloadAssets, createZipFileFromS3, enableReupload, userlistdataNotification, send_notification, notificationdetail, notificatiomaster, usersReport, tychoUserDetailView, tychoUserlistdataNotification, tychoUsersReport, send_notification_tychostream, notificationDetailTychoStream, notificatioMasterTychoStream };