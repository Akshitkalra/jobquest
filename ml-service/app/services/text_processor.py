import re


def clean_text(text: str) -> str:
    """Remove HTML tags, normalize whitespace, and clean text for embedding."""
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+", " ", text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r"[^\w\s.,;:!?'-]", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def prepare_job_text(
    title: str,
    description: str,
    requirements: str | None = None,
    skills: list[str] | None = None,
) -> str:
    """Combine job fields into a single text for embedding."""
    parts = [title, description]
    if requirements:
        parts.append(requirements)
    if skills:
        parts.append("Skills: " + ", ".join(skills))
    combined = " ".join(parts)
    return clean_text(combined)


def prepare_resume_text(
    parsed_text: str,
    headline: str | None = None,
    skills: list[str] | None = None,
) -> str:
    """Combine resume fields into a single text for embedding."""
    parts = []
    if headline:
        parts.append(headline)
    parts.append(parsed_text)
    if skills:
        parts.append("Skills: " + ", ".join(skills))
    combined = " ".join(parts)
    return clean_text(combined)
