import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { BookOpen, User, LogOut, LayoutDashboard } from "lucide-react";
import Chatbot from "./Chatbot";

export default function Layout() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
                <BookOpen className="w-6 h-6" />
                <span>EduPath AI</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link to="/profile" className="text-slate-600 hover:text-blue-600 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-slate-600 hover:text-red-600 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Chatbot />

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} EduPath AI. Empowering learners through personalization.
        </div>
      </footer>
    </div>
  );
}
