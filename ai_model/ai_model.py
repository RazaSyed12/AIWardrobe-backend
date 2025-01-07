import sys
from random import choice

def process_image(image_path):
    # Dummy AI processing logic
    # In a real-world scenario, you would load your trained AI model here,
    # and perform inference using the input image.

    # Dummy attributes that the AI model will predict
    primary_colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black']
    secondary_colors = ['White', 'Gray', 'None']  # None means no secondary color
    # types = ['T-Shirt', 'Sweater', 'Jacket', 'Jeans', 'Skirt']
    types = ['T-Shirt', 'Sweater']

    isTop = ['true','false']
    textures = ['Smooth', 'Rough', 'Soft', 'Stiff']
    fabrics = ['Cotton', 'Wool', 'Polyester', 'Silk']
    shapes = ['Slim Fit', 'Regular Fit', 'Loose Fit']
    patterns = ['Solid', 'Striped', 'Checked', 'Polka Dot']
    styles = ['Casual', 'Formal', 'Sporty', 'Vintage']
    isTop = ['true','false']

    # primary_color = choice(primary_colors)
    # secondary_color = choice(secondary_colors)
    # clothing_type = choice(types)
    # texture = choice(textures)
    # fabric = choice(fabrics)
    # shape = choice(shapes)
    # pattern = choice(patterns)
    # style = choice(styles)
    # isTop = choice(isTop)

    primary_color = '#4f3e31'
    secondary_color = '#898175'
    clothing_type = 'Shorts'
    texture = []
    fabric = ['leather']
    shape = ['pencil']
    pattern = ['drawstring', 'flat', 'flat_front']
    style = ['running']
    isTop = 'False'
    
    # Return the generated attributes
    return primary_color, secondary_color, clothing_type, texture, fabric, shape, pattern, style, isTop

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python ai_model.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]  # First argument is the image path
    # print("Image Path:", image_path)
    # Simulate AI processing
    primary_color, secondary_color, clothing_type, texture, fabric, shape, pattern, style, isTop = process_image(image_path)

    # Output the result as a comma-separated string
    print(f"{primary_color},{secondary_color},{clothing_type},{texture},{fabric},{shape},{pattern},{style},{isTop}")