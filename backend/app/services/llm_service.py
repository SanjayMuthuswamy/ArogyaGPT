"""
ArogyaGPT - LLM Service (Groq + LangChain)
Medical report simplification, summarization, and intelligent Q&A using Groq LLM.
"""

from typing import Optional

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
1. Summarize the report in simple English (or the target language if specified).
2. Explain what each abnormal value means in everyday terms.
3. Explain each diagnosis in patient-friendly language.
4. Provide clear lifestyle recommendations where appropriate.
5. Use bullet points and short paragraphs.
6. Do NOT add any new medical diagnoses not present in the report.
7. Do NOT provide specific medication advice.
8. End with "Please consult your doctor for personalized medical advice."

Target Language: {language}

Simplified Explanation:"""

SUMMARY_PROMPT_TEMPLATE = """Create a very brief 3-5 sentence summary of this simplified medical report for a patient:

{simplified_text}

Summary:"""

CHAT_PROMPT_TEMPLATE = """You are ArogyaGPT, a helpful AI health assistant for Indian patients. You are answering questions about a patient's medical report.

**Context from Medical Report:**
{context}

**Conversation History:**
{chat_history}

**Patient's Question:**
{question}

**Instructions:**
- Answer based ONLY on the provided context from the report.
- If the answer is not in the report, say so clearly.
- Use simple, patient-friendly language.
- Always recommend consulting a doctor for medical decisions.
- Be empathetic and supportive.

Answer:"""


class LLMService:
    """
    Groq LLM service for medical AI tasks.
    Uses LangChain for prompt management and response streaming.
    """

    def __init__(self) -> None:
        self._llm = None

    def _get_llm(self):
        """Lazy-load the Groq LLM client."""
        if self._llm is None:
            if not settings.GROQ_API_KEY:
                raise LLMServiceError("GROQ_API_KEY is not configured.")
            try:
                from langchain_groq import ChatGroq
                self._llm = ChatGroq(
                    api_key=settings.GROQ_API_KEY,
                    model=settings.GROQ_MODEL_NAME,
                    max_tokens=settings.GROQ_MAX_TOKENS,
                    temperature=settings.GROQ_TEMPERATURE,
                )
                logger.info(f"Groq LLM initialized: model={settings.GROQ_MODEL_NAME}")
            except ImportError:
                raise LLMServiceError(
                    "langchain-groq is not installed. Run: pip install langchain-groq"
                )
            except Exception as e:
                raise LLMServiceError(f"Failed to initialize Groq LLM: {str(e)}")
        return self._llm

    async def simplify_report(
        self,
        text: str,
        abnormalities: list[dict],
        diagnoses: list[dict],
        language: str = "en",
    ) -> str:
        """
        Simplify a medical report into patient-friendly language.

        Args:
            text: Cleaned extracted text from the report.
            abnormalities: List of detected abnormal values.
            diagnoses: List of detected conditions.
            language: Target language code.

        Returns:
            Simplified plain-language explanation string.
        """
        try:
            from langchain_core.prompts import PromptTemplate
            from langchain_core.output_parsers import StrOutputParser
            from app.core.constants import LANGUAGE_NAMES

            # Format abnormalities for the prompt
            abnorm_text = "\n".join([
                f"- {a.get('parameter_name', 'Unknown')}: {a.get('detected_value', '')} "
                f"({a.get('abnormality_type', '')} - {a.get('severity', '')})"
                for a in abnormalities
            ]) or "No abnormalities detected."

            diag_text = "\n".join([
                f"- {d.get('condition_name', d.get('name', 'Unknown'))}"
                for d in diagnoses
            ]) or "No specific diagnoses identified."

            lang_name = LANGUAGE_NAMES.get(language, "English")

            prompt = PromptTemplate.from_template(SIMPLIFY_PROMPT_TEMPLATE)
            chain = prompt | self._get_llm() | StrOutputParser()

            result = await chain.ainvoke({
                "report_text": text[:6000],  # Stay within context window
                "abnormalities": abnorm_text,
                "diagnoses": diag_text,
                "language": lang_name,
            })

            logger.info(f"LLM simplification complete | {len(result)} chars | lang={language}")
            return result.strip()

        except LLMServiceError:
            raise
        except Exception as e:
            logger.error(f"LLM simplification failed: {e}")
            raise LLMServiceError(f"Report simplification failed: {str(e)}")

    async def generate_summary(self, simplified_text: str) -> str:
        """Generate a brief summary from already-simplified report text."""
        try:
            from langchain_core.prompts import PromptTemplate
            from langchain_core.output_parsers import StrOutputParser

            prompt = PromptTemplate.from_template(SUMMARY_PROMPT_TEMPLATE)
            chain = prompt | self._get_llm() | StrOutputParser()

            result = await chain.ainvoke({"simplified_text": simplified_text[:3000]})
            return result.strip()

        except Exception as e:
            logger.error(f"LLM summary generation failed: {e}")
            return "Summary unavailable."

    async def answer_question(
        self,
        question: str,
        context: str,
        chat_history: str = "",
    ) -> str:
        """
        Answer a patient's question using RAG context from their report.

        Args:
            question: The patient's question.
            context: Retrieved relevant text chunks from the report.
            chat_history: Formatted prior conversation.

        Returns:
            AI-generated answer string.
        """
        try:
            from langchain_core.prompts import PromptTemplate
            from langchain_core.output_parsers import StrOutputParser

            prompt = PromptTemplate.from_template(CHAT_PROMPT_TEMPLATE)
            chain = prompt | self._get_llm() | StrOutputParser()

            result = await chain.ainvoke({
                "context": context[:4000],
                "chat_history": chat_history[-2000:] if chat_history else "No previous messages.",
                "question": question,
            })

            return result.strip()

        except Exception as e:
            logger.error(f"LLM Q&A failed: {e}")
            raise LLMServiceError(f"Chat response generation failed: {str(e)}")
