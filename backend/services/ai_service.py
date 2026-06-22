import os
import json
import requests
import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
#print(os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


PROMPT = """
Extract from this receipt image:

merchant_name

date (YYYY-MM-DD)

total_amount (number only)

category (one of: Food, Transport, Shopping, Medical, Entertainment, Other)

items (array of {name, price})

Return JSON only.

Do not return markdown.

Do not return extra text.
"""


def analyze_receipt(image_url):

    # Download image from S3
    response = requests.get(image_url)

    if response.status_code != 200:
        raise Exception("Could not download image")

    image_bytes = response.content

    gemini_response = model.generate_content(
        [
            PROMPT,
            {
                "mime_type": "image/jpeg",
                "data": image_bytes,
            },
        ]
    )

    response_text = gemini_response.text.strip()

    try:

        # Remove markdown if AI accidentally returns it

        response_text = response_text.replace("```json", "")
        response_text = response_text.replace("```", "")

        data = json.loads(response_text)

        return data, response_text

    except Exception:

        raise Exception("Invalid JSON returned by Gemini")