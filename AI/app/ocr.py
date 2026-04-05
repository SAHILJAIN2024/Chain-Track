import numpy as np
import cv2
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en')

def extract_text(image_bytes):
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = ocr.predict(img)  # ✅ FIXED (no .ocr())

    lines = []
    for block in result:
        for line in block:
            lines.append(line[1][0])

    return "\n".join(lines)