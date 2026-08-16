# CoolCart — B2B Ice Cream Ordering Platform

A full-stack MERN platform built for shop owners to browse products, manage their cart, and place orders with ice cream suppliers. CoolCart streamlines B2B ordering with a curated product catalog, an intuitive checkout flow, and order tracking.

- Architected a full-stack MERN platform with 25+ API endpoints supporting product browsing, cart, and order management for shop owners
- Curated a product catalog populated with 30+ sample ice cream products across multiple categories
- Built and assessed a cart and checkout flow across 10+ mock shop owner accounts

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## Features

- **Product Catalog** — Browse ice cream products across multiple categories
- **Cart & Checkout** — Add items to cart and complete orders through a streamlined checkout flow
- **Order Management** — Track and manage orders for shop owners
- **Email Notifications** — Automated order/account emails via Nodemailer
- **Reporting & Analytics** — Visual charts and dashboards for order and product data
- **PDF Export** — Generate downloadable PDF reports (e.g. invoices, order summaries)
- **Toast & Alert Notifications** — User-friendly success/error feedback throughout the app

---

## Tech Stack

**Frontend:** React, Material UI (MUI), Chart.js, Recharts, SweetAlert2, React-Toastify, jsPDF
**Backend:** Node.js, Express, Nodemailer
**Database:** MongoDB

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/K4V1DU/ITP_Project.git
cd ITP_Project
```

**Backend:**
```bash
cd Backend
npm install
npm install nodemailer
```

**Frontend:**
```bash
cd ../Frontend
npm install
npm install sweetalert2 react-toastify recharts
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install react-chartjs-2 chart.js
npm install jspdf jspdf-autotable
npm install html2canvas
```

### Environment Variables

Create a `.env` file in the `Frontend` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```

Create a `.env` file in the `Backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=8000
NODE_ENV=development

# Nodemailer (email notifications)
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

> Never commit your actual `.env` file. Add it to `.gitignore` and share only a `.env.example` with placeholder values.

### Run Locally

```bash
# Start the backend
cd Backend
npm run dev

# Start the frontend (in a new terminal)
cd Frontend
npm start
```

The app should now be running at `http://localhost:3000`, with the API served from `http://localhost:8000`.

---

## License

This project is licensed under the MIT License.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/K4V1DU/ITP_Project/issues).

---

## Contact

For questions or feedback, feel free to reach out via GitHub Issues.
