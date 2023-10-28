import whisperx
from flask import Flask, render_template, request

app = Flask(__name__)

model = whisperx.load_model('small.en', 'cuda', compute_type='float16')

@app.route('/', methods=['GET'])
def main():
    return render_template('index.html')

@app.route('/api/summarize', methods=['POST'])
def summarize():
    if not request.method == 'POST':
        return
    
    if request.files.get('audio'):
        audio = request.files['audio']
        audio.save('temp.mp3')

        audio = whisperx.load_audio('temp.mp3')
        result = model.transcribe(audio, batch_size=16)#['transcription']

        return result

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6969)