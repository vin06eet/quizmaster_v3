import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/api/login", { email, password });
      
      Cookies.set("token", response.data.token, {
        path: "/",
        expires: 7, 
        secure: false,
        sameSite: "Strict",
      });
      
      navigate("/landing");
    } catch (error: any) {
      console.log(error)
      setError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center sm:w-1/3 sm:h-1/2 h-64 bg-gray-400 rounded-lg shadow-2xl">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center p-4">
          <Input
            type="email"
            placeholder="Email"
            className="m-2 bg-white font-black"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            id="password"
            className="m-2 bg-white font-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <Button type="submit" variant="default">Submit</Button>
        </form>
      </div>
    </div>
  );
}

export { Login }

