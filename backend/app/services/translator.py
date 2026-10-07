from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(temperature=0.1, model="gpt-4o-mini")

async def translate_text(text: str, target_language: str) -> str:
    """
    Template for translating medical text into regional languages.
    """
    prompt = PromptTemplate.from_template(
        "Translate the following medical text into {target_language}. "
        "Ensure the medical terminology is accurately translated and easy to understand.\n\n"
        "Text to translate:\n{text}\n\n"
        "Translation:"
    )
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        response = await chain.ainvoke({"text": text, "target_language": target_language})
        return response
    except Exception as e:
        print(f"Translation Error: {e}")
        return f"Error: Could not translate to {target_language}."
