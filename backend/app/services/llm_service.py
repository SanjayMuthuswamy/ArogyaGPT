import os
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

# Using OpenAI as a placeholder template for the LLM. 
# You can swap this with HuggingFace, Anthropic, Gemini, or local models.
# Make sure to set OPENAI_API_KEY in your .env
llm = ChatOpenAI(temperature=0.2, model="gpt-4o-mini")

async def simplify_medical_text(text: str) -> str:
    """
    Template for simplifying complex medical text into plain language.
    """
    prompt = PromptTemplate.from_template(
        "You are an expert medical communicator. Translate the following medical report "
        "into simple, easy-to-understand language for a patient with no medical background. "
        "Keep the tone empathetic and informative.\n\n"
        "Medical Report:\n{text}\n\n"
        "Simplified Explanation:"
    )
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        response = await chain.ainvoke({"text": text})
        return response
    except Exception as e:
        print(f"Error in LLM simplification: {e}")
        return "Error: Failed to simplify report. Please try again."
