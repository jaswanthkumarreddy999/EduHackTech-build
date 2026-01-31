// src/modules/landing/LandingPage.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Code, Terminal, Cpu } from 'lucide-react'; // Icons

const LandingPage = () => {
  const { mode, bgPrimary, primary, bgLight } = useTheme();

  // Mock Data for "Learning" Mode
  const courses = [
    { title: "Full Stack Web Dev", modules: 12, icon: <Code />, level: "Beginner" },
    { title: "Data Structures & Algo", modules: 20, icon: <Terminal />, level: "Advanced" },
    { title: "System Design", modules: 8, icon: <Cpu />, level: "Intermediate" },
    { title: "React Native Mastery", modules: 15, icon: <BookOpen />, level: "All Levels" },
  ];

  // Mock Data for "Competition" Mode
  const hackathons = [
    { title: "EduHack Global 2026", teams: 120, prize: "$10,000", status: "Live" },
    { title: "AI Innovation Sprint", teams: 45, prize: "$5,000", status: "Upcoming" },
    { title: "Web3 Builders Clash", teams: 80, prize: "$8,000", status: "Registering" },
    { title: "Green Tech Challenge", teams: 200, prize: "$20,000", status: "Live" },
  ];

  const data = mode === 'learning' ? courses : hackathons;

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      
      {/* 1. Hero Section */}
      <div className="bg-white pb-12 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className={`font-semibold tracking-wider uppercase text-sm ${primary}`}>
              {mode === 'learning' ? "#KeepLearning" : "#BeUnstoppable"}
            </span>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-850 sm:text-5xl md:text-6xl">
              {mode === 'learning' ? "Unlock Premium Courses" : "Battle in Global Hackathons"}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              {mode === 'learning' 
                ? "From tech to non-tech, discover courses to upskill and advance your career." 
                : "Join the world's best developers, solve real problems, and win massive prizes."}
            </p>
            
            {/* Category Pills */}
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              {['Software Tools', 'Coding', 'Aptitude', 'Management'].map((cat) => (
                <span key={cat} className="px-6 py-3 rounded-xl bg-orange-50 text-orange-600 font-medium cursor-pointer hover:bg-orange-100 transition-colors border border-orange-100">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-8">
          <div className={`w-1 h-8 ${bgPrimary} rounded-full`}></div>
          <h2 className="text-2xl font-bold text-slate-850">
            {mode === 'learning' ? "Trending Courses" : "Featured Battles"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-lg ${bgLight} flex items-center justify-center mb-4 ${primary}`}>
                {mode === 'learning' ? item.icon : <Trophy />}
              </div>
              
              <h3 className="text-lg font-bold text-slate-850 mb-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                {mode === 'learning' ? `${item.modules} Modules • ${item.level}` : `${item.teams} Teams • Prize: ${item.prize}`}
              </p>

              <button className={`w-full py-2.5 rounded-lg border font-medium transition-all ${mode === 'learning' ? 'border-blue-100 text-blue-600 hover:bg-blue-50' : 'border-purple-100 text-purple-600 hover:bg-purple-50'}`}>
                {mode === 'learning' ? "View Course" : "Register Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Icon component for the mock data
const Trophy = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;

export default LandingPage;