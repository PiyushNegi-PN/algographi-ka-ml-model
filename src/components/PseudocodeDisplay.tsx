import React, { useState } from 'react';
import { Copy, Check, Code, Eye, EyeOff } from 'lucide-react';

interface PseudocodeDisplayProps {
  pseudocode: string;
}

const PseudocodeDisplay: React.FC<PseudocodeDisplayProps> = ({ pseudocode }) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pseudocode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatPseudocode = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Determine line type for syntax highlighting
      let lineClass = 'text-gray-800';
      let bgClass = '';
      
      if (trimmedLine.startsWith('function') || trimmedLine.startsWith('procedure') || trimmedLine.startsWith('algorithm')) {
        lineClass = 'text-blue-600 font-semibold';
        bgClass = 'bg-blue-50';
      } else if (trimmedLine.startsWith('if') || trimmedLine.startsWith('else') || trimmedLine.startsWith('while') || trimmedLine.startsWith('for') || trimmedLine.startsWith('do')) {
        lineClass = 'text-green-600 font-semibold';
        bgClass = 'bg-green-50';
      } else if (trimmedLine.startsWith('return') || trimmedLine.startsWith('end') || trimmedLine.startsWith('exit')) {
        lineClass = 'text-red-600 font-semibold';
        bgClass = 'bg-red-50';
      } else if (trimmedLine.includes('=') || trimmedLine.includes('←') || trimmedLine.includes(':')) {
        lineClass = 'text-purple-600';
        bgClass = 'bg-purple-50';
      } else if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('#')) {
        lineClass = 'text-gray-500 italic';
        bgClass = 'bg-gray-50';
      }

      return (
        <div
          key={index}
          className={`flex items-start gap-3 py-1 px-2 rounded ${bgClass}`}
        >
          {showLineNumbers && (
            <span className="text-gray-400 text-sm font-mono select-none w-8 text-right">
              {index + 1}
            </span>
          )}
          <pre className={`flex-1 text-sm font-mono leading-relaxed ${lineClass}`}>
            {line}
          </pre>
        </div>
      );
    });
  };

  const getPseudocodeStructure = (code: string) => {
    const structure = {
      functions: 0,
      loops: 0,
      conditionals: 0,
      assignments: 0,
      comments: 0
    };

    const lines = code.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('function') || trimmed.startsWith('procedure') || trimmed.startsWith('algorithm')) {
        structure.functions++;
      } else if (trimmed.startsWith('for') || trimmed.startsWith('while') || trimmed.startsWith('do')) {
        structure.loops++;
      } else if (trimmed.startsWith('if') || trimmed.startsWith('else')) {
        structure.conditionals++;
      } else if (trimmed.includes('=') || trimmed.includes('←') || trimmed.includes(':')) {
        structure.assignments++;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('#')) {
        structure.comments++;
      }
    });

    return structure;
  };

  const structure = getPseudocodeStructure(pseudocode);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Code className="w-6 h-6" />
          Pseudocode
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
          >
            {showLineNumbers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
            title="Copy pseudocode"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Pseudocode Structure Stats */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Code Structure:</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{structure.functions} functions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{structure.loops} loops</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>{structure.conditionals} conditions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>{structure.assignments} assignments</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span>{structure.comments} comments</span>
          </div>
        </div>
      </div>

      {/* Pseudocode Display */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600 font-mono">pseudocode.txt</span>
          </div>
        </div>
        
        <div className="bg-white max-h-96 overflow-y-auto">
          {formatPseudocode(pseudocode)}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Syntax Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
            <span className="text-blue-600">Functions/Procedures</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border border-green-300 rounded"></div>
            <span className="text-green-600">Control Structures</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 border border-red-300 rounded"></div>
            <span className="text-red-600">Return/Exit Statements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-50 border border-purple-300 rounded"></div>
            <span className="text-purple-600">Assignments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-50 border border-gray-300 rounded"></div>
            <span className="text-gray-500">Comments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
            <span className="text-gray-800">Regular Code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PseudocodeDisplay;


