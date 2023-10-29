import React, { useEffect, useState } from "react";
import { Box, Container, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { AudioPlayer } from "./AudioPlayer";

type WordData = {
  word: string;
  start?: number;
  end?: number;
  score?: number;
};

type SegmentData = {
  start: number;
  end: number;
  text: string;
  words: WordData[];
};

export interface ResultsData {
  segments: SegmentData[];
  word_segments: Word[]; // Define the type for this property
  language: string;
};

export interface Word {
  word: string;
  start: number;
  end: number;
  score: number;
}

interface SentenceRendererProps {
  data: ResultsData;
  //   activeID: string;
}

const renderRow: (
  newSegments: SegmentData[],
  activeID: string,
  setTime: (time: number) => void
) => (props: ListRowProps) => React.ReactNode =
  (newSegments, activeID, setTime) =>
  ({ key, index, style }) => {
    return (
      <Box key={key} style={style} lineHeight={1.1}>
        {newSegments[index].words.map((word, wordIndex) => (
          <Text
            key={wordIndex}
            display="inline"
            color={word.index === activeID ? "black" : "gray"}
            onClick={() => setTime(word.start ?? 0)}
          >
            {word.word}{" "}
          </Text>
        ))}
      </Box>
    );
  };

export const SentenceRenderer: React.FC<SentenceRendererProps> = ({ data }) => {
  const [appTime, setAppTime] = useState(0);
  // const setSeekTime = () => null;
  const [activeID, setActiveID] = useState("0,0");
  useEffect(() => {
    const idx = findIndex(data, appTime);
    if (idx) setActiveID(idx);

    return () => {};
  }, [appTime]);
  const [seekTime, setSeekTime] = useState(0);

  const newSegments = data.segments.map((seg, idx) => ({
    ...seg,
    words: seg.words.map((word, wordIdx) => ({ ...word, index: idx + "," + wordIdx })),
  }));

  return (
    <Container maxW="container.lg" my={3}>
      <Stack>
        <Heading size="md">Notes</Heading>
        <Text>Bullets</Text>
        <Heading size="md">Transcript</Heading>
        <List
          width={1000} // Adjust the width as needed
          height={600} // Adjust the height as needed
          rowCount={newSegments.length}
          rowHeight={30} // Adjust the row height as needed
          rowRenderer={renderRow(newSegments, activeID, setSeekTime)}
        />
        <AudioPlayer appTime={appTime} setAppTime={setAppTime} seekTime={seekTime} setSeekTime={setSeekTime} />
      </Stack>
    </Container>
  );
};

function findIndex(data: ResultsData, seconds: number): string | null {
  for (let segIdx = 0; segIdx < data.segments.length; segIdx++) {
    const segment = data.segments[segIdx];
    if (seconds >= segment.start && seconds <= segment.end) {
      for (let wordIdx = 0; wordIdx < segment.words.length; wordIdx++) {
        const word = segment.words[wordIdx];
        if (word.start !== undefined && word.end !== undefined && seconds >= word.start && seconds <= word.end) {
          return `${segIdx},${wordIdx}`;
        }
      }
    }
  }

  return null;
}

// function findIndex(data: ResultsData, sentence: string, word: string): string | null {
//   for (let segmentIndex = 0; segmentIndex < data.segments.length; segmentIndex++) {
//     const segment = data.segments[segmentIndex];
//     for (let wordIndex = 0; wordIndex < segment.words.length; wordIndex++) {
//       const currentWord = segment.words[wordIndex].word;
//       if (currentWord === word && segment.text.includes(sentence)) {
//         return `${segmentIndex},${wordIndex}`;
//       }
//     }
//   }
//   return null;
// }
