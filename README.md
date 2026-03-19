# Instock Client

Frontend application for the Instock inventory management system. This client provides a responsive interface for managing warehouses and inventory items, and connects directly to the Instock Server backend API.

---

## 🚀 Overview

Instock Client is a modern React application built to manage inventory data through a clean and user-friendly interface. It allows users to view, create, update, and delete warehouses and inventory items while interacting with a backend server.

This project emphasizes responsive design, modular components, and seamless API integration.

---

## 🔗 Related Project (Backend)

This client requires the backend server:

👉 https://github.com/hellsten/Instock-Server

Make sure the server is running before starting the client.

---

## 📌 Contributions & History

This repository represents a refined version of the project.

For full commit history and earlier contributions, please refer to:

👉 https://github.com/hellsten/Instock-Server-Archived

---

## 🧩 Features

* View and manage warehouses
* View and manage inventory items
* Create, edit, and delete records
* Responsive design (mobile & desktop)
* Clean UI with reusable React components
* API integration with backend server

---

## 🛠️ Tech Stack

* React
* JavaScript (ES6+)
* SCSS (Sass)
* Axios
* React Router

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/hellsten/Instock-Client.git
cd Instock-Client
```

### 2. Install dependencies

```bash
npm install
```

---

## 🔌 Backend Setup (REQUIRED)

Before running the client, start the Instock Server:

```bash
git clone https://github.com/hellsten/Instock-Server.git
cd Instock-Server
npm install
npm run dev
```

Server should run at:

```txt
http://localhost:8080
```

---

## ▶️ Running the Client

```bash
npm run dev
```

Client will typically run at:

```txt
http://localhost:5173
```

---

## 🌐 API Connection

Make sure your client is configured to connect to:

```txt
http://localhost:8080
```

If needed, update your API base URL in your services or config files.

---

## 📁 Project Structure

```txt
src/
├── components/
├── pages/
├── assets/
├── styles/
├── utils/
├── services/
```

---

## ⚠️ Common Setup Notes

* The backend **must be running** before using the client
* Ensure ports do not conflict (`5173` for client, `8080` for server)
* If requests fail, check:

  * Backend is running
  * API URL is correct
  * CORS is enabled on the server

---

## 📌 Status

This project is part of a full-stack inventory management system and is actively being developed and improved.

---

## 📄 License

This project is for educational and portfolio purposes.

---

## 👤 Author

Jessica Hellsten
GitHub: https://github.com/hellsten

---


