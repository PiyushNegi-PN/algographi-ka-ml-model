import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, Loader2 } from 'lucide-react';
import { AlgorithmData, generateAudioExplanation } from '../utils/gemini';

interface AudioExplanationProps {
  algorithmData: AlgorithmData;
}

const AudioExplanation: React.FC<AudioExplanationProps> = ({ algorithmData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioScript, setAudioScript] = useState<string>('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);

  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Generate audio script when component mounts or algorithm changes
    generateScript();
  }, [algorithmData]);

  useEffect(() => {
    return () => {
      // Clean up speech synthesis on unmount
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const generateScript = async () => {
    setIsGeneratingScript(true);
    try {
      const script = await generateAudioExplanation(algorithmData);
      setAudioScript(script);
    } catch (error) {
      console.error('Error generating audio script:', error);
      setAudioScript('Unable to generate audio explanation at this time.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handlePlay = () => {
    if (!audioScript) return;

    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (speechSynthesis.speaking && speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        startSpeech();
      }
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const startSpeech = () => {
    if (utteranceRef.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(audioScript);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.volume = isMuted ? 0 : speechVolume;

    utterance.onstart = () => {
      setIsPlaying(true);
      highlightCurrentWords();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const highlightCurrentWords = () => {
    // Simple word highlighting based on time elapsed
    const words = audioScript.split(' ');
    const totalDuration = words.length * 200; // Rough estimate: 200ms per word
    const startTime = Date.now();

    const highlightInterval = setInterval(() => {
      if (!isPlaying) {
        clearInterval(highlightInterval);
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const currentIndex = Math.floor(progress * words.length);
      
      setCurrentWordIndex(currentIndex);
    }, 100);

    // Clean up interval when speech ends
    setTimeout(() => {
      clearInterval(highlightInterval);
    }, totalDuration);
  };

  const downloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([audioScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${algorithmData.name.replace(/\s+/g, '_')}_audio_script.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getVoices = () => {
    return speechSynthesis.getVoices();
  };

  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    const voices = getVoices();
    if (voices.length > 0 && !selectedVoice) {
      // Prefer English voices
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      setSelectedVoice(englishVoice?.name || '');
    }
  }, []);

  const applyVoiceSettings = () => {
    if (utteranceRef.current && speechSynthesis.speaking) {
      const voices = getVoices();
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice && utteranceRef.current) {
        utteranceRef.current.voice = voice;
        utteranceRef.current.rate = speechRate;
        utteranceRef.current.pitch = speechPitch;
        utteranceRef.current.volume = isMuted ? 0 : speechVolume;
      }
    }
  };

  const renderHighlightedScript = () => {
    if (!audioScript) return null;

    const words = audioScript.split(' ');
    
    return words.map((word, index) => (
      <span
        key={index}
        className={`transition-colors duration-200 ${
          index === currentWordIndex
            ? 'bg-yellow-200 text-yellow-800 font-semibold'
            : index < currentWordIndex
            ? 'text-gray-600'
            : 'text-gray-800'
        }`}
      >
        {word}{' '}
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Volume2 className="w-6 h-6" />
          Audio Explanation
        </h3>
        <button
          onClick={generateScript}
          disabled={isGeneratingScript}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Regenerate audio script"
        >
          {isGeneratingScript ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Audio Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleStop}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            title="Stop"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handlePlay}
            disabled={!audioScript || isGeneratingScript}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={downloadScript}
            disabled={!audioScript}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
            title="Download script"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speed: {speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pitch: {speechPitch}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume: {Math.round(speechVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={speechVolume}
              onChange={(e) => setSpeechVolume(Number(e.target.value))}
              className="w-full"
              disabled={isMuted}
            />
          </div>
        </div>

        {/* Voice Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Voice:
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {getVoices().map((voice, index) => (
              <option key={index} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Script Display */}
      <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
        {isGeneratingScript ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-gray-600">Generating audio script...</span>
          </div>
        ) : (
          <div className="text-sm leading-relaxed">
            {renderHighlightedScript()}
          </div>
        )}
      </div>

      {/* Script Stats */}
      {audioScript && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-blue-800">
                {audioScript.split(' ').length}
              </div>
              <div className="text-blue-600">Words</div>
            </div>
            <div>
              <div className="font-semibold text-blue-800">
                {Math.ceil(audioScript.split(' ').length * 200 / 1000 / 60)} min
              </div>
              <div className="text-blue-600">Duration</div>
            </div>
            <div>
              <div className="font-semibold text-blue-800">
                {audioScript.length}
              </div>
              <div className="text-blue-600">Characters</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioExplanation;


