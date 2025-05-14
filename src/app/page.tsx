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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center">PrintEasy</h1>
        <p className="text-xl text-center text-gray-600">Automated Document Printing Solution</p>
        
        <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <label htmlFor="file-upload" className="font-medium text-center">
              Select a document to print
            </label>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              className="border p-2 rounded cursor-pointer hover:border-blue-500 transition-colors"
              disabled={uploading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload & Print"}
            </button>
            {uploading && (
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-500 h-2 rounded transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            {success && (
              <div className="text-green-600 text-center font-medium">
                Document uploaded successfully! It will be printed shortly.
              </div>
            )}
            {error && (
              <div className="text-red-600 text-center font-medium">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <li className="mb-2 tracking-[-.01em]">
              Upload your document using our simple interface
            </li>
            <li className="mb-2 tracking-[-.01em]">
              Your document is securely stored and processed
            </li>
            <li className="mb-2 tracking-[-.01em]">
              The Printer will automatically receive and print your document
            </li>
            <li className="tracking-[-.01em]">
              After printing, your document will be gone from server in a minute 🙂.
            </li>
          </ol>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
