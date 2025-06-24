"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MerchantLogin() {
  const [form, setForm] = useState({
    shopName: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const merchantRef = doc(db, "merchants", form.shopName);
      const merchantSnap = await getDoc(merchantRef);
      if (!merchantSnap.exists()) {
        setError("Shop not found");
        setLoading(false);
        return;
      }
      const merchant = merchantSnap.data();
      if (merchant.password !== form.password) {
        setError("Incorrect password");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("shopName", form.shopName);
      }
      router.push("/merchant/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Merchant Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="shopName" type="text" placeholder="Shop Name" value={form.shopName} onChange={handleChange} required className="border rounded-lg p-3" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border rounded-lg p-3" />
          <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-semibold mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 