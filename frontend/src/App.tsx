import React, { useState } from "react";
import { Stack, Button, Center, Heading, BoxProps, ButtonProps } from "@chakra-ui/react";
import { useVoiceRecorder } from "./voiceRecorder";
import { SentenceRenderer } from "./Results";

const Recorder: React.FC<
  {
    onRecorded: (data: Blob) => void;
  } & ButtonProps
> = ({ onRecorded, ...props }) => {
  const { isRecording, stop, start, error } = useVoiceRecorder(onRecorded);
  const toggle = isRecording ? stop : start;
  console.log(isRecording, toggle, error);

  return (
    <Button colorScheme={isRecording ? "red" : "blue"} {...props} onClick={toggle}>
      {isRecording ? "Stop Recording" : "Start Recording"}
    </Button>
  );
};
const Player: React.FC<{
  audioBlob: Blob;
}> = ({ audioBlob }) => {
  const link = window.URL.createObjectURL(audioBlob);
  return <audio src={link} controls />;
};

async function postAudioBlob(blob: Blob) {
  const formData = new FormData();
  formData.append("audio", blob, "audio.wav");

  await fetch("/api/summarize", {
    method: "POST",
    body: formData,
  });
}

function VoiceRecorderScreen() {
  const [audio, setAudio] = useState<Blob | null>(null);
  return (
    <Center>
      <Stack w="50%">
        <Heading as="h1">Voice Recorder</Heading>
        <Recorder onRecorded={(blob) => setAudio(blob)} w="fit-content" />
        {audio && <Player audioBlob={audio} />}
        <Button onClick={() => audio && postAudioBlob(audio)} w="fit-content">
          Submit
        </Button>
      </Stack>
    </Center>
  );
}
import results from "./robbery.json";
export const App = () => {
  return <SentenceRenderer data={results} />;
  // <VoiceRecorderScreen />;
};
