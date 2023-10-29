import {
  Button,
  ButtonProps,
  Container,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { BulletData, BulletRenderer } from "./Notes";
import { ResultsData, SentenceRenderer } from "./Results";
import { useVoiceRecorder } from "./voiceRecorder";

const Recorder: React.FC<
  {
    onRecorded: (data: Blob) => void;
  } & ButtonProps
> = ({ onRecorded, ...props }) => {
  const { isRecording, stop, start, error } = useVoiceRecorder(onRecorded);

  return (
    <Button
      colorScheme={isRecording ? "red" : "blue"}
      {...props}
      onClick={isRecording ? stop : start}
    >
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

function VoiceRecorderScreen({
  handleSubmit,
}: {
  handleSubmit: (audio: Blob) => void;
}) {
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

export const App = () => {
  const [transcriptResults, setTranscriptResults] =
    useState<ResultsData | null>(null); // Added transcriptResults state
  const [noteResults, setNoteResults] = useState<BulletData | null>(null);

  async function postAudioBlob(blob: Blob) {
    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");

    const url = "http://localhost:6969/api/getTranscriptMP3";
    const urlNotes = "http://localhost:6969/api/getNotes";

    const resTranscript = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const outTranscript: ResultsData = await resTranscript.json();
    setTranscriptResults(outTranscript);

    let transcript = "";
    for (const word of outTranscript.word_segments) {
      transcript = transcript.concat(" " + word.word);
    }
    const URLParams = new URLSearchParams();
    URLParams.append("transcript", transcript);
    const resNotes = await fetch(urlNotes, {
      method: "POST",
      body: URLParams,
    });
    const outNotes: BulletData = await resNotes.json();
    setNoteResults(outNotes);
  }

  return transcriptResults !== null ? (
    <div>
      <BulletRenderer data={noteResults} />
      <SentenceRenderer data={transcriptResults as any} />
    </div>
  ) : (
    <VoiceRecorderScreen handleSubmit={postAudioBlob} />
  );
};
