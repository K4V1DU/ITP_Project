// contact.js (Backend)
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  console.log("Received form data:", req.body);

  try {
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // use 587 for TLS
      secure: true, // true for 465, false for 587
      auth: {
        user: "coolcarticecream@gmail.com", // your Gmail
        pass: "hmjr bjdz wdhk qgfu",       // your Gmail App Password
      },
    });

    const mailOptions = {
      from: '"CoolCart Contact Form" <coolcarticecream@gmail.com>',
      to: "coolcarticecream@gmail.com",
      subject: `New Contact Form Message: ${subject}`,
      html: `
        <h3>New Inquiry from CoolCart Contact Form</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err);

    // Return detailed error for easier debugging
    let errorMessage = "Failed to send email";
    if (err.response) {
      errorMessage += `: ${err.response}`;
    } else if (err.message) {
      errorMessage += `: ${err.message}`;
    }

    res.status(500).json({ success: false, message: errorMessage });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
