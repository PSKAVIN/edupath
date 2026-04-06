import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState as useFirebaseAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebase";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CourseView from "./pages/CourseView";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

function App() {
  const [firebaseUser, loading] = useFirebaseAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={!firebaseUser ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="dashboard" element={firebaseUser ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="course/:courseId" element={firebaseUser ? <CourseView /> : <Navigate to="/login" />} />
          <Route path="profile" element={firebaseUser ? <Profile /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
