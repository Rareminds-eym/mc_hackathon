import React from "react";
import Background from '../gmp-simulation/background';
import { Factory, Clock, Trophy, AlertTriangle } from "lucide-react";

interface InstructionsProps {
  onStart: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900 flex items-center justify-center p-2 lg:p-4">
      <Background />
    <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-2xl w-full text-center">
      <div className="flex justify-center mb-6">
        <Factory className="w-12 h-12 lg:w-16 lg:h-16 text-blue-600" />
      </div>
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span role="img" aria-label="lab">🧪</span> GMP Simulation Game: Deviation Detective
        </h1>
        <div className="text-gray-700 mb-6 lg:mb-8 text-sm lg:text-base text-left mx-auto max-w-2xl space-y-3">
          <p>Test your knowledge of Good Manufacturing Practices through real-world simulation cases.</p>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="timer">⏱️</span> <span>Duration:</span></div>
          <p>You have 60 minutes to complete the simulation.</p>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="target">🎯</span> <span>Objective:</span></div>
          <p><b>Level 1: Deviation Analysis</b><br />Each team will be given 5 deviation cases randomly selected from real GMP incidents.<br />Your task is to identify:</p>
          <ul className="list-disc ml-6">
            <li>Correct Violation</li>
            <li>Correct Root Cause</li>
          </ul>
          <p>If all 5 analyses are correct within the time limit, your team advances to:</p>
          <p><b>Level 2: Corrective Solution Round</b><br />For the same 5 cases, identify the <b>Correct Solution</b> that best resolves the root cause and prevents recurrence.</p>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="clipboard">📋</span> <span>Gameplay Format:</span></div>
          <b>✅ Level 1 – Deviation Analysis</b>
          <ul className="list-disc ml-6">
            <li>You’ll be shown a table with:</li>
            <ul className="list-disc ml-6">
              <li>A Deviation Case Description</li>
              <li>Multiple Violation Options</li>
              <li>Multiple Root Cause Options</li>
            </ul>
            <li>Select the most appropriate Violation and Root Cause for each case.</li>
            <li>Accuracy + Time = Progress</li>
          </ul>
          <b>🔓 Level 2 – Corrective Solution (unlocked only if Level 1 is passed)</b>
          <ul className="list-disc ml-6">
            <li>For each of the 5 previously analyzed cases:</li>
            <li>Choose the best corrective/preventive solution from the options provided.</li>
          </ul>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="brain">🧠</span> <span>Scoring Criteria:</span></div>
          <table className="w-full text-sm mb-2 border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Criteria</th>
                <th className="border px-2 py-1">Points</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-2 py-1">Correct Violation</td><td className="border px-2 py-1">✅ 1 point</td></tr>
              <tr><td className="border px-2 py-1">Correct Root Cause</td><td className="border px-2 py-1">✅ 1 point</td></tr>
              <tr><td className="border px-2 py-1">Correct Solution</td><td className="border px-2 py-1">✅ 1 point (Level 2)</td></tr>
              <tr><td className="border px-2 py-1">Speed Bonus</td><td className="border px-2 py-1">🎉 Fastest team gets extra points</td></tr>
            </tbody>
          </table>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="gear">⚙️</span> <span>Rules:</span></div>
          <ul className="list-disc ml-6">
            <li>Each team gets one attempt per case.</li>
            <li>No backtracking after submitting your answer for a case.</li>
            <li>Use team discussion wisely — time is limited.</li>
            <li>Top teams from Level 2 may be shortlisted for prizes or special certification.</li>
          </ul>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="puzzle">🧩</span> <span>Sample Case (Preview)</span></div>
          <table className="w-full text-xs mb-2 border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Case</th>
                <th className="border px-2 py-1">Deviation</th>
                <th className="border px-2 py-1">Choose Violation</th>
                <th className="border px-2 py-1">Choose Root Cause</th>
                <th className="border px-2 py-1">Choose Solution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-2 py-1">1</td>
                <td className="border px-2 py-1">Entries written in pencil and later overwritten in blue ink</td>
                <td className="border px-2 py-1">Documentation Practices</td>
                <td className="border px-2 py-1">Operator unaware of permanent ink usage policy</td>
                <td className="border px-2 py-1">Retrain all operators on GDP</td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="trophy">🏆</span> <span>Winning Criteria:</span></div>
          <ul className="list-disc ml-6">
            <li>Teams that complete both levels accurately and quickly score higher.</li>
            <li>In case of a tie, Level 2 solution quality and submission timestamp will be used as tiebreakers.</li>
          </ul>
          <div className="flex items-center gap-2 font-semibold"><span role="img" aria-label="megaphone">📣</span> <span>Tips:</span></div>
          <ul className="list-disc ml-6">
            <li>Think like a GMP auditor!</li>
            <li>Eliminate options logically — some are traps.</li>
            <li>Prioritize accuracy over speed — but don’t delay too long.</li>
          </ul>
          <div className="font-bold text-green-700 mt-4">Ready to become a Deviation Detective?<br />Let the simulation begin!</div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <div className="bg-blue-50 p-3 lg:p-4 rounded-lg">
          <Clock className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base">60 Minutes</h3>
          <p className="text-gray-600 text-xs lg:text-sm">Complete all questions</p>
        </div>
        <div className="bg-green-50 p-3 lg:p-4 rounded-lg">
          <Trophy className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base">2 Levels</h3>
          <p className="text-gray-600 text-xs lg:text-sm">Analysis & Solution</p>
        </div>
        <div className="bg-orange-50 p-3 lg:p-4 rounded-lg">
          <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 text-sm lg:text-base">5 Cases</h3>
          <p className="text-gray-600 text-xs lg:text-sm">Random MC scenarios</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 lg:px-8 rounded-lg transition-colors duration-200 text-sm lg:text-base"
      >
        Start Simulation
      </button>
    </div>
  </div>
);

export default Instructions;
