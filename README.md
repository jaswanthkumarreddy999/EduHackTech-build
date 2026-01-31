# EduHack Tech 🚀

**Unified Learning, Competition & Innovation Platform**

EduHack Tech is a comprehensive ecosystem designed to bridge the gap between learning and competing. It offers a "Learn-to-Compete" environment where users can enroll in courses, build teams, participate in hackathons, and leverage AI to enhance their skills.

![EduHack Tech Banner](/path/to/banner.png) <!-- Optional: Add a banner image if available -->

## 🌟 Key Features

### 🎓 Learning & Development
-   **Course Management**: Enroll in curated courses and track progress.
-   **Interactive Quizzes**: Test your knowledge with quizzes associated with learning modules.
-   **AI-Powered Assistance**: Leverage Google Gemini AI for personalized learning support and content generation.

### 🏆 Competition Hub (Hackathons)
-   **Event Registration**: Seamlessly register for hackathons and coding challenges.
-   **Team Building**: Create or join teams, manage members, and collaborate effectively.
-   **Problem Statements**: Submit and manage problem statements for hackathons.
-   **Live Updates**: Stay informed with real-time updates on event status.

### 🔔 Smart Notifications
-   **Real-time Alerts**: Get notified about course updates, event registrations, and team activities.
-   **Centralized Hub**: Manage all notifications from a dedicated dashboard.

### 👑 Admin & Management
-   **Dashboard**: Comprehensive admin panel to manage users, events, courses, and challenges.
-   **Analytics**: View platform usage statistics and engagement metrics.

### 🔐 Security & UX
-   **Secure Authentication**: Robust user management using JWT, bcrypt, and secure password policies.
-   **Modern UI**: Fully responsive interface built with React, Vite, and Tailwind CSS.
-   **Dark/Light Mode**: User-preference based theming for a comfortable viewing experience.

---

## 🛠️ Tech Stack

### Frontend (Client)
-   **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Tailwind Merge](https://www.npmjs.com/package/tailwind-merge), [CLSX](https://www.npmjs.com/package/clsx)
-   **State & Routing**: React Router DOM v7, Context API
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Utilities**: JWT Decode

### Backend (Server)
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Authentication**: JSON Web Tokens (JWT), BcryptJS
-   **AI Integration**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
-   **Security**: [Helmet](https://helmetjs.github.io/), [Cors](https://www.npmjs.com/package/cors)
-   **Logging**: [Morgan](https://www.npmjs.com/package/morgan)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
-   **Node.js** (v18 or higher recommended)
-   **npm** or **yarn**
-   **MongoDB** (Local instance or MongoDB Atlas Connection String)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/jaswanthkumarreddy999/EduHackTech.git
cd EduHackTech
```

#### 2. Server Setup (Backend)
Navigate to the server directory and install dependencies.

```bash
cd server
npm install
```

**Configuration**: Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eduhacktech?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# AI Service (Google Gemini)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```
> The server will start on `http://localhost:5000` (or your defined PORT).

#### 3. Client Setup (Frontend)
Open a new terminal, navigate to the client directory, and install dependencies.

```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```
> The application will run on `http://localhost:5173` by default.

---

## 📂 Project Structure

### Server (`/server`)
-   `modules/`: Contains business logic separated by domain.
    -   `auth/`: User authentication and authorization.
    -   `learning/`: Courses, quizzes, and enrollments.
    -   `competition/`: Hackathons, challenges, and teams.
    -   `admin/`: Administrative functionalities.
    -   `ai/`: AI service integration.
    -   `notification/`: Notification system.
-   `config/`: Database and other configurations.
-   `middlewares/`: Global middlewares (Auth, Error handling).

### Client (`/client`)
-   `src/modules/`: Feature-based directory structure mirroring the backend.
    -   `auth/`: Login, Register, Profile pages.
    -   `learning/`: Course catalog, video player, quizzes.
    -   `competition/`: Event listings, team registration.
    -   `admin/`: Admin dashboard and management tools.
-   `src/components/`: Shared UI components (Navbar, Footer, Cards).
-   `src/context/`: Global state providers (AuthContext, ThemeContext).

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📞 Support

If you have any questions or run into issues, please open an issue in the repository.

---

Made with ❤️ by the EduHack Tech Team