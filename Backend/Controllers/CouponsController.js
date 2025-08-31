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


// Insert

const addCoupon = async(req, res, next) =>{

    const {Code,DiscountValue,MinAmount,UsageLimit,UsageCount,ExpiryDate,Active} = req.body;

    let Coupon;

    try {
        
        Coupon = new Coupons({Code,DiscountValue,MinAmount,UsageLimit,UsageCount,ExpiryDate,Active});
        await Coupon.save();

    } catch (err) {
        console.log(err);
    }
    if(!Coupon){
        return res.status(404).json({message:"Insert failed"});
    }
    return res.status(200).json({ Coupon });
};


//getById


const getBycouponId = async(req, res, next) => {

    const id = req.params.id;

    let Coupon;

    try {
        Coupon = await Coupons.findById(id);    

    } catch (err) {
        console.log(err);
    }
    if(!Coupon){
        return res.status(404).json({message:"Coupon Not Found"});
    }
    return res.status(200).json({Coupon});


};


exports.getAllCoupons = getAllCoupons;
exports.addCoupon = addCoupon;
exports.getBycouponId = getBycouponId;