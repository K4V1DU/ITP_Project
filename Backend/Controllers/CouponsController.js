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



// Create a coupon
const addCoupon = async(req, res, next) =>{
    const {Code,discountType,DiscountValue,MinAmount,UsageLimit,UsageCount,ExpiryDate,Active} = req.body;
    let Coupon;

    try {
        Coupon = new Coupons({Code,discountType,DiscountValue,MinAmount,UsageLimit,UsageCount,ExpiryDate,Active});
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
        return res.status(404).json({message:"Coupon not found"});
    }
    return res.status(200).json({Coupon});
};


//Delete coupon
const deleteCoupon = async(req, res, next) => {
    const id = req.params.id;
    let Coupon;

    try {
        Coupon = await Coupons.findByIdAndDelete(id);

    } catch (err) {
        console.log(err);
    }
    if(!Coupon){
        return res.status(404).json({message:"Coupon not found"});
    }
    return res.status(200).json({Coupon});
};


//Update coupon
const updateCoupon = async(req, res, next) => {
    const id = req.params.id;
    const {Code,discountType,DiscountValue,MinAmount,UsageLimit,UsageCount,ExpiryDate,Active} = req.body;
    let Coupon;

    try {
        Coupon = await Coupons.findByIdAndUpdate(id,{Code,discountType,DiscountValue,MinAmount,UsageLimit,UsageCount,ExpiryDate,Active});
        await Coupon.save();
    } catch (err) {
        console.log(err);
    }
    if(!Coupon){
        return res.status(404).json({message:"Unable this coupon to update"});
    }
    return res.status(200).json({Coupon});
};




exports.getAllCoupons = getAllCoupons;
exports.addCoupon = addCoupon;
exports.getBycouponId = getBycouponId;
exports.deleteCoupon = deleteCoupon;
exports.updateCoupon = updateCoupon;
