from PIL import Image, ImageDraw, ImageFont
import os

def draw_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.15)
    w = size - pad * 2
    h = size - pad * 2
    
    # Background gradient using two colors
    for y in range(size):
        ratio = y / size
        r = int(66 * (1 - ratio) + 51 * ratio)
        g = int(133 * (1 - ratio) + 103 * ratio)
        b = int(244 * (1 - ratio) + 214 * ratio)
        for x in range(size):
            draw.point((x, y), (r, g, b, 255))
    
    # Round corners
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=int(size * 0.15), fill=255)
    img.putalpha(mask)
    
    # Redraw the draw object
    draw = ImageDraw.Draw(img)
    
    # Draw pages
    page_rect = [
        pad, 
        pad + int(h * 0.25), 
        pad + int(w * 0.7), 
        pad + int(h * 0.25) + int(h * 0.5)
    ]
    draw.rectangle(page_rect, fill=(255, 255, 255, 255))
    
    # Draw folder tab
    tab_points = [
        (pad, pad),
        (pad + int(w * 0.4), pad),
        (pad + int(w * 0.4), pad + int(h * 0.25)),
        (pad, pad + int(h * 0.25))
    ]
    draw.polygon(tab_points, fill=(255, 255, 255, 255))
    
    # Draw star
    star_cx = pad + int(w * 0.75)
    star_cy = pad + int(h * 0.4)
    star_outer = int(size * 0.12)
    star_inner = int(star_outer * 0.5)
    
    import math
    points = []
    for i in range(10):
        angle = math.radians(i * 36 - 90)
        radius = star_outer if i % 2 == 0 else star_inner
        x = star_cx + int(math.cos(angle) * radius)
        y = star_cy + int(math.sin(angle) * radius)
        points.append((x, y))
    
    draw.polygon(points, fill=(251, 188, 5, 255))
    
    return img

icons_dir = os.path.dirname(os.path.abspath(__file__))

sizes = [16, 48, 128]
for size in sizes:
    img = draw_icon(size)
    filename = os.path.join(icons_dir, f'icon{size}.png')
    img.save(filename)
    print(f'Generated {filename}')

print('All icons generated successfully!')
