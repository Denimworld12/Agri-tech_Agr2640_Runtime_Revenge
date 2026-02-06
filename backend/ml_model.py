import numpy as np
import tensorflow as tf
from PIL import Image
import io

from tensorflow.keras.applications.resnet import preprocess_input
from tensorflow.keras.preprocessing import image

# Load model ONCE (important)
MODEL_PATH = "model/cnn_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

CLASS_NAMES = [
    'BacterialBlights',
    'Healthy',
    'Mosaic',
    'RedRot',
    'Rust',
    'Yellow'
]

IMG_SIZE = (224, 224)


def prepare_image_from_bytes(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)

    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    return img_array


def predict_image(image_bytes):
    """
    Pure function:
    input  -> image bytes
    output -> prediction + confidence
    """

    img_array = prepare_image_from_bytes(image_bytes)

    predictions = model.predict(img_array)

    confidence = float(np.max(predictions) * 100)
    predicted_index = int(np.argmax(predictions))
    predicted_class = CLASS_NAMES[predicted_index]

    return {
        "prediction": predicted_class,
        "confidence": round(confidence, 2)
    }
