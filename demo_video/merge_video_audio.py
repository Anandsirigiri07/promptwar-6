import os
import subprocess
import glob
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def merge():
    # Find the latest webm in raw_recording
    recordings = glob.glob("demo_video/raw_recording/*.webm")
    if not recordings:
        print("No recorded webm found in demo_video/raw_recording/")
        return
    
    # Sort by modification time
    recordings.sort(key=os.path.getmtime, reverse=True)
    raw_video = recordings[0]
    print(f"Found latest raw recording: {raw_video}")

    audio_file = "demo_video/master_narration_3min.mp3"
    output_mp4 = "demo_video/vayuwise_demo_3min.mp4"

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", raw_video,
        "-i", audio_file,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-t", "180.0",
        output_mp4
    ]

    print("Merging live interactive video with synchronized studio voice-over...")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        print("Error during FFmpeg merge:\n", res.stderr)
    else:
        print("Successfully merged into:", output_mp4)
        file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
        print(f"File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    merge()
