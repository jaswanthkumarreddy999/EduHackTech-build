import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LandingPage from "./modules/landing/LandingPage";
import Login from "./modules/auth/pages/Login";
import Learning from "./modules/learning/learning";
import CoursePage from "./modules/learning/coursepage";
import CoursePlayer from "./modules/learning/pages/CoursePlayer";
import HackathonList from "./modules/competition/pages/HackathonList";
import OrganizeHackathon from "./modules/competition/pages/OrganizeHackathon";
import HackathonDetail from "./modules/competition/pages/HackathonDetail";
import HackathonRegistration from "./modules/competition/pages/HackathonRegistration";
import EventPayment from "./modules/competition/pages/EventPayment";
import MyEvents from "./modules/competition/pages/MyEvents";
import EventRegistrations from "./modules/competition/pages/EventRegistrations";
import MyRegistrations from "./modules/competition/pages/MyRegistrations";
import PaymentPage from "./modules/learning/pages/PaymentPage";
import MyCourses from "./modules/learning/pages/MyCourses";
import Dashboard from "./modules/learning/pages/Dashboard";
import Profile from "./modules/user/pages/Profile";

import AdminDashboard from "./modules/admin/pages/AdminDashboard";
import ManageCourses from "./modules/admin/pages/ManageCourses";
import ManageEvents from "./modules/admin/pages/ManageEvents";
import CourseEditor from "./modules/admin/pages/CourseEditor";
import ManageUsers from "./modules/admin/pages/ManageUsers";
import ManageChallenges from "./modules/admin/pages/ManageChallenges";
import CreateChallenge from "./modules/competition/pages/CreateChallenge";
import AdminSettings from "./modules/admin/pages/AdminSettings";
import RobotPetDog from "./components/RobotPetDog/RobotPetDog";

// Fallback Components
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import UnderProgress from "./components/common/UnderProgress";
import NotFoundRedirect from "./components/common/NotFoundRedirect";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname.startsWith("/admin");
  const hideFooter =
    location.pathname === "/login" || location.pathname.startsWith("/admin");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
      <RobotPetDog />
    </>
  );
};

function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* HOME */}
                <Route path="/" element={<Learning />} />
                <Route path="/learning" element={<Learning />} />

                {/* AUTH */}
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* COMPETITION */}
                <Route path="/competition" element={<HackathonList />} />
                <Route
                  path="/competition/organize"
                  element={
                    <ProtectedRoute>
                      <OrganizeHackathon />
                    </ProtectedRoute>
                  }
                />
                <Route path="/competition/:id" element={<HackathonDetail />} />
                <Route
                  path="/competition/:id/register"
                  element={
                    <ProtectedRoute>
                      <HackathonRegistration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competition/:id/payment"
                  element={
                    <ProtectedRoute>
                      <EventPayment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/competition/create-challenge"
                  element={
                    <ProtectedRoute>
                      <CreateChallenge />
                    </ProtectedRoute>
                  }
                />

                {/* ORGANIZER DASHBOARD */}
                <Route
                  path="/my-events"
                  element={
                    <ProtectedRoute>
                      <MyEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-events/:id/registrations"
                  element={
                    <ProtectedRoute>
                      <EventRegistrations />
                    </ProtectedRoute>
                  }
                />

                {/* LANDING */}
                <Route path="/landing" element={<LandingPage />} />

                {/* LEARNING FLOW */}
                <Route path="/course/:id" element={<CoursePage />} />
                <Route path="/course/:id/learn" element={<CoursePlayer />} />
                <Route path="/payment/:id" element={<PaymentPage />} />
                <Route
                  path="/my-courses"
                  element={
                    <ProtectedRoute>
                      <MyCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-registrations"
                  element={
                    <ProtectedRoute>
                      <MyRegistrations />
                    </ProtectedRoute>
                  }
                />

                {/* ========== ADMIN ROUTES ========== */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageCourses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/:id/editor"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <CourseEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/challenges"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageChallenges />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />

                {/* UNDER PROGRESS ROUTES */}
                <Route path="/under-progress" element={<UnderProgress />} />

                {/* 404 CATCH-ALL REDIRECT */}
                <Route path="*" element={<NotFoundRedirect />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
