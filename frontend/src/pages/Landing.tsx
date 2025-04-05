import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription  } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Upload, Search, List, User, Menu, Book, Trophy, Users, Bell, TrendingUp, Award, BarChart, LogOut } from "lucide-react";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

interface Announcement {
    _id: String,
    sentBy: string,
    message: string,
    read: boolean
}

interface UserInfo {
    username: String,
    email: String,
    quizzesCreated: Array<String>,
    quizzesAttempted: Array<String>,
    profilePicture?: String,
    bio?: String,
    dateJoined?: String,
    totalScore?: Number,
    badges?: Array<String>,
    recentActivity?: Array<{
        type: String,
        quiz: String,
        date: String,
        score?: Number
    }>
}

function Landing() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userID, setUserID] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [userProfile, setUserProfile] = useState<UserInfo>({
        username: "",
        email: "",
        quizzesCreated: [],
        quizzesAttempted: [],
        profilePicture: "",
        bio: "",
        dateJoined: "",
        totalScore: 0,
        badges: [],
        recentActivity: []
    });
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    useEffect(() => {
        const getUserProfile = async () => {
            if (!userID) return;
            
            setIsProfileLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/api/user/${userID}`, { withCredentials: true });
                console.log("User profile data:", response.data);
                setUserProfile(response.data);
            } catch (error) {
                console.error("Error getting user details:", error);
            } finally {
                setIsProfileLoading(false);
            }
        };
        
        if (userID) {
            getUserProfile();
        }
    }, [userID]);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/islogged`, { withCredentials: true });
                setUserID(response.data.userID);
                setIsLoggedIn(response.data.final); 
            } catch (error) {
                console.error("Error checking login status:", error);
            }
        };
        checkLoginStatus();
    }, []);

    useEffect(() => {
        const checkAnnouncements = async () => {
            if (!userID) return; 
            try {
                const response = await axios.get(`${apiUrl}:8080/api/fetch`, {withCredentials: true});
                const newAnnouncements = response.data.announcements ?? [];
                setAnnouncements(newAnnouncements);
                newAnnouncements.map((notif: { sentBy: any; }) => notif.sentBy);
                // findUsername(userID);
            } catch (error) {
                console.error('Error finding announcements', error);
            }
        }
        checkAnnouncements();
        const interval = setInterval(checkAnnouncements, 5000);
        return () => clearInterval(interval);
    }, [userID]);

    // const findUsername = async (userIDs: string[]) => {
    //     const uniqueUserIDs = userIDs.filter((id) => !username[id]);
    //     if (uniqueUserIDs.length === 0) return; 
    //     try {
    //         const response = await axios.post(`http://localhost:8080/api/getUsernames`, { userIDs }, { withCredentials: true });
    //         setUsername((prev) => ({ ...prev, ...response.data })); 
    //     } catch (error) {
    //         console.error("Error fetching usernames:", error);
    //     }
    // };

    const markAsRead = async (announceID: String) => {
        try {
            await axios.patch(`${apiUrl}/api/user/markAsRead/${announceID}`,{}, { withCredentials: true });
            setAnnouncements(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };
    
    const deleteNotification = async (announceID: String) =>{
        try {
            await axios.delete(`${apiUrl}/api/user/delete/notif/${announceID}`, {withCredentials: true})
        } catch (error) {
            console.error("Error deleting the notification")
        }   
    }

    const markAllAsRead = async () => {
        try {
            await axios.patch(`${apiUrl}/api/user/markAllAsRead`,{}, { withCredentials: true });
            setAnnouncements(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };
    
    useEffect(() => {
        const findUsername = async () => {
            try {
                await axios.get(`${apiUrl}/api/quiz/${userID}`, {withCredentials: true});
                // setUsername(response.data.username);
            } catch (error) {
                console.error('Error finding username', error)
            }
        }
        findUsername();
    }, [announcements]);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            
            .animate-fade-in {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('.animate-on-scroll');
            sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top;
                if (sectionTop < window.innerHeight * 0.75) {
                    section.classList.add('animate-fade-in');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogOut = async () => {
        try {
            await axios.post(`${apiUrl}/api/logout`, {}, { withCredentials: true });
            setIsLoggedIn(false);
        } catch (error) {
            console.error({ "Error logging out": error });
        }
    };
    
    return ( 
        <div className="w-screen min-h-screen text-white bg-[#0A0F1F]">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-[#0A0F1F] z-[-1]">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.4),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.4),transparent_30%)]"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            </div>

            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 border-b border-gray-800/50 bg-[#0A0F1F]/80 backdrop-blur-md shadow-md">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
                    </Link>
                </div>
                
                {/* Sidebar Trigger */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden bg-transparent">
                            <Menu className="h-5 w-5 text-gray-200" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#0E1225] border-r border-gray-800/50 w-64">
                        <div className="flex flex-col space-y-6 mt-4">
                            <div className="flex items-center gap-2 px-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <Trophy size={16} className="text-white" />
                                </div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</h2>
                            </div>
                            <Separator className="bg-gray-700/50" />

                            <nav className="flex flex-col space-y-1 px-2">
                                <Link to="/upload">
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                        <Upload size={18} />
                                        <span>Upload</span>
                                    </Button>
                                </Link>
                                <Link to="/browse">
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                        <Search size={18} />
                                        <span>Browse</span>
                                    </Button>
                                </Link>
                                <Link to="/myQuizzes">
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                        <List size={18} />
                                        <span>My Quizzes</span>
                                    </Button>
                                </Link>
                                <Link to="/myAttempts">
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                        <TrendingUp size={18} />
                                        <span>My Attempts</span>
                                    </Button>
                                </Link>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-1">
                    <Link to="/upload">
                        <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 bg-transparent hover:bg-gray-800/50 flex items-center gap-2">
                            <Upload size={16} />
                            <span>Upload</span>
                        </Button>
                    </Link>
                    <Link to="/browse">
                        <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 bg-transparent hover:bg-gray-800/50 flex items-center gap-2">
                            <Search size={16} />
                            <span>Browse</span>
                        </Button>
                    </Link>
                    <Link to="/myQuizzes">
                        <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 bg-transparent hover:bg-gray-800/50 flex items-center gap-2">
                            <List size={16} />
                            <span>My Quizzes</span>
                        </Button>
                    </Link>
                    <Link to="/myAttempts">
                        <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 bg-transparent hover:bg-gray-800/50 hover:text-yellow-400">
                            <TrendingUp size={16} />
                            <span>My Attempts</span>
                        </Button>
                    </Link>
                </div>

                {/* Login / Register / Profile Section */}
                <div className="flex space-x-3">
                {isLoggedIn && (
        <div className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative hover:bg-gray-800 transition-colors duration-200 bg-transparent "
            >
                <Bell className="h-6 w-6 text-gray-200 hover:text-yellow-400" />
                {announcements.some(notif => !notif.read) && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0E1225]"></span>
                )}
            </Button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0E1225] border border-gray-700 shadow-xl rounded-lg p-4 z-auto">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                        <h3 className="text-gray-200 font-semibold text-lg">Notifications</h3>
                        <div className="flex space-x-2">
                            {announcements.some(notif => !notif.read) && (
                                <button 
                                    onClick={markAllAsRead} 
                                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>

                    {announcements.length > 0 ? (
                        <ul className="space-y-2 max-h-80 overflow-y-auto">
                            {announcements.map((notif, index) => (
                                <li 
                                    key={index} 
                                    className={`text-gray-300 text-sm p-3 rounded-lg flex flex-col 
                                        ${notif.read ? 'bg-gray-800/50' : 'bg-gray-800'} 
                                        hover:bg-gray-700 transition-colors duration-150`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-200">
                                            {notif.sentBy || "Unknown User"}
                                        </span>
                                        <div className="flex space-x-1">
                                            {!notif.read && (
                                                <button 
                                                    onClick={() => markAsRead(notif._id)} 
                                                    className="p-1 text-xs text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <span className="sr-only">Mark as read</span>
                                                    ✓
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(notif._id)}
                                                className="p-1 text-xs text-white bg-red-600 rounded-full hover:bg-red-500 transition-colors"
                                                title="Delete notification"
                                            >
                                                <span className="sr-only">Delete</span>
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        has shared a quiz with you.{" "}
                                        <Link 
                                            to={`/take/${notif.message}`} 
                                            className="text-yellow-400 hover:text-yellow-300 font-medium underline"
                                        >
                                            Click here to try it out!
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-gray-400 text-sm">No notifications</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )}
                    {isLoggedIn ? (
                        // Profile Button with Sheet for right sidebar
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800/50 hover:text-yellow-400 flex items-center gap-2 bg-transparent border-none">
                                    <User size={16} />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-[#0E1225] border-l border-gray-800/50 w-80 overflow-y-auto">
                                <SheetHeader className="text-left">
                                    <SheetTitle className="text-xl text-white">Profile</SheetTitle>
                                    <SheetDescription className="text-gray-400">
                                        Manage your account settings and view your stats
                                    </SheetDescription>
                                </SheetHeader>
                                
                                <div className="mt-6 flex flex-col space-y-6">
                                    {/* User Info with loading state */}
                                    <div className="flex flex-col items-center py-6 px-4 bg-gray-800/30 rounded-lg">
                                        {isProfileLoading ? (
                                            <>
                                                <div className="w-20 h-20 rounded-full shimmer mb-4"></div>
                                                <div className="h-6 w-32 shimmer rounded mb-2"></div>
                                                <div className="h-4 w-40 shimmer rounded"></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                                                    {userProfile.profilePicture ? (
                                                        <img 
                                                            src={`${userProfile.profilePicture}`} 
                                                            alt={`${userProfile.username}'s profile`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={32} className="text-white" />
                                                    )}
                                                </div>
                                                <h3 className="text-xl font-semibold text-white">{userProfile.username || "User"}</h3>
                                                <p className="text-gray-400">{userProfile.email || "email@example.com"}</p>
                                                {userProfile.bio && (
                                                    <p className="text-sm text-gray-300 mt-3 text-center">
                                                        {userProfile.bio}
                                                    </p>
                                                )}
                                                {userProfile.dateJoined && (
                                                    <p className="text-xs text-gray-400 mt-3">
                                                        Member since {new Date(userProfile.dateJoined.toString()).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    
                                    <Separator className="bg-gray-700/50" />
                                    
                                    {/* User Stats */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-white">Your Stats</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-800/30 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Book size={14} className="text-yellow-400" />
                                                    <span className="text-sm text-gray-400">Quizzes Created</span>
                                                </div>
                                                {isProfileLoading ? (
                                                    <div className="h-6 w-12 shimmer rounded"></div>
                                                ) : (
                                                    <p className="text-xl font-semibold text-center text-white">{userProfile.quizzesCreated?.length || 0}</p>
                                                )}
                                            </div>
                                            <div className="bg-gray-800/30 p-3 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TrendingUp size={14} className="text-yellow-400" />
                                                    <span className="text-sm text-gray-400">Quizzes Attempted</span>
                                                </div>
                                                {isProfileLoading ? (
                                                    <div className="h-6 w-12 shimmer rounded"></div>
                                                ) : (
                                                    <p className="text-xl font-semibold text-center text-white">{userProfile.quizzesAttempted?.length || 0}</p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Total Score */}
                                        {userProfile.totalScore !== undefined && (
                                            <div className="bg-gray-800/30 p-3 rounded-lg mt-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Award size={14} className="text-yellow-400" />
                                                    <span className="text-sm text-gray-400">Total Score</span>
                                                </div>
                                               
                                            </div>
                                        )}
                                        
                                        {/* Badges */}
                                        {userProfile.badges && userProfile.badges.length > 0 && (
                                            <div className="bg-gray-800/30 p-3 rounded-lg mt-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Trophy size={14} className="text-yellow-400" />
                                                    <span className="text-sm text-gray-400">Badges</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {userProfile.badges.map((badge, index) => (
                                                        <div key={index} className="px-2 py-1 bg-yellow-600/20 rounded-full text-xs text-yellow-300">
                                                            {badge}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Recent Activity */}
                                    {userProfile.recentActivity && userProfile.recentActivity.length > 0 && (
                                        <>
                                            <Separator className="bg-gray-700/50" />
                                            <div className="space-y-3">
                                                <h4 className="text-lg font-medium text-white">Recent Activity</h4>
                                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                                    {userProfile.recentActivity.map((activity, index) => (
                                                        <li key={index} className="text-sm bg-gray-800/30 p-2 rounded-lg">
                                                            <div className="flex justify-between">
                                                                <span className="text-yellow-400">{activity.type}</span>
                                                                <span className="text-gray-400 text-xs">
                                                                    {new Date(activity.date.toString()).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-200 mt-1">
                                                                {activity.quiz.toString()}
                                                                {activity.score !== undefined && ` - Score: ${activity.score}`}
                                                            </p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                    
                                    <Separator className="bg-gray-700/50" />
                                    
                                    {/* Quick Links */}
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-medium text-white">Quick Links</h4>
                                        <nav className="flex flex-col space-y-1">
                                            <Link to="/myQuizzes">
                                                <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                                    <Book size={16} />
                                                    <span>My Quizzes</span>
                                                </Button>
                                            </Link>
                                            <Link to="/myAttempts">
                                                <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                                    <BarChart size={16} />
                                                    <span>My Attempts</span>
                                                </Button>
                                            </Link>
                                            {/* <Link to="/analytics">
                                                <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400 bg-transparent">
                                                    <Library size={16} />
                                                    <span>Analytics</span>
                                                </Button>
                                            </Link> */}
                                        </nav>
                                    </div>
                                    
                                    {/* Logout Button */}
                                    <Button 
                                        variant="destructive" 
                                        className="w-full mt-auto bg-red-600 hover:bg-red-700"
                                        onClick={handleLogOut}
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                  ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline" className="text-white bg-gradient-to-r from-yellow-500 to-orange-600 border-gray-700 hover:bg-gray-800/50 hover:text-yellow-400 ">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
                

            {/* Hero Section */}
            <section className="relative flex flex-col items-center text-center pt-40 pb-32 px-6 bg-transparent overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl"></div>
                
                <div className="relative animate-on-scroll">
                    <h1 className="text-5xl sm:text-7xl font-bold">
                        Welcome to <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-4"></div>
                    <p className="mt-6 text-xl text-gray-300 max-w-2xl">
                        Your ultimate destination for fun and challenging quizzes! Create, share, and test your knowledge on any topic.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/browse">
                            <Button className="px-8 py-3 text-lg bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg shadow-orange-600/20 rounded-full transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-orange-600/30">
                                Explore Quizzes
                                <ChevronRight size={18} className="ml-1" />
                            </Button>
                        </Link>
                        <Link to="/upload">
                            <Button variant="outline" className="px-8 py-3 text-lg border-gray-700 hover:bg-gray-800/50 hover:text-yellow-400 rounded-full">
                                Create Quiz
                            </Button>
                        </Link>
                    </div>
                </div>
                
                {/* Decorative quiz cards */}
                <div className="hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2 transform rotate-12 opacity-70">
                    <div className="w-48 h-64 bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-xl p-4">
                        <div className="w-full h-3 bg-white/20 rounded mb-2"></div>
                        <div className="w-3/4 h-3 bg-white/20 rounded mb-6"></div>
                        <div className="space-y-3">
                            <div className="w-full h-4 bg-white/10 rounded"></div>
                            <div className="w-full h-4 bg-white/10 rounded"></div>
                            <div className="w-full h-4 bg-white/10 rounded"></div>
                            <div className="w-2/3 h-4 bg-white/10 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:block absolute -left-12 top-1/2 -translate-y-1/2 transform -rotate-12 opacity-70">
                    <div className="w-48 h-64 bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg shadow-xl p-4">
                        <div className="w-full h-3 bg-white/20 rounded mb-2"></div>
                        <div className="w-3/4 h-3 bg-white/20 rounded mb-6"></div>
                        <div className="space-y-3">
                            <div className="w-full h-4 bg-white/10 rounded"></div>
                            <div className="w-full h-4 bg-white/10 rounded"></div>
                            <div className="w-full h-4 bg-white/10 rounded"></div>
                            <div className="w-2/3 h-4 bg-white/10 rounded"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section with improved visuals */}
            <section className="py-24 px-6 bg-[#0D121F] relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,rgba(76,29,149,0.2),transparent)]"></div>
                
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-on-scroll">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent inline-block">Key Features</h2>
                        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
                            Everything you need to create, participate in, and share knowledge through interactive quizzes.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="group animate-on-scroll">
                            <Card className="relative h-full overflow-hidden bg-gradient-to-b from-gray-900 to-[#0E1225] border-gray-800/50 hover:border-yellow-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-600/10">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 mb-6 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-yellow-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                                        <Book size={24} className="text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-yellow-400 mb-3">Create Quizzes</h3>
                                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                        Easily design and publish your own quizzes with our intuitive interface. Add multiple choice questions, images, and time limits.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="group animate-on-scroll" style={{animationDelay: "100ms"}}>
                            <Card className="relative h-full overflow-hidden bg-gradient-to-b from-gray-900 to-[#0E1225] border-gray-800/50 hover:border-yellow-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-600/10">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 mb-6 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-yellow-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                                        <Trophy size={24} className="text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-yellow-400 mb-3">Test Knowledge</h3>
                                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                        Challenge yourself with quizzes in various categories. Track your progress and see how you stack up against other quiz takers.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="group animate-on-scroll" style={{animationDelay: "200ms"}}>
                            <Card className="relative h-full overflow-hidden bg-gradient-to-b from-gray-900 to-[#0E1225] border-gray-800/50 hover:border-yellow-500/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-yellow-600/10">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 mb-6 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-yellow-500/30 group-hover:to-orange-600/30 transition-all duration-300">
                                        <Users size={24} className="text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-yellow-400 mb-3">Share & Compete</h3>
                                    <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                                        Invite friends to take your quizzes, or join collaborative team challenges. Compete for the top score on global leaderboards!
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section with visual enhancement */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,transparent,#FFB800,transparent)]"></div>
                
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="animate-on-scroll order-2 md:order-1">
                            <h2 className="text-4xl font-bold text-white mb-6">About <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span></h2>
                            <p className="text-gray-300 mb-6">
                                QuizMaster is an interactive platform designed to make learning and knowledge sharing more engaging. Whether you want to test yourself, create custom quizzes, or challenge your friends, QuizMaster provides all the tools you need.
                            </p>
                            <p className="text-gray-300 mb-8">
                                Our platform offers a vibrant community of quiz enthusiasts from around the world, with thousands of quizzes covering every topic imaginable – from academic subjects to pop culture and everything in between.
                            </p>
                            
                        </div>
                        
                        <div className="relative animate-on-scroll order-1 md:order-2">
                            <div className="aspect-square max-w-md mx-auto relative">
                                {/* Decorative elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl transform rotate-6"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-800/20 rounded-2xl transform -rotate-3"></div>
                                
                                {/* Main image container */}
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-[#0E1225] rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
                                    {/* Decorative quiz interface elements */}
                                    <div className="h-full w-full p-6 flex flex-col">
                                        <div className="w-full h-8 bg-white/10 rounded-full mb-4"></div>
                                        <div className="flex-1 bg-white/5 rounded-lg p-4 flex flex-col">
                                            <div className="w-3/4 h-6 bg-white/10 rounded mb-6"></div>
                                            <div className="space-y-4 flex-1">
                                                <div className="w-full h-10 bg-white/10 rounded hover:bg-yellow-500/20 transition-colors duration-300"></div>
                                                <div className="w-full h-10 bg-white/10 rounded hover:bg-yellow-500/20 transition-colors duration-300"></div>
                                                <div className="w-full h-10 bg-white/10 rounded hover:bg-yellow-500/20 transition-colors duration-300"></div>
                                                <div className="w-full h-10 bg-white/10 rounded hover:bg-yellow-500/20 transition-colors duration-300"></div>
                                            </div>
                                            <div className="mt-6 w-1/3 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full ml-auto"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA with enhanced design */}
            <section className="py-24 px-6 bg-[#0D121F] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(76,29,149,0.2),transparent_50%)]"></div>
                
                <div className="max-w-3xl mx-auto text-center relative z-10 animate-on-scroll">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Get Started Today!</h2>
                    <p className="text-xl text-gray-300 mb-8">Join thousands of quiz enthusiasts and start exploring now. Create your first quiz in minutes!</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button className="px-8 py-3 text-lg bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg shadow-orange-600/20 rounded-full transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-orange-600/30">
                                Sign Up Now
                                <ChevronRight size={18} className="ml-1" />
                            </Button>
                        </Link>
                        <Link to="/browse">
                            <Button variant="outline" className="px-8 py-3 text-lg border-gray-700 hover:bg-gray-800/50 hover:text-yellow-400 rounded-full">
                                Browse Quizzes
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-800/50 bg-[#090D19]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <Trophy size={16} className="text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">QuizMaster</span>
                        </div>
                        <p className="text-gray-400 max-w-xs">
                            The ultimate platform for knowledge enthusiasts. Create, share, and compete with quizzes on any topic.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-4">Quick Links</h4>
                        <div className="flex flex-col space-y-2">
                            <Link to="/browse" className="text-gray-400 hover:text-yellow-400 transition-colors">Browse Quizzes</Link>
                            <Link to="/upload" className="text-gray-400 hover:text-yellow-400 transition-colors">Create Quiz</Link>
                            <Link to="/myQuizzes" className="text-gray-400 hover:text-yellow-400 transition-colors">My Quizzes</Link>
                            <Link to="/myAttempts" className="text-gray-400 hover:text-yellow-400 transition-colors">My Attempts</Link>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-medium mb-4">Account</h4>
                        <div className="flex flex-col space-y-2">
                            <Link to="/login" className="text-gray-400 hover:text-yellow-400 transition-colors">Login</Link>
                            <Link to="/register" className="text-gray-400 hover:text-yellow-400 transition-colors">Register</Link>
                            <Link to="/profile" className="text-gray-400 hover:text-yellow-400 transition-colors">Profile</Link>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-800/50 text-center">
                    <p className="text-gray-500 text-sm">© {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
                </div>
            </footer>

            {/* CSS for animation */}
            
        </div>
    );
}

export { Landing };