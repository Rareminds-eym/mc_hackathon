import React from 'react';
import { Trophy, Award, Target, ArrowLeft } from 'lucide-react';
import { UserProfile } from './types/GameData';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

interface UserProfileHeaderProps {
  profile: UserProfile;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ profile }) => {
  const progressPercentage = (profile.completedModules / profile.totalModules) * 100;
  const { user } = useAuth(); // Get user from auth context

  // Use user?.user_metadata?.full_name || user?.email || 'Player' for name
  const displayName = user?.user_metadata?.full_name || user?.email || 'Player';

  return (
    <>
      {/* Desktop Back Button (above header card) */}
      <button
        className="hidden md:flex items-center justify-center  rounded-full shadow-lg w-10 h-10 mb-2 text-white hover:scale-105 transition-transform focus:outline-none border-3 border-white/30"
        aria-label="Back"
        onClick={() => window.history.back()}
        type="button"
        style={{ alignSelf: 'flex-start' }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      <div className=" border border-gray-200 rounded-2xl text-white shadow-2xl p-4 mb-4 mobile-portrait:p-2 mobile-portrait:mb-2 mobile-portrait:rounded-lg mobile-landscape:p-1.5 mobile-landscape:mb-1 mobile-landscape:rounded-md">
        <div className="flex items-center justify-between mobile-portrait:flex-col mobile-portrait:space-y-2 mobile-landscape:flex-row mobile-landscape:space-y-0">
          {/* Mobile Back Button (inside header card) */}
          <button
            className="flex md:hidden items-center justify-center  rounded-full shadow-lg w-10 h-10 mb-2 text-white hover:scale-105 transition-transform focus:outline-none border-4 border-white/30 mobile-portrait:w-8 mobile-portrait:h-8 mobile-portrait:mb-1 mobile-landscape:w-6 mobile-landscape:h-6 mobile-landscape:mb-1"
            aria-label="Back"
            onClick={() => window.history.back()}
            type="button"
            style={{ alignSelf: 'flex-start' }}
          >
            <ArrowLeft className="w-5 h-5 mobile-portrait:w-4 mobile-portrait:h-4 mobile-landscape:w-3 mobile-landscape:h-3 text-white" />
          </button>
          {/* User Info Section */}
          <div className="flex items-center space-x-2 mobile-portrait:space-x-1 mobile-landscape:space-x-1">
            <div className="bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm w-10 h-10 mobile-portrait:w-8 mobile-portrait:h-8 mobile-portrait:text-lg mobile-landscape:w-6 mobile-landscape:h-6 mobile-landscape:text-base">
              {profile.avatar}
            </div>
            <div>
              <h1 className="font-bold text-lg mobile-portrait:text-base mobile-landscape:text-sm">{displayName}</h1>
              <p className="text-purple-100 text-xs mobile-portrait:text-xs mobile-landscape:text-xs">Level {profile.level} • {profile.rank}</p>
            </div>
          </div>
          {/* Stats Section */}
          <div className="flex items-center space-x-4 mobile-portrait:flex-row mobile-portrait:space-x-2 mobile-landscape:space-x-1">
            {/* Total Score */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-0.5">
                <Trophy className="text-yellow-300 w-4 h-4 mobile-portrait:w-3 mobile-portrait:h-3 mobile-landscape:w-2 mobile-landscape:h-2" />
                <span className="font-bold text-base mobile-portrait:text-sm mobile-landscape:text-xs">{profile.totalScore.toLocaleString()}</span>
              </div>
              <p className="text-purple-100 text-xs mobile-portrait:text-xs mobile-landscape:text-xs">Total Score</p>
            </div>
            {/* Completed Modules */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-0.5">
                <Award className="text-green-300 w-4 h-4 mobile-portrait:w-3 mobile-portrait:h-3 mobile-landscape:w-2 mobile-landscape:h-2" />
                <span className="font-bold text-base mobile-portrait:text-sm mobile-landscape:text-xs">{profile.completedModules}</span>
              </div>
              <p className="text-purple-100 text-xs mobile-portrait:text-xs mobile-landscape:text-xs">Completed</p>
            </div>
            {/* Progress Bar */}
            <div className="text-center min-w-[60px] mobile-portrait:min-w-[40px] mobile-landscape:min-w-[30px]">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Target className="text-blue-300 w-4 h-4 mobile-portrait:w-3 mobile-portrait:h-3 mobile-landscape:w-2 mobile-landscape:h-2" />
                <span className="font-semibold text-xs mobile-portrait:text-xs mobile-landscape:text-xs">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full backdrop-blur-sm h-1 mobile-portrait:h-0.5 mobile-landscape:h-0.5">
                <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000 ease-out h-1 mobile-portrait:h-0.5 mobile-landscape:h-0.5" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};