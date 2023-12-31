import { useRef, useEffect, useState, useMemo } from "react";
import { Button, Slider, Text, Flex, SliderFilledTrack, SliderThumb, SliderTrack, Stack } from "@chakra-ui/react";

interface AudioPlayerProps {
  appTime: number;
  setAppTime: (time: number) => void;
  seekTime: number;
  setSeekTime: (time: number) => void;
}

export interface AudioData {
  audio: Blob | string;
}

//   , seekTime, setSeekTime
export function AudioPlayer({ appTime, setAppTime, seekTime, setSeekTime, audio, ...props }: AudioPlayerProps & AudioData & BoxProps) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  //   const [seekTime, setSeekTime] = useState(0);

  return (
    <Flex direction="column" alignItems="center" gap={2} {...props}>
      <Stack direction="row" w="full">
        <Button colorScheme="teal" onClick={() => setPlaying(true)}>
          PLAY
        </Button>
        <Button colorScheme="teal" onClick={() => setPlaying(false)}>
          PAUSE
        </Button>
        <Button colorScheme="teal" onClick={() => setSeekTime(appTime - 5)}>
          -5 SEC
        </Button>
        <Button colorScheme="teal" onClick={() => setSeekTime(appTime + 5)}>
          +5 SEC
        </Button>
      </Stack>
      <Stack direction="row" w="full">
        <Text color="gray.6000">{new Date(appTime * 1000).toISOString().substring(11, 19)}</Text>
        <Slider
          value={appTime}
          min={0}
          max={duration}
          step={0.01} // You can adjust the step value as needed
          onChange={(value) => setSeekTime(value)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Stack>
      <Player
        audio={audio}
        playing={playing}
        seekTime={seekTime}
        onTimeUpdate={(event) => setAppTime(event.currentTarget.currentTime)}
        onLoadedData={(event) => setDuration(event.currentTarget.duration)}
      />
    </Flex>
  );
}

function Player({
  playing,
  seekTime,
  onTimeUpdate,
  onLoadedData,
  audio,
}: {
  playing: boolean;
  seekTime: number;
  onTimeUpdate: (event: React.SyntheticEvent<HTMLAudioElement>) => void;
  onLoadedData: (event: React.SyntheticEvent<HTMLAudioElement>) => void;
} & AudioData) {
  const ref = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      if (playing) {
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }
  }, [playing]);

  useEffect(() => {
    if (ref.current) {
      ref.current.currentTime = seekTime;
    }
  }, [seekTime]);

  const link = typeof audio == "string" ? audio : useMemo(() => window.URL.createObjectURL(audio), [audio]);

  return <audio src={link} ref={ref} onTimeUpdate={onTimeUpdate} onLoadedData={onLoadedData} />;
}
