import sys
import torch
from torchvision import models, transforms
from random import choice
from PIL import Image



transform = transforms.Compose([
    transforms.Resize((224, 224)),  
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])  
])

classification_categories={
    1:"Anorak",
    2:"Blazer",
    3:"Blouse",
    4:"Bomber",
    5:"Button-Down",
    6:"Cardigan",
    7:"Flannel",
    8:"Halter",
    9:"Henley",
    10:"Hoodie",
    11:"Jacket",
    12:"Jersey",
    13:"Parka",
    14:"Peacoat",
    15:"Poncho",
    16:"Sweater",
    17:"Tank",
    18:"Tee",
    19:"Top",
    20:"Turtleneck",
    21:"Capris",
    22:"Chinos",
    23:"Culottes",
    24:"Cutoffs",
    25:"Gauchos",
    26:"Jeans",
    27:"Jeggings",
    28:"Jodhpurs",
    29:"Joggers",
    30:"Leggings",
    31:"Sarong",
    32:"Shorts",
    33:"Skirt",
    34:"Sweatpants",
    35:"Sweatshorts",
    36:"Trunks",
    37:"Caftan",
    38:"Cape",
    39:"Coat",
    40:"Coverup",
    41:"Dress",
    42:"Jumpsuit",
    43:"Kaftan",
    44:"Kimono",
    45:"Nightdress",
    46:"Onesie",
    47:"Robe",
    48:"Romper",
    49:"Shirtdress",
    50:"Sundress"
    }

# Load the trained model from a saved file
def load_model(model_path):
    model = models.resnet50(pretrained=False)
    model.fc = torch.nn.Linear(model.fc.in_features, 50)
    
    # Load the saved weights
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.load_state_dict(torch.load(model_path, map_location=device))
    
    # Set the model to evaluation mode
    model.eval()
    return model

model = load_model('/Users/apple/Documents/AiWardrobe/backend/AIWardrobe-backend/ai_model/classification_model.pth')

# Function to predict the class of an image
def predict_image(model, image_path):
    # Load and preprocess the image
    image = Image.open(image_path).convert('RGB')
    image = transform(image).unsqueeze(0)  # Add batch dimension (1, 3, 224, 224)

    # Make prediction
    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)
    return predicted.item()

def process_image(image_path):
    # Dummy AI processing logic
    # In a real-world scenario, you would load your trained AI model here,
    # and perform inference using the input image.

    # Dummy attributes that the AI model will predict
    primary_colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black']
    secondary_colors = ['White', 'Gray', 'None']  # None means no secondary color
    
    label = predict_image(model, image_path)

    primary_color = choice(primary_colors)
    secondary_color = choice(secondary_colors)
    clothing_type = classification_categories[label]

    # Return the generated attributes
    return primary_color, secondary_color, clothing_type


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python ai_model.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]  # First argument is the image path
    # Simulate AI processing
    primary_color, secondary_color, clothing_type = process_image(image_path)

    # Output the result as a comma-separated string
    print(f"{primary_color},{secondary_color},{clothing_type}")