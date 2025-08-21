

const Inventory = require("../Model/InventoryModel");


//Display All

const getAllProducts = async(req, res, next) => {

    let products;

    try {
        products = await Inventory.find();

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Products Not Found"});
    }
    return res.status(200).json({products});


};

// Insert

const addProducts = async(req, res, next) =>{

    const {ProductID,Name,Price,Description,Quantity,Category,Flavour,Capacity,URL} = req.body;

    let products;

    try {
        
        products = new Inventory({ProductID,Name,Price,Description,Quantity,Category,Flavour,Capacity,URL});
        await products.save();

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Insert failed"});
    }
    return res.status(200).json({ products });
};


//getById


const getById = async(req, res, next) => {

    const id = req.params.id;

    let products;

    try {
        products = await Inventory.findById(id);    

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Product Not Found"});
    }
    return res.status(200).json({products});


};



//Update

const updateProduct = async(req, res, next) => {

    const id = req.params.id;
    const {ProductID,Name,Price,Description,Quantity,Category,Flavour,Capacity,URL} = req.body;

    let products;

    try {

        products = await Inventory.findByIdAndUpdate(id,{ProductID,Name,Price,Description,Quantity,Category,Flavour,Capacity,URL});
        await products.save();


    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"unable to update"});
    }
    return res.status(200).json({products});


};

//Delete

const deleteProduct = async(req, res, next) => {

    const id = req.params.id;

    let products;

    try {
        products = await Inventory.findByIdAndDelete(id);

    } catch (err) {
        console.log(err);
    }
    if(!products){
        return res.status(404).json({message:"Product Not Found"});
    }
    return res.status(200).json({products});


};



exports.addProducts = addProducts;
exports.getAllProducts = getAllProducts;
exports.getById = getById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;