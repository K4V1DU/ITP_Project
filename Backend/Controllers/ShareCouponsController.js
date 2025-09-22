const nodemailer = require("nodemailer");
const Users = require("../Model/UsersModel");
const Coupons = require("../Model/CouponsModel");
const SharedCoupons = require("../Model/SharedCouponsModel");

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "coolcarticecream@gmail.com",   // your Gmail
    pass: "hpwc kbns iazj cjcv",         // app password from Gmail
  },
});

const shareCoupon = async (req, res) => {
  const { userIds, couponId } = req.body;

  try {
    const customers = await Users.find({ _id: { $in: userIds }, Role: "Customer" });
    const coupon = await Coupons.findById(couponId);

    if (!coupon || !coupon.Active) {
      return res.status(400).json({ message: "Coupon not valid" });
    }

    for (const customer of customers) {
      // avoid duplicate log
      const alreadyShared = await SharedCoupons.findOne({ userId: customer._id, couponId });
      if (!alreadyShared) {
        await SharedCoupons.create({ userId: customer._id, couponId });
      }

      // send email
      const mailOptions = {
        from: "coolcarticecream@gmail.com",
        to: customer.Email,
        subject: "🎁 You received a CoolCart Ice Cream coupon!",
        html: `
          <h3>Hello ${customer.FirstName},</h3>
          <p>You have received a special coupon code: <b>${coupon.Code}</b></p>
          <p>Discount: ${coupon.DiscountValue}%</p>
          <p>Minimum Order: Rs. ${coupon.MinAmount}</p>
          <p>Expiry Date: ${new Date(coupon.ExpiryDate).toLocaleDateString()}</p>
          <br>
          <p>Enjoy shopping with CoolCart Ice Cream 🍦</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return res.status(200).json({ message: "Coupons shared & logged successfully" });
  } catch (err) {
    console.error("Error sharing coupon:", err);
    return res.status(500).json({ message: "Error sharing coupon", error: err });
  }
};

module.exports = { shareCoupon };
