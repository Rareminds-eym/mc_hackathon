import React from "react";

const levels = [
  {
    title: "Level 1: Memory Challenge",
    objective: "Identify and recall key terms",
    bloom: "Remembering",
    format: "Bingo / Taboo / Flashcard Race",
    interface: "Interactive Games",
    description: "Get familiar with essential terminology through fast-paced memory games. Match terms, shout out answers, and race against time to build your foundational knowledge.",
    icon: "🧠"
  },
  {
    title: "Level 2: Sorting Challenge",
    objective: "Group terms by function",
    bloom: "Understanding",
    format: "Category Matching",
    interface: "Drag & Drop",
    description: "Test your comprehension by organizing terms into their proper categories. Think fast and sort accurately to unlock the next level!",
    icon: "🗂️"
  },
  {
    title: "Level 3: Process Puzzle",
    objective: "Arrange steps in order",
    bloom: "Applying",
    format: "Flow Chart Builder",
    interface: "Jigsaw Puzzle",
    description: "Put processes in motion by arranging steps in the correct sequence. Solve the puzzle to demonstrate you can apply what you've learned.",
    icon: "🧩"
  },
  {
    title: "Level 4: Detective Mode",
    objective: "Spot problems in scenarios",
    bloom: "Analyzing",
    format: "Gap Identification",
    interface: "Document Review",
    description: "Put on your detective hat! Examine scenarios closely to identify what's missing or incorrect. Your sharp eyes will uncover hidden issues.",
    icon: "🔍"
  },
  {
    title: "Level 5: Decision Simulator",
    objective: "Choose best solutions",
    bloom: "Evaluating",
    format: "Case Simulations",
    interface: "Hackathon Arena",
    description: "Step into the role of decision-maker. Analyze complex situations and choose the optimal response under pressure.",
    icon: "⚖️"
  },
  {
    title: "Level 6: Creator Studio",
    objective: "Design solutions",
    bloom: "Creating",
    format: "Capstone Project",
    interface: "Innovation Lab",
    description: "Bring all your skills together to design original solutions. This is your chance to create something new and demonstrate mastery!",
    icon: "✨"
  },
];

const InstructionsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="max-w-6xl w-full bg-white/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center border-4 border-blue-200 relative overflow-hidden">
        {/* Manual Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full mb-4 shadow-lg">
            <h1 className="text-3xl font-extrabold tracking-tight">GAME MANUAL</h1>
          </div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Learning Adventure Guide</h2>
          <p className="text-blue-700 max-w-2xl mx-auto">
            Progress through 6 levels of increasing challenge to master each module. 
            Unlock new content as you demonstrate your skills!
          </p>
        </div>

        {/* Core Levels Section */}
        <div className="w-full mb-12">
          <div className="bg-blue-100 border-l-8 border-blue-500 px-4 py-2 mb-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-blue-800">CORE LEVELS (1-4)</h3>
            <p className="text-blue-700">Available in all standard modules</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.slice(0, 4).map((level, idx) => (
              <div key={level.title} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-blue-600 p-4 flex items-center">
                  <span className="text-3xl mr-3">{level.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{level.title}</h3>
                    <p className="text-blue-100 text-sm">{level.bloom} Level</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-blue-800 text-sm">YOUR MISSION:</h4>
                    <p className="text-blue-900">{level.objective}</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-semibold text-blue-800 text-sm">GAME TYPE:</h4>
                    <p className="text-blue-900">{level.format}</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-semibold text-blue-800 text-sm">HOW TO PLAY:</h4>
                    <p className="text-blue-900 italic">{level.description}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center text-sm text-blue-700 font-medium">
                    Unlocks after completing Level {idx}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Levels Section */}
        <div className="w-full">
          <div className="bg-purple-100 border-l-8 border-purple-500 px-4 py-2 mb-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-purple-800">ADVANCED LEVELS (5-6)</h3>
            <p className="text-purple-700">Special challenge modules</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {levels.slice(4).map((level, idx) => (
              <div key={level.title} className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="bg-purple-600 p-4 flex items-center">
                  <span className="text-3xl mr-3">{level.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{level.title}</h3>
                    <p className="text-purple-100 text-sm">{level.bloom} Level</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-800 text-sm">YOUR MISSION:</h4>
                    <p className="text-purple-900">{level.objective}</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-800 text-sm">GAME TYPE:</h4>
                    <p className="text-purple-900">{level.format}</p>
                  </div>
                  <div className="mb-3">
                    <h4 className="font-semibold text-purple-800 text-sm">HOW TO PLAY:</h4>
                    <p className="text-purple-900 italic">{level.description}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center text-sm text-purple-700 font-medium">
                    Requires completion of Level 4 + Instructor Approval
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tips Section */}
        <div className="mt-12 w-full bg-yellow-50 border-l-8 border-yellow-400 rounded-r-lg p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-3 flex items-center">
            <span className="mr-2">💡</span> PRO TIPS
          </h3>
          <ul className="space-y-2 text-yellow-900">
            <li className="flex items-start">
              <span className="mr-2">🏆</span> Complete levels in order to build your skills progressively
            </li>
            <li className="flex items-start">
              <span className="mr-2">⏱️</span> Some games are timed - practice to improve your speed
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔄</span> Replay levels to improve your scores
            </li>
            <li className="flex items-start">
              <span className="mr-2">👥</span> Team up with classmates for advanced levels
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help? Contact your instructor or visit the in-game help center.</p>
          <p className="mt-2 text-xs">© 2023 Learning Adventure Game | Version 2.1</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -m-16 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full -m-24 opacity-20"></div>
      </div>
    </div>
  );
};

export default InstructionsPage;