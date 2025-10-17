import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { searchAlgorithm, AlgorithmData } from './utils/gemini';
import AlgorithmVisualizer from './components/AlgorithmVisualizer';
import StepByStepDisplay from './components/StepByStepDisplay';
import ComplexityAnalysis from './components/ComplexityAnalysis';
import PseudocodeDisplay from './components/PseudocodeDisplay';
import AudioExplanation from './components/AudioExplanation';

function App() {
  const [query, setQuery] = useState('');
  const [customArray, setCustomArray] = useState('');
  const [loading, setLoading] = useState(false);
  const [algorithmData, setAlgorithmData] = useState<AlgorithmData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true); 
    setError(null);
    setAlgorithmData(null);
    setCurrentStep(0);

    try {
      // Create enhanced query with custom array/graph if provided
      let enhancedQuery = query;
      if (customArray.trim()) {
        // Check if it's a graph format (contains - or , with letters)
        if (customArray.includes('-') || /[A-Za-z]/.test(customArray)) {
          // Graph format
          enhancedQuery = `${query} with graph ${customArray}`;
        } else {
          // Array format
          const arrayValues = customArray.split(',').map(val => val.trim()).filter(val => val);
          const numbers = arrayValues.map(val => parseInt(val)).filter(num => !isNaN(num));
          
          if (numbers.length > 0) {
            enhancedQuery = `${query} with array [${numbers.join(', ')}]`;
          }
        }
      }
      
      const data = await searchAlgorithm(enhancedQuery);
      setAlgorithmData(data);
    } catch (err) {
      setError('Failed to fetch algorithm data. Please check your API key and try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            DSA Algorithm Visualizer
          </h1>
          <p className="text-gray-600">
            Search for algorithms in natural language and visualize them step by step
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Algorithm Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Algorithm name... (e.g., 'bubble sort', 'quick sort', 'binary search')"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
            
            {/* Custom Array Input */}
            <div className="relative">
              <input
                type="text"
                value={customArray}
                onChange={(e) => setCustomArray(e.target.value)}
                placeholder="Custom data... (e.g., '4,2,3,2,1' for arrays or 'A-B-C-D' for graphs)"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'Generating...' : 'Visualize Algorithm'}
            </button>
          </div>

          {/* Example queries */}
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">Try these examples:</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Algorithm Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'bubble sort',
                    'quick sort', 
                    'merge sort',
                    'insertion sort',
                    'binary search',
                    'linear search',
                    'BFS',
                    'DFS',
                    'Bellman Ford',
                    'Floyd Warshall',
                    'Dijkstra',
                    'Kruskal',
                    'singly linked list',
                    'doubly linked list',
                    'circular linked list'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setQuery(example)}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Array Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    '4,2,3,2,1',
                    '10,5,8,3,1',
                    '7,3,9,2,5',
                    '1,2,3,4,5',
                    '5,4,3,2,1'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setCustomArray(example)}
                      className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors"
                    >
                      [{example}]
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Graph Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'A-B-C-D',
                    '1-2-3-4-5',
                    'A-B,A-C,B-D,C-E',
                    '1-2,2-3,3-4,4-1',
                    'A-B-5,A-C-3,B-D-2,C-D-1'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setCustomArray(example)}
                      className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Adjacency List: {`{nodeA: [1,2], nodeB: [0,3]}`}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Linked List Examples:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'singly linked list',
                    'doubly linked list', 
                    'circular linked list',
                    'linked list traversal',
                    'linked list insertion'
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setQuery(example)}
                      className="px-3 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nodes: {`[{value: 1, id: "node1"}, {value: 2, id: "node2"}]`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}


        {/* Algorithm Display */}
        {algorithmData && (
          <div className="space-y-8">
            {/* Algorithm Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {algorithmData.name}
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                {algorithmData.description}
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Visualization */}
              <div className="space-y-6">
                <AlgorithmVisualizer 
                  data={algorithmData.visualizationData}
                  currentStep={currentStep}
                />
                <StepByStepDisplay 
                  steps={algorithmData.steps}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                />
                <AudioExplanation 
                  algorithmData={algorithmData}
                />
              </div>

              {/* Right Column - Analysis */}
              <div className="space-y-6">
                <ComplexityAnalysis 
                  timeComplexity={algorithmData.timeComplexity}
                  spaceComplexity={algorithmData.spaceComplexity}
                />
                <PseudocodeDisplay 
                  pseudocode={algorithmData.pseudocode}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
