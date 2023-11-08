import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import axios from 'axios';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // Your English translations
        },
      },
      es: {
        translation: {
          // Your Spanish translations
        },
      },
      // Add more languages as needed
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

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

  const sendAudioData = async (transcript) => {
    console.log('Transcript:', transcript);
  
    const formData = new FormData();
    const audioBlob = new Blob([transcript], { type: 'audio/wav' });
    formData.append('audio', audioBlob);
  
    // Check the content of the form data
    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/translate', formData, {
        withCredentials: true,
      });
      console.log('Translation:', response.data);
      // Do something with the translation response
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

 const handleTranscriptChange = () => {
  if (finalTranscript !== '') {
    // Call the function to send audio data when the final transcript is available
    sendAudioData(finalTranscript);
  }
};


  const recordAudio = () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];

          mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
          });

          mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            resolve(audioBlob);
          });

          // Start recording
          mediaRecorder.start();

          // Stop recording after a certain duration (e.g., 5 seconds)
          setTimeout(() => {
            mediaRecorder.stop();
          }, 5000);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const handleAudioRecording = async () => {
    try {
      const audioBlob = await recordAudio();
      console.log('Audio Blob:', audioBlob);

      // Call sendAudioData with the audioBlob parameter
      sendAudioData(audioBlob);
    } catch (error) {
      console.error('Error recording audio:', error);
    }
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }

  return (
    <div className='translator'>
      <button className='trigger' onClick={handleButtonClick}>
        {isListening ? 'Stop Talking' : 'Start Talking'}
      </button>
      <button className='reset' onClick={handleResetClick}>
        Reset
      </button>
      <p>{i18n.t(interimTranscript)}</p>
      <p>{i18n.t(finalTranscript)}</p>
      {finalTranscript !== '' && handleTranscriptChange()}
    </div>
  );
}

export default App;
