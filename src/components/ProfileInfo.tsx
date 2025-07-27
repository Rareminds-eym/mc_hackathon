import React, { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';

interface ProfileInfoProps {
  email: string;
  name?: string;
  phone?: string;
  teamName?: string;
  collegeCode?: string;
  teamLeader?: string;
  teamMembers?: string[];
  joinCode?: string; // optional, but will be fetched if not provided
  onClose: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  email,
  // password prop removed
  name,
  phone,
  teamName,
  collegeCode,
  teamLeader,
  teamMembers,
  joinCode: joinCodeProp,
  onClose,
}) => {
  const [joinCode, setJoinCode] = useState<string | undefined>(joinCodeProp);

  useEffect(() => {
    // Only fetch if not provided
    if (!joinCode && email) {
      (async () => {
        const { data, error } = await supabase
          .from('teams')
          .select('join_code')
          .eq('email', email)
          .limit(1)
          .single();
        if (!error && data && data.join_code) {
          setJoinCode(data.join_code);
        } else {
          setJoinCode(undefined);
          if (error) {
            console.log('ProfileInfo: error fetching join_code', error);
          }
        }
      })();
    }
  }, [joinCode, email]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-8 sm:p-6 w-full max-w-md flex flex-col items-center relative backdrop-blur-md transition-all duration-300">
        <h2 className="font-bold mb-6 text-white text-2xl">Profile Information</h2>
        <ul className="w-full text-left mb-4">
          <li><span className="font-semibold text-blue-900">Email:</span> <span className="text-white break-all">{email}</span></li>
          {name && <li><span className="font-semibold text-blue-900">Full Name:</span> <span className="text-white">{name}</span></li>}
          {phone && <li><span className="font-semibold text-blue-900">Phone:</span> <span className="text-white">{phone}</span></li>}
          {teamName && <li><span className="font-semibold text-blue-900">Team Name:</span> <span className="text-white">{teamName}</span></li>}
          {collegeCode && <li><span className="font-semibold text-blue-900">College Code:</span> <span className="text-white">{collegeCode}</span></li>}
          {joinCode && <li><span className="font-semibold text-blue-900">Join Code:</span> <span className="text-white">{joinCode}</span></li>}
          {teamLeader && <li><span className="font-semibold text-blue-900">Team Leader:</span> <span className="text-white">{teamLeader}</span></li>}
          {teamMembers && teamMembers.length > 0 && (
            <li><span className="font-semibold text-blue-900">Team Members:</span> <span className="text-white">{teamMembers.join(", ")}</span></li>
          )}
        </ul>
        <button
          className="absolute top-3 right-5 text-white hover:text-gray-200 text-3xl font-bold"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ProfileInfo;
