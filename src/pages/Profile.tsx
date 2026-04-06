import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { motion } from "motion/react";
import { User, Mail, Calendar, Shield, Settings, Bell, CreditCard } from "lucide-react";

export default function Profile() {
  const [user] = useAuthState(auth);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}&background=random`} 
            alt={user?.displayName || 'User'}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white text-white">
            <Settings className="w-4 h-4" />
          </div>
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.displayName || 'Learner'}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined April 2026
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-blue-500" />
              Student Account
            </div>
          </div>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            Account Settings
          </h2>
          
          <div className="space-y-4">
            {[
              { icon: User, label: "Personal Information", desc: "Update your name and photo" },
              { icon: Bell, label: "Notifications", desc: "Manage your email alerts" },
              { icon: CreditCard, label: "Subscription", desc: "Manage your premium plan" }
            ].map((item, i) => (
              <button 
                key={i}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left group"
              >
                <div className="bg-slate-100 p-3 rounded-xl text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            Learning Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-3">Interests</label>
              <div className="flex flex-wrap gap-2">
                {["Machine Learning", "Web Development", "UI Design", "Data Science", "Python"].map((tag, i) => (
                  <span key={i} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold border border-blue-100">
                    {tag}
                  </span>
                ))}
                <button className="bg-slate-100 text-slate-500 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">
                  + Add More
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-3">AI Personalization</label>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-sm font-bold text-blue-800">Adaptive Difficulty</div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
