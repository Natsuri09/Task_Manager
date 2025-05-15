import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';



export default function Home() {
  return (
    <>
      <Head>
        <title>Task Manager</title>
        <meta name="theme-color" content="#0a0a23" />
       
      </Head>
      
      <main className="flex items-center justify-center min-h-screen bg-[#9191e1] overflow-hidden">
      
        
        {/* Glowing orb decoration */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#e6e6fa] opacity-10 blur-[80px] animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#b0c4de] opacity-10 blur-[80px] animate-float-delay"></div>
        
        <div className="relative text-center p-12 bg-[rgba(15,15,35,0.7)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.15)] shadow-2xl max-w-xl z-10 transition-all duration-500 hover:border-[rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(230,230,250,0.15)]">
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(230,230,250,0.05)] to-transparent rounded-2xl"></div>
            <div className="absolute inset-0 border border-[rgba(255,255,255,0.05)] rounded-2xl"></div>
          </div>
          
          <h1 className="text-5xl font-bold text-[#e6e6fa] mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#e6e6fa] to-[#b0c4de]">
            Task Manager
          </h1>
          <p className="text-[#d3d3d3]/80 mb-10 text-lg font-light max-w-md mx-auto">
            Login To Our Task Manager App
          </p>
          
          <div className="flex justify-center gap-5">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-[rgba(230,230,250,0.15)] text-[#e6e6fa] rounded-lg hover:bg-[rgba(230,230,250,0.25)] transition-all duration-300 backdrop-blur-md border border-[rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(230,230,250,0.3)] font-medium flex items-center gap-2"
            >
              
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-transparent border-2 border-[#e6e6fa] text-[#e6e6fa] rounded-lg hover:bg-[rgba(230,230,250,0.1)] transition-all duration-300 hover:shadow-[0_0_15px_rgba(230,230,250,0.3)] font-medium flex items-center gap-2"
            >
              
              Register
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float 10s ease-in-out infinite 2s;
        }
      `}</style>
    </>
  );
}