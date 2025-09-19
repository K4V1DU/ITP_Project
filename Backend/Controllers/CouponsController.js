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
    }
    catch (err){
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
    } 
    catch (err) {
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
    } 
    catch (err) {
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
    } 
    catch (err) {
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
    } 
    catch (err) {
        console.log(err);
    }
    if(!Coupon){
        return res.status(404).json({message:"Unable this coupon to update"});
    }
    return res.status(200).json({Coupon});
};




// Validate Coupon

const validateCoupon = async (req, res, next) => {
  const { code, subtotal } = req.body;

  if (!code || subtotal === undefined) {
    return res.status(400).json({ message: "Coupon code and subtotal are required" });
  }

  try {
    const coupon = await Coupons.findOne({ Code: code });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });

    if (!coupon.Active) return res.status(400).json({ message: "Coupon is not active" });

    if (!coupon.ExpiryDate || new Date() > new Date(coupon.ExpiryDate))
      return res.status(400).json({ message: "Coupon expired" });

    if (Number(subtotal) < coupon.MinAmount)
      return res.status(400).json({ message: `Minimum order Rs ${coupon.MinAmount} required` });

    if (coupon.UsageCount >= coupon.UsageLimit)
      return res.status(400).json({ message: "Coupon usage limit reached" });

    //usage count increment
    coupon.UsageCount +=1;
    await coupon.save();
    
    // Only return details, increment usage AFTER successful order
    return res.status(200).json({
      message: "Coupon applied successfully",
      discountValue: coupon.DiscountValue,
      type: coupon.discountType,
      code: coupon.Code,
    });
  } 
  catch (err) {
    console.error("Coupon validation error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getAllCoupons = getAllCoupons;
exports.addCoupon = addCoupon;
exports.getBycouponId = getBycouponId;
exports.deleteCoupon = deleteCoupon;
exports.updateCoupon = updateCoupon;
exports.validateCoupon = validateCoupon;



