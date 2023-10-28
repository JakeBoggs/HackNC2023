# audio_file= open("file.mp3", "rb")
# transcript = openai.Audio.transcribe("whisper-1", audio_file)
# print(transcript)
import os
import time

import openai
from dotenv import load_dotenv

load_dotenv()

import whisperx
from PyPDF2 import PdfReader

openai.api_key = os.getenv("api_key")
if openai.api_key == None:
    print("please provide an api key!")
    quit() 

def getNotes(s: str):
    print("inferernce started")
    t = time.time()
    completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are an assistant that will create bullet points of information and examples."},
        {"role": "user", "content": s}
    ]
    )
    print("inference took: " + str(time.time() - t))

    return completion.choices[0].message["content"]

model = whisperx.load_model('small.en', 'cuda', compute_type='float16')

def getTranscriptMP3(audio: any):
    # audio.save('temp.mp3')
#   
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filename = "file.mp3"
    abs_file_path = os.path.join(script_dir, filename)
    print("abs_file_path:::::", abs_file_path)
    audio = whisperx.load_audio(abs_file_path)
    result = model.transcribe(audio, batch_size=16)#['transcription']
# 
    return result
    
def getTranscriptPDF(pdf: any):
    reader = PdfReader(pdf)
    transcript = " ".join([page.extract_text() for page in reader.pages])
    return transcript

if __name__ == "__main__":
    print(os.getcwd())
    text = open('./tmp/transcript3.txt', 'r')
    print(getTranscriptMP3(text.read()))
    