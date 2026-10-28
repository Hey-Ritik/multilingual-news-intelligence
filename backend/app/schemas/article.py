from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from enum import Enum

class ExtractionStatus(str, Enum):
    FULL = "FULL"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"

class ArticleMetadata(BaseModel):
    title: Optional[str] = None
    publisher: Optional[str] = None
    publish_date: Optional[str] = None
    url: Optional[str] = None
    author: Optional[str] = None
    word_count: int = 0
    char_count: int = 0
    sentence_count: int = 0

class IngestedArticle(BaseModel):
    article_id: str
    text: str
    metadata: ArticleMetadata
    status: ExtractionStatus = ExtractionStatus.FULL
    extraction_notes: List[str] = Field(default_factory=list)

class TextIngestRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Raw text of the article")
    title: Optional[str] = Field(None, description="Optional article title")

class UrlIngestRequest(BaseModel):
    url: str = Field(..., description="Target article HTTP/HTTPS URL")

