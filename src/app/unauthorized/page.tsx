import { Container } from "@/components/Container";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md animate-in">
        <div className="w-24 h-24 bg-red-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-red-500 shadow-xl shadow-red-100">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Access Denied</h1>
        <p className="text-gray-500 font-bold mb-10 leading-relaxed">
          You don't have the necessary permissions to access this area. If you believe this is an error, please contact the academy administrator.
        </p>
        <Link 
          href="/" 
          className="btn btn-primary px-10 h-16 rounded-[1.5rem] shadow-xl shadow-primary-200 inline-flex items-center justify-center font-black uppercase tracking-widest"
        >
          Return to Safe Area
        </Link>
      </div>
    </div>
  );
}
