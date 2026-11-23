import subprocess
import imageio_ffmpeg
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

# Create concat list
concat_file = "demo_video/slides_concat.txt"
with open(concat_file, "w") as f:
    f.write("ffconcat version 1.0\n")
    f.write("file 'slides/slide_01_intro.png'\n")
    f.write("duration 4.0\n")
    f.write("file 'slides/slide_02_landing.png'\n")
    f.write("duration 31.0\n")
    f.write("file 'slides/slide_03_dashboard.png'\n")
    f.write("duration 30.0\n")
    f.write("file 'slides/slide_04_routine.png'\n")
    f.write("duration 28.0\n")
    f.write("file 'slides/slide_05_commute.png'\n")
    f.write("duration 14.0\n")
    f.write("file 'slides/slide_06_indoor.png'\n")
    f.write("duration 15.0\n")
    f.write("file 'slides/slide_07_community.png'\n")
    f.write("duration 14.0\n")
    f.write("file 'slides/slide_08_advisories.png'\n")
    f.write("duration 15.0\n")
    f.write("file 'slides/slide_09_profile.png'\n")
    f.write("duration 23.0\n")
    f.write("file 'slides/slide_10_outro.png'\n")
    f.write("duration 6.0\n")
    f.write("file 'slides/slide_10_outro.png'\n")

output_mp4 = "demo_video/vayuwise_demo_3min.mp4"

cmd = [
    ffmpeg_exe,
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_file,
    "-i", "demo_video/master_narration_3min.mp3",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-r", "30",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    "-t", "180.0",
    output_mp4
]

print("Rendering high-definition 3-minute video (1080p @ 30fps)...")
res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
if res.returncode != 0:
    print("FFmpeg rendering error:\n", res.stderr)
else:
    print("Video rendered successfully:", output_mp4)
    file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
    print(f"File size: {file_size_mb:.2f} MB")
