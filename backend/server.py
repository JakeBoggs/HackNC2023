from flask import Flask, abort, render_template, request
from flask_cors import CORS
from functions import getNotes, getTranscriptMP3, getTranscriptPDF

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def main():
    return render_template('index.html')

@app.route('/api/summarizeMP3', methods=['POST'])
def summarizeMP3():
    pass
    if request.files.get('audio'):
        transcript = getTranscriptMP3(request.files['audio'])
        notes = getNotes(transcript)

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