import html
import re
from bs4 import BeautifulSoup

def clean_html_text(raw_text: str) -> str:
    """
    Strips raw HTML tags and decodes escaped HTML entities from feed text, titles, and snippets.
    Removes feed boilerplate and normalizes whitespace.
    """
    if not raw_text or not isinstance(raw_text, str):
        return ""

    text = raw_text

    # 1. Unescape HTML entities (e.g. &amp;#39; -> &#39; -> ')
    try:
        text = html.unescape(text)
        # Handle potential double-escaped entities
        if "&" in text:
            text = html.unescape(text)
    except Exception:
        pass

    # 2. Strip HTML tags using BeautifulSoup or regex
    if "<" in text and ">" in text:
        try:
            soup = BeautifulSoup(text, "html.parser")
            # Remove scripts, styles
            for elem in soup(["script", "style"]):
                elem.decompose()
            text = soup.get_text(separator=" ")
        except Exception:
            text = re.sub(r'<[^>]+>', ' ', text)

    # 3. Clean up common Google News RSS boilerplate fragments
    # e.g., "... - Times of India" or "View Full Coverage on Google News"
    text = re.sub(r'View Full Coverage on Google News', '', text, flags=re.IGNORECASE)
    text = re.sub(r'&nbsp;?', ' ', text)

    # 4. Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    return text

