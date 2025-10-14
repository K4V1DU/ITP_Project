const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Please fill in all required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "coolcarticecream@gmail.com", 
        pass: "hmjr bjdz wdhk qgfu", 
      },
    });

    // from customer
    const mailOptions = {
      from: `${name} <${email}>`,
      to: "coolcarticecream@gmail.com", 
      subject: `Customer Support: ${subject}`,
      html: `
        <h2>New Customer Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr />
        <p style="font-size:12px;color:#666;">
          This message was sent from the CoolCart Contact Page.
        </p>
      `,
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Your message has been sent successfully! We’ll get back to you soon.",
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;
