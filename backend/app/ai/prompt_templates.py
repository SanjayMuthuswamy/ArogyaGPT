from langchain_core.prompts import PromptTemplate

SIMPLIFICATION_PROMPT = PromptTemplate.from_template(
    "You are a medical assistant. Simplify the following medical report for a patient to understand:\n\n{report_text}"
)

QA_PROMPT = PromptTemplate.from_template(
    "Answer the patient's question based on their medical report:\nReport: {report_text}\nQuestion: {question}"
)
