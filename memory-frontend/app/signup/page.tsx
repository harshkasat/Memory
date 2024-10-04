'use client'

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';
import loginSignup from '../assets/images/loginSignup.jpg'

export default function Component() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter() // Initialize useRouter

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    // Append the profile picture Blob if available
    if (profilePicture) {
        const response = await fetch(profilePicture);
        const blob = await response.blob(); // Convert the data URL to a Blob
        formData.append('profile_picture', blob, 'profile.jpg'); // Append Blob to FormData
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/user/register/', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            // Registration successful
            router.push('/'); // Redirect to home
        } else {
            const errorData = await response.json();
            console.error("Registration failed:", errorData); // Handle errors
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
};


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-sm w-full space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 text-center md:text-left">
            Create Account
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}> {/* Attach onSubmit handler */}
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={profilePicture || ""} alt="Profile picture" />
                <AvatarFallback>{profilePicture ? "Preview" : "Upload"}</AvatarFallback>
              </Avatar>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                placeholder="Enter your full name" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} // Update username state
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                placeholder="Enter your email" 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} // Update email state
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                placeholder="Create a password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} // Update password state
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                placeholder="Confirm your password" 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions
              </label>
            </div>

            {/* Sign Up Button */}
            <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" type="submit">
              Sign up
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account?</span>{" "}
            <a href="/login" className="text-blue-600 hover:underline">Log in</a>
          </div>

          {/* Social Links */}
          <div className="mt-6 flex justify-center space-x-4">
            {/* Icons */}
            <a href="#" className="text-gray-400 hover:text-gray-500">
              {/* Facebook Icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" />
              </svg>
            </a>
            {/* Twitter Icon */}
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743A11.65 11.65 0 011.267 5.71a4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.832 2.84A8.233 8.233 0 010 15.29a11.592 11.592 0 006.29 1.962" />
              </svg>
            </a>
            {/* Google Icon */}
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 2C5.305 2 1.215 5.646.374 9.546 1.215 13.446 5.305 17 10 17c2.166 0 4.134-.728 5.715-1.94l-3.722-2.183C9.125 12.19 8.138 13 6.937 13 5.191 13 3.817 11.57 3.817 10c0-1.232 1.291-2.266 2.861-2.79A5.755 5.755 0 019.445 10l5.719-3.473C12.74 4.066 11.467 2 10 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
            src={loginSignup}
            alt="Photo gallery preview"
            layout="fill"
            objectFit="cover"
            className="rounded-l-2xl"
          />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-l-2xl"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Join our Photo Community</h2>
          <p className="text-sm">Share your best shots and get inspired by others</p>
        </div>
      </div>
    </div>
  )
}
