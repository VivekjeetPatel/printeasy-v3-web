"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Define Merchant type
interface Merchant {
  shopName: string;
  // Add other fields as needed
}

export default function MerchantDashboard() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get shopName from sessionStorage (set on login)
    const shopName = typeof window !== "undefined" ? sessionStorage.getItem("shopName") : null;
    if (!shopName) {
      router.push("/merchant/login");
      return;
    }
    async function fetchMerchant() {
      const merchantRef = doc(db, "merchants", shopName as string);
      const merchantSnap = await getDoc(merchantRef);
      if (!merchantSnap.exists()) {
        router.push("/merchant/login");
        return;
      }
      setMerchant({ ...merchantSnap.data(), shopName: shopName as string });
      setLoading(false);
    }
    fetchMerchant();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!merchant) return null;

  // Generate a simple login code (shopName for now)
  const loginCode = merchant.shopName;
  const shopUrl = `https://printeasy.neuraltechnologies.in/shop/${merchant.shopName}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Merchant Dashboard</h2>
        <div className="mb-6">
          <div className="text-lg font-semibold mb-2">Your Shop URL:</div>
          <a href={shopUrl} className="text-blue-700 underline break-all" target="_blank" rel="noopener noreferrer">{shopUrl}</a>
        </div>
        <div className="mb-6">
          <div className="text-lg font-semibold mb-2">Android App Login Code:</div>
          <div className="text-2xl font-mono bg-gray-100 rounded-lg px-4 py-2 inline-block">{loginCode}</div>
        </div>
      </div>
    </div>
  );
} 