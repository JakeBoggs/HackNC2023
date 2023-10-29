import json
import re

from flask import Flask, abort, render_template, request
from flask_cors import CORS
from functions import (embed, getEmbeddings, getNotes, getTranscriptMP3,
                       getTranscriptPDF)
from sentence_transformers import util

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def main():
    return render_template('index.html')

@app.route('/api/getNotes', methods=['POST'])
def summarizeMP3():
    if request.form.get("transcript"):
        transcript = json.loads(request.form["transcript"]) # this is a list
        notes = getNotes(". ".join(transcript))
        embeddings = getEmbeddings(transcript)
        resp = {}
        print(notes)
        print(embeddings)
        print(transcript)
        for bullet in notes:
            indices = [i for i in range(len(transcript))]
            resp[bullet] = sorted(zip(indices, util.cos_sim(embed(bullet), embeddings).numpy()[0]), key=lambda x: x[1], reverse=True)[0][0]
        return resp
    abort(500)

@app.route('/api/getTranscriptMP3', methods=['POST'])
def getTranscript():
    if request.files.get('audio'):
        path = "temp.mp3"
        request.files['audio'].save(path)
        result = getTranscriptMP3(path)
        return result
    abort(500)

@app.route('/api/summarizePDF', methods=['POST'])
def summarizePDF():
    # ONLY WORKS FOR PDFS WITH EMBEDDED TEXT
    if request.files.get('pdf'):
        transcript = getTranscriptPDF(request.files['pdf'])
        if transcript == "":
            abort(500)
        notes = getNotes(transcript)
        
        return notes
    abort(500)
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6969)