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

@app.route('/api/summarizeMP3', methods=['POST'])
def summarizeMP3():
    pass
    if request.files.get('audio'):
        path = "temp.mp3"
        request.files['audio'].save(path)
        transcript = getTranscriptMP3(path)
        notes = getNotes(transcript)
        embeddings = getEmbeddings(transcript)
        for bullet in notes:
            print(bullet, sorted(zip(notes, util.cos_sim(embed(bullet), embeddings).numpy()[0]), key=lambda x: x[1], reverse=True)[0])
        return notes
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