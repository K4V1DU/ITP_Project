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


// Validate Coupon
const validateCoupon = async (req, res, next) => {
  const { code, subtotal } = req.body;

  try {
    const coupon = await Coupons.findOne({ Code: code });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon" });
    }

    // Active check
    if (!coupon.Active) {
      return res.status(400).json({ message: "Coupon is not active" });
    }

    // Expiry check
    if (new Date() > coupon.ExpiryDate) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    // Minimum amount check
    if (subtotal < coupon.MinAmount) {
      return res
        .status(400)
        .json({ message: `Minimum order Rs ${coupon.MinAmount} required` });
    }

    // Usage limit check
    if (coupon.UsageCount >= coupon.UsageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // If valid, return discount details
    return res.status(200).json({
      message: "Coupon applied successfully",
      discountValue: coupon.DiscountValue,
      type: "percentage", // you can change later if you want fixed
      code: coupon.Code,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};




exports.getAllCoupons = getAllCoupons;
exports.addCoupon = addCoupon;
exports.getBycouponId = getBycouponId;
exports.validateCoupon = validateCoupon;
