// import { Box, Heading, Stack, Text } from "@chakra-ui/react";

import React, { useState } from "react";
import { Box, Button, Center, Heading } from "@chakra-ui/react";
import { useVoiceRecorder } from "./voiceRecorder";

const Recorder: React.FC<{
  onRecorded: (data: Blob) => void;
}> = ({ onRecorded }) => {
  // const isRecording = false;
  const { isRecording, stop, start, error } = useVoiceRecorder(onRecorded);
  const toggle = isRecording ? stop : start
  console.log(isRecording, toggle, error);
  
  return (
    <Button colorScheme={isRecording ? "red" : "blue"} onClick={toggle}> 
      {isRecording ? "Stop Recording" : "Start Recording"}
    </Button>
  );
};
const Player: React.FC<{
  audioBlob: Blob
}> = ({audioBlob}) => {
  const link = window.URL.createObjectURL(audioBlob)
  return <audio src={link} controls />
};

function VoiceRecorderScreen() {
  const [audio, setAudio] = useState<Blob | null>(null)
  return (
    <Center>
      <Box w="50%" p={4} m={4}>
        <Heading as="h1" mb={4}>
          Voice Recorder
        </Heading>
        <Recorder onRecorded={(blob) => setAudio(blob)}/>
        {audio && <Player audioBlob={audio}/>}
      </Box>
    </Center>
  );
}
export const App = () => {
  return <VoiceRecorderScreen />;
};
