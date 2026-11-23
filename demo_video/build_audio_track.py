import subprocess
import imageio_ffmpeg
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

# Exact timeline offsets in seconds:
# Intro silence: 4.0s
# Ch1: at 4.0s (dur: 30.81s) -> ends at 34.81s
# Ch2: at 35.0s (dur: 29.47s) -> ends at 64.47s
# Ch3: at 65.0s (dur: 25.68s) -> ends at 90.68s
# Ch4: at 93.0s (dur: 25.46s) -> ends at 118.46s
# Ch5: at 122.0s (dur: 24.14s) -> ends at 146.14s
# Ch6: at 151.0s (dur: 22.58s) -> ends at 173.58s
# Outro silence: 173.58s to 180.0s (6.42s silence)

# We can construct an ffmpeg filter_complex with adelay and amix, then pad with apad to 180.0s:
inputs = [
    "-i", "demo_video/audio/ch1_vision.mp3",
    "-i", "demo_video/audio/ch2_telemetry.mp3",
    "-i", "demo_video/audio/ch3_routine.mp3",
    "-i", "demo_video/audio/ch4_commute_iaq.mp3",
    "-i", "demo_video/audio/ch5_community_advisories.mp3",
    "-i", "demo_video/audio/ch6_architecture.mp3"
]

filter_str = (
    "[0:a]adelay=4000|4000[a0];"
    "[1:a]adelay=35000|35000[a1];"
    "[2:a]adelay=65000|65000[a2];"
    "[3:a]adelay=93000|93000[a3];"
    "[4:a]adelay=122000|122000[a4];"
    "[5:a]adelay=151000|151000[a5];"
    "[a0][a1][a2][a3][a4][a5]amix=inputs=6:duration=longest:dropout_transition=0,apad=whole_dur=180[out]"
)

out_file = "demo_video/master_narration_3min.mp3"

cmd = [
    ffmpeg_exe,
    "-y",
    *inputs,
    "-filter_complex", filter_str,
    "-map", "[out]",
    "-t", "180.0",
    "-b:a", "192k",
    out_file
]

print("Assembling master 3-minute narration track...")
res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res.returncode != 0:
    print("FFmpeg Error:\n", res.stderr)
else:
    print("Master audio created successfully:", out_file)
