import gc
import os
import warnings
import numpy as np
import torch
from whisperx.alignment import align, load_align_model
from whisperx.asr import load_model
from whisperx.audio import load_audio
from whisperx.diarize import DiarizationPipeline, assign_word_speakers
from whisperx.utils import LANGUAGES, TO_LANGUAGE_CODE, optional_float, optional_int, str2bool

def run_whisperx(audio_files, model="small.en", model_dir=None, device="cuda", device_index=0, batch_size=8, compute_type="float16", output_dir=".", output_format="all", verbose=True, task="transcribe", language=None, align_model=None, interpolate_method="nearest", no_align=False, return_char_alignments=False, vad_onset=0.500, vad_offset=0.363, chunk_size=30, diarize=False, min_speakers=None, max_speakers=None, temperature=0, best_of=5, beam_size=5, patience=1.0, length_penalty=1.0, suppress_tokens="-1", suppress_numerals=False, initial_prompt=None, condition_on_previous_text=False, fp16=True, temperature_increment_on_fallback=0.2, compression_ratio_threshold=2.4, logprob_threshold=-1.0, no_speech_threshold=0.6, max_line_width=None, max_line_count=None, highlight_words=False, segment_resolution="sentence", threads=0, hf_token=None, print_progress=False):
    
    # Part 0: Argument Processing
    
    # Convert language to lowercase if provided
    if language is not None:
        language = language.lower()
        if language not in LANGUAGES:
            if language in TO_LANGUAGE_CODE:
                language = TO_LANGUAGE_CODE[language]
            else:
                raise ValueError(f"Unsupported language: {language}")
    
    # Adjust model and language if model name implies English
    if model.endswith(".en") and language != "en":
        if language is not None:
            warnings.warn(
                f"{model} is an English-only model but received '{language}'; using English instead."
            )
        language = "en"
    
    align_language = language if language is not None else "en"
    
    # Prepare temperature
    if temperature_increment_on_fallback is not None:
        temperature = tuple(np.arange(temperature, 1.0 + 1e-6, temperature_increment_on_fallback))
    else:
        temperature = [temperature]
    
    # Configure number of threads for PyTorch
    faster_whisper_threads = 4
    if threads > 0:
        torch.set_num_threads(threads)
        faster_whisper_threads = threads
    
    asr_options = {
        "beam_size": beam_size,
        "patience": patience,
        "length_penalty": length_penalty,
        "temperatures": temperature,
        "compression_ratio_threshold": compression_ratio_threshold,
        "log_prob_threshold": logprob_threshold,
        "no_speech_threshold": no_speech_threshold,
        "condition_on_previous_text": condition_on_previous_text,
        "initial_prompt": initial_prompt,
        "suppress_tokens": [int(x) for x in suppress_tokens.split(",")],
        "suppress_numerals": suppress_numerals,
    }
    
    # Create the output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Part 1: VAD & ASR Loop
    
    results = []
    
    for audio_path in audio_files:
        audio = load_audio(audio_path)
        
        # >> VAD & ASR
        if verbose:
            print(">> Performing transcription...")
        
        model = load_model(model, device=device, device_index=device_index, compute_type=compute_type, language=language, asr_options=asr_options, vad_options={"vad_onset": vad_onset, "vad_offset": vad_offset}, task=task, threads=faster_whisper_threads)
        
        result = model.transcribe(audio, batch_size=batch_size, chunk_size=chunk_size, print_progress=print_progress)
        results.append((result, audio_path))
        
        # Unload Whisper and VAD
        del model
        gc.collect()
        torch.cuda.empty_cache()
    
    # Part 2: Align Loop
    if not no_align:
        tmp_results = results
        results = []
        align_model, align_metadata = load_align_model(align_language, device, model_name=align_model)
        for result, audio_path in tmp_results:
            # >> Align
            if len(tmp_results) > 1:
                input_audio = audio_path
            else:
                # Lazily load audio from Part 1
                input_audio = audio
    
            if align_model is not None and len(result["segments"]) > 0:
                if result.get("language", "en") != align_metadata["language"]:
                    # Load a new language
                    if verbose:
                        print(f"New language found ({result['language']}), previous was ({align_metadata['language']}), loading a new alignment model for the new language...")
                    align_model, align_metadata = load_align_model(result["language"], device)
                
                if verbose:
                    print(">> Performing alignment...")
                
                result = align(result["segments"], align_model, align_metadata, input_audio, device, interpolate_method=interpolate_method, return_char_alignments=return_char_alignments, print_progress=print_progress)
            
            results.append((result, audio_path))
        
        # Unload align model
        del align_model
        gc.collect()
        torch.cuda.empty_cache()
    
    # >> Diarize
    if diarize:
        if hf_token is None:
            print("Warning: no --hf_token used, needs to be saved in environment variable, otherwise will throw an error loading the diarization model...")
        tmp_results = results
        if verbose:
            print(">> Performing diarization...")
        
        results = []
        diarize_model = DiarizationPipeline(use_auth_token=hf_token, device=device)
        for result, input_audio_path in tmp_results:
            diarize_segments = diarize_model(input_audio_path, min_speakers=min_speakers, max_speakers=max_speakers)
            result = assign_word_speakers(diarize_segments, result)
            results.append((result, input_audio_path))
    
    return results

# Example usage:
# run_whisperx(
#     audio_files=["audio1.wav", "audio2.wav"],
#     model="large",
#     device="cuda",
#     output_dir="output_folder",
#     output_format="all",
#     verbose=True,
#     task="transcribe",
#     language="en",
#     align_model="align_model",
#     interpolate_method="nearest",
#     no_align=False,
#     return_char_alignments=False,
#     vad_onset=0.500,
#     vad_offset=0.363,
#     chunk_size=30,
#    
