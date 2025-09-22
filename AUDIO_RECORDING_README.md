# Audio Recording & Pronunciation System

This document describes the new audio recording and pronunciation scoring system integrated into the pronunce-react project.

## Overview

The system provides two main approaches for audio recording and pronunciation analysis:

1. **AudioRecordingSystem Component** - A standalone component with built-in UI
2. **useEnhancedSpeechRecognition Hook** - A hook that integrates with existing UI components

Both systems use AssemblyAI for speech-to-text transcription and include pronunciation scoring algorithms.

## Features

- 🎤 **Audio Recording** - High-quality audio recording with waveform visualization
- 🗣️ **Speech-to-Text** - Powered by AssemblyAI API for accurate transcription
- 📊 **Pronunciation Scoring** - Advanced algorithm to score pronunciation accuracy
- 🎯 **Word-by-Word Analysis** - Visual feedback showing correct/incorrect words
- 📱 **Mobile & Desktop Support** - Responsive UI for all devices
- ⚡ **Real-time Processing** - Live waveform visualization during recording

## Components

### AudioRecordingSystem

A complete, self-contained component for audio recording and pronunciation analysis.

```jsx
import AudioRecordingSystem from './components/AudioRecordingSystem';

<AudioRecordingSystem
  expectedSentence="Hello, how are you today?"
  onResults={(scoreResult) => console.log('Score:', scoreResult.score)}
  onError={(error) => console.error('Error:', error)}
/>
```

**Props:**
- `expectedSentence` (string) - The sentence to practice
- `onResults` (function) - Callback when results are ready
- `onError` (function) - Callback for error handling

### useEnhancedSpeechRecognition Hook

A React hook that provides audio recording functionality for integration with existing components.

```jsx
import { useEnhancedSpeechRecognition } from './hooks/useEnhancedSpeechRecognition';

const {
  isRecording,
  isProcessing,
  pronunciationScore,
  startRecording,
  stopRecording,
  processRecording,
  clearRecording
} = useEnhancedSpeechRecognition();
```

**Key Methods:**
- `startRecording()` - Start audio recording
- `stopRecording()` - Stop recording and return audio blob
- `processRecording(expectedSentence)` - Process recording with transcription and scoring
- `clearRecording()` - Clear all recording data

## Demo Page

Access the demo page at `/audio-demo` to see both systems in action. The demo includes:

- Toggle between new AudioRecordingSystem and enhanced hook integration
- Sample sentences for practice
- Real-time pronunciation scoring
- Visual feedback for correct/incorrect words
- Mobile and desktop UI examples

## API Configuration

The system uses AssemblyAI for speech-to-text transcription. The API key is currently hardcoded in the components:

```javascript
const ASSEMBLYAI_API_KEY = "bdb00961a07c4184889a80206c52b6f2";
```

**Note:** For production use, move this to environment variables for security.

## Pronunciation Scoring Algorithm

The scoring system uses:

1. **Text Normalization** - Removes punctuation and converts to lowercase
2. **Word Matching** - Exact matches get full points
3. **Similarity Matching** - Uses Levenshtein distance for fuzzy matching
4. **Missing Word Detection** - Identifies words not spoken
5. **Score Calculation** - Percentage based on matched words

## Integration Examples

### With Mobile Recording UI

```jsx
import MobileRecordingUI from './components/mobile/MobileRecordingUI';
import { useEnhancedSpeechRecognition } from './hooks/useEnhancedSpeechRecognition';

const MyComponent = () => {
  const {
    isRecording,
    isProcessing,
    pronunciationScore,
    startRecording,
    stopRecording,
    processRecording
  } = useEnhancedSpeechRecognition();

  const handleStopRecording = async () => {
    await stopRecording();
    await processRecording("Hello, how are you?");
  };

  return (
    <MobileRecordingUI
      show={isRecording || isProcessing || pronunciationScore}
      recordingTime={recordingTime}
      speechDetected={speechDetected}
      onStopRecording={handleStopRecording}
      isProcessing={isProcessing}
      pronunciationScore={pronunciationScore}
    />
  );
};
```

### With Desktop Recording UI

```jsx
import DesktopRecordingUI from './components/desktop/DesktopRecordingUI';
import { useEnhancedSpeechRecognition } from './hooks/useEnhancedSpeechRecognition';

const MyComponent = () => {
  const {
    isRecording,
    isProcessing,
    pronunciationScore,
    startRecording,
    stopRecording,
    processRecording
  } = useEnhancedSpeechRecognition();

  return (
    <DesktopRecordingUI
      show={isRecording || isProcessing || pronunciationScore}
      recordingTime={recordingTime}
      speechDetected={speechDetected}
      onStopRecording={handleStopRecording}
      isProcessing={isProcessing}
      pronunciationScore={pronunciationScore}
    />
  );
};
```

## Browser Compatibility

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Full support (iOS 14.5+)
- **Mobile Browsers** - Full support

## Error Handling

The system includes comprehensive error handling for:

- Microphone access denied
- Network connectivity issues
- AssemblyAI API errors
- Audio processing failures
- Browser compatibility issues

## Performance Considerations

- Audio recording uses efficient MediaRecorder API
- Waveform visualization uses requestAnimationFrame
- Transcription processing is asynchronous
- Memory cleanup on component unmount

## Security Notes

- API keys should be moved to environment variables
- Audio data is processed locally before upload
- No audio data is stored permanently
- HTTPS required for microphone access

## Troubleshooting

### Common Issues

1. **Microphone Access Denied**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Try refreshing the page

2. **Transcription Fails**
   - Check internet connection
   - Verify API key is valid
   - Ensure audio quality is good

3. **Low Pronunciation Scores**
   - Speak clearly and at normal pace
   - Ensure quiet environment
   - Check microphone quality

### Debug Mode

Enable console logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will show detailed logs of the recording and processing pipeline.

