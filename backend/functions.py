import json
import os
import time
from typing import List

import openai
from dotenv import load_dotenv

load_dotenv()

import whisperx
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer, util

openai.api_key = os.getenv("API_KEY")
if openai.api_key == None:
    print("please provide an api key!")
    quit() 

def getNotes(s: str):
    print("inferernce started")
    t = time.time()
    completion = openai.ChatCompletion.create(
    model="gpt-3.5-turbo-16k",
    messages=[
        {"role": "system", "content": "You are an assistant that will create bullet points of information and examples."},
        {"role": "user", "content": s}
    ]
    )

    print("inference took: " + str(time.time() - t))
    return list(map(lambda x: x.strip(), filter( lambda x: x.strip() != "", completion.choices[0].message["content"].split("-"))))


model = whisperx.load_model('small.en', 'cuda', compute_type='float16')

embedding_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
def getEmbeddings(transcript: List[str]):
    return embed(transcript)

def embed(text):
    return embedding_model.encode(text)

def saveMP3(audio: any):
    audio.save('temp.mp3')

def getTranscriptMP3(path):
    audio = whisperx.load_audio(path)
    result = model.transcribe(audio, batch_size=16)#['transcription']
    print(result)

    result = " ".join([section["text"] for section in result["segments"]])
    return result
    
def getTranscriptPDF(pdf: any):
    reader = PdfReader(pdf)
    transcript = " ".join([page.extract_text() for page in reader.pages])
    return transcript

if __name__ == "__main__":
    text = open('./tmp/transcript3.txt', 'r')
    # transcript = getTranscriptMP3("temp.mp3")
    # fp = open("transcript", 'w')
    # fp.write(json.dumps(transcript))
    # notes = getNotes(transcript)
    # fp = open("notes", 'w')
    # fp.write(json.dumps(notes))
    transcript = json.loads(open("transcript", "r").read())
    notes = json.loads(open("notes", "r").read())
    embeddings = getEmbeddings(transcript)
    for bullet in notes:
        print(f"bullet point: {bullet} \n best match: { sorted(zip(transcript.split('.'), util.cos_sim(embed(bullet), embeddings).numpy()[0]), key=lambda x: x[1], reverse=True)[0][0]} \n\n")


    