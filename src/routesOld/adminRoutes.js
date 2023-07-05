const express = require('express');
const { loginView, login, logout } = require('../controllers/loginController');
const isLoggedIn = require("../middlewares/isLoggedIn.js");
const { dashboardView } = require('../controllers/dashboardController');
const { platformDetailView, userDetailView, downloadAssets, enableReupload, userlistdataNotification, send_notification, notificationdetail, notificatiomaster,usersReport} = require('../controllers/platformDetailController');
const { fileSync } = require('../controllers/fileValidateController')
const router = express.Router();

router.get('/login', loginView);
router.get('/dashboard', isLoggedIn, dashboardView);

router.get('/platform-detail-pointprecise/:id', isLoggedIn, platformDetailView);
router.get('/platform-detail-scanamaze/:id', isLoggedIn, platformDetailView);
// router.get('/platform-detail-recon/:id', isLoggedIn, platformDetailView);

router.get('/logout', logout);
router.post('/dashboard', login);

router.get('/pointprecise', isLoggedIn, userDetailView);
router.get('/scanamaze', userDetailView)
// router.get('/recon', userDetailView)

router.get("/downloadAssets-pointpre", downloadAssets);
router.get("/downloadAssets-scanamaze", downloadAssets);
// router.get("/downloadAssets-recon", downloadAssets);

router.get("/reupload-scanamaze", enableReupload);
router.get("/reupload-pointpre", enableReupload);
// router.get("/reupload-recon", enableReupload);

router.get('/pointprecise-notification', isLoggedIn, userlistdataNotification);
router.get('/scanamaze-notification', userlistdataNotification)
// router.get('/recon-notification', userlistdataNotification)

router.get('/pointprecise-notification-detail', notificationdetail);
router.get('/scanamaze-notification-detail', notificationdetail)
// router.get('/recon-notification-detail', notificationdetail)

router.post("/send-notification", send_notification)

router.get("/pointprecise-notificatiomaster/:id", notificatiomaster);
router.get("/scanamaze-notificatiomaster/:id", notificatiomaster);


router.get('/pointprecise-user-report/:id', usersReport);
router.get('/scanamaze-user-report/:id', usersReport);
// router.get("/recon-notificatiomaster/:id", notificatiomaster);


module.exports = router;