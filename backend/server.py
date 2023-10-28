from flask import Flask, abort, render_template, request
from flask_cors import CORS
from functions import getNotes, getTranscript

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def main():
    return render_template('index.html')

@app.route('/api/summarize', methods=['POST'])
def summarize():
    pass
    if request.files.get('audio'):
        transcript = getTranscript(request.files['audio'])
        notes = getNotes(transcript)

        return notes
    abort(500)




    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6969)