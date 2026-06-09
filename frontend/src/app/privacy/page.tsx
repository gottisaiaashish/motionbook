import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 font-sans p-8 md:p-24 relative z-10">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-xl text-gray-400 max-w-2xl">
        This is a placeholder page for the Privacy Policy. We are working hard to bring this content to you soon!
      </p>
      <div className="mt-12 p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md max-w-3xl">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-2 bg-gray-700 rounded"></div>
              <div className="h-2 bg-gray-700 rounded w-5/6"></div>
              <div className="h-2 bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}