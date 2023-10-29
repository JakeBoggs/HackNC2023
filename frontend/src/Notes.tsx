import { Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";

export type Bullet = { [bullet: string]: number };

interface BulletRendererProps {
  data: Bullet | null;
  cb: (i: number) => void;
  cb2: (i: string) => void;
}

export const BulletRenderer: React.FC<BulletRendererProps> = ({
  data,
  cb2,
}) => {
  if (data === null) {
    return (
      <Stack>
        <Heading size="md">Notes</Heading>
      </Stack>
    );
  }

  return (
    <Stack>
      <Heading size="md">Notes</Heading>
      <Stack h="20rem" overflow="scroll">
        {Object.entries(data).map((entry) => {
          return (
            <Text
              display="inline"
              onClick={() => cb2(entry[1].toString() + ",0")}
            >
              {entry[0]}
            </Text>
          );
        })}
      </Stack>
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
