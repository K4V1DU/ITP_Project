import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../NavBar/NavBar';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:5000/contact', formData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Message sent successfully! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || 'Failed to send message. Please try again.');
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Cannot connect to server. Please check if backend is running on port 5000.');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <style>{`
        .contact-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #dcdcdcff 0%, #ffffffff 100%);
          padding: 2rem 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .contact-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 3rem;
          color: back;
        }

        .contact-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(33, 33, 33, 0.56);
        }

        .contact-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        .contact-info {
          background: rgba(255, 255, 255, 0.95);
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
        }

        .info-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #2d3748;
          text-align: center;
        }

        .info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding: 1rem;
          border-radius: 10px;
          transition: all 0.3s ease;
          background: rgba(102, 126, 234, 0.05);
        }

        .info-item:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateX(5px);
        }

        .info-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .info-icon svg {
          color: white;
          font-size: 1.2rem;
        }

        .info-content h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.1rem;
        }

        .info-content p {
          margin: 0;
          color: #4a5568;
          line-height: 1.5;
        }

        .business-hours {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 10px;
        }

        .business-hours h4 {
          margin: 0 0 1rem 0;
          color: #2d3748;
          font-size: 1.1rem;
        }

        .hours-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .hours-list li {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        .hours-list li:last-child {
          margin-bottom: 0;
        }

        .contact-form {
          background: rgba(255, 255, 255, 0.95);
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
        }

        .form-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: #2d3748;
          text-align: center;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          color: #2d3748;
          font-weight: 500;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea, #b076eeff);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .map-section {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          margin-bottom: 3rem;
        }

        .emergency-contact {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .emergency-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .emergency-phone {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .emergency-note {
          opacity: 0.9;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="contact-container">
        <div className="contact-content">
          {/* Header Section */}
          <div className="contact-header">
            <h1 className="contact-title">Contact CoolCart</h1>
            <p className="contact-subtitle">
              Get in touch with our supply chain and stock ordering experts. 
              We're here to help streamline your business operations.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2 className="info-title">Get In Touch</h2>
              
              <div className="info-item">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Office Address</h3>
                  <p>
                    126/4 DS Jayasinghe Road<br />
                    Botiyawaththa<br />
                    Minuwangoda
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Phone Numbers</h3>
                  <p>
                    General Inquiries: +94 71 563 2558<br />
                    Order Support: +94 75 553 5311<br />
                    Technical Support: +94 71 529 4616
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Email Addresses</h3>
                  <p>
                    coolcarticecream@gmail.com<br />
                  </p>
                </div>
              </div>

              <div className="business-hours">
                <h4>Business Hours</h4>
                <ul className="hours-list">
                  <li><span>Monday - Friday:</span> <span>8:00 AM - 6:00 PM</span></li>
                  <li><span>Saturday:</span> <span>8:00 AM - 6:00 PM</span></li>
                  <li><span>Sunday:</span> <span>Closed</span></li>
                  <li><span>Emergency Support:</span> <span>24/7 Available</span></li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <h2 className="form-title">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="order-inquiry">Order Inquiry</option>
                    <option value="stock-management">Stock Management</option>
                    <option value="supply-chain">Supply Chain</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="billing">Billing Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Tell us about your stock ordering or supply chain needs..."
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <iframe
              title="CoolCart Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.499960834195!2d79.95659679999997!3d7.183648400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2e50060a402f3%3A0xc31c324f44908bd3!2sOsanda%20DistributorS!5e0!3m2!1sen!2slk!4v1760424275082!5m2!1sen!2slk"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>

          {/* Emergency Contact */}
          <div className="emergency-contact">
            <h3 className="emergency-title">🚨 Urgent Order Support</h3>
            <div className="emergency-phone">+94 77 665 1300</div>
            <p className="emergency-note">
              Available 24/7 for critical supply chain and order emergencies
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ContactPage;