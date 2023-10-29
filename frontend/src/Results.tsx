import React, { useState } from "react";
import { Box, Container, SimpleGrid, Text } from "@chakra-ui/react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";

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

type ResultsData = {
  segments: SegmentData[];
  word_segments: any[]; // Define the type for this property
  language: string;
};

interface SentenceRendererProps {
  data: ResultsData;
  //   activeID: string;
}

const renderRow: (
  newSegments: SegmentData[],
  activeID: string,
  setActiveID: (id: string) => void
) => (props: ListRowProps) => React.ReactNode =
  (newSegments, activeID, setActiveID) =>
  ({ key, index, style }) => {
    return (
      <Box key={key} style={style} lineHeight={1.1}>
        {newSegments[index].words.map((word, wordIndex) => (
          <Text
            key={wordIndex}
            display="inline"
            color={word.index === activeID ? "black" : "gray"}
            onClick={() => setActiveID(word.index)}
          >
            {word.word}{" "}
          </Text>
        ))}
      </Box>
    );
  };

export const SentenceRenderer: React.FC<SentenceRendererProps> = ({ data }) => {
  const [activeID, setActiveID] = useState("0,0");
  const newSegments = data.segments.map((seg, idx) => ({
    ...seg,
    words: seg.words.map((word, wordIdx) => ({ ...word, index: idx + "," + wordIdx })),
  }));

  return (
    <Container maxW="container.lg" my={3}>
      <List
        width={1000} // Adjust the width as needed
        height={600} // Adjust the height as needed
        rowCount={newSegments.length}
        rowHeight={30} // Adjust the row height as needed
        rowRenderer={renderRow(newSegments, activeID, setActiveID)}
      />
    </Container>
  );
};

{
  /* <AutoSizer>
        {({ width, height }) => (
        )}
      </AutoSizer> */
}

function findIndex(data: ResultsData, sentence: string, word: string): string | null {
  for (let segmentIndex = 0; segmentIndex < data.segments.length; segmentIndex++) {
    const segment = data.segments[segmentIndex];
    for (let wordIndex = 0; wordIndex < segment.words.length; wordIndex++) {
      const currentWord = segment.words[wordIndex].word;
      if (currentWord === word && segment.text.includes(sentence)) {
        return `${segmentIndex},${wordIndex}`;
      }
    }
  }
  return null;
}
