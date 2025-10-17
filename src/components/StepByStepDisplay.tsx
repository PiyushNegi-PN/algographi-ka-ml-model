import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { AlgorithmStep } from '../utils/gemini';
import { speak, stopSpeaking } from '../utils/AudioUtils';

interface StepByStepDisplayProps {
  steps: AlgorithmStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

const StepByStepDisplay: React.FC<StepByStepDisplayProps> = ({
  steps,
  currentStep,
  onStepChange
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1000);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      onStepChange(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Stop any ongoing audio
    stopSpeaking();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      onStepChange(newStep);
      // Play audio for the new step
      if (steps[newStep]) {
        speak(steps[newStep].description);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      onStepChange(newStep);
      // Play audio for the new step
      if (steps[newStep]) {
        speak(steps[newStep].description);
      }
    }
  };

  const handleReset = () => {
    handlePause();
    onStepChange(0);
    // Play audio for step 0
    if (steps[0]) {
      speak(steps[0].description);
    }
  };

  React.useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, playbackSpeed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, playbackSpeed]);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Stop any ongoing audio when component unmounts
      stopSpeaking();
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Step-by-Step Execution
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <button
          onClick={handleReset}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          title="Reset to beginning"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous step"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next step"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 ml-4">
          <label className="text-sm text-gray-600">Speed:</label>
          <input
            type="range"
            min="200"
            max="2000"
            step="200"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="w-20"
            disabled={isPlaying}
          />
          <span className="text-xs text-gray-500">{playbackSpeed}ms</span>
        </div>
      </div>

      {/* Current Step Display */}
      {steps[currentStep] && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-sm font-semibold px-2 py-1 rounded">
                Step {steps[currentStep].step}
              </span>
              <span className="text-sm text-blue-700 font-medium">
                {steps[currentStep].description}
              </span>
            </div>
            
            <div className="bg-white border rounded p-3 mb-3">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {steps[currentStep].code}
              </pre>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {steps[currentStep].explanation}
            </p>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">All Steps:</h4>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
          {steps.map((step, index) => (
            <button
              key={step.step}
              onClick={() => onStepChange(index)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                index === currentStep
                  ? 'bg-blue-100 border-blue-300 text-blue-800'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold">Step {step.step}</span>
                {index === currentStep && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm truncate">{step.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepByStepDisplay;


