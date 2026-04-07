# Project Report: Campus Suggestion Box

## 1. Executive Summary
The **Campus Suggestion Box** is a multi-platform application designed to streamline student feedback and administration management within educational institutions. The application allows students to report issues or give suggestions securely, while administrators can continuously monitor, approve, or reject suggestions via a dedicated portal.

The project is developed using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) supported by a **React Native / Expo** mobile environment to provide cross-platform capabilities.

---

## 2. Architecture & Tech Stack
The system is comprised of three primary components:

### 2.1. Backend API (Node.js & Express)
- **Environment:** Node.js with Express.js routing.
- **Database:** MongoDB Atlas managed via Mongoose Object Data Modeling (ODM).
- **Authentication:** Google OAuth 2.0 integration alongside standard JWT (JSON Web Token) handling.
- **Media Storage:** Integrated with Cloudinary via Multer for persistent, secure image and media uploads.
- **Deployment Setup:** Contains serverless configuration via `vercel.json`.

### 2.2. Web Frontend (React & Vite)
- **Framework:** React.js scaffolded and bundled using Vite.
- **Routing:** Handled securely via `react-router-dom` utilizing standard and protected route patterns.
- **Styling Framework:** Tailwind CSS for responsive UI.
- **Pages:** Distinct views for Students and Admins.

### 2.3. Mobile Application (React Native / Expo)
- **Framework:** React Native managed via Expo.
- **Navigation:** Native-Stack and Bottom-Tabs from `@react-navigation`.
- **Features Highlights:** Expo Image Picker for file inputs and persistent login states using AsyncStorage.

---

## 3. Data Models
MongoDB consists of the following core schemas:

| Model Name | Purpose | Key Attributes |
| :--- | :--- | :--- |
| **User** | Stores personnel credentials and operational roles. | Name, Email, Role (Student/Admin), GoogleID |
| **Suggestion** | The primary transactional data outlining feedback. | Title, Category, Description, Image URL, Status, Author |

---

## 4. Current System Capabilities
- **Google Single Sign-On (SSO):** Secure authentication for both Students and Admins.
- **Cloud Media Integrity:** Direct image uploads to Cloudinary.
- **Responsive Design:** Seamless experience across Web and Mobile.
- **CORS & Security:** Enforced strict security headers (COOP/COEP).

---

## 5. Repository Map
- `/frontend` - React Vite UI Implementation.
- `/backend` - Core Express Application and Mongoose Schemas.
- `/mobile` - React Native Expo Application.

---
**Report generated automatically from the master repository.**
**Date:** April 2026
**Version:** 1.0.0
