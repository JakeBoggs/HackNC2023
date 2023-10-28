import React, { useState } from 'react';
import { Stack, View, Text, Button, Input, Heading } from 'tamagui';

export const VoiceRecorderScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingName, setRecordingName] = useState('');

  const handleRecordButtonPress = () => {
    setIsRecording(!isRecording);
  };

  const handleRecordingNameChange = (text) => {
    setRecordingName(text);
  };

  return (
    <Stack gap="1rem" width="50%" margin="auto">
      <Heading>Voice Recorder</Heading>
      <Button backgroundColor="$red6" hoverStyle={{ backgroundColor: "$red7" }} pressStyle={{ backgroundColor: "$red8" }} onPress={handleRecordButtonPress} >{isRecording ? 'Stop Recording' : 'Start Recording'}</Button>
      <Input placeholder="Recording Name" value={recordingName} onChangeText={handleRecordingNameChange} />
      <Button>Submit</Button>
    </Stack>
  );
};

// export VoiceRecorderScreen;
