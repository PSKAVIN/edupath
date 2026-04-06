import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Brain, Target, Zap, ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-100"
        >
          <Zap className="w-4 h-4" />
          <span>The Future of Personalized Learning</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight"
        >
          Master Any Subject with <br />
          <span className="text-blue-600">AI-Powered Paths</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          EduPath AI analyzes your performance in real-time to create a learning journey 
          that adapts to your strengths, weaknesses, and goals.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
        >
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            Start Learning Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Explore Courses
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: Brain,
            title: "Adaptive AI",
            description: "Our AI engine analyzes your quiz results and engagement to suggest the most effective next steps.",
            color: "bg-purple-100 text-purple-600"
          },
          {
            icon: Target,
            title: "Goal Oriented",
            description: "Set your learning objectives and let the platform guide you through the most direct path to mastery.",
            color: "bg-blue-100 text-blue-600"
          },
          {
            icon: Zap,
            title: "Real-time Feedback",
            description: "Get instant, AI-generated feedback on your assessments to understand exactly where you can improve.",
            color: "bg-amber-100 text-amber-600"
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-blue-400">95%</div>
            <div className="text-slate-400 font-medium">Completion Rate</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-purple-400">2x</div>
            <div className="text-slate-400 font-medium">Faster Learning</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-amber-400">10k+</div>
            <div className="text-slate-400 font-medium">Active Learners</div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="text-center space-y-12">
        <h2 className="text-3xl font-bold text-slate-900">Trusted by Educators Worldwide</h2>
        <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
          <div className="flex items-center gap-2 font-bold text-2xl"><GraduationCap className="w-8 h-8" /> EduGlobal</div>
          <div className="flex items-center gap-2 font-bold text-2xl"><BookOpen className="w-8 h-8" /> LearnHub</div>
          <div className="flex items-center gap-2 font-bold text-2xl"><Users className="w-8 h-8" /> SkillUp</div>
        </div>
      </section>
    </div>
  );
}
