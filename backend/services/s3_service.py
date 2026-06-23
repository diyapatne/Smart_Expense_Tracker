import os
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=AWS_REGION,
)


def upload_to_s3(file_bytes, filename):

    s3.put_object(
    Bucket=AWS_BUCKET_NAME,
    Key=filename,
    Body=file_bytes,
    ContentType="image/jpeg"
)

    image_url = (
        f"https://{AWS_BUCKET_NAME}"
        f".s3.{AWS_REGION}.amazonaws.com/{filename}"
    )

    return image_url
