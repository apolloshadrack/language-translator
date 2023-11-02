import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const { finalTranscript, interimTranscript, resetTranscript } = useSpeechRecognition();

  const handleButtonClick = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }

    setIsListening(!isListening);
  };

  const handleResetClick = () => {
    resetTranscript();
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }

  return (
    <div class='translator'>
      <button class='trigger' onClick={handleButtonClick}>
        {isListening ? 'Stop Talking' : 'Start Talking'}
      </button>
      <button class='reset' onClick={handleResetClick}>Reset</button>
      <p>{interimTranscript}</p>
      <p>{finalTranscript}</p>
    </div>
  );
}

export default App;
