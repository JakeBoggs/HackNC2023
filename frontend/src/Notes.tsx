import { Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { ResultsData } from "./Results";

export type Bullet = { [bullet: string]: number };

interface BulletRendererProps {
  data: Bullet | null;
  cb: (i: number) => void;
  cb2: (data: ResultsData, i: string) => number | undefined;
  transcript: ResultsData;
}

export const BulletRenderer: React.FC<BulletRendererProps> = ({
  data,
  cb,
  cb2,
  transcript,
}) => {
  return (
    <Stack>
      <Heading size="md">Notes</Heading>
      {data === null ? (
        <Spinner />
      ) : (
        <Stack h="20rem" overflowY="scroll">
          {Object.entries(data).map((entry) => {
            return (
              <Text
                display="inline"
                onClick={() =>
                  cb(cb2(transcript, entry[1].toString() + ",0") ?? 0)
                }
                cursor="pointer"
              >
                {entry[0]}
              </Text>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

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
