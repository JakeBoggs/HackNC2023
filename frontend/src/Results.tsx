import { Box, BoxProps, Container, Heading, Spacer, Stack, Text } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import { List, ListRowProps } from "react-virtualized";
import { AudioData, AudioPlayer } from "./AudioPlayer";
import { Bullet, BulletRenderer } from "./Notes";

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
}

export interface Word {
  word: string;
  start: number;
  end: number;
  score: number;
}

interface SentenceRendererProps {
  data: ResultsData;
  time: number;
  notes: Bullet;
  setTime: (time: number) => void;
}

interface ResultProps extends AudioData {
  data: ResultsData;
  notes: Bullet;
  //   activeID: string;
}

const renderRow: (
  newSegments: SegmentData[],
  activeID: string,
  activeSentence: number,
  setTime: (time: number) => void
) => (props: ListRowProps) => React.ReactNode =
  (newSegments, activeID, activeSentence, setTime) =>
  ({ key, index, style }) => {
    return (
      <Box key={key} style={style} lineHeight={1.1}>
        {newSegments[index].words.map((word, wordIndex) => (
          <Text
            key={wordIndex}
            display="inline"
            color={word.index === activeID ? "blue" : index === activeSentence ? "black" : "gray"}
            onClick={() => setTime(word.start ?? 0)}
            cursor="pointer"
          >
            {word.word}{" "}
          </Text>
        ))}
      </Box>
    );
  };

export const SentenceRenderer = ({ data, time, notes, setTime, ...props }: SentenceRendererProps & BoxProps) => {
  const newSegments = useMemo(
    () =>
      data.segments.map((seg, idx) => ({
        ...seg,
        words: seg.words.map((word, wordIdx) => ({
          ...word,
          index: idx + "," + wordIdx,
        })),
      })),
    [data]
  );

  const listRef = React.createRef<List>();
  const scrollToRow = (idx: number) => {
    listRef.current!.scrollToRow(idx);
  };
  const [activeID, setActiveID] = useState("0,0");
  const [activeSentence, setActiveSentence] = useState(0);
  useEffect(() => {
    const idx = findIndex(data, time);
    if (idx) {
      setActiveID(idx);
      scrollToRow(parseInt(idx.split(",")[0]));
      setActiveSentence(parseInt(idx.split(",")[0]));
      console.log(idx);
    }

    return () => {};
  }, [time]);

  return (
    <Stack {...props} maxH="80%" spacing={5}>
      <BulletRenderer data={notes} cb={setTime} cb2={findTime} transcript={data} />
      <Heading size="md">Transcript</Heading>
      <List
        ref={listRef}
        width={1000} // Adjust the width as needed
        height={window.innerHeight / 2.1} // Adjust the height as needed
        rowCount={newSegments.length}
        rowHeight={({ index }) => (newSegments[index].text.length / 100) * 10 + 30} // Adjust the row height as needed
        rowRenderer={renderRow(newSegments, activeID, activeSentence, setTime)}
      />
    </Stack>
  );
};

export const Results: React.FC<ResultProps> = ({ data, audio, notes }) => {
  const [appTime, setAppTime] = useState(0);
  // const setSeekTime = () => null;
  const [seekTime, setSeekTime] = useState(0);

  return (
    <Container maxW="container.lg">
      <Stack h="100vh" py={4} spacing={4}>
        <Heading>Cogniscribe</Heading>
        <SentenceRenderer setTime={setSeekTime} time={appTime} data={data} notes={notes} />
        <Spacer />
        <AudioPlayer
          // h="10%"
          audio={audio}
          appTime={appTime}
          setAppTime={setAppTime}
          seekTime={seekTime}
          setSeekTime={setSeekTime}
          // position="fixed"
          // bottom={2}
        />
      </Stack>
    </Container>
  );
};

function findTime(data: ResultsData, index: string) {
  for (let segIdx = 0; segIdx < data.segments.length; segIdx++) {
    const segment = data.segments[segIdx];
    for (let wordIdx = 0; wordIdx < segment.words.length; wordIdx++) {
      if (segIdx === parseInt(index.split(",")[0]) && wordIdx === parseInt(index.split(",")[1])) {
        const word = segment.words[wordIdx];
        return word.start;
      }
    }
  }
}

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
