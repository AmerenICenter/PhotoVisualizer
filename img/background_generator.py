from PIL import Image, ImageDraw

start = (107, 184, 53)
end = (36, 147, 60)
colorRange = [end[i] - start[i] for i in range(3)]
percent = 0.4

dimension = 100

im = Image.new("RGB", (dimension, ) * 2)
d = ImageDraw.Draw(im)

for xy in range(dimension):
    color = [int(start[i] + colorRange[i] * xy / dimension * percent) for i in range(3)]
    d.line([(0, xy), (100, xy)], fill=(color[0], color[1], color[2]))

im.save("background.png", "PNG")
del d
