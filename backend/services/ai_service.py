# backend/services/ai_service.py
import os
import base64
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_VISION_MODEL = os.getenv("NVIDIA_VISION_MODEL", "nvidia/llama-3.1-nemotron-nano-vl-8b-v1")

# This client object works exactly like the OpenAI client,
# except it's pointed at NVIDIA's servers via base_url.
client = OpenAI(
    api_key=NVIDIA_API_KEY,
    base_url=NVIDIA_BASE_URL
)


def download_image_as_base64(image_url: str) -> str:
    """
    Downloads the receipt image from S3 and converts it to a base64 data URL.
    NVIDIA NIM (like most vision APIs) needs the image embedded directly
    in the request — it cannot just fetch a public S3 URL itself.
    """
    response = requests.get(image_url, timeout=10)
    response.raise_for_status()

    image_bytes = response.content
    base64_str = base64.b64encode(image_bytes).decode("utf-8")

    # Detect content type roughly from the URL extension
    if image_url.lower().endswith(".png"):
        mime_type = "image/png"
    else:
        mime_type = "image/jpeg"

    return f"data:{mime_type};base64,{base64_str}"


def build_extraction_prompt():

    return """
You are a receipt extraction system.

Analyze this image.

If this image is NOT a receipt, is blank, unreadable, too blurry, or there is insufficient information, return EXACTLY:

{
  "error": "Unable to analyze receipt"
}

Otherwise return ONLY valid JSON in this format:

{
  "merchant_name": "",
  "date": "YYYY-MM-DD",
  "total_amount": 0.0,
  "category": "",
  "items": [
    {
      "name": "",
      "price": 0.0
    }
  ]
}

Rules:

- Do NOT invent information.
- Do NOT guess merchant names.
- Do NOT guess dates.
- Do NOT guess prices.
- Do NOT hallucinate.
- category must be one of:
  Food
  Transport
  Shopping
  Medical
  Entertainment
  Other

Return JSON only.
"""

def analyze_receipt(image_url: str) -> dict:
    """
    Main function. Takes an S3 image URL, returns a dict with extracted data.
    Raises an exception if the AI fails or returns unparseable output —
    the caller (the route) is responsible for catching this and marking
    the receipt as 'failed'.
    """
    image_data_url = download_image_as_base64(image_url)
    prompt = build_extraction_prompt()

    response = client.chat.completions.create(
        model=NVIDIA_VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_data_url}
                    }
                ]
            }
        ],
        temperature=0.2,   # low temperature = more consistent, less "creative" JSON
        max_tokens=1024
    )

    raw_text = response.choices[0].message.content.strip()

    # Models sometimes wrap JSON in ```json ... ``` even when told not to.
    # Strip that defensively before parsing.
    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.lower().startswith("json"):
            raw_text = raw_text[4:].strip()

    extracted_data = json.loads(raw_text)  # raises ValueError if invalid JSON
    if "error" in extracted_data:
        raise Exception(
            extracted_data["error"]
        )
    # Build the log info the route will save to ai_logs
    extracted_data["_raw_prompt"] = prompt
    extracted_data["_raw_response"] = raw_text
    extracted_data["_tokens_used"] = response.usage.total_tokens if response.usage else None

    return extracted_data