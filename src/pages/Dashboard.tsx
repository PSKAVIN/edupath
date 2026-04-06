import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Play, TrendingUp, Clock, CheckCircle, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_PROGRESS_DATA = [
  { name: "Mon", score: 65 },
  { name: "Tue", score: 72 },
  { name: "Wed", score: 68 },
  { name: "Thu", score: 85 },
  { name: "Fri", score: 82 },
  { name: "Sat", score: 90 },
  { name: "Sun", score: 88 },
];

// Mock data for initial state
const MOCK_COURSES = [
  {
    id: "course-1",
    title: "Introduction to Machine Learning",
    description: "Master the fundamentals of ML and build your first predictive models.",
    progress: 45,
    lastAccessed: "2 hours ago",
    category: "Data Science",
    image: "https://picsum.photos/seed/ml/800/400",
    isEnrolled: false
  },
  {
    id: "course-2",
    title: "Advanced React Patterns",
    description: "Deep dive into hooks, composition, and performance optimization.",
    progress: 12,
    lastAccessed: "Yesterday",
    category: "Web Development",
    image: "https://picsum.photos/seed/react/800/400",
    isEnrolled: false
  }
];

const MOCK_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "Review: Gradient Descent",
    reason: "Based on your recent quiz score in Module 3, a quick review will help solidify your understanding.",
    type: "Review"
  },
  {
    id: "rec-2",
    title: "Next: Neural Networks Basics",
    reason: "You've mastered the linear regression module. Ready to move to the next level!",
    type: "Next Step"
  }
];

const MOCK_LEARNING_PATH = [
  {
    id: "lp-1",
    courseId: "course-1",
    title: "Foundations of Data Science",
    status: "completed",
    duration: "45 mins",
    videoUrl: "https://www.youtube.com/embed/HcqpanDadyQ"
  },
  {
    id: "lp-2",
    courseId: "course-2",
    title: "Advanced React: Custom Hooks",
    status: "in-progress",
    duration: "60 mins",
    videoUrl: "https://www.youtube.com/embed/6ThXaZ3W36A"
  },
  {
    id: "lp-3",
    courseId: "course-1",
    title: "Introduction to Neural Networks",
    status: "upcoming",
    duration: "90 mins",
    videoUrl: "https://www.youtube.com/embed/aircAruvnKk"
  },
  {
    id: "lp-4",
    courseId: "course-2",
    title: "React Performance Optimization",
    status: "upcoming",
    duration: "120 mins",
    videoUrl: "https://www.youtube.com/embed/7YhdqirKgK8"
  }
];

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [courses, setCourses] = useState<any[]>(MOCK_COURSES);
  const [recommendations, setRecommendations] = useState<any[]>(MOCK_RECOMMENDATIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const enrolledCourseIds = querySnapshot.docs.map(doc => doc.data().courseId);
        
        // Update MOCK_COURSES with real enrollment and completion status
        const assessmentsQ = query(
          collection(db, "assessments"),
          where("userId", "==", user.uid)
        );
        const assessmentsSnapshot = await getDocs(assessmentsQ);
        const completedCourseModuleMap: Record<string, Set<string>> = {};
        assessmentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (!completedCourseModuleMap[data.courseId]) {
            completedCourseModuleMap[data.courseId] = new Set();
          }
          completedCourseModuleMap[data.courseId].add(data.moduleId);
        });

        const updatedCourses = MOCK_COURSES.map(course => {
          const isEnrolled = enrolledCourseIds.includes(course.id);
          const completedModules = completedCourseModuleMap[course.id] || new Set();
          // This is a bit simplified as we don't have the full module list for all courses here
          // But we can assume if they have assessments for some modules, we show progress
          // For completion, we'd need the actual module count. 
          // Let's use a fixed count for mock courses or just check if they have at least 2 modules (since our mock courses have 2)
          const isComplete = completedModules.size >= 2; 

          return {
            ...course,
            isEnrolled,
            isComplete,
            progress: isComplete ? 100 : (completedModules.size / 2) * 100
          };
        });
        setCourses(updatedCourses);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          <p className="text-slate-500 mt-1">You've completed 12 modules this week. Keep it up!</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-slate-700">Level 12</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-700">450 XP</span>
          </div>
        </div>
      </header>

      {/* AI Recommendations & Progress Graph */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-blue-200" />
              <h2 className="text-lg font-bold text-blue-100 uppercase tracking-wider">AI Personalized Path</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {recommendations.map((rec) => (
                <motion.div 
                  key={rec.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
                      {rec.type}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{rec.title}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed mb-4">{rec.reason}</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold hover:text-blue-200 transition-colors">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Learning Activity</h2>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PROGRESS_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#2563eb", fontWeight: "bold" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Weekly Performance</p>
          </div>
        </section>
      </div>

      {/* My Learning Path Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">My Learning Path</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-blue-600" />
            AI Generated
          </div>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

          <div className="space-y-6">
            {MOCK_LEARNING_PATH.filter(step => courses.find(c => c.id === step.courseId)?.isEnrolled).map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col md:flex-row gap-6 items-start group"
              >
                {/* Timeline Dot */}
                <div className={`hidden md:flex absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 transition-colors duration-300 ${
                  step.status === 'completed' ? 'bg-green-500' : 
                  step.status === 'in-progress' ? 'bg-blue-600 animate-pulse' : 'bg-slate-200'
                }`}></div>

                <div className={`flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md md:ml-16 w-full ${
                  step.status === 'in-progress' ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                }`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          step.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {step.status.replace('-', ' ')}
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{step.duration}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    </div>

                    {step.videoUrl && (
                      <div className="flex-shrink-0 w-full lg:w-48 aspect-video rounded-xl overflow-hidden relative group/video border border-slate-100">
                        <iframe
                          width="100%"
                          height="100%"
                          src={step.videoUrl}
                          title={step.title}
                          className="pointer-events-none opacity-80 group-hover/video:opacity-100 transition-opacity"
                        ></iframe>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover/video:bg-black/0 transition-all">
                          <div className="bg-white/90 p-2 rounded-full shadow-lg">
                            <Play className="w-4 h-4 text-blue-600 fill-current" />
                          </div>
                        </div>
                        <a 
                          href={step.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-20"
                        ></a>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {step.status === 'in-progress' ? (
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                          Continue
                        </button>
                      ) : step.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Done</span>
                        </div>
                      ) : (
                        <button className="text-slate-400 hover:text-blue-600 font-bold text-sm transition-colors">
                          Preview
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Your Courses</h2>
          <Link to="/courses" className="text-blue-600 text-sm font-bold hover:underline">View All</Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-6">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  {course.isComplete && (
                    <span className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Complete
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      className="bg-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{course.lastAccessed}</span>
                  </div>
                  <Link 
                    to={`/course/${course.id}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                      course.isComplete
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100"
                        : course.isEnrolled 
                          ? "bg-slate-900 text-white hover:bg-blue-600" 
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                    }`}
                  >
                    {course.isComplete ? (
                      <>
                        <Trophy className="w-4 h-4" />
                        Completed
                      </>
                    ) : course.isEnrolled ? (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Enroll
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats & Progress */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-100 p-3 rounded-2xl text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">24</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Modules Completed</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            You're in the <span className="font-bold text-green-600">top 5%</span> of learners this month.
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">18.5h</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Learning Time</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Average of <span className="font-bold text-blue-600">2.6 hours</span> per day.
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">88%</div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg. Quiz Score</div>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Your score has increased by <span className="font-bold text-amber-600">12%</span> since last week.
          </div>
        </div>
      </section>
    </div>
  );
}
