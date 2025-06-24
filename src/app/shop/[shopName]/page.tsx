"use client";
import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Script from "next/script";
import { db, storage } from "@/lib/firebase";

// Define Merchant type
interface Merchant {
  costPerPage: number;
  upiId: string;
  shopName: string;
}

export default function ShopUploadPage() {
  const { shopName } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    async function fetchMerchant() {
      if (shopName) {
        const merchantRef = doc(db, "merchants", shopName as string);
        const merchantSnap = await getDoc(merchantRef);
        if (merchantSnap.exists()) {
          setMerchant(merchantSnap.data() as Merchant);
        }
      }
    }
    fetchMerchant();
  }, [shopName]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setPageCount(null);
    setError("");
    if (!selectedFile) return;
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      setError("Only PDF files are supported for printing.");
      return;
    }
    const reader = new FileReader();
    // @ts-expect-error: pdfjsLib is loaded globally from CDN
    const pdfjsLib = typeof window !== 'undefined' ? window.pdfjsLib : undefined;
    if (!pdfjsLib) {
      setError("PDF library not loaded");
      return;
    }
    reader.onload = function () {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer);
      pdfjsLib.getDocument({ data: typedarray }).promise.then(function (pdf: { numPages: number }) {
        setPageCount(pdf.numPages);
      }).catch((err: { message: string }) => {
        setError('Error reading PDF: ' + err.message);
      });
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-16">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 ">
              {shopName} <span className="text-lg font-normal">powered by PrintEasy</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
              Upload your document for {shopName}
            </p>
            {merchant && (
              <div className="mt-4 text-lg text-gray-700">
                <div>Cost per page: <span className="font-semibold">₹{merchant.costPerPage}</span></div>
                <div>UPI ID: <span className="font-mono">{merchant.upiId}</span></div>
              </div>
            )}
          </div>
          <form onSubmit={e => e.preventDefault()} className="glass-effect rounded-2xl shadow-xl p-1 sm:p-28 mb-20 transform transition-all duration-300 hover:shadow-2xl">
            <label htmlFor="file-upload" className="block text-xl font-medium text-center text-gray-700">
              Select a document to print
            </label>
            <div className="flex flex-col items-center">
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-2xl p-12 cursor-pointer hover:border-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 text-lg"
                disabled={uploading}
              />
            </div>
            {pageCount !== null && merchant && (
              <div className="mt-4 text-lg text-blue-700 font-semibold text-center">
                Page count: {pageCount} <br />
                Total bill: ₹{pageCount * merchant.costPerPage}
              </div>
            )}
            <div className="flex justify-center mt-8 gap-4">
              <button
                type="button"
                className="bg-green-600 text-white py-3 px-8 rounded-xl font-semibold text-lg shadow-md disabled:opacity-50"
                disabled={!file || !pageCount || !merchant || uploading}
                onClick={async () => {
                  setError("");
                  if (!merchant || !pageCount || !file) return;
                  // Payment
                  const totalAmount = pageCount * merchant.costPerPage * 100;
                  const options = {
                    key: "rzp_live_bWsP3uljCMWJFm",
                    amount: totalAmount,
                    currency: "INR",
                    name: merchant.shopName,
                    description: `Print job for ${merchant.shopName}`,
                    handler: async function (response: { razorpay_payment_id: string }) {
                      setPaymentSuccess(true);
                      setPaymentId(response.razorpay_payment_id);
                      // Upload after payment
                      setUploading(true);
                      const storageRef = ref(storage, `uploads/${shopName}/${Date.now()}_${file.name}`);
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
                            shopName,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url,
                            uploadedAt: serverTimestamp(),
                            pageCount,
                            cost: pageCount && merchant ? pageCount * merchant.costPerPage : null,
                            paymentId: response.razorpay_payment_id,
                            status: "pending"
                          });
                          setUploading(false);
                          setSuccess(true);
                          setProgress(0);
                          setPaymentSuccess(false);
                          setPaymentId("");
                          setFile(null);
                          setPageCount(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }
                      );
                    },
                    prefill: { email: "" },
                    theme: { color: "#2563eb" },
                  };
                  // @ts-expect-error: Razorpay is loaded globally from CDN
                  const rzp = new window.Razorpay(options);
                  rzp.open();
                }}
              >
                {uploading ? "Uploading..." : "Pay & Upload"}
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
                Document uploaded and paid successfully! It will be printed shortly.
              </div>
            )}
            {error && (
              <div className="text-red-600 text-center font-medium text-lg bg-red-50 py-3 px-4 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>
      </main>
      <footer className="py-8 text-center text-gray-600 bg-white/50 backdrop-blur-sm mt-10">
        <p className="text-sm">© {new Date().getFullYear()} neuraltechnologies.in. All rights reserved.</p>
      </footer>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.0/jszip.min.js" strategy="beforeInteractive" />
    </div>
  );
} 