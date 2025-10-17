export const speak = (text: string, rate: number = 1) => {
  // Stop any ongoing speech
  speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  // Try to use a good voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.lang.startsWith('en') && voice.name.includes('Google')
  ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }
  
  speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  speechSynthesis.cancel();
};

export const isSpeaking = () => {
  return speechSynthesis.speaking;
};
