const Notification = require("../Model/NotificationModel");

//Display All
const getAllNotification = async (req, res, next) =>{
   
    let Notification;

    try{
        Notification = await Notification.find();
    }catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    //not found
    if(!Notification){
        return res.status(404).json({message: "Notification not found"});
    }
    //Display all Notifications
    return res.status(200).json({Notification});


};


//data Insert
const addNotification = async (req, res, next) =>{
    console.log("Incoming body:", req.body);  // Debug

    const {NotificationID, UserID, Title, Notification: message,  NotificationDate, NotificationTime} = req.body;

    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    let Notification;

    try{
        Notification = new Notification({NotificationID, UserID, Title, Notification:message,  NotificationDate, NotificationTime});
        await Notification.save();
    }catch(err){
        console.log(err);
        
    }
    //not insert users
    if(!Notification){
        return res.status(500).json({message: "Unable to add Notification"});
    }
    return res.status(201).json({Notification});
}

//Get by Id
const getById = async (req, res, next) =>{

    const id = req.params.id;

    let Notification;

    try{
        Notification = await Notification.findById(id);
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    //not available users
    if(!Notification){
        return res.status(502).json({message: "Notification Not found"});
    }
    return res.status(200).json({Notification});
}


//Update

const updateNotification = async(req, res, next) => {

    const id = req.params.id;
    const {NotificationID, UserID, Title, Notification:message,  NotificationDate, NotificationTime} = req.body;


    let Notification;
    
    try {

        const Notification = await Notification.findByIdAndUpdate(
            id,{ NotificationID, UserID, Title, Notification: message, NotificationDate, NotificationTime },
            
        );

    } catch (err) {
        console.log(err);
    }
    if(!Notification){
        return res.status(404).json({message:"unable to update"});
    }
    return res.status(200).json({Notification});


};



//Delete

const deleteNotification = async(req, res, next) => {

    const id = req.params.id;

    let Notification;

    try {
        Notification = await Notification.findByIdAndDelete(id);

    } catch (err) {
        console.log(err);
    }
    if(!Notification){
        return res.status(404).json({message:"Notification Not Found"});
    }
    return res.status(200).json({Notification});


};




exports.getAllNotification = getAllNotification;
exports.addNotification = addNotification;
exports.getById=getById;
exports.updateNotification = updateNotification;
exports.deleteNotification = deleteNotification;