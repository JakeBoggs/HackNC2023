import React, { useState } from "react";
import { Box, Container, SimpleGrid, Text } from "@chakra-ui/react";

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

export const SentenceRenderer: React.FC<SentenceRendererProps> = ({ data }) => {
  const [activeID, setActiveID] = useState("0,0");
  const newSegments = data.segments.map((seg, idx) => ({...seg, words: seg.words.map((word, wordIdx) => ({...word, index: idx + "," + wordIdx}))}))

  return (
    <Container maxW="container.lg" my={3}>
      {newSegments.map((segment, segmentIndex) => (
        <Box key={segmentIndex}>
          {segment.words.map((word, wordIndex) => (
            <Text
              key={wordIndex}
              display="inline"
              color={segmentIndex + "," + wordIndex === activeID ? "black" : "gray"}
              onClick={() => setActiveID(word.index)}
            >
              {word.word}{" "}
            </Text>
          ))}
        </Box>
      ))}
    </Container>
  );
};

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
