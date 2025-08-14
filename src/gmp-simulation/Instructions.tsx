import Background from './background';
import React, { useState } from "react";
import { Icon } from '@iconify/react';
import { Factory, Lightbulb, Target } from "lucide-react";
import ProfileInfo from '../gmp-simulation/ProfileInfo';
import { useAuth } from '../contexts/AuthContext';

interface InstructionsProps {
  onStart: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onStart }) => {
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex flex-col items-center justify-center p-2 lg:p-4 relative text-white">
      <Background />
      {/* Profile Button */}
      <button
        className="absolute top-6 right-8 z-30 flex items-center gap-2 bg-white/90 hover:bg-blue-100 text-blue-900 font-semibold px-4 py-2 rounded-xl shadow transition-all duration-200 border border-blue-200"
        onClick={() => setShowProfile(true)}
        title="View Profile"
      >
        <Icon icon="mdi:account-circle" width={28} height={28} />
        Profile
      </button>

      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-6 lg:p-10 max-w-5xl w-full space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4 animate-float">
            <Factory className="w-14 h-14 text-cyan-400 drop-shadow-lg" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-cyan-500 pixel-text drop-shadow-lg flex items-center justify-center gap-2">
            <Icon icon="mdi:star-four-points" className="inline w-8 h-8 text-yellow-400 animate-float" />
            GMP Simulation Game: <span className="text-purple-500">Deviation Detective</span>
            <Icon icon="mdi:trophy-award" className="inline w-8 h-8 text-emerald-400 animate-float" />
          </h1>
          <p className="text-gray-500 mt-2 text-base lg:text-lg pixel-text">
            Test your knowledge of Good Manufacturing Practices through real-world deviation case simulations.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-cyan-900/80 p-4 rounded-lg text-center pixel-border">
            <Icon icon="mdi:timer-outline" className="w-8 h-8 text-cyan-300 mx-auto mb-2 animate-float" />
            <h3 className="font-semibold text-cyan-100 pixel-text">60 Minutes</h3>
            <p className="text-cyan-200 text-sm pixel-text">Complete all questions</p>
          </div>
          <div className="bg-purple-900/80 p-4 rounded-lg text-center pixel-border">
            <Icon icon="mdi:stairs-up" className="w-8 h-8 text-purple-300 mx-auto mb-2 animate-float" />
            <h3 className="font-semibold text-purple-100 pixel-text">2 Levels</h3>
            <p className="text-purple-200 text-sm pixel-text">Analysis & Solution</p>
          </div>
          <div className="bg-emerald-900/80 p-4 rounded-lg text-center pixel-border">
            <Icon icon="mdi:clipboard-list-outline" className="w-8 h-8 text-emerald-300 mx-auto mb-2 animate-float" />
            <h3 className="font-semibold text-emerald-100 pixel-text">5 Cases</h3>
            <p className="text-emerald-200 text-sm pixel-text">Random GMP Scenarios</p>
          </div>
        </div>

        {/* Game Objective */}
        <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-4 rounded-lg pixel-border animate-float mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-yellow-400 w-6 h-6" />
            <h2 className="font-semibold text-lg text-yellow-700 pixel-text">Game Objective</h2>
          </div>
          <p className="text-yellow-200 text-sm pixel-text">
            Identify the correct <strong>Violation</strong> and <strong>Root Cause</strong> for each deviation case in Level 1. 
            If successful, advance to Level 2 to choose the best <strong>Corrective Solution</strong>.
          </p>
        </div>

        {/* Scoring Table */}
        <div className="text-sm text-gray-800">
          <h3 className="font-semibold text-lg mb-2">Scoring Criteria:</h3>
          <table className="w-full text-left border border-gray-300 rounded-md overflow-hidden">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-2 border-b border-gray-300">Criteria</th>
                <th className="p-2 border-b border-gray-300">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2">Correct Violation</td><td className="p-2">1 point</td></tr>
              <tr><td className="p-2">Correct Root Cause</td><td className="p-2">1 point</td></tr>
              <tr><td className="p-2">Correct Solution (Level 2)</td><td className="p-2">1 point</td></tr>
              <tr><td className="p-2">Speed Bonus</td><td className="p-2">Top team gets bonus</td></tr>
            </tbody>
          </table>
        </div>

        {/* Tips */}
        <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="text-green-600 w-6 h-6" />
            <h2 className="font-semibold text-lg text-gray-800">Tips for Teams</h2>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Discuss as a team before locking your answers.</li>
            <li>Read each option carefully — some are red herrings.</li>
            <li>Accuracy matters more than rushing blindly.</li>
            <li>Think like a Quality Assurance auditor.</li>
          </ul>
        </div>

        {/* Start Simulation Button */}
        <div className="text-center">
          <button
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 lg:px-8 rounded-lg transition-colors duration-200 text-sm lg:text-base mt-4"
          >
            Start Simulation
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-black opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-transparent opacity-80 pixel-glow"></div>
            <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-30 blur-lg"></div>
          </div>
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 sm:p-6 w-full max-w-lg flex flex-col items-center animate-fade-in">
            <ProfileInfo
              name={user?.user_metadata?.full_name || ""}
              phone={user?.user_metadata?.phone || ""}
              teamName={user?.user_metadata?.team_name || ""}
              teamLeader={user?.user_metadata?.team_lead || ""}
              teamMembers={user?.user_metadata?.team_members ?? []}
              email={user?.email || ""}
              collegeCode={user?.user_metadata?.college_code || ""}
              joinCode={user?.user_metadata?.join_code || ""}
              onClose={() => setShowProfile(false)}
            />
            <button
              className="absolute top-3 right-5 text-blue-700 hover:text-blue-900 text-3xl font-bold"
              onClick={() => setShowProfile(false)}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructions;
