# audio_file= open("file.mp3", "rb")
# transcript = openai.Audio.transcribe("whisper-1", audio_file)
# print(transcript)
import os

import openai
import whisperx

openai.api_key = os.getenv("api_key")
if openai.api_key == None:
    print("please provide an api key!")
    quit() 

def getNotes(s: str):
    completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo-16k",
    messages=[
        {"role": "system", "content": "You are an assistant that will create bullet points of information and examples."},
        {"role": "user", "content": s}
    ]
    )
    
    print(completion.choices[0].message["content"])
    return completion.choices[0].message["content"]

model = whisperx.load_model('small.en', 'cuda', compute_type='float16')

def getTranscript(audio: any):
    audio.save('temp.mp3')

    audio = whisperx.load_audio('temp.mp3')
    result = model.transcribe(audio, batch_size=16)#['transcription']

    return result
    
if __name__ == "__main__":
    text = open('./tmp/transcript3.txt', 'r')
    getNotes(text.read())
    