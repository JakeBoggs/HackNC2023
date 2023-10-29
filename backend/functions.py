import json
import os
import re
import time
from typing import List

import numpy as np
import openai
import torch
from dotenv import load_dotenv

load_dotenv()

import whisperx
from aligned_whisperx import run_whisperx
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
    return list(map(lambda x: x.strip(), re.split(r'- ',completion.choices[0].message["content"])))


# model = whisperx.load_model('small.en', 'cuda', compute_type='float16')

embedding_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
def getEmbeddings(transcript: List[str]):
    return torch.tensor(np.array(list(map(lambda x: embed(x), transcript))))
    # return embed(transcript)

def embed(text):
    response = openai.Embedding.create(
    input=text,
    model="text-embedding-ada-002"
    )
    return np.array(response["data"][0]["embedding"])
    return embedding_model.encode(text)

def saveMP3(audio: any):
    audio.save('temp.mp3')

def getTranscriptMP3(path):
    result = run_whisperx([path])
    result = result[0][0]
    # audio = whisperx.load_audio(path)
    # result = model.transcribe(audio)
    # , batch_size=16, segment_resolution="chunk")#['transcription']
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
    embeddings = getEmbeddings(re.split(r'\. ', transcript))
    for bullet in notes:
        print(f"bullet point: {bullet} \n best match: { sorted(zip(transcript.split('.'), util.cos_sim(embed(bullet), embeddings).numpy()[0]), key=lambda x: x[1], reverse=True)[0][0]} \n\n")


    