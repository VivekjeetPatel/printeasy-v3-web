"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function MerchantRegister() {
  const [form, setForm] = useState({
    shopName: "",
    password: "",
    upiId: "",
    costPerPage: ""
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
      await setDoc(doc(db, "merchants", form.shopName), {
        shopName: form.shopName,
        password: form.password,
        upiId: form.upiId,
        costPerPage: Number(form.costPerPage)
      });
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
        <h2 className="text-3xl font-bold mb-6 text-center">Merchant Registration</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="shopName" type="text" placeholder="Shop Name" value={form.shopName} onChange={handleChange} required className="border rounded-lg p-3" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border rounded-lg p-3" />
          <input name="upiId" type="text" placeholder="Shop UPI ID" value={form.upiId} onChange={handleChange} required className="border rounded-lg p-3" />
          <input name="costPerPage" type="number" placeholder="Cost Per Page" value={form.costPerPage} onChange={handleChange} required className="border rounded-lg p-3" />
          <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-semibold mt-2" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
} 