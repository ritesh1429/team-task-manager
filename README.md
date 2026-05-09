# Team Task Manager (Full-Stack)

A full-stack web application built for managing teams, projects, and tasks with role-based access control.

## 🚀 Features
- **Authentication**: Secure Signup and Login using JWT and bcrypt.
- **Role-Based Access Control**: Admins can create projects and tasks, assign members, and manage the workspace. Members can view their assigned tasks and update statuses.
- **Project Management**: Create projects, add descriptions, and organize workflows.
- **Task Management**: Create tasks, assign them to team members, set due dates, and track progress (TO DO, IN PROGRESS, DONE).
- **Dashboard**: A unified dashboard providing an overview of projects and tasks.
- **Premium UI/UX**: Developed with Vanilla CSS showcasing a dark-mode premium aesthetic, smooth glassmorphism, gradients, and micro-animations.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), React Router v6, Axios, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens).

## 💻 Local Setup

1. **Clone the repository**:
   ```bash
   git clone <your-github-repo-url>
   cd "Team Task Manager"
   ```

2. **Setup Environment Variables**:
   In the `backend` directory, create a `.env` file based on `.env.example` (or configure the following variables):
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. **Install dependencies and build**:
   The root directory contains scripts to easily install and build both the frontend and backend.
   ```bash
   npm run build
   ```

4. **Run the Application locally**:
   - To run both frontend and backend for development, open two terminals:
     - Terminal 1 (Backend): `cd backend && npm run dev`
     - Terminal 2 (Frontend): `cd frontend && npm run dev`

## 🌐 Railway Deployment

This repository is pre-configured for a seamless deployment on Railway as a single Node.js service (serving both the API and the React static build).

1. **Push to GitHub**:
   Ensure all files are pushed to your GitHub repository.

2. **Deploy on Railway**:
   - Create a new project on [Railway.app](https://railway.app/).
   - Select **Deploy from GitHub repo** and choose your repository.

3. **Configure Environment Variables in Railway**:
   Go to the **Variables** tab of your deployed service and add:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string for JWT signing.
   - `NODE_ENV`: `production`

4. **Build and Start Commands**:
   Railway will automatically detect the root `package.json` and run:
   - **Build Command**: `npm run build` (Installs dependencies and builds the Vite frontend).
   - **Start Command**: `npm start` (Starts the Express backend which serves the API and the static React build).

Your application will be live on the URL provided by Railway!
