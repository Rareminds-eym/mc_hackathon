import React from "react";

interface ProfileInfoProps {
  name: string;
  phone: string;
  teamName: string;
  teamLeader: string;
  teamMembers: string[];
  email: string;
  collegeCode: string;
  joinCode: string;
  onClose?: () => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  name,
  phone,
  teamName,
  teamLeader,
  teamMembers,
  email,
  collegeCode,
  joinCode,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-auto text-gray-800 modern-modal-container pixel-perfect">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Profile Information</h2>
      <div className="mb-2"><span className="font-semibold">Name:</span> {name || "-"}</div>
      <div className="mb-2"><span className="font-semibold">Phone:</span> {phone || "-"}</div>
      <div className="mb-2"><span className="font-semibold">Team Name:</span> {teamName || "-"}</div>
      <div className="mb-2"><span className="font-semibold">Team Leader:</span> {teamLeader || "-"}</div>
      <div className="mb-2"><span className="font-semibold">Team Members:</span> {teamMembers && teamMembers.length > 0 ? teamMembers.join(", ") : "-"}</div>
      <div className="mb-2"><span className="font-semibold">Email:</span> {email || "-"}</div>
      <div className="mb-2"><span className="font-semibold">College Code:</span> {collegeCode || "-"}</div>
      <div className="mb-2"><span className="font-semibold">Join Code:</span> {joinCode || "-"}</div>
      {onClose && (
        <button
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      )}
    </div>
  );
};

export default ProfileInfo;
