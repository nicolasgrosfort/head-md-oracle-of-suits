# Oracle of Suits

A project to design embodied, playful, and accessible interactive experiences revealing the stories behind playing-card suits for the Swiss Museum of Games.

## Summary

- [Process](/process)
- [Code](/code)
- [Press-kit](/press-kit)

## How to use it

### Obsidian

The documentation part of this project is built with [Obsidian](https://obsidian.md/).
Obsidian is a powerful knowledge management tool that allows you to organize notes in a non-linear way, through links and tags.

## Tools

### Create .gif

Create a palette from the video file:

```bash
ffmpeg -i input.mov -vf "fps=15,scale=640:-1:flags=lanczos,palettegen" palette.png
```

Create the .gif using the palette:

```bash
ffmpeg -i input.mov -i palette.png -filter_complex "fps=15,scale=640:-1:flags=lanczos[x];[x][1:v]paletteuse" output.gif
```
