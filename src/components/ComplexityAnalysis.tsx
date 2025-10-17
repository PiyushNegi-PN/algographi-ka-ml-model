import React from 'react';
import { Clock, Database, TrendingUp, Info } from 'lucide-react';

interface ComplexityAnalysisProps {
  timeComplexity: string;
  spaceComplexity: string;
}

const ComplexityAnalysis: React.FC<ComplexityAnalysisProps> = ({
  timeComplexity,
  spaceComplexity
}) => {
  const getComplexityColor = (complexity: string) => {
    const lowerComplexity = complexity.toLowerCase();
    
    if (lowerComplexity.includes('o(1)') || lowerComplexity.includes('o(log')) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (lowerComplexity.includes('o(n)') || lowerComplexity.includes('o(n log')) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    } else if (lowerComplexity.includes('o(n²)') || lowerComplexity.includes('o(n^2)') || lowerComplexity.includes('o(n^3)')) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    } else if (lowerComplexity.includes('o(2^n)') || lowerComplexity.includes('o(n!)')) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getComplexityLevel = (complexity: string) => {
    const lowerComplexity = complexity.toLowerCase();
    
    if (lowerComplexity.includes('o(1)') || lowerComplexity.includes('o(log')) {
      return 'Excellent';
    } else if (lowerComplexity.includes('o(n)') || lowerComplexity.includes('o(n log')) {
      return 'Good';
    } else if (lowerComplexity.includes('o(n²)') || lowerComplexity.includes('o(n^2)') || lowerComplexity.includes('o(n^3)')) {
      return 'Fair';
    } else if (lowerComplexity.includes('o(2^n)') || lowerComplexity.includes('o(n!)')) {
      return 'Poor';
    } else {
      return 'Unknown';
    }
  };

  const timeColor = getComplexityColor(timeComplexity);
  const spaceColor = getComplexityColor(spaceComplexity);
  const timeLevel = getComplexityLevel(timeComplexity);
  const spaceLevel = getComplexityLevel(spaceComplexity);

  const complexityExplanations = {
    'O(1)': 'Constant time - execution time doesn\'t depend on input size',
    'O(log n)': 'Logarithmic time - very efficient, execution time grows slowly',
    'O(n)': 'Linear time - execution time grows proportionally with input size',
    'O(n log n)': 'Linearithmic time - efficient for most practical purposes',
    'O(n²)': 'Quadratic time - execution time grows with square of input size',
    'O(n³)': 'Cubic time - execution time grows with cube of input size',
    'O(2ⁿ)': 'Exponential time - execution time doubles with each additional element',
    'O(n!)': 'Factorial time - execution time grows factorially with input size'
  };

  const getExplanation = (complexity: string) => {
    const lowerComplexity = complexity.toLowerCase();
    for (const [key, explanation] of Object.entries(complexityExplanations)) {
      if (lowerComplexity.includes(key.toLowerCase())) {
        return explanation;
      }
    }
    return 'Complexity analysis varies based on implementation details';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Complexity Analysis
      </h3>

      <div className="space-y-6">
        {/* Time Complexity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Time Complexity</h4>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${timeColor}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-lg font-bold">
                {timeComplexity}
              </span>
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-white bg-opacity-50">
                {timeLevel}
              </span>
            </div>
            <p className="text-sm opacity-90">
              {getExplanation(timeComplexity)}
            </p>
          </div>
        </div>

        {/* Space Complexity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-700">Space Complexity</h4>
          </div>
          
          <div className={`p-4 rounded-lg border-2 ${spaceColor}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-lg font-bold">
                {spaceComplexity}
              </span>
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-white bg-opacity-50">
                {spaceLevel}
              </span>
            </div>
            <p className="text-sm opacity-90">
              {getExplanation(spaceComplexity)}
            </p>
          </div>
        </div>

        {/* D3 Complexity Charts */}
        <div className="mt-6 space-y-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Complexity Visualization
          </h4>
          
          {/* Time Complexity Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-700 mb-2">Time Complexity Chart</h5>
            <svg width={400} height={250}>
              <line x1={40} y1={20} x2={40} y2={220} stroke="gray" strokeWidth={1} />
              <line x1={40} y1={220} x2={380} y2={220} stroke="gray" strokeWidth={1} />
              <text x={10} y={130} transform="rotate(-90,10,130)" fill="var(--text-color)" fontSize={12}>
                Time
              </text>
              <text x={210} y={240} textAnchor="middle" fill="var(--text-color)" fontSize={12}>
                Input Size (n)
              </text>
              
              {/* Draw complexity line based on actual complexity */}
              {(() => {
                const complexity = timeComplexity.toLowerCase();
                if (complexity.includes('o(1)')) {
                  return <line x1={40} y1={200} x2={380} y2={200} stroke="green" strokeWidth={2} />;
                } else if (complexity.includes('o(log')) {
                  return <path d="M 40 220 Q 100 180 200 120 Q 300 80 380 60" stroke="green" strokeWidth={2} fill="none" />;
                } else if (complexity.includes('o(n)')) {
                  return <line x1={40} y1={220} x2={380} y2={60} stroke="yellow" strokeWidth={2} />;
                } else if (complexity.includes('o(n log')) {
                  return <path d="M 40 220 Q 100 200 200 150 Q 300 100 380 80" stroke="yellow" strokeWidth={2} fill="none" />;
                } else if (complexity.includes('o(n²)') || complexity.includes('o(n^2)')) {
                  return <path d="M 40 220 Q 100 210 200 180 Q 300 120 380 60" stroke="orange" strokeWidth={2} fill="none" />;
                } else if (complexity.includes('o(2^n)')) {
                  return <path d="M 40 220 Q 100 200 200 100 Q 300 40 380 20" stroke="red" strokeWidth={2} fill="none" />;
                } else {
                  return <line x1={40} y1={200} x2={380} y2={200} stroke="blue" strokeWidth={2} />;
                }
              })()}
              
              <text x={300} y={80} fill="var(--text-color)" fontSize={12}>
                {timeComplexity}
              </text>
            </svg>
          </div>

          {/* Space Complexity Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-700 mb-2">Space Complexity Chart</h5>
            <svg width={400} height={250}>
              <line x1={40} y1={20} x2={40} y2={220} stroke="gray" strokeWidth={1} />
              <line x1={40} y1={220} x2={380} y2={220} stroke="gray" strokeWidth={1} />
              <text x={10} y={130} transform="rotate(-90,10,130)" fill="var(--text-color)" fontSize={12}>
                Space
              </text>
              <text x={210} y={240} textAnchor="middle" fill="var(--text-color)" fontSize={12}>
                Input Size (n)
              </text>
              
              {/* Draw complexity line based on actual complexity */}
              {(() => {
                const complexity = spaceComplexity.toLowerCase();
                if (complexity.includes('o(1)')) {
                  return <line x1={40} y1={200} x2={380} y2={200} stroke="green" strokeWidth={2} />;
                } else if (complexity.includes('o(log')) {
                  return <path d="M 40 220 Q 100 180 200 120 Q 300 80 380 60" stroke="green" strokeWidth={2} fill="none" />;
                } else if (complexity.includes('o(n)')) {
                  return <line x1={40} y1={220} x2={380} y2={60} stroke="yellow" strokeWidth={2} />;
                } else if (complexity.includes('o(n log')) {
                  return <path d="M 40 220 Q 100 200 200 150 Q 300 100 380 80" stroke="yellow" strokeWidth={2} fill="none" />;
                } else if (complexity.includes('o(n²)') || complexity.includes('o(n^2)')) {
                  return <path d="M 40 220 Q 100 210 200 180 Q 300 120 380 60" stroke="orange" strokeWidth={2} fill="none" />;
                } else {
                  return <line x1={40} y1={200} x2={380} y2={200} stroke="blue" strokeWidth={2} />;
                }
              })()}
              
              <text x={300} y={80} fill="var(--text-color)" fontSize={12}>
                {spaceComplexity}
              </text>
            </svg>
          </div>
        </div>

        {/* Practical Implications */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-3">Practical Implications</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Time Complexity:</strong> Affects how long your algorithm takes to run
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Space Complexity:</strong> Affects how much memory your algorithm uses
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Big O Notation:</strong> Describes worst-case scenario performance
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Trade-offs:</strong> Sometimes you can trade time for space or vice versa
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplexityAnalysis;


