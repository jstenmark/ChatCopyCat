from PIL import Image, ImageDraw

def make_circle_transparent_and_resize(img_path, output_path, size=(512, 512)):
    img = Image.open(img_path).convert("RGBA")
    img = img.resize(size, Image.Resampling.LANCZOS)  # Updated line

    # Creating mask for circular image
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)

    # Apply mask to resized image
    result = Image.new("RGBA", img.size)
    result.putalpha(mask)
    result = Image.composite(img, result, mask)

    result.save(output_path, "PNG")

make_circle_transparent_and_resize("cat.png", "cat_out.png")
