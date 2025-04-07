# Quizmaster

**Quizmaster** is a full-stack quiz application built using the MERN stack (MongoDB, Express.js, React, Node.js), TesseractJS and Gemini API. It provides a clean, interactive platform where users can create quizzes from text or documents and also take timed quizzes, and view their scores instantly, along with detailed analysis. 

---

##  Features

-  User registration & login (JWT with secure cookies)
-  Create, update, delete quizzes
-  Timer-based quiz interface
-  Real-time score calculation and results
-  Responsive UI for all devices
-  Secure API with protected routes

---

##  Tech Stack

- **Frontend**: React + Tailwind CSS + Vite + ShadCN UI
- **Backend**: Node.js + Express.js
- **Libraries**: Tesseract.js
- **Database**: MongoDB with Mongoose
_ **LLM API**: Gemini API
- **Authentication**: JSON Web Tokens (JWT)
- **Deployment**:
  - Frontend: [Vercel](https://vercel.com)
  - Backend: [Render](https://render.com) 

---

##  Getting Started

Follow the instructions below to set up and run Quizmaster locally on your machine.

###  Prerequisites

- Node.js and npm
- MongoDB account or local MongoDB instance
- Cloudinary account
- Google AI for Developers account
- Git

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/vin06eet/quizmaster_v3.git
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add the following variables:

```env
PORT=<port of your choice>
MONGODB_URI=<mongoDB cluster URI>
JWT_KEY=<a secret key of your choice>
JWT_EXPIRES_IN=<expiry time for jwt token, in seconds>
CLOUDINARY_NAME=<refer cloudinary docs>
CLOUDINARY_API_KEY=<refer cloudinary docs>
CLOUDINARY_SECRET_KEY=<refer cloudinary docs>
GEMINI_API_KEY=<refer gemini api docs>
FRONTEND_URL=<localhost url> 
```

Then, start the backend server:

```bash
npm run dev
```

---

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```
Create a `.env` file inside the `frontend` folder and add the following variables:

```env
VITE_BACKEND_URL=<backend url>
```

Then, start the frontend:

```bash
npm run dev
```

---

## 📁 Project Structure

```
quizmaster/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── main.jsx
│   └── ...
```

---

##  Future Improvements

- Add leaderboard functionality
- Quiz categories and filters
- Admin analytics dashboard
- Google/GitHub OAuth login

---
