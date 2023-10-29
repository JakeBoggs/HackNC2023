# Cogniscribe

## Inspiration
As college students, we understand the pressure of note-taking during limited lecture time. We wanted to alleviate this through a program that would automatically record, transcribe, and analyze lectures with minimal labor.

## Here's how it works.
Open the app, start recording, and let Cogniscribe's advanced audio processing algorithms kick in. As the recording progresses, the app identifies key phrases, concepts, and important details. Once the session is complete, Cogniscribe works its magic, condensing the audio into comprehensive, easy-to-read notes. But it doesn't stop there. Cogniscribe understands context and can distinguish between essential information and background noise, ensuring that your notes are focused and relevant. The app even categorizes content, making it a breeze to review specific topics later. Cogniscribe uses Whisper to transcribe the audio, then GPT to summarize the transcript and extract important details. The summarized bullet points in the notes are then mapped back to the original transcript with vector word embeddings so that the user can jump to that portion of the recording and see exactly what was said.

## Features
- Upload or record audio from your device
- Generates notes/summary of most useful information
- Citations: Click on note to go to transcript location where that information occurred
- Click on words in transcript to go to audio
- Seek, play, pause

## How we built it
We used Python, Flask, and the OpenAI API for processing the audio. React and Node.js were used to build the frontend webapp.

## Challenges
Aligning the transcription with the timestamps and audio was a technical challenge which we are greatly proud of overcoming.

## What we learned
We gained a better understanding of large language models and integrating multiple web technologies together.