# 🧑‍💼 Job Portal - Progressive Web App (PWA)

A full-featured **Job Portal** built as a **Progressive Web App (PWA)** to streamline the job application and recruitment process. This platform enables job seekers to find and apply to relevant opportunities and allows recruiters to post jobs and manage applications—all through a seamless, responsive web interface.

---

## 🚀 Overview

The Job Portal is designed for both **job seekers** and **recruiters**. With secure user authentication, resume parsing, intelligent job recommendations, and automated email notifications, this platform offers a modern hiring experience built on scalable technologies.

---

## ✨ Features

- 🔐 **User Authentication**: Secure sign-up/login using Clerk with JWT-based authorization.
- 📄 **Resume Parsing**: Extracts and evaluates resume content for job matching.
- 📬 **Email Notifications**: Sends status updates, confirmation, and interview alerts.
- 🧠 **Job Recommendation System**: Personalized job suggestions based on user data.
- 💼 **Post Jobs**: Recruiters can post and manage job/internship listings easily.
- 📝 **Apply for Jobs**: Job seekers can apply with a pre-filled profile and resume.
- 📱 **Responsive Design**: Mobile-first UI using Tailwind CSS for a seamless experience.
- 🔄 **PWA Support**: Installable web app with offline access and native-like interface.

---

## 🛠️ Technologies Used

### 🔹 Frontend
- **React.js** – Component-based UI development
- **Tailwind CSS** – Utility-first styling framework
- **Vite** – Lightning-fast bundler and dev environment

### 🔹 Backend & Services
- **Clerk** – Secure user authentication and session management
- **Supabase** – Open-source Firebase alternative for backend and storage
- **Node.js** – Handles server-side logic for custom APIs and parsing
- **PostgreSQL** – Relational database for storing job data and applications
-  **Emailjs** – sending emails to applied candidates

---

## 📦 Installation & Setup

### ✅ Prerequisites
- Node.js & npm
- Supabase project
- Clerk account

### 🔧 1. Clone the Repository

- git clone https://github.com/Sravan-1817/Job-portal-pwa
- cd Job-portal-pwa

### 🔧 2.Set Up Environment Variables: 
Create a .env file in the root directory with:

- VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
- VITE_CLERK_SECRET_KEY=your_clerk_secret_key
- VITE_SUPABASE_URL=https://your-project.supabase.co
- VITE_SUPABASE_ANON_KEY=your_anon_key
- VITE_EMAILJS_SERVICE_ID
- VITE_EMAILJS_TEMPLATE_ID
- VITE_EMAILJS_PUBLIC_KEY
### 🔧 3. Install Dependencies
- npm install
### ▶️ 4. Run the Development Server
- npm run dev
### 🌐 Deployment LINK
 - https://hidred-up-jobportal.netlify.app/
### 🙌 Contributors
- T.Manisha
- K.Surya Prakash

### 📝 License
- This project is licensed under the MIT License.


