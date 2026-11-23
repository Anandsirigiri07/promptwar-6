import os
import subprocess
import json
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def get_duration(file_path):
    cmd = [
        ffmpeg_exe,
        "-i", file_path,
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd, stderr=subprocess.PIPE, text=True, errors="replace")
    for line in result.stderr.splitlines():
        if "time=" in line:
            parts = line.split("time=")[1].split()[0]
            # format HH:MM:SS.xx
            h, m, s = parts.split(":")
            return float(h)*3600 + float(m)*60 + float(s)
    return 0.0

audio_dir = "demo_video/audio"
files = [
    "ch1_vision.mp3",
    "ch2_telemetry.mp3",
    "ch3_routine.mp3",
    "ch4_commute_iaq.mp3",
    "ch5_community_advisories.mp3",
    "ch6_architecture.mp3"
]

total = 0.0
for f in files:
    path = os.path.join(audio_dir, f)
    dur = get_duration(path)
    total += dur
    print(f"{f}: {dur:.2f}s")
print(f"Total raw audio: {total:.2f}s")
