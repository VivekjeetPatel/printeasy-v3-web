"use client";
import { useRef } from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <nav className="w-full flex justify-between items-center px-8 py-4 bg-white/80 shadow-sm">
        <div className="flex items-center text-2xl font-bold text-blue-700">
          {/* Replace with <img src="/logo.png" alt="PrintEasy Logo" className="h-8 mr-2" /> if you have a logo image */}
          PrintEasy
        </div>
        <div className="flex gap-2 text-blue-700 font-semibold items-center">
          <span>Merchant?</span>
          <a href="/merchant/login" className="hover:underline ml-1">Login</a>
          <a href="/merchant/register" className="hover:underline ml-2">Signup</a>
        </div>
      </nav>
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-16">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 ">
              PrintEasy
            </h1>
            <p className="text-2xl sm:text-3xl text-gray-600 max-w-2xl mx-auto mt-6">
              Automating and securing printout process
            </p>
          </div>
          <div className="glass-effect rounded-2xl p-10 sm:p-14 text-center sm:text-left mt-16">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-10 text-gray-800">How it works</h2>
            <ol className="space-y-8 text-lg font-[family-name:var(--font-geist-mono)]">
              <li className="flex items-start group">
                <span className="mr-4 text-blue-600 font-bold group-hover:text-blue-700 transition-colors">1.</span>
                <span className="text-gray-700">Upload your document using our simple interface</span>
              </li>
              <li className="flex items-start group">
                <span className="mr-4 text-blue-600 font-bold group-hover:text-blue-700 transition-colors">2.</span>
                <span className="text-gray-700">Your document is securely stored and processed</span>
              </li>
              <li className="flex items-start group">
                <span className="mr-4 text-blue-600 font-bold group-hover:text-blue-700 transition-colors">3.</span>
                <span className="text-gray-700">The Printer will automatically receive and print your document</span>
              </li>
              <li className="flex items-start group">
                <span className="mr-4 text-blue-600 font-bold group-hover:text-blue-700 transition-colors">4.</span>
                <span className="text-gray-700">After printing, your document will be gone from server in a minute 🙂</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-gray-600 bg-white/50 backdrop-blur-sm mt-10">
        <p className="text-sm">© {new Date().getFullYear()} neuraltechnologies.in. No rights reserved.</p>
      </footer>
    </div>
  );
}
