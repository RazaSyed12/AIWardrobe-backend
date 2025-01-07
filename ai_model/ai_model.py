import sys
import csv
from PIL import Image

import numpy as np
from sklearn.cluster import KMeans
from collections import Counter

import torch
from torchvision import models, transforms

clasiification_path = "/Users/apple/Documents/AiWardrobe/backend/AIWardrobe-backend/ai_model/classification_FINAL.pth"
#clasiification_path = "classification_model_19.pth"
boundin_box_path = "/Users/apple/Documents/AiWardrobe/backend/AIWardrobe-backend/ai_model/bounding_box_FINAL.pth"
attributes_path = "/Users/apple/Documents/AiWardrobe/backend/AIWardrobe-backend/ai_model/attributes_FINAL.pth"
attributes_type_path = "/Users/apple/Documents/AiWardrobe/backend/AIWardrobe-backend/ai_model/Attributes_Types.csv"

learning_rate=0.01
size_of_batch=128
num_of_workers=8
num_of_epochs=10

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])



attributes_types = []
with open(attributes_type_path, mode='r') as file:
    reader = csv.reader(file)
    next(reader)
    for row in reader:
        attributes_types.append(row)


def get_Category(image):

    classification_categories={
    1:"Anorak",
    2:"Blazer",
    3:"Blouse",
    4:"Jacket", #Bomber
    5:"Button-Down",
    6:"Coat", # Cardigan
    7:"Flannel", 
    8:"Dress", #Halter
    9:"Henley", 
    10:"Hoodie",
    11:"Jacket", 
    12:"Tee", #Jersey
    13:"Jacket", #Parka
    14:"Coat", #Peacoat
    15:"Ponchio", 
    16:"Sweater",
    17:"Tee", #Tank
    18:"Tee",
    19:"Blouse", #Top
    20:"Turtleneck",
    21:"Shorts", #Capris
    22:"Chinos", 
    23:"Culottes", 
    24:"Shorts", #Cutoffs
    25:"Culottes", #Gauchos
    26:"Jeans",
    27:"Jeans", #Jeggings
    28:"Leggings", #Jodhpurs
    29:"Joggers",
    30:"Leggings",
    31:"Sarong",
    32:"Shorts",
    33:"Skirt",
    34:"Sweatpants",
    35:"Shorts", #Sweathorts
    36:"Shorts", #Trunks
    37:"Dress", #Caftan
    38:"Dress", #Cape
    39:"Coat",
    40:"Dress", #Coverup
    41:"Dress",
    42:"Jumpsuit",
    43:"Kaftan",
    44:"Kimono",
    45:"Dress", # NightDress
    46:"Onesie",
    47:"Dress", #Robe
    48:"Dress", #Romper
    49:"Dress", #ShirtDress
    50:"Dress"  #Sundress
    }    

    
    classification_model = models.resnet50(pretrained=False)
    classification_model.fc = torch.nn.Linear(classification_model.fc.in_features, 50)
    classification_model.load_state_dict(torch.load(clasiification_path, map_location=torch.device('cpu')))
    classification_model = classification_model.to(device)
    classification_model.eval()


    with torch.no_grad():
        outputs = classification_model(image)
    _, predicted = torch.max(outputs, 1)
    if predicted.item() < 21:
        return classification_categories[predicted.item()] ,"true"
    else:
        return classification_categories[predicted.item()] ,"false"

def rgb2hex(r,g,b):
    return "#{:02x}{:02x}{:02x}".format(r,g,b)

def extract_colors(image_tensor, num_colors=2):
    
    image_array = image_tensor.permute(1, 2, 0).cpu().numpy()
    pixels = image_array.reshape((-1, 3))
     
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    pixels = (pixels * std + mean) * 255
    pixels = np.clip(pixels, 0, 255).astype(np.uint8)

    # Remove black or near-black pixels (e.g., shadows)
    #pixels = pixels[np.any(pixels > 30, axis=1)]

    # Apply KMeans clustering to find dominant colors
    kmeans = KMeans(n_clusters=num_colors, random_state=0)
    kmeans.fit(pixels)
    
    # Count the occurrences of each cluster label
    counts = Counter(kmeans.labels_)

    # Sort the colors by frequency
    sorted_colors = [color for color, _ in counts.most_common()]

    # Get the RGB values of the dominant colors
    dominant_colors = kmeans.cluster_centers_[sorted_colors]

    return [tuple(map(int, color)) for color in dominant_colors]

def get_Colors(image):

    state_dict = torch.load(boundin_box_path, map_location=torch.device('cpu'))

    new_state_dict = {}
    for key, value in state_dict.items():
        new_key = key.replace("module.", "")
        new_state_dict[new_key] = value

    boundinbox_model = models.resnet50(pretrained=False)
    boundinbox_model.fc = torch.nn.Linear(boundinbox_model.fc.in_features, 4)
    boundinbox_model.load_state_dict(new_state_dict)
    boundinbox_model = boundinbox_model.to(device)
    boundinbox_model.eval()

    with torch.no_grad():
        outputs = boundinbox_model(image)

    
    x1 = round(outputs[0][0].item())
    y1 = round(outputs[0][1].item())
    x2 = round(outputs[0][2].item())
    y2 = round(outputs[0][3].item())

    image = image.squeeze(0)
    cropped_image = image[:, y1:y2, x1:x2]

    # Extract dominant colors
    dominant_colors = extract_colors(cropped_image)

    result = {
        'primary_color': dominant_colors[0] if len(dominant_colors) > 0 else None,
        'secondary_color': dominant_colors[1] if len(dominant_colors) > 1 else None
    }

    return result
    
def get_attributes(image):
    
    attributes_model = models.resnet50(pretrained=False)
    attributes_model.fc = torch.nn.Linear(attributes_model.fc.in_features, 1000)  # Assuming 50 classes
    attributes_model.load_state_dict(torch.load(attributes_path, map_location=device))
    attributes_model = attributes_model.to(device)
    attributes_model.eval()
    
    with torch.no_grad():
        outputs = attributes_model(image)
        probabilities = torch.sigmoid(outputs)
        predictions = (probabilities > 0.1).float()
    p =predictions.cpu().numpy()[0].tolist()

    attribute_arrays = {'1': [], '2': [], '3': [], '4': [], '5': []}
    for i in range(1000):
        if p[i]==1:
            attribute_arrays[attributes_types[i][1]].append(attributes_types[i][0])

    return attribute_arrays['1'],attribute_arrays['2'],attribute_arrays['3'],attribute_arrays['4'],attribute_arrays['5']    

def process_image(image_path):
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)
    image = image.to(device)

    clothing_type ,isTop  = get_Category(image)

    colors=get_Colors(image)
    
    primary_color = colors["primary_color"]
    secondary_color = colors["secondary_color"]

    primary_color = rgb2hex(primary_color[0],primary_color[1],primary_color[2])
    secondary_color = rgb2hex(secondary_color[0],secondary_color[1],secondary_color[2])

    texture , fabric , shape , pattern , style = get_attributes(image)

    return primary_color, secondary_color, clothing_type, texture, fabric, shape, pattern, style , isTop

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