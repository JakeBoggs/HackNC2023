import { Button, ButtonProps, Container, Heading, Stack, Text, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { BulletData } from "./Notes";
import { Results, ResultsData } from "./Results";
import { useVoiceRecorder } from "./voiceRecorder";

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

function VoiceRecorderScreen({ handleSubmit, loading }: { handleSubmit: (audio: Blob) => void; loading: boolean }) {
  const [audio, setAudio] = useState<Blob | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudio(file);
    }
  };

  return (
    <Container maxW="container.lg" my={4}>
      <Stack spacing={5}>
        <Heading>Cogniscribe</Heading>
        <Heading size="md">Upload Audio</Heading>
        <Stack direction="row" spacing={4} alignItems="center">
          <Recorder onRecorded={(blob) => setAudio(blob)} w="fit-content" />
          <Text>or</Text>
          <input type="file" accept="audio/*" onChange={handleFileChange} />
        </Stack>
        {audio && <Player audioBlob={audio} />}
        <Button
          onClick={() => audio && handleSubmit(audio)}
          w="fit-content"
          isLoading={loading}
          loadingText="Transcribing"
        >
          Submit
        </Button>
      </Stack>
    </Container>
  );
}

export const App = () => {
  const [transcriptResults, setTranscriptResults] = useState<ResultsData | null>(null); // Added transcriptResults state
  const [noteResults, setNoteResults] = useState<BulletData | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const toast = useToast();

  async function postAudioBlob(blob: Blob) {
    setTranscriptLoading(true);
    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");

    const BASE_URL = import.meta.env.VITE_PUBLIC_API_URL ?? "http://localhost:6969/api";

    const url = BASE_URL + "/getTranscriptMP3";
    const urlNotes = BASE_URL + "/getNotes";
    try {
      const resTranscript = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const outTranscript: ResultsData = await resTranscript.json();
      setTranscriptResults(outTranscript);
      setAudio(window.URL.createObjectURL(blob));

      let transcript = "";
      for (const word of outTranscript.word_segments) {
        transcript = transcript.concat(" ", word.word);
      }
      const URLParams = new URLSearchParams();
      URLParams.append("transcript", transcript);
      const resNotes = await fetch(urlNotes, {
        method: "POST",
        body: URLParams,
      });
      const outNotes: BulletData = await resNotes.json();
      console.log(outNotes);
      setNoteResults(outNotes);
    } catch (error) {
      toast({
        title: "Error transcribing",
        description: (error as Error).toString(),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTranscriptLoading(false);
    }
  }

  return transcriptResults !== null ? (
    <div>
      <Results data={transcriptResults as any} audio={audio!} notes={noteResults} />
    </div>
  ) : (
    <VoiceRecorderScreen handleSubmit={postAudioBlob} loading={transcriptLoading} />
  );
};
