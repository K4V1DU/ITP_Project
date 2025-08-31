const Coupons = require("../Model/CouponsModel");

//Display all coupons
const getAllCoupons = async (req, res, next) => {
    let Coupon;

    try{
        Coupon = await Coupons.find();
        if(!Coupon || Coupon.length===0){
            return res.status(404).json({message: "Coupons not found..."});
        }
        else{
            return res.status(200).json({Coupon});
        }
    }catch (err){
        console.error(err);
        return res.status(500).json({message: "Error.!", error: err});
    }
};

exports.getAllCoupons = getAllCoupons;