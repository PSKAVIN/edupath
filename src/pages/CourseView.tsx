import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, AlertCircle, Play, Pause, Volume2, VolumeX, Maximize, FileText, HelpCircle, Loader2, Clock, Lock, Trophy, Award, Download, Share2 } from "lucide-react";
import { generateFeedback } from "../lib/gemini";
import YouTube, { YouTubeProps } from "react-youtube";
import confetti from "canvas-confetti";

// Mock course data
const MOCK_COURSES_DATA: Record<string, any> = {
  "course-1": {
    id: "course-1",
    title: "Introduction to Machine Learning",
    modules: [
      {
        id: "mod-1",
        title: "What is Machine Learning?",
        content: `
# What is Machine Learning?

Machine Learning (ML) is a subfield of artificial intelligence (AI) that focuses on building systems that can learn from and make decisions based on data.

## Key Concepts

- **Supervised Learning**: Training a model on labeled data.
- **Unsupervised Learning**: Finding patterns in unlabeled data.
- **Reinforcement Learning**: Learning through trial and error.

### Why ML Matters?
ML powers everything from search engines to self-driving cars.
        `,
        videoUrl: "https://www.youtube.com/embed/HcqpanDadyQ",
        quiz: [
          { question: "What is supervised learning?", options: ["Learning from labeled data", "Learning from unlabeled data", "Learning through trial and error"], answer: 0 },
          { question: "Which is NOT a type of ML?", options: ["Supervised", "Unsupervised", "Deterministic", "Reinforcement"], answer: 2 }
        ]
      },
      {
        id: "mod-2",
        title: "Linear Regression",
        content: `
# Linear Regression

Linear regression is one of the simplest and most common algorithms in machine learning. It models the relationship between a dependent variable and one or more independent variables.

## The Equation
The basic equation is: **y = mx + b**

- **y**: Dependent variable (target)
- **x**: Independent variable (feature)
- **m**: Slope (weight)
- **b**: Intercept (bias)
        `,
        videoUrl: "https://www.youtube.com/embed/7ArmBVF2dCs",
        quiz: [
          { question: "In y = mx + b, what does 'm' represent?", options: ["Intercept", "Bias", "Slope", "Target"], answer: 2 }
        ]
      },
      {
        id: "mod-3",
        title: "Neural Networks",
        content: `
# Neural Networks

Neural networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns. They interpret sensory data through a kind of machine perception, labeling or clustering raw input.

## Structure
- **Input Layer**: Receives the data.
- **Hidden Layers**: Process the data.
- **Output Layer**: Provides the final result.
        `,
        videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
        quiz: [
          { question: "What layer receives the data in a neural network?", options: ["Hidden Layer", "Output Layer", "Input Layer"], answer: 2 }
        ]
      }
    ]
  },
  "course-2": {
    id: "course-2",
    title: "Advanced React Patterns",
    modules: [
      {
        id: "react-mod-1",
        title: "Custom Hooks & Logic Reuse",
        content: `
# Custom Hooks

Custom hooks are a powerful way to reuse stateful logic between components. They follow the naming convention \`useSomething\`.

## Why use Custom Hooks?
- **DRY (Don't Repeat Yourself)**: Avoid duplicating logic.
- **Abstraction**: Hide complex logic behind a simple interface.
- **Testing**: Easier to test logic in isolation.
        `,
        videoUrl: "https://www.youtube.com/embed/6ThXaZ3W36A",
        quiz: [
          { question: "What is the naming convention for custom hooks?", options: ["handleSomething", "useSomething", "getSomething"], answer: 1 }
        ]
      },
      {
        id: "react-mod-2",
        title: "Compound Components",
        content: `
# Compound Components

Compound components is a pattern where components are used together such that they share an implicit state. Think of \`<select>\` and \`<option>\`.

## Implementation
Usually implemented using \`React.Context\` to share state between the parent and its children.
        `,
        videoUrl: "https://www.youtube.com/embed/hEGgHqz26t0",
        quiz: [
          { question: "Which API is commonly used for Compound Components?", options: ["useState", "useReducer", "Context API"], answer: 2 }
        ]
      },
      {
        id: "react-mod-3",
        title: "Render Props Pattern",
        content: `
# Render Props

The term “render prop” refers to a technique for sharing code between React components using a prop whose value is a function.

## Usage
A component with a render prop takes a function that returns a React element and calls it instead of implementing its own render logic.
        `,
        videoUrl: "https://www.youtube.com/embed/3Id7S2Z6u6A",
        quiz: [
          { question: "What is a render prop?", options: ["A prop that is a string", "A prop that is a function returning JSX", "A prop that is a boolean"], answer: 1 }
        ]
      },
      {
        id: "react-mod-4",
        title: "Performance Optimization",
        content: `
# React Performance

Learn how to optimize your React applications using \`React.memo\`, \`useMemo\`, and \`useCallback\`.

## Key Tools
- **React.memo**: For component memoization.
- **useMemo**: For value memoization.
- **useCallback**: For function memoization.
        `,
        videoUrl: "https://www.youtube.com/embed/7YhdqirKgK8",
        quiz: [
          { question: "Which hook is used to memoize a function?", options: ["useMemo", "useCallback", "useRef"], answer: 1 }
        ]
      }
    ]
  }
};

export default function CourseView() {
  const { courseId } = useParams();
  const [user] = useAuthState(auth);
  const [course, setCourse] = useState<any>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCourseComplete, setIsCourseComplete] = useState(false);

  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // Video controls state
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressInterval = useRef<any>(null);

  useEffect(() => {
    if (courseId && MOCK_COURSES_DATA[courseId]) {
      setCourse(MOCK_COURSES_DATA[courseId]);
    }
  }, [courseId]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!courseId) return;
      
      if (!user) {
        setIsEnrolled(false);
        return;
      }
      
      try {
        const q = query(
          collection(db, "enrollments"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId)
        );
        const querySnapshot = await getDocs(q);
        setIsEnrolled(!querySnapshot.empty);

        // Also check if course is already complete
        const assessmentsQ = query(
          collection(db, "assessments"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId)
        );
        const assessmentsSnapshot = await getDocs(assessmentsQ);
        const completedModuleIds = new Set(assessmentsSnapshot.docs.map(doc => doc.data().moduleId));
        
        if (course && course.modules.every((mod: any) => completedModuleIds.has(mod.id))) {
          setIsCourseComplete(true);
        }
      } catch (error) {
        console.error("Enrollment check error:", error);
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [user, courseId, course]);

  const handleEnroll = async () => {
    if (!user || !courseId) return;
    setEnrolling(true);
    try {
      await addDoc(collection(db, "enrollments"), {
        userId: user.uid,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0
      });
      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setEnrolling(false);
    }
  };

  // Video control handlers
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === YouTube.PlayerState.PLAYING);
    if (event.data === YouTube.PlayerState.PLAYING) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(event.target.getCurrentTime());
      }, 1000);
    } else {
      clearInterval(progressInterval.current);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    const time = parseFloat(e.target.value);
    player.seekTo(time);
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    const v = parseInt(e.target.value);
    player.setVolume(v);
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      player.setVolume(volume || 50);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Not Found</h2>
          <Link to="/dashboard" className="text-blue-600 font-bold hover:underline">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (isEnrolled === false) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={`https://picsum.photos/seed/${courseId}/1200/600`} 
              alt={course.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-10">
              <h1 className="text-4xl font-black text-white tracking-tight">{course.title}</h1>
            </div>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="flex flex-wrap gap-6 text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>{course.modules.length} Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>AI Personalized Path</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Certificate of Completion</span>
              </div>
            </div>

            <p className="text-lg text-slate-600 leading-relaxed">
              This comprehensive course will guide you through the core concepts and advanced techniques of {course.title}. 
              Enroll now to unlock all modules, interactive quizzes, and personalized AI feedback.
            </p>

            <div className="pt-6">
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full sm:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {enrolling ? <Loader2 className="w-6 h-6 animate-spin" /> : <Lock className="w-6 h-6" />}
                Enroll in Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEnrolled === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];

  const handleQuizSubmit = async () => {
    let score = 0;
    currentModule.quiz.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.answer) score++;
    });

    const percentage = (score / currentModule.quiz.length) * 100;
    setQuizResult({ score, total: currentModule.quiz.length, percentage });

    // Generate AI Feedback
    setLoadingFeedback(true);
    try {
      const feedback = await generateFeedback(
        { score, total: currentModule.quiz.length, answers: quizAnswers },
        currentModule
      );
      setAiFeedback(feedback);
    } catch (err) {
      console.error("AI Feedback failed:", err);
    } finally {
      setLoadingFeedback(false);
    }

    // Save assessment to Firestore
    if (user) {
      try {
        await addDoc(collection(db, "assessments"), {
          userId: user.uid,
          courseId,
          moduleId: currentModule.id,
          score: percentage,
          timestamp: serverTimestamp()
        });

        // Check if this was the last module
        if (currentModuleIndex === course.modules.length - 1 && percentage >= 70) {
          // Check if all other modules are also done
          const assessmentsQ = query(
            collection(db, "assessments"),
            where("userId", "==", user.uid),
            where("courseId", "==", courseId)
          );
          const assessmentsSnapshot = await getDocs(assessmentsQ);
          const completedModuleIds = new Set(assessmentsSnapshot.docs.map(doc => doc.data().moduleId));
          completedModuleIds.add(currentModule.id); // Add current one

          if (course.modules.every((mod: any) => completedModuleIds.has(mod.id))) {
            setShowCelebration(true);
            setIsCourseComplete(true);
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#2563eb', '#3b82f6', '#60a5fa', '#fbbf24']
            });
          }
        }
      } catch (err) {
        console.error("Failed to save assessment:", err);
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Sidebar - Module List */}
      <aside className="lg:col-span-1 space-y-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 space-y-4">
            <h2 className="font-bold text-slate-900 line-clamp-2">{course.title}</h2>
            {isCourseComplete && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  Course Completed
                </div>
                <button 
                  onClick={() => setShowCelebration(true)}
                  className="flex items-center justify-center gap-2 bg-amber-100 text-amber-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  View Certificate
                </button>
              </div>
            )}
          </div>
          <div className="p-2">
            {course.modules.map((mod: any, i: number) => (
              <button
                key={mod.id}
                onClick={() => {
                  setCurrentModuleIndex(i);
                  setShowQuiz(false);
                  setQuizResult(null);
                  setAiFeedback("");
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                  currentModuleIndex === i 
                    ? "bg-blue-50 text-blue-700 font-bold" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  currentModuleIndex === i ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm">{mod.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-3 space-y-8">
        <AnimatePresence mode="wait">
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>
                
                <div className="p-10 text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 text-amber-600 mb-4 relative">
                    <Trophy className="w-12 h-12" />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg"
                    >
                      <Award className="w-4 h-4" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Congratulations!</h2>
                    <p className="text-xl text-slate-500 font-medium">You've successfully completed</p>
                    <h3 className="text-2xl font-bold text-blue-600">{course.title}</h3>
                  </div>

                  <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
                    You've mastered all modules and demonstrated exceptional understanding of the subject matter. Your dedication to learning is truly inspiring!
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-6">
                    <button
                      onClick={() => {
                        // In a real app, this would trigger a PDF generation
                        window.print();
                      }}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      <Download className="w-5 h-5" />
                      Get Certificate
                    </button>
                    <button
                      onClick={() => setShowCelebration(false)}
                      className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Back to Course
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2 text-sm font-bold">
                      <Share2 className="w-4 h-4" />
                      Share Achievement
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {!showQuiz ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 md:p-12">
                {currentModule.videoUrl && (
                  <div className="mb-8 space-y-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black group">
                      <div className="w-full h-full">
                        <YouTube
                          videoId={currentModule.videoUrl.split('/').pop()}
                          onReady={onPlayerReady}
                          onStateChange={onPlayerStateChange}
                          opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                              controls: 0,
                              modestbranding: 1,
                              rel: 0,
                              showinfo: 0,
                            },
                          }}
                          className="w-full h-full"
                        />
                      </div>
                      
                      {/* Custom Controls Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div className="flex items-center gap-3">
                            <span className="text-white text-xs font-bold w-10">{formatTime(currentTime)}</span>
                            <input
                              type="range"
                              min="0"
                              max={duration}
                              value={currentTime}
                              onChange={handleSeek}
                              className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-white text-xs font-bold w-10">{formatTime(duration)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                              </button>
                              
                              <div className="flex items-center gap-2 group/volume">
                                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={isMuted ? 0 : volume}
                                  onChange={handleVolumeChange}
                                  className="w-0 group-hover/volume:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-blue-500 transition-all overflow-hidden"
                                />
                              </div>
                            </div>

                            <button className="text-white hover:text-blue-400 transition-colors">
                              <Maximize className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{currentModule.content}</ReactMarkdown>
                </div>
                
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                  <button 
                    disabled={currentModuleIndex === 0}
                    onClick={() => setCurrentModuleIndex(prev => prev - 1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <button 
                    onClick={() => setShowQuiz(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                  >
                    Take Assessment
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Module Assessment</h2>
                  <button 
                    onClick={() => setShowQuiz(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                {!quizResult ? (
                  <div className="space-y-8">
                    {currentModule.quiz.map((q: any, i: number) => (
                      <div key={i} className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800">{i + 1}. {q.question}</h3>
                        <div className="grid gap-3">
                          {q.options.map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                const newAnswers = [...quizAnswers];
                                newAnswers[i] = optIdx;
                                setQuizAnswers(newAnswers);
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all ${
                                quizAnswers[i] === optIdx 
                                  ? "bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-sm" 
                                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleQuizSubmit}
                      disabled={quizAnswers.length < currentModule.quiz.length}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                    >
                      Submit Answers
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">
                        {quizResult.score} / {quizResult.total}
                      </h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Your Score</p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-left space-y-4">
                      <div className="flex items-center gap-2 text-blue-600 font-bold">
                        <Sparkles className="w-5 h-5" />
                        AI Feedback
                      </div>
                      {loadingFeedback ? (
                        <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                          <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                          <span>AI is analyzing your performance...</span>
                        </div>
                      ) : (
                        <div className="prose prose-blue text-slate-600 leading-relaxed">
                          <ReactMarkdown>{aiFeedback}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setQuizResult(null);
                          setQuizAnswers([]);
                          setAiFeedback("");
                        }}
                        className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                      >
                        Retry Quiz
                      </button>
                      <button
                        onClick={() => {
                          if (currentModuleIndex < course.modules.length - 1) {
                            setCurrentModuleIndex(prev => prev + 1);
                            setShowQuiz(false);
                            setQuizResult(null);
                            setAiFeedback("");
                          } else if (isCourseComplete) {
                            setShowCelebration(true);
                          }
                        }}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                      >
                        {currentModuleIndex === course.modules.length - 1 ? "Finish Course" : "Next Module"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
