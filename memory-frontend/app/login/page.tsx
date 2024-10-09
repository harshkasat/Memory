"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';

import loginSignup from '../assets/images/loginSignup.jpg';
import Cookies from 'js-cookie'


export default function Component() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter() // Initialize useRouter

  // Handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Simple POST request logic
    const response = await fetch("http://127.0.0.1:8000/user/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store access token in cookies
      Cookies.set('authToken', data.access_token); // Use access_token
      // Optional: You can store refresh_token if needed
      Cookies.set('refreshToken', data.refresh_token); // Store refresh token if needed
      // Login successful
      router.push('/dashboard'); // Redirect to home
    } else {
      // Handle login failure
      console.error("Login failed");
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-sm w-full">
          <h1 className="text-3xl font-bold mb-6 text-blue-600">Welcome<br />back!</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" type="submit">
              Log in
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="text-gray-600">Don't have an account?</span>{" "}
            <a href="signup" className="text-blue-600 hover:underline">Sign up</a>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
            {/* Social media icons */}
          </div>
        </div>
      </div>
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src={loginSignup}
          alt="Photo gallery showcase"
          layout="fill"
          objectFit="cover"
          className="rounded-l-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-l-2xl"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Photo Gallery</h2>
          <p className="text-sm">Log in to view and share your amazing photographs</p>
        </div>
      </div>
    </div>
  );
}
