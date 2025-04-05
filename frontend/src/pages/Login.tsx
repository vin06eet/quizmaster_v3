import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/login`, { email, password });

      Cookies.set("token", response.data.token, {
        path: "/",
        expires: 7,
        sameSite: 'None',                   
        secure: true,
        httpOnly: true,
      });
      
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden w-screen">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/5">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>
      
      <div className="relative w-full max-w-md px-4">
        <Card className="bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          {/* Top decorative bar */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-8">
            {/* Logo/Brand mark */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white text-center mb-1">Welcome Back</h1>
            <p className="text-gray-400 text-center mb-8">Log in to your account to continue</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-gray-300 pl-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-white/10 border-white/10 text-white ring-offset-white/5 focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-extrabold text-gray-300 pl-1">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-white/10 border-white/10 text-white ring-offset-white/5 focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg border border-red-500/20 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-indigo-500 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Sign In"}
              </Button>
            </form>
            
            
            {/* Register link */}
            <p className="text-gray-400 text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </Card>
        
        {/* Add a subtle attribution */}
       <p className="text-gray-600/30 text-xs text-center mt-8">
         © 2025 QuizMaster • All rights reserved
       </p>
     </div>
     
     {/* Add glass morphism elements for depth */}
     <div className="hidden lg:block absolute top-1/4 left-24 w-40 h-40 rounded-full border border-white/10 backdrop-blur-xl" style={{ background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' }}></div>
     <div className="hidden lg:block absolute bottom-1/4 right-24 w-64 h-64 rounded-full border border-white/10 backdrop-blur-xl" style={{ background: 'linear-gradient(45deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}></div>
   </div>
 );
}

export { Login };