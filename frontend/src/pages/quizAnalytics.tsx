import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { 
  Trophy, ChevronRight, Clock, Home, BarChart2, PieChartIcon, 
  CalendarDays, BrainCircuit, Target, Calendar, Activity
} from "lucide-react";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

interface Question {
  questionNumber: number;
  question: string;
  options: string[];
  answer: string;
  markedOption: string;
  isCorrect: boolean;
  marks: number;
  score: number;
}

interface QuizAttempt {
  _id: string;
  title: string;
  maxMarks: number;
  description: string;
  totalMarks: number;
  timeTaken: number;
  isCompleted: boolean;
  createdAt: string;
  questions: Question[];
}

const QuizAttemptsAnalytics: React.FC = () => {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRangeFilter, setTimeRangeFilter] = useState<"week" | "month" | "year" | "all">("month");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/getallattempts`, {
          withCredentials: true,
        });
        // Sort attempts by date
        const sortedAttempts = response.data.sort((a: QuizAttempt, b: QuizAttempt) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAttempts(sortedAttempts);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch quiz attempts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  // Filter attempts based on selected time range
  const getFilteredAttempts = () => {
    if (timeRangeFilter === "all") return attempts;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRangeFilter === "week") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRangeFilter === "month") {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeRangeFilter === "year") {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    return attempts.filter(attempt => new Date(attempt.createdAt) >= cutoffDate);
  };

  const filteredAttempts = getFilteredAttempts();

  // Calculate overall statistics
  const calculateOverallStats = () => {
    if (filteredAttempts.length === 0) return null;
    
    const totalQuizzes = filteredAttempts.length;
    const completedQuizzes = filteredAttempts.filter(a => a.isCompleted).length;
    
    // Calculate total questions answered
    const totalQuestionsAnswered = filteredAttempts.reduce(
      (sum, attempt) => sum + attempt.questions.length, 0
    );
    
    // Calculate correct answers
    const totalCorrectAnswers = filteredAttempts.reduce(
      (sum, attempt) => sum + attempt.questions.filter(q => q.isCorrect).length, 0
    );

    const totalScore = filteredAttempts.reduce(
        (sum, attempt) => {
          const attemptScore = attempt.questions.reduce((qSum, q) => qSum + q.marks, 0);
          return sum + attemptScore;
        }, 0
      );

    // Calculate average score
    const averageScore = filteredAttempts.reduce(
      (sum, attempt) => {
        const attemptScore = attempt.questions.reduce((qSum, q) => qSum + q.score, 0) / attempt.maxMarks * 100;
        return sum + attemptScore;
      }, 0
    ) / totalQuizzes;
    
    // Calculate average time per question
    const averageTimePerQuestion = filteredAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeTaken / attempt.questions.length), 0
    ) / totalQuizzes;
    
    return {
      totalQuizzes,
      completedQuizzes,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      correctPercentage: (totalCorrectAnswers / totalQuestionsAnswered * 100).toFixed(1),
      averageScore: averageScore.toFixed(1),
      averageTimePerQuestion: averageTimePerQuestion.toFixed(1)
    };
  };

  // Prepare data for topic performance chart
  const getTopicPerformanceData = () => {
    if (filteredAttempts.length === 0) return [];
    
    // Group attempts by quiz title/topics
    const topicMap = new Map<string, { correct: number, total: number }>();
    
    filteredAttempts.forEach(attempt => {
      const topic = attempt.title;
      const correctCount = attempt.questions.filter(q => q.isCorrect).length;
      const totalQuestions = attempt.questions.length;
      
      if (topicMap.has(topic)) {
        const existing = topicMap.get(topic)!;
        topicMap.set(topic, {
          correct: existing.correct + correctCount,
          total: existing.total + totalQuestions
        });
      } else {
        topicMap.set(topic, { correct: correctCount, total: totalQuestions });
      }
    });
    
    // Convert map to array and calculate percentages
    return Array.from(topicMap.entries())
      .map(([topic, stats]) => ({
        topic: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
        percentage: (stats.correct / stats.total * 100).toFixed(1),
        correct: stats.correct,
        total: stats.total
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  };

  // Prepare data for progress over time chart
  const getProgressOverTimeData = () => {
    if (filteredAttempts.length === 0) return [];
    
    // Create a map of dates and scores
    const dateMap = new Map<string, { score: number, count: number }>();
    
    filteredAttempts.forEach(attempt => {
      const date = new Date(attempt.createdAt);
      let dateKey: string;
      
      if (timeRangeFilter === "week") {
        // For week, use day format
        dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeRangeFilter === "month") {
        // For month, group by week
        const weekNumber = Math.ceil((date.getDate()) / 7);
        dateKey = `Week ${weekNumber}`;
      } else {
        // For year and all, group by month
        dateKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      const score = attempt.questions.reduce((sum, q) => sum + q.score, 0) / attempt.totalMarks * 100;
      
      if (dateMap.has(dateKey)) {
        const existing = dateMap.get(dateKey)!;
        dateMap.set(dateKey, {
          score: existing.score + score,
          count: existing.count + 1
        });
      } else {
        dateMap.set(dateKey, { score: score, count: 1 });
      }
    });
    
    // Calculate average scores for each date period
    const result = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        score: (data.score / data.count).toFixed(1)
      }));
    
    // Sort by date
    if (timeRangeFilter === "week") {
      // Sort by day for week view
      return result.sort((a, b) => {
        const dateA = new Date(a.date + ", 2025");
        const dateB = new Date(b.date + ", 2025");
        return dateA.getTime() - dateB.getTime();
      });
    } else if (timeRangeFilter === "month") {
      // Sort by week number
      return result.sort((a, b) => {
        const weekA = parseInt(a.date.split(" ")[1]);
        const weekB = parseInt(b.date.split(" ")[1]);
        return weekA - weekB;
      });
    } else {
      // Sort by month for year/all view
      return result.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    }
  };

  // Prepare data for difficulty distribution
  const getDifficultyDistribution = () => {
    if (filteredAttempts.length === 0) return [];
    
    // Let's create a simple difficulty categorization based on score
    const difficultyMap = {
      "Easy": 0,
      "Medium": 0,
      "Hard": 0
    };
    
    filteredAttempts.forEach(attempt => {
      const score = attempt.questions.reduce((sum, q) => sum + q.score, 0) / attempt.totalMarks * 100;
      
      if (score >= 80) {
        difficultyMap["Easy"]++;
      } else if (score >= 50) {
        difficultyMap["Medium"]++;
      } else {
        difficultyMap["Hard"]++;
      }
    });
    
    return [
      { name: "Easy", value: difficultyMap["Easy"], color: "#22c55e" },
      { name: "Medium", value: difficultyMap["Medium"], color: "#f59e0b" },
      { name: "Hard", value: difficultyMap["Hard"], color: "#ef4444" }
    ];
  };

  // Get recent activity data
  const getRecentActivity = () => {
    return filteredAttempts.slice(0, 5).map(attempt => {
      const score = attempt.questions.reduce((sum, q) => sum + q.score, 0);
      const scorePercentage = (score / attempt.maxMarks * 100).toFixed(1);
      
      return {
        id: attempt._id,
        title: attempt.title,
        scorePercentage,
        date: new Date(attempt.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        }),
        correctCount: attempt.questions.filter(q => q.isCorrect).length,
        totalQuestions: attempt.questions.length
      };
    });
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="w-screen min-h-screen text-white bg-[#0A0F1F] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-yellow-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-xl font-medium">Loading quiz analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen text-white bg-[#0A0F1F] flex items-center justify-center">
        <div className="bg-red-900/50 text-red-300 border border-red-700 p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Button 
            onClick={() => navigate("/")} 
            className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen text-white bg-[#0A0F1F]">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
      </div>
      
      {/* Header with home button */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-gray-800/50 bg-[#0A0F1F]/80 backdrop-blur-md shadow-md">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
          </Link>
        </div>
        
        <Link to="/">
          <Button variant="ghost" className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="container mx-auto pt-24 pb-12 px-4">
        <div className="text-center mb-8 animate-on-scroll">
          <h1 className="text-4xl font-bold">
            Quiz <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
          <p className="mt-4 text-gray-300">
            Track your progress and performance across all quizzes
          </p>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                <Activity size={32} className="text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Quiz Attempts Found</h2>
              <p className="text-gray-400 mb-6">You haven't attempted any quizzes yet.</p>
              <Button 
                onClick={() => navigate("/quizzes")} 
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium rounded-full shadow transition-all duration-200"
              >
                Start a Quiz
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Time filter */}
            <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-medium flex items-center">
                  <CalendarDays size={20} className="mr-2 text-yellow-400" />
                  Time Range
                </h2>
                <div className="flex gap-2">
                  {["week", "month", "year", "all"].map((range) => (
                    <Button
                      key={range}
                      onClick={() => setTimeRangeFilter(range as any)}
                      className={`rounded-full px-4 py-1 ${
                        timeRangeFilter === range
                          ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats summary */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Quizzes Completed</div>
                      <div className="text-2xl font-bold">{stats.completedQuizzes} / {stats.totalQuizzes}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                      <Target size={20} className="text-blue-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {((stats.completedQuizzes / stats.totalQuizzes) * 100).toFixed(0)}% completion rate
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Average Score</div>
                      <div className="text-2xl font-bold">{stats.averageScore}%</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                      <Activity size={20} className="text-green-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Based on {stats.totalQuizzes} quiz attempts
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Questions Answered</div>
                      <div className="text-2xl font-bold">{stats.totalQuestionsAnswered}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <BrainCircuit size={20} className="text-purple-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {stats.correctPercentage}% correct answers
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Avg. Time/Question</div>
                      <div className="text-2xl font-bold">{stats.averageTimePerQuestion}s</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
                      <Clock size={20} className="text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Speed rating: {parseFloat(stats.averageTimePerQuestion) < 20 ? "Fast" : parseFloat(stats.averageTimePerQuestion) < 40 ? "Average" : "Careful"}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress over time */}
              <div className="lg:col-span-2 bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Activity size={20} className="mr-2 text-yellow-400" />
                  Performance Trend
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getProgressOverTimeData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.375rem' }}
                        labelStyle={{ color: '#f3f4f6' }}
                        formatter={(value: any) => [`${value}%`, 'Score']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#f59e0b" 
                        fillOpacity={1} 
                        fill="url(#scoreGradient)" 
                        name="Average Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quiz difficulty distribution */}
              <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Target size={20} className="mr-2 text-yellow-400" />
                  Difficulty Distribution
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getDifficultyDistribution()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {getDifficultyDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.375rem' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Topic performance */}
            <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <BarChart2 size={20} className="mr-2 text-yellow-400" />
                Topic Performance
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopicPerformanceData()} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                    <YAxis dataKey="topic" type="category" stroke="#9ca3af" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.375rem' }}
                      labelStyle={{ color: '#f3f4f6' }}
                      formatter={(value: any, name: any, props: any) => {
                        const item = props.payload;
                        return [`${value}% (${item.correct}/${item.total})`, 'Score'];
                      }}
                    />
                    <Bar 
                      dataKey="percentage" 
                      name="Accuracy" 
                      fill="#fbbf24" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-gradient-to-b from-gray-900 to-[#0E1225] border border-gray-800/50 rounded-lg shadow-sm p-5">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Calendar size={20} className="mr-2 text-yellow-400" />
                Recent Activity
              </h2>
              
              {getRecentActivity().length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {getRecentActivity().map((activity) => (
                    <div key={activity.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-400">{activity.date}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            parseFloat(activity.scorePercentage) >= 80 ? "text-green-400" :
                            parseFloat(activity.scorePercentage) >= 50 ? "text-yellow-400" :
                            "text-red-400"
                          }`}>
                            {activity.scorePercentage}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {activity.correctCount}/{activity.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No recent activity in the selected time range
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { QuizAttemptsAnalytics };