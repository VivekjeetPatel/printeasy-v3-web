"use client";
import { useRef, useState } from "react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setUploading(true);
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      },
      (err) => {
        setError(err.message);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "files"), {
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          uploadedAt: serverTimestamp(),
        });
        setUploading(false);
        setSuccess(true);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-16">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 ">
              PrintEasy
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
              Your Automated Document Printing Solution
            </p>
          </div>
          
          <div className="glass-effect rounded-2xl shadow-xl p-1 sm:p-28 mb-20 transform transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleUpload} className="space-y-16 ">
              <label htmlFor="file-upload" className="block text-xl font-medium text-center text-gray-700">
                Select a document to print
              </label>
              <div className="flex flex-col items-center">
                <input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-2xl p-12 cursor-pointer hover:border-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 text-lg"
                  disabled={uploading}
                />
              </div>
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="w-full max-w-md bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 px-14 rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-xl shadow-lg"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload & Print"}
                </button>
              </div>
              {uploading && (
                <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              {success && (
                <div className="text-green-600 text-center font-medium text-lg bg-green-50 py-3 px-4 rounded-lg">
                  Document uploaded successfully! It will be printed shortly.
                </div>
              )}
              {error && (
                <div className="text-red-600 text-center font-medium text-lg bg-red-50 py-3 px-4 rounded-lg">
                  {error}
                </div>
              )}
            </form>
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
