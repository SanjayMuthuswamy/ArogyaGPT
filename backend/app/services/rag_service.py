import os
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(temperature=0.1, model="gpt-4o-mini")

async def process_report_into_vectorstore(text: str, report_id: int):
    """
    Template for creating a FAISS vector store from a report's text.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )
    chunks = text_splitter.split_text(text)
    
    documents = [Document(page_content=chunk, metadata={"report_id": report_id}) for chunk in chunks]
    
    if not documents:
        return None
        
    vector_store = FAISS.from_documents(documents, embeddings)
    
    # Save the index locally (or you could upload it to S3)
    index_path = f"faiss_indices/report_{report_id}"
    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    vector_store.save_local(index_path)
    
    return vector_store

async def chat_with_report(query: str, report_id: int) -> str:
    """
    Template for querying a vector store (RAG) and generating a response.
    """
    index_path = f"faiss_indices/report_{report_id}"
    
    if not os.path.exists(index_path):
        return "I couldn't find the data for this report."
        
    try:
        vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        docs = vector_store.similarity_search(query, k=4)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        prompt = PromptTemplate.from_template(
            "You are a helpful AI medical assistant. Answer the user's question based ONLY on the provided medical report context.\n"
            "If the answer is not in the context, say 'I don't have enough information in the report to answer that.'\n\n"
            "Context:\n{context}\n\n"
            "Question: {query}\n"
            "Answer:"
        )
        
        chain = prompt | llm | StrOutputParser()
        response = await chain.ainvoke({"context": context, "query": query})
        
        return response
    except Exception as e:
        print(f"RAG Error: {e}")
        return "An error occurred while analyzing the report."
