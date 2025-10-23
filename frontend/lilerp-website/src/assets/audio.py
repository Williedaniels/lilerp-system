import os
import subprocess

script_lines = [
    "Calling plus two three one one two three HELP...",
    "Welcome to LILERP Emergency Response",
    "Press 1 for English, 2 for Mano, 3 for Gio",
    "User presses 1",
    "Press 1 to report land dispute",
    "Press 2 if violence is happening – urgent",
    "Press 3 to speak with traditional chief",
    "User presses 1",
    "Recording your location. Speak after beep",
    "Ganta village, boundary dispute with neighbor",
    "Report submitted. Help is on the way."
]

print("Generating audio files...")

# Generate individual audio files using macOS 'say' command
for i, line in enumerate(script_lines):
    print(f"Creating line{i}.wav: {line}")
    subprocess.run(['say', '-o', f'line{i}.wav', '--data-format=LEI16@22050', line])

# Combine all files using ffmpeg (if available) or just create a simple combined file
try:
    # Try to combine with ffmpeg
    file_list = ' '.join([f'line{i}.wav' for i in range(len(script_lines))])
    subprocess.run(f'ffmpeg -i "concat:{"|".join([f"line{i}.wav" for i in range(len(script_lines))])}" -c copy LILERP_IVR_Demo.wav', shell=True)
    print("Combined demo created: LILERP_IVR_Demo.wav")
except:
    # If ffmpeg fails, just use the first file as demo
    subprocess.run(['cp', 'line0.wav', 'LILERP_IVR_Demo.wav'])
    print("Demo created: LILERP_IVR_Demo.wav (single file)")

print("Audio generation complete!")
print("To play the demo: open LILERP_IVR_Demo.wav")