import React, { useEffect, useState, useRef } from "react";
// Modern, accessible Popup component
const Popup: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  // Trap focus inside popup
  const okButtonRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    okButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadein">
      <div
        className="bg-gray-900 rounded-2xl shadow-2xl px-8 py-7 max-w-sm w-full text-center relative border border-gray-800 animate-pop"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center">
          <div className="mb-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto">
              <circle cx="12" cy="12" r="12" fill="#2563eb" fillOpacity="0.18" />
              <path d="M12 8v4m0 4h.01" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mb-5 text-gray-100 text-lg font-medium" style={{wordBreak:'break-word'}}>{message}</div>
          <button
            ref={okButtonRef}
            className="bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none text-white font-semibold py-2 px-8 rounded-lg text-base shadow transition-all duration-150"
            onClick={onClose}
          >
            OK
          </button>
        </div>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-blue-400 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close popup"
          tabIndex={-1}
          type="button"
        >
          ×
        </button>
      </div>
      <style>{`
        .animate-fadein { animation: fadein 0.2s; }
        .animate-pop { animation: pop 0.18s cubic-bezier(.4,2,.6,1) ; }
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pop { 0% { transform: scale(0.92); opacity:0.7; } 100% { transform: scale(1); opacity:1; } }
      `}</style>
    </div>
  );
};
import { supabase } from '../lib/supabase';
import { collegeCodes as collegeCodeList } from '../data/collegeCodes';

interface ProfileInfoProps {
  email: string;
  onClose: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  email,
  onClose,
}) => {
  // Popup state must be inside the component
  const [popup, setPopup] = useState<{ message: string } | null>(null);
  const [joinCode, setJoinCode] = useState<string | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    teamName: '',
    collegeCode: '',
    teamLeader: '',
    teamMembers: [] as string[],
  });
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    teamName: '',
    collegeCode: '',
    isTeamLeader: null as null | boolean,
    joinCode: '',
  });
  const [loading, setLoading] = useState(true);
  
  // College code dropdown logic (same as signup)
  const collegeCodes = collegeCodeList.map(code => ({ code }));
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const collegeInputRef = useRef<HTMLInputElement>(null);
  const filteredColleges = collegeSearch.trim() === '' ? [] : collegeCodes.filter(c =>
    c.code.toLowerCase().includes(collegeSearch.trim().toLowerCase())
  );

  useEffect(() => {
    // Fetch complete profile data from Supabase teams table only
    const fetchProfileData = async () => {
      if (!email) return;
      
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('email', email)
          .limit(1)
          .single();

        if (!error && data) {
          const fetchedData = {
            name: data.full_name || '',
            phone: data.phone || '',
            teamName: data.team_name || '',
            collegeCode: data.college_code || '',
            teamLeader: '', // Will be populated from team leader lookup if needed
            teamMembers: [] as string[], // Will be populated from team members lookup if needed
          };
          
          setProfileData(fetchedData);
          setJoinCode(data.join_code);
          
          // Set edit data only for missing fields
          setEditData({
            name: fetchedData.name || '',
            phone: fetchedData.phone || '',
            teamName: fetchedData.teamName || '',
            collegeCode: fetchedData.collegeCode || '',
            isTeamLeader: data.is_team_leader !== undefined ? data.is_team_leader : null,
            joinCode: '',
          });
          
          // Set college search for dropdown
          setCollegeSearch(fetchedData.collegeCode || '');
        } else {
          console.log('ProfileInfo: No profile data found in teams table', error);
          // Initialize empty profile data if no record found
          setProfileData({
            name: '',
            phone: '',
            teamName: '',
            collegeCode: '',
            teamLeader: '',
            teamMembers: [],
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [email]);

  // Check if any important data is missing
  const hasMissingData = !profileData.name || !profileData.phone || !profileData.teamName || !profileData.collegeCode;
  
  // Debug log to see what data we have
  console.log('ProfileInfo data:', { profileData, hasMissingData });

  const validateForm = () => {
    if (!profileData.name && !editData.name.trim()) {
      setPopup({ message: 'Please enter your full name' });
      return false;
    }
    if (!profileData.phone && !editData.phone.trim()) {
      setPopup({ message: 'Please enter your phone number' });
      return false;
    }
    if (!profileData.phone && editData.phone && !/^\d{10}$/.test(editData.phone.trim())) {
      setPopup({ message: 'Please enter a valid 10-digit phone number' });
      return false;
    }
    if (editData.isTeamLeader === null) {
      setPopup({ message: 'Please specify if you are the team leader' });
      return false;
    }
    if (editData.isTeamLeader) {
      // Team leader: must provide team name and college code
      if (!profileData.teamName && !editData.teamName.trim()) {
        setPopup({ message: 'Please enter your team name' });
        return false;
      }
      if (!profileData.collegeCode && !editData.collegeCode.trim()) {
        setPopup({ message: 'Please enter your college code' });
        return false;
      }
      // Validate college code against the list
      const validCollegeCodes = collegeCodes.map(c => c.code.toLowerCase());
      if (!profileData.collegeCode && !validCollegeCodes.includes(editData.collegeCode.trim().toLowerCase())) {
        setPopup({ message: 'College code not found. Contact HelpDesk for assistance.' });
        return false;
      }
    } else {
      // Team member: must provide join code
      if (!editData.joinCode.trim()) {
        setPopup({ message: 'Please enter the join code provided by your team leader' });
        return false;
      }
    }
    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    try {
      console.log('Starting save profile with email:', email);
      console.log('Edit data:', editData);
      
      // Get current user ID from Supabase auth (for potential future use)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setPopup({ message: 'Authentication error. Please log in again.' });
        return;
      }
      
      console.log('Current user ID:', user.id);
      
      // Check if user exists in teams table by email (since user_id is null)
      const { data: existingUser, error: checkError } = await supabase
        .from('teams')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single();
        
      console.log('Existing user check by email:', { existingUser, checkError, recordExists: !!existingUser });
      
      if (editData.isTeamLeader === false) {
        // Team member: join with code
        const joinCodeInput = editData.joinCode.trim().toUpperCase();
        console.log('Looking for team with join code:', joinCodeInput);
        
        const { data: teamRows, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('join_code', joinCodeInput);
          
        if (teamError) {
          console.error('Team lookup error:', teamError);
          setPopup({ message: 'Error finding team. Please try again.' });
          return;
        }
        if (!teamRows || teamRows.length === 0) {
          setPopup({ message: 'Invalid join code. Please check with your team leader.' });
          return;
        }
        
        const team = teamRows[0];
        console.log('Found team:', team);
        
        // Prepare data for team member
        const memberData: any = {
          email: email,
          user_id: user.id,
          full_name: editData.name || profileData.name,
          phone: editData.phone || profileData.phone,
          team_name: team.team_name,
          college_code: team.college_code,
          join_code: team.join_code,
          session_id: team.session_id,
          is_team_leader: false,
        };
        
        console.log('Member data to save:', memberData);

        let saveResult;
        if (existingUser) {
          // Update existing record (email exists in table)
          console.log('Updating existing record for email:', email);
          const { data, error } = await supabase
            .from('teams')
            .update(memberData)
            .eq('email', email)
            .select();
          saveResult = { data, error };
        } else {
          // Insert new record (email not found in table)
          console.log('Inserting new record for email:', email);
          const { data, error } = await supabase
            .from('teams')
            .insert([memberData])
            .select();
          saveResult = { data, error };
        }

        if (saveResult.error) {
          console.error('Save error:', saveResult.error);
          setPopup({ message: 'Failed to join team: ' + saveResult.error.message });
          return;
        }
        
        console.log('Save successful:', saveResult.data);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          name: memberData.full_name || prev.name,
          phone: memberData.phone || prev.phone,
          teamName: team.team_name,
          collegeCode: team.college_code,
        }));
        setJoinCode(team.join_code);
        
      } else {
        // Team leader: update own info
        const teamName = editData.teamName || profileData.teamName;
        const collegeCode = editData.collegeCode || profileData.collegeCode;
        
        // Generate join code if new team leader
        let joinCodeToUse = existingUser?.join_code;
        let sessionIdToUse = existingUser?.session_id;
        
        if (!existingUser || !existingUser.join_code) {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          joinCodeToUse = code;
          sessionIdToUse = crypto.randomUUID();
        }
        
        // Prepare data for team leader
        const leaderData: any = {
          email: email,
          user_id: user.id,
          full_name: editData.name || profileData.name,
          phone: editData.phone || profileData.phone,
          team_name: teamName,
          college_code: collegeCode,
          is_team_leader: true,
          join_code: joinCodeToUse,
          session_id: sessionIdToUse,
        };
        
        console.log('Leader data to save:', leaderData);

        let saveResult;
        if (existingUser) {
          // Update existing record (email exists in table)
          console.log('Updating existing record for email:', email);
          const { data, error } = await supabase
            .from('teams')
            .update(leaderData)
            .eq('email', email)
            .select();
          saveResult = { data, error };
        } else {
          // Insert new record (email not found in table)
          console.log('Inserting new record for email:', email);
          const { data, error } = await supabase
            .from('teams')
            .insert([leaderData])
            .select();
          saveResult = { data, error };
        }

        if (saveResult.error) {
          console.error('Save error:', saveResult.error);
          setPopup({ message: 'Failed to update profile: ' + saveResult.error.message });
          return;
        }
        
        console.log('Save successful:', saveResult.data);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          name: leaderData.full_name || prev.name,
          phone: leaderData.phone || prev.phone,
          teamName: leaderData.team_name || prev.teamName,
          collegeCode: leaderData.college_code || prev.collegeCode,
        }));
        
        if (leaderData.join_code) {
          setJoinCode(leaderData.join_code);
        }
      }

  setPopup({ message: 'Profile updated successfully!' });
  setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setPopup({ message: 'Failed to update profile. Please try again.' });
    }
  };

  return (
    <>
      {popup && <Popup message={popup.message} onClose={() => setPopup(null)} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-8 sm:p-6 w-full max-w-md flex flex-col items-center relative backdrop-blur-md transition-all duration-300">
        <h2 className="font-bold mb-6 text-white text-2xl">
          {isEditing ? 'Edit Profile' : 'Profile Information'}
        </h2>

        {loading ? (
          <div className="text-white text-center">Loading profile...</div>
        ) : !isEditing ? (
          <>
            <ul className="w-full text-left mb-4">
              <li><span className="font-semibold text-blue-900">Email:</span> <span className="text-white break-all">{email}</span></li>
              <li>
                <span className="font-semibold text-blue-900">Full Name:</span>
                <span className="text-white">{profileData.name || <span className="text-red-200 italic">Not provided</span>}</span>
              </li>
              <li>
                <span className="font-semibold text-blue-900">Phone:</span>
                <span className="text-white">{profileData.phone || <span className="text-red-200 italic">Not provided</span>}</span>
              </li>
              <li>
                <span className="font-semibold text-blue-900">Team Name:</span>
                <span className="text-white">{profileData.teamName || <span className="text-red-200 italic">Not provided</span>}</span>
              </li>
              <li>
                <span className="font-semibold text-blue-900">College Code:</span>
                <span className="text-white">{profileData.collegeCode || <span className="text-red-200 italic">Not provided</span>}</span>
              </li>
              {joinCode && <li><span className="font-semibold text-blue-900">Join Code:</span> <span className="text-white">{joinCode}</span></li>}
              {profileData.teamLeader && <li><span className="font-semibold text-blue-900">Team Leader:</span> <span className="text-white">{profileData.teamLeader}</span></li>}
              {profileData.teamMembers && profileData.teamMembers.length > 0 && (
                <li><span className="font-semibold text-blue-900">Team Members:</span> <span className="text-white">{profileData.teamMembers.join(", ")}</span></li>
              )}
            </ul>

            {hasMissingData && (
              <div className="w-full mb-4">
                <p className="text-red-200 text-sm mb-2 text-center">Some information is missing from your profile.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full space-y-4">
            <p className="text-blue-900 font-semibold text-center mb-4">Complete your missing information:</p>
            
            {!profileData.name && (
              <div>
                <label className="block text-blue-900 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {!profileData.phone && (
              <div>
                <label className="block text-blue-900 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-600">+91</span>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>
            )}

            {/* Are you the team leader? Yes/No */}
            <div className="flex flex-col gap-2">
              <label className="block text-blue-900 font-semibold mb-1">Are you the team leader?</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border font-medium focus:outline-none transition-colors duration-150 ${
                    editData.isTeamLeader === true 
                      ? 'bg-blue-600 text-white border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setEditData({ ...editData, isTeamLeader: true, joinCode: '' })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md border font-medium focus:outline-none transition-colors duration-150 ${
                    editData.isTeamLeader === false 
                      ? 'bg-blue-600 text-white border-blue-700' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setEditData({ ...editData, isTeamLeader: false, teamName: '', collegeCode: '' })}
                >
                  No
                </button>
              </div>
            </div>

            {/* Team Leader Fields */}
            {editData.isTeamLeader && (
              <>
                {!profileData.teamName && (
                  <div>
                    <label className="block text-blue-900 font-semibold mb-1">Team Name</label>
                    <input
                      type="text"
                      value={editData.teamName}
                      onChange={(e) => setEditData({ ...editData, teamName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your team name"
                    />
                  </div>
                )}

                {!profileData.collegeCode && (
                  <div>
                    <label className="block text-blue-900 font-semibold mb-1">College Code</label>
                    <div className="relative">
                      <input
                        ref={collegeInputRef}
                        type="text"
                        autoComplete="off"
                        value={collegeSearch}
                        onChange={(e) => {
                          setCollegeSearch(e.target.value);
                          setShowCollegeDropdown(true);
                          setEditData({ ...editData, collegeCode: e.target.value });
                        }}
                        onFocus={() => setShowCollegeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 150)}
                        className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search college code or name"
                      />
                      {/* Dropdown list for college codes */}
                      {showCollegeDropdown && filteredColleges.length > 0 && (
                        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {filteredColleges.map(college => (
                            <li
                              key={college.code}
                              className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-gray-700 text-sm"
                              onMouseDown={() => {
                                setEditData({ ...editData, collegeCode: college.code });
                                setCollegeSearch(college.code);
                                setShowCollegeDropdown(false);
                                setTimeout(() => { collegeInputRef.current?.blur(); }, 100);
                              }}
                            >
                              <span className="font-semibold">{college.code}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Team Member Fields */}
            {editData.isTeamLeader === false && (
              <div>
                <label className="block text-blue-900 font-semibold mb-1">Join Code</label>
                <input
                  type="text"
                  value={editData.joinCode}
                  onChange={(e) => setEditData({ ...editData, joinCode: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter join code from team leader"
                  maxLength={6}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
        </>
      );
    }

    export default ProfileInfo;