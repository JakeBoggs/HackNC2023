import React, { useState } from "react";
import { Text, Stack, Button, Center, Heading, BoxProps, ButtonProps, Container } from "@chakra-ui/react";
import { useVoiceRecorder } from "./voiceRecorder";
import { ResultsData, Results } from "./Results";

const Recorder: React.FC<
  {
    onRecorded: (data: Blob) => void;
  } & ButtonProps
> = ({ onRecorded, ...props }) => {
  const { isRecording, stop, start, error } = useVoiceRecorder(onRecorded);

  return (
    <Button colorScheme={isRecording ? "red" : "blue"} {...props} onClick={isRecording ? stop : start}>
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

function VoiceRecorderScreen({ handleSubmit }: { handleSubmit: (audio: Blob) => void }) {
  const [audio, setAudio] = useState<Blob | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudio(file);
    }
  };

  return (
    <Container maxW="container.lg" my={3}>
      <Stack spacing={5}>
        <Heading as="h1">Upload Audio</Heading>
        <Stack direction="row" spacing={4} alignItems="center">
          <Recorder onRecorded={(blob) => setAudio(blob)} w="fit-content" />
          <Text>or</Text>
          <input type="file" accept="audio/*" onChange={handleFileChange} />
        </Stack>
        {audio && <Player audioBlob={audio} />}
        <Button onClick={() => audio && handleSubmit(audio)} w="fit-content">
          Submit
        </Button>
      </Stack>
    </Container>
  );
}

import results from "./robbery.json";
export const App = () => {
  const [audio, setAudio] = useState<string | null>(null);
  const [results, setResults] = useState(false); // Added results state
  const [transcriptResults, setTranscriptResults] = useState<ResultsData | null>(null); // Added transcriptResults state

  async function postAudioBlob(blob: Blob) {
    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");

    const url = "/api/getTranscriptMP3";

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const out = await res.json();
    setTranscriptResults(out);
    setAudio(window.URL.createObjectURL(blob))
    setResults(true);
  }

  return results ? <Results data={transcriptResults as any} audio={audio} /> : <VoiceRecorderScreen handleSubmit={postAudioBlob} />;
};
