import json
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser

# Using a slightly higher temperature or a specific model if needed
llm = ChatOpenAI(temperature=0, model="gpt-4o-mini")

async def detect_abnormalities(text: str) -> list[str]:
    """
    Template for detecting abnormalities or red flags in a medical report.
    """
    prompt = PromptTemplate.from_template(
        "Analyze the following medical report text and identify any abnormalities, "
        "red flags, or out-of-range values. Return a JSON array of strings, where each string "
        "is a concise description of an abnormality found. If none are found, return an empty array [].\n\n"
        "Medical Report:\n{text}\n\n"
        "Abnormalities (JSON array):"
    )
    
    # We use a JSON parser to reliably get a list of strings
    chain = prompt | llm | JsonOutputParser()
    
    try:
        response = await chain.ainvoke({"text": text})
        if isinstance(response, list):
            return response
        return []
    except Exception as e:
        print(f"Anomaly Detection Error: {e}")
        return []
