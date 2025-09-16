const express = require("express");
const router = express.Router();
//Insert Model
const Notification = require("../Controllers/NotificationController");
//Insert Notification Controller
const NotificationController = require("../Controllers/NotificationController")

router.get("/", NotificationController.getAllNotification);
router.post("/", NotificationController.addNotification);
router.get("/:id", NotificationController.getById);
router.put("/:id", NotificationController.updateNotification);
router.delete("/:id", NotificationController.deleteNotification);



//export
module.exports = router;