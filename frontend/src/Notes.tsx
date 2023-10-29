import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { List, ListRowProps } from "react-virtualized";

export type Bullet = { bullet: string; index: number };

export type BulletData = Bullet[];

interface BulletRendererProps {
  data: BulletData | null;
}

const renderBullet: (
  newBullet: BulletData
) => (props: ListRowProps) => React.ReactNode =
  (newBullet) =>
  ({ key, index, style }) => {
    return (
      <Box key={key} style={style} lineHeight={1.1}>
        <Text key={index} display="inline">
          {newBullet[index].bullet}
        </Text>
      </Box>
    );
  };

export const BulletRenderer: React.FC<BulletRendererProps> = ({ data }) => {
  if (data === null) {
    return (
      <Container>
        <Heading size="md">Notes</Heading>
        <Text>Bullets</Text>
      </Container>
    );
  }
  const newBullets = data.map((value) => {
    return value.bullet;
  });

  return (
    <Container maxW="container.lg" my={3}>
      <Stack>
        <Heading size="md">Notes</Heading>
        <Text>Bullets</Text>
        <Heading size="md">Transcript</Heading>
        <List
          width={1000} // Adjust the width as needed
          height={600} // Adjust the height as needed
          rowCount={1}
          rowHeight={30} // Adjust the row height as needed
          rowRenderer={renderBullet(data)}
        />
      </Stack>
    </Container>
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
