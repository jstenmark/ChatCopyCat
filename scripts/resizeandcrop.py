from PIL import Image, ImageDraw

def resize_and_crop_center(img_path, output_path, resize_size=(192, 192), crop_size=(128, 128)):
    img = Image.open(img_path).convert("RGBA")

    # Resize image
    img = img.resize(resize_size, Image.Resampling.LANCZOS)

    # Calculate the cropping box for the center of the image
    left = (resize_size[0] - crop_size[0]) / 2
    top = (resize_size[1] - crop_size[1]) / 2
    right = (resize_size[0] + crop_size[0]) / 2
    bottom = (resize_size[1] + crop_size[1]) / 2
    img = img.crop((left, top, right, bottom))

    # Create mask for circular crop
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)

    # Apply mask
    result = Image.new("RGBA", img.size)
    result.putalpha(mask)
    result = Image.composite(img, result, mask)

    result.save(output_path, "PNG")

resize_and_crop_center("assets/128.png", "images/png/profile_128.png")
