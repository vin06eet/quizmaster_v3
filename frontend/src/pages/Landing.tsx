import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Upload, Search, List, User, Menu, Book, Trophy, Users, Bell } from "lucide-react";

interface Announcement {
    _id: String,
    sentBy: string,
    message: string,
    read: boolean
}

function Landing() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userID, setUserID] = useState<string | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [username, setUsername] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/islogged', { withCredentials: true });
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
                const response = await axios.get(`http://localhost:8080/api/fetch`, {withCredentials: true});
                const newAnnouncements = response.data.announcements ?? [];
                setAnnouncements(newAnnouncements);
                const userID = newAnnouncements.map((notif: { sentBy: any; }) => notif.sentBy);
                findUsername(userID);
            } catch (error) {
                console.error('Error finding announcements', error);
            }
        }
        checkAnnouncements();
        const interval = setInterval(checkAnnouncements, 5000);
        return () => clearInterval(interval);
    }, [userID]);

    const findUsername = async (userIDs: string[]) => {
        // Filter out IDs that we already have usernames for
        const uniqueUserIDs = userIDs.filter((id) => !username[id]);

        if (uniqueUserIDs.length === 0) return; // No new usernames to fetch

        try {
            const response = await axios.post(`http://localhost:8080/api/getUsernames`, { userIDs }, { withCredentials: true });
            setUsername((prev) => ({ ...prev, ...response.data })); 
        } catch (error) {
            console.error("Error fetching usernames:", error);
        }
    };

    const markAsRead = async (announceID: String) => {
        try {
            await axios.patch(`http://localhost:8080/api/quiz/markAsRead/${announceID}`, { withCredentials: true });
            setAnnouncements(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };
    
    const markAllAsRead = async () => {
        try {
            await axios.patch("http://localhost:8080/api/quiz/markAllAsRead", { withCredentials: true });
            setAnnouncements(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };
    
    useEffect(() => {
        const findUsername = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/quiz/${userID}`, {withCredentials: true});
                setUsername(response.data.username);
            } catch (error) {
                console.error('Error finding username', error)
            }
        }
        findUsername();
    }, [announcements]);

    useEffect(() => {
        // Add CSS to the document
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
    // Animation for scroll effect
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
        // Trigger once on load
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    
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
                        <Button variant="ghost" size="icon" className="sm:hidden">
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
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400">
                                        <Upload size={18} />
                                        <span>Upload</span>
                                    </Button>
                                </Link>
                                <Link to="/browse">
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400">
                                        <Search size={18} />
                                        <span>Browse</span>
                                    </Button>
                                </Link>
                                <Link to="/myQuizzes">
                                    <Button variant="ghost" className="w-full text-gray-200 text-left justify-start gap-3 hover:bg-gray-800/50 hover:text-yellow-400">
                                        <List size={18} />
                                        <span>My Quizzes</span>
                                    </Button>
                                </Link>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center space-x-1">
                    <Link to="/upload">
                        <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 hover:bg-gray-800/50 flex items-center gap-2">
                            <Upload size={16} />
                            <span>Upload</span>
                        </Button>
                    </Link>
                    <Link to="/browse">
                        <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 hover:bg-gray-800/50 flex items-center gap-2">
                            <Search size={16} />
                            <span>Browse</span>
                        </Button>
                    </Link>
                    <Link to="/myQuizzes">
                        <Button variant="ghost" className="text-gray-200 hover:text-yellow-400 hover:bg-gray-800/50 flex items-center gap-2">
                            <List size={16} />
                            <span>My Quizzes</span>
                        </Button>
                    </Link>
                </div>

                {/* Login / Register / Profile Section */}
                <div className="flex space-x-3">
                {isLoggedIn && (
                        <div className="relative">
                            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)} className="relative">
                                <Bell className="h-6 w-6 text-gray-200" />
                                {announcements.some(notif => !notif.read) && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-64 bg-[#0E1225] border border-gray-700 shadow-lg rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-gray-200 font-semibold">Notifications</h3>
                                        {announcements.some(notif => !notif.read) && (
                                            <button 
                                                onClick={markAllAsRead} 
                                                className="text-sm text-blue-400 hover:underline"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    {announcements.length > 0 ? (
                                        <ul className="space-y-2">
                                            {announcements.map((notif, index) => (
                                                <li 
                                                    key={index} 
                                                    className={`text-gray-300 text-sm p-2 rounded-lg flex justify-between items-center 
                                                        ${notif.read ? 'bg-gray-700' : 'bg-gray-800'}`}
                                                >
                                                    <div>
                                                        {notif.sentBy || "Unknown User"} has shared a quiz with you.{" "}
                                                        <Link 
                                                            to={`/take/${notif.message}`} 
                                                            className="text-yellow-400 underline hover:text-yellow-300"
                                                        >
                                                            Click here to try it out!
                                                        </Link>
                                                    </div>
                                                    
                                                    {/* Small "Mark as Read" Button */}
                                                    {!notif.read && (
                                                        <button 
                                                            onClick={() => markAsRead(notif._id)} 
                                                            className="ml-2 px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                                                        >
                                                            ✓
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No new notifications</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {isLoggedIn ? (
                        <Link to="/profile">
                            <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800/50 hover:text-yellow-400 flex items-center gap-2 bg-transparent">
                                <User size={16} />
                                <span>Profile</span>
                            </Button>
                        </Link>
                  ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800/50 hover:text-yellow-400">
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