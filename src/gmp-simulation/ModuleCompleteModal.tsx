import React from 'react';
import jsPDF from 'jspdf';
import { CheckCircle, Clock, ChevronRight, Target, ExternalLink, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeviceLayout } from '../hooks/useOrientation';

interface Scenario {
  caseFile: string;
  violation: string;
  rootCause: string;
  solution: string;
}

interface ModuleCompleteModalProps {
  level1CompletionTime: number;
  onProceed: () => void;
  scenarios: Scenario[];
}

export const ModuleCompleteModal: React.FC<ModuleCompleteModalProps> = ({
  level1CompletionTime,
  onProceed,
  scenarios
}) => {
  // PDF generation handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Times', 'normal');
    doc.setFontSize(16);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 28;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const title = 'Level 1: Attempted Scenarios';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, margin);
  let y = margin + 20;
    scenarios.forEach((sc, idx) => {
      doc.setFontSize(12);
      doc.text(`${idx + 1}.`, margin, y);
      doc.setFontSize(11);
      doc.text('Case:', margin + 12, y);
      doc.setFont('Times', 'bold');
      // Normalize hyphens to prevent extra spacing (replace non-breaking and en/em dashes with standard hyphen)
      const normalizedCase = sc.caseFile.replace(/[\u2010-\u2015\u2212\u00AD\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D]/g, '-');
      const caseLines = doc.splitTextToSize(normalizedCase, usableWidth - 32);
      caseLines.forEach((line: string, i: number) => {
        doc.text(line, margin + 32, y + i * 8, { maxWidth: usableWidth - 32, align: 'justify' });
      });
      y += 8 * caseLines.length + 16;
      doc.setFont('Times', 'normal');
      if (y > margin + usableHeight - 10) {
        doc.addPage();
        y = margin + 8;
      }
    });
    doc.save('Level1_Scenarios.pdf');
  };
  const navigate = useNavigate();
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">

      <div className={`pixel-border-thick bg-gray-800 w-full text-center relative overflow-hidden animate-slideIn my-auto ${isMobileHorizontal ? 'max-w-4xl p-4' : 'max-w-2xl p-6'
        }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header with Icon */}
          <div className={`pixel-border bg-gradient-to-r from-green-600 to-emerald-600 -mx-4 -mt-4 mb-3 ${isMobileHorizontal ? 'p-2' : 'p-3 mb-4 -mx-6 -mt-6'
            }`}>
            <div className={`flex items-center justify-center space-x-2 ${isMobileHorizontal ? 'mb-1' : 'mb-2'
              }`}>
              <div className={`bg-green-500 pixel-border flex items-center justify-center ${isMobileHorizontal ? 'w-6 h-6' : 'w-8 h-8'
                }`}>
                <CheckCircle className={`text-green-900 ${isMobileHorizontal ? 'w-4 h-4' : 'w-5 h-5'
                  }`} />
              </div>
              <h2 className={`font-black text-green-100 pixel-text flex items-center justify-center gap-2 ${isMobileHorizontal ? 'text-base' : 'text-lg'
                }`}>
                Level 1 Submission Complete! <span className={`animate-bounce ${isMobileHorizontal ? 'text-lg' : 'text-xl'}`}>🎉</span>
              </h2>
            </div>
          </div>

          {/* Main Message */}
          <div className={`pixel-border bg-gradient-to-r from-blue-900 to-indigo-800 mb-3 text-left ${isMobileHorizontal ? 'p-2' : 'p-3 mb-4'
            }`}>
            <p className={`text-blue-100 font-bold pixel-text ${isMobileHorizontal ? 'text-xs mb-2' : 'text-sm mb-3'
              }`}>
              Great work! Your Hackathon Level-1 is been successfully submitted for evaluation.
            </p>

            <div className={`pixel-border bg-gradient-to-r from-teal-700 to-teal-600 mb-2 ${isMobileHorizontal ? 'p-2' : 'p-3 mb-3'
              }`}>
              <h3 className={`text-teal-100 font-black pixel-text flex items-center gap-1 ${isMobileHorizontal ? 'text-xs mb-1' : 'text-sm mb-2'
                }`}>
                📌 What's Next?
              </h3>
              <ul className={`text-teal-100 pixel-text space-y-1 ${isMobileHorizontal ? 'text-xs leading-tight' : 'text-xs'
                }`}>
                <li>• Results will be announced on 18th August 2025 3PM</li>
                <li>• Check the results at: <a href="https://rareminds.in/hackathons" target="_blank" rel="noopener noreferrer" className="text-yellow-300 font-bold hover:text-yellow-200 underline">https://rareminds.in/hackathons</a></li>
                <li>• While you wait, start thinking of solutions and ideas for any one of your problem statements—you'll need this for Level 2</li>
              </ul>
            </div>

            <div className={`pixel-border bg-gradient-to-r from-yellow-800 to-orange-700 ${isMobileHorizontal ? 'p-2' : 'p-3'
              }`}>
              <h3 className={`text-yellow-100 font-black pixel-text flex items-center gap-1 ${isMobileHorizontal ? 'text-xs mb-1' : 'text-sm mb-2'
                }`}>
                💡 Tip:
              </h3>
              <p className={`text-yellow-100 pixel-text ${isMobileHorizontal ? 'text-xs leading-tight' : 'text-xs'
                }`}>

                Focus on practical, innovative solutions that can make your idea stand out in the next round!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              className={`pixel-border bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black pixel-text transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg ${isMobileHorizontal ? 'py-1 px-3 text-xs' : 'py-2 px-4 text-sm'
                }`}
            >
                <Download className="w-4 h-4 animate-pulse" />
              <span>
                Click to Download Attempted Scenarios
              </span>
              <ChevronRight className={isMobileHorizontal ? 'w-3 h-3' : 'w-4 h-4'} />
            </button>

            <button
              onClick={() => navigate('/home')}
              className={`pixel-border bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black pixel-text transition-all duration-200 flex items-center space-x-2 transform hover:scale-105 shadow-lg ${isMobileHorizontal ? 'py-1 px-3 text-xs' : 'py-2 px-4 text-sm'
                }`}
            >
              <span>Home</span>
            </button>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className={`absolute top-2 right-2 bg-green-500 rounded-full animate-ping ${isMobileHorizontal ? 'w-2 h-2' : 'w-3 h-3'
          }`}></div>
        <div className={`absolute bottom-2 left-2 bg-blue-500 rounded-full animate-ping ${isMobileHorizontal ? 'w-2 h-2' : 'w-3 h-3'
          }`} style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};