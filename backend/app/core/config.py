from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_TRANSLATE_API_KEY: str = ""
    AWS_S3_BUCKET: str = ""
    FAISS_INDEX_PATH: str = "./faiss_index"
    SPACY_MODEL: str = "en_core_web_sm"
    HUGGINGFACE_MODEL: str = "all-MiniLM-L6-v2"
    TTS_PROVIDER: str = "gtts"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
