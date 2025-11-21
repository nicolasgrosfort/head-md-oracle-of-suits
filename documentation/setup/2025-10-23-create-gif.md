# Create a .gif

Create a palette from the video file:

```bash
ffmpeg -i input.mov -vf "fps=15,scale=640:-1:flags=lanczos,palettegen" palette.png
```

Create the .gif using the palette:

```bash
ffmpeg -i input.mov -i palette.png -filter_complex "fps=15,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```
