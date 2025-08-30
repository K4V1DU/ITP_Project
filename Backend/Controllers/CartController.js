const Cart = require("../Model/CartModel");


//Display All

const getAllItems = async(req, res, next) => {

    let Items;

    try {
        Items = await Cart.find();

    } catch (err) {
        console.log(err);
    }
    if(!Items){
        return res.status(404).json({message:"Cart is empty"});
    }
    return res.status(200).json({Items});


};





// Insert
const addToCart = async(req, res, next) =>{

    const {UserID,ProductID,Name,Price,Quantity,Total,URL} = req.body;

    let Items;

    try {
        
        Items = new Cart({UserID,ProductID,Name,Price,Quantity,Total,URL});
        await Items.save();

    } catch (err) {
        console.log(err);
    }
    if(!Items){
        return res.status(404).json({message:"Insert failed"});
    }
    return res.status(200).json({ Items });
};




//getById
const getById = async(req, res, next) => {

    const id = req.params.id;

    let Items;

    try {
        Items = await Cart.findById(id);    

    } catch (err) {
        console.log(err);
    }
    if(!Items){
        return res.status(404).json({message:"Items Not Found"});
    }
    return res.status(200).json({Items});


};



//Update

const updateCart = async(req, res, next) => {

    const id = req.params.id;
    const {UserID,ProductID,Name,Price,Quantity,Total,URL} = req.body;

    let Items;

    try {

        Items = await Cart.findByIdAndUpdate(id,{UserID,ProductID,Name,Price,Quantity,Total,URL});
        await Items.save();


    } catch (err) {
        console.log(err);
    }
    if(!Items){
        return res.status(404).json({message:"unable to update"});
    }
    return res.status(200).json({Items});


};



//Delete

const deleteItem = async(req, res, next) => {

    const id = req.params.id;

    let Items;

    try {
        Items = await Cart.findByIdAndDelete(id);

    } catch (err) {
        console.log(err);
    }
    if(!Items){
        return res.status(404).json({message:"Items Not Found"});
    }
    return res.status(200).json({Items});


};


exports.addToCart = addToCart;
exports.getAllItems = getAllItems;
exports.getById = getById;
exports.updateCart = updateCart;
exports.deleteItem = deleteItem;