"""
ArogyaGPT - LLM Service (Groq Async Client)
Medical report simplification, summarization, and intelligent Q&A using Groq LLM.
"""

from typing import Optional
from groq import AsyncGroq

from app.core.config import settings
from app.core.exceptions import LLMServiceError
from app.core.logging import get_logger

logger = get_logger(__name__)

# Medical report simplification prompt
SIMPLIFY_PROMPT_TEMPLATE = """You are a compassionate medical expert translating a complex medical report into simple, easy-to-understand language for a patient in India.

The patient may not have a medical background. Explain findings clearly, warmly, and without causing unnecessary alarm.

**Medical Report Text:**
{report_text}

**Detected Abnormalities:**
{abnormalities}

**Detected Diagnoses:**
{diagnoses}

**Instructions:**
1. Summarize the report clearly and simply for the patient.
2. Explain what each abnormal value means in everyday terms.
3. Explain each diagnosis in patient-friendly language.
4. Provide clear lifestyle recommendations where appropriate.
5. Use bullet points and short paragraphs.
6. Do NOT add any new medical diagnoses not present in the report.
7. Do NOT provide specific medication advice.
8. End with "Please consult your doctor for personalized medical advice." (translated to the target language).
9. STRICT MULTILINGUAL REQUIREMENT: You MUST write your entire explanation in {language}. If Tamil, write completely in Tamil script (தமிழ்). If Hindi, write completely in Devanagari script (हिन्दी). If Telugu, write in Telugu (తెలుగు), etc.

Target Language: {language}

Simplified Explanation:"""

SUMMARY_PROMPT_TEMPLATE = """Create a very brief 3-5 sentence summary of this simplified medical report for a patient:

{simplified_text}

Summary:"""

CHAT_PROMPT_TEMPLATE = """You are ArogyaGPT, a compassionate AI medical assistant for Indian patients. You are answering questions about the patient's medical report.

**Context from Medical Report:**
{context}

**Conversation History:**
{chat_history}

**Patient's Question:**
{question}

**Instructions:**
1. Answer based on the provided context from the medical report.
2. If the answer is not in the report, state that clearly without guessing.
3. Use simple, patient-friendly, compassionate language.
4. Always advise consulting their doctor for clinical decisions.
5. STRICT MULTILINGUAL REQUIREMENT: You MUST write your entire response in {target_language}.
   - If the chosen language is Tamil, respond completely in Tamil script (தமிழ்).
   - If Hindi, respond completely in Hindi script (हिन्दी).
   - If Telugu, respond completely in Telugu script (తెలుగు).
   - If Kannada, respond completely in Kannada script (ಕನ್ನಡ).
   - If Malayalam, respond completely in Malayalam script (മലയാളം).
   - If Bengali, respond completely in Bengali script (বাংলা).
   - If English, respond in English.
   Do NOT mix languages or default to English unless English is explicitly requested.

Target Language: {target_language}

Answer:"""


LANGUAGE_MAP: dict[str, str] = {
    "en": "English",
    "english": "English",
    "ta": "Tamil (தமிழ் - write strictly in Tamil script)",
    "tamil": "Tamil (தமிழ் - write strictly in Tamil script)",
    "hi": "Hindi (हिन्दी - write strictly in Hindi Devanagari script)",
    "hindi": "Hindi (हिन्दी - write strictly in Hindi Devanagari script)",
    "te": "Telugu (తెలుగు - write strictly in Telugu script)",
    "telugu": "Telugu (తెలుగు - write strictly in Telugu script)",
    "kn": "Kannada (ಕನ್ನಡ - write strictly in Kannada script)",
    "kannada": "Kannada (ಕನ್ನಡ - write strictly in Kannada script)",
    "ml": "Malayalam (മലയാളം - write strictly in Malayalam script)",
    "malayalam": "Malayalam (മലയാളം - write strictly in Malayalam script)",
    "bn": "Bengali (বাংলা - write strictly in Bengali script)",
    "bengali": "Bengali (বাংলা - write strictly in Bengali script)",
    "mr": "Marathi (मराठी - write strictly in Marathi script)",
    "marathi": "Marathi (मराठी - write strictly in Marathi script)",
    "gu": "Gujarati (ગુજરાતી - write strictly in Gujarati script)",
    "gujarati": "Gujarati (ગુજરાતી - write strictly in Gujarati script)",
    "pa": "Punjabi (ਪੰਜਾਬੀ - write strictly in Punjabi Gurmukhi script)",
    "punjabi": "Punjabi (ਪੰਜਾਬੀ - write strictly in Punjabi Gurmukhi script)",
    "or": "Odia (ଓଡ଼ିଆ - write strictly in Odia script)",
    "odia": "Odia (ଓଡ଼ିଆ - write strictly in Odia script)",
    "ur": "Urdu (اردو - write strictly in Urdu script)",
    "urdu": "Urdu (اردو - write strictly in Urdu script)",
}


class LLMService:
    """
    Groq LLM service for medical AI tasks using official AsyncGroq client.
    """

    def __init__(self) -> None:
        self._client: Optional[AsyncGroq] = None
        self._candidate_models = [
            settings.GROQ_MODEL_NAME,
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
        ]

    def _get_client(self) -> AsyncGroq:
        """Lazy-load the Groq Async client."""
        if self._client is None:
            if not settings.GROQ_API_KEY:
                raise LLMServiceError("GROQ_API_KEY is not configured.")
            self._client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            logger.info("Groq Async client initialized.")
        return self._client

    async def _generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.1) -> str:
        """Send prompt to Groq with model fallback resilience."""
        client = self._get_client()
        last_error = None

        for model in self._candidate_models:
            if not model:
                continue
            try:
                resp = await client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                content = resp.choices[0].message.content
                if content:
                    return content.strip()
            except Exception as e:
                logger.warning(f"Groq generation failed with model '{model}': {e}. Trying next model...")
                last_error = e

        raise LLMServiceError(f"All Groq models failed: {last_error}")

    async def simplify_report(
        self,
        text: str,
        abnormalities: list[dict],
        diagnoses: list[dict],
        language: str = "en",
    ) -> str:
        """
        Simplify a medical report into patient-friendly language.
        """
        target_lang = LANGUAGE_MAP.get(language.strip().lower(), language)

        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not configured. Generating simplified report fallback.")
            findings_str = "\n".join([
                f"- **{a.get('parameter_name', 'Parameter')}**: {a.get('detected_value', '')} ({a.get('severity', 'abnormal')})"
                for a in abnormalities
            ]) or "No abnormal parameters identified."

            diag_str = "\n".join([
                f"- **{d.get('condition_name', d.get('name', 'Condition'))}**"
                for d in diagnoses
            ]) or "No diagnostic flags identified."

            return f"""### Medical Report Analysis
Findings extracted from your document:

#### Findings & Alerts:
{findings_str}

#### Clinical Conditions:
{diag_str}

*Explanation prepared in {target_lang}.*
Please consult your doctor for personalized medical advice."""

        try:
            abnorm_text = "\n".join([
                f"- {a.get('parameter_name', 'Unknown')}: {a.get('detected_value', '')} "
                f"({a.get('abnormality_type', '')} - {a.get('severity', '')})"
                for a in abnormalities
            ]) or "No abnormalities detected."

            diag_text = "\n".join([
                f"- {d.get('condition_name', d.get('name', 'Unknown'))}"
                for d in diagnoses
            ]) or "No specific diagnoses identified."

            prompt = SIMPLIFY_PROMPT_TEMPLATE.format(
                report_text=text[:6000],
                abnormalities=abnorm_text,
                diagnoses=diag_text,
                language=target_lang,
            )

            result = await self._generate(prompt, max_tokens=settings.GROQ_MAX_TOKENS, temperature=settings.GROQ_TEMPERATURE)
            logger.info(f"LLM simplification complete | {len(result)} chars | lang={language}")
            return result

        except Exception as e:
            logger.error(f"LLM simplification failed: {e}")
            raise LLMServiceError(f"Report simplification failed: {str(e)}")

    async def generate_summary(self, simplified_text: str) -> str:
        """Generate a brief summary from already-simplified report text."""
        if not settings.GROQ_API_KEY:
            return "Report analysis completed. Please review findings above."

        try:
            prompt = SUMMARY_PROMPT_TEMPLATE.format(simplified_text=simplified_text[:3000])
            result = await self._generate(prompt, max_tokens=250, temperature=0.2)
            return result
        except Exception as e:
            logger.error(f"LLM summary generation failed: {e}")
            return "Summary unavailable."

    async def answer_question(
        self,
        question: str,
        context: str,
        chat_history: str = "",
        language: str = "en",
    ) -> str:
        """
        Answer a patient's question using RAG context from their report in their chosen language.
        """
        target_lang = LANGUAGE_MAP.get(language.strip().lower(), language)

        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY not configured. Generating mock Q&A answer.")
            return f"You asked: '{question}'. Groq API is not configured. Please add GROQ_API_KEY to backend/.env."

        try:
            prompt = CHAT_PROMPT_TEMPLATE.format(
                context=context[:4000],
                chat_history=chat_history[-2000:] if chat_history else "No previous messages.",
                question=question,
                target_language=target_lang,
            )
            result = await self._generate(prompt, max_tokens=1000, temperature=0.1)
            return result
        except Exception as e:
            logger.error(f"LLM Q&A failed: {e}")
            raise LLMServiceError(f"Chat response generation failed: {str(e)}")
