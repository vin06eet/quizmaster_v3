import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/api/register", { username, email, password });

      Cookies.set("token", response.data.token, {
        path: "/",
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });

      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4 w-screen">
      <Card className="relative w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white text-center mb-4">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            className="text-white placeholder-gray-300 bg-gray-900 border-gray-700"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            className="text-white placeholder-gray-300 bg-gray-900 border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            className="text-white placeholder-gray-300 bg-gray-900 border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            className="w-full text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
          >
            Register
          </Button>
        </form>

        {/* Link to Login */}
        <p className="text-gray-300 text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition">
            Login here
          </Link>
        </p>

        {/* Decorative Elements */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full blur-2xl opacity-30"></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full blur-2xl opacity-30"></div>
      </Card>
    </div>
  );
}

export { Register };
