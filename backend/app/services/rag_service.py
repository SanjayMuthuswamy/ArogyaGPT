"""
ArogyaGPT - RAG Service
FAISS vector store + LangChain retriever for medical report Q&A.
"""

import os
import pickle
from pathlib import Path
from typing import Optional

from app.core.config import settings
from app.core.exceptions import RAGIndexingError
from app.core.logging import get_logger

logger = get_logger(__name__)


class RAGService:
    """
    Retrieval-Augmented Generation service using FAISS + Sentence Transformers.

    Manages:
    - Document chunking with overlap
    - Sentence transformer embeddings
    - Per-report FAISS index
    - Similarity-based retrieval
    - Conversational context injection
    """

    def __init__(self) -> None:
        self._embedding_model = None
        self.embedding_model_name = settings.HUGGINGFACE_MODEL
        self.chunk_size = settings.RAG_CHUNK_SIZE
        self.chunk_overlap = settings.RAG_CHUNK_OVERLAP
        self.top_k = settings.RAG_TOP_K
        self.index_dir = Path(settings.FAISS_INDEX_PATH)

    def _get_embedding_model(self):
        """Lazy-load the sentence transformer model."""
        if self._embedding_model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedding_model = SentenceTransformer(
                    self.embedding_model_name,
                    device=settings.EMBEDDING_DEVICE,
                )
                logger.info(f"Embedding model loaded: {self.embedding_model_name}")
            except ImportError:
                raise RAGIndexingError(
                    "sentence-transformers is not installed. "
                    "Run: pip install sentence-transformers"
                )
            except Exception as e:
                raise RAGIndexingError(f"Failed to load embedding model: {str(e)}")
        return self._embedding_model

    def _chunk_text(self, text: str) -> list[str]:
        """
        Split text into overlapping chunks using word boundaries.

        Args:
            text: Input text to chunk.

        Returns:
            List of text chunks.
        """
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk = " ".join(words[start:end])
            if chunk.strip():
                chunks.append(chunk)
            if end >= len(words):
                break
            start = end - self.chunk_overlap
        return chunks

    def _get_index_path(self, report_id: str) -> Path:
        """Get FAISS index path for a specific report."""
        return self.index_dir / f"report_{report_id}.faiss"

    def _get_chunks_path(self, report_id: str) -> Path:
        """Get the pickled chunks path for a specific report."""
        return self.index_dir / f"report_{report_id}.pkl"

    async def chunk_and_index(self, text: str, report_id: str) -> list[str]:
        """
        Chunk the text, embed, and store in a per-report FAISS index.

        Args:
            text: Cleaned report text.
            report_id: Report UUID (used as FAISS index identifier).

        Returns:
            List of text chunks (for storage in DB).
        """
        try:
            import faiss
            import numpy as np

            self.index_dir.mkdir(parents=True, exist_ok=True)
            chunks = self._chunk_text(text)

            if not chunks:
                logger.warning(f"No chunks generated for report {report_id}")
                return []

            model = self._get_embedding_model()
            embeddings = model.encode(
                chunks,
                batch_size=settings.EMBEDDING_BATCH_SIZE,
                show_progress_bar=False,
                convert_to_numpy=True,
            )

            # Normalize for cosine similarity
            norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
            embeddings = embeddings / (norms + 1e-8)

            # Build FAISS index
            dimension = embeddings.shape[1]
            index = faiss.IndexFlatIP(dimension)  # Inner product (cosine similarity)
            index.add(embeddings.astype(np.float32))

            # Save index and chunks
            faiss.write_index(index, str(self._get_index_path(report_id)))
            with open(self._get_chunks_path(report_id), "wb") as f:
                pickle.dump(chunks, f)

            logger.info(
                f"FAISS index created: report_id={report_id} | "
                f"chunks={len(chunks)} | dim={dimension}"
            )
            return chunks

        except ImportError:
            raise RAGIndexingError("faiss-cpu is not installed. Run: pip install faiss-cpu")
        except Exception as e:
            logger.error(f"RAG indexing failed for report {report_id}: {e}")
            raise RAGIndexingError(f"Vector indexing failed: {str(e)}")

    async def retrieve(
        self,
        query: str,
        report_id: str,
        top_k: Optional[int] = None,
    ) -> list[dict]:
        """
        Retrieve the most relevant chunks for a query.

        Args:
            query: The search query (user question).
            report_id: The report to search within.
            top_k: Number of top results to return.

        Returns:
            List of dicts with 'text' and 'score' keys.
        """
        try:
            import faiss
            import numpy as np

            k = top_k or self.top_k
            index_path = self._get_index_path(report_id)
            chunks_path = self._get_chunks_path(report_id)

            if not index_path.exists() or not chunks_path.exists():
                logger.warning(f"No FAISS index found for report {report_id}")
                return []

            # Load index and chunks
            index = faiss.read_index(str(index_path))
            with open(chunks_path, "rb") as f:
                chunks = pickle.load(f)

            # Encode query
            model = self._get_embedding_model()
            query_embedding = model.encode([query], convert_to_numpy=True)
            query_embedding = query_embedding / (
                np.linalg.norm(query_embedding, axis=1, keepdims=True) + 1e-8
            )

            # Search
            scores, indices = index.search(query_embedding.astype(np.float32), k)

            results = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0 and idx < len(chunks):
                    results.append({
                        "text": chunks[idx],
                        "score": float(score),
                        "chunk_index": int(idx),
                    })

            logger.debug(f"RAG retrieved {len(results)} chunks for query | report={report_id}")
            return results

        except Exception as e:
            logger.error(f"RAG retrieval failed: {e}")
            return []

    async def build_context(self, query: str, report_id: str) -> str:
        """
        Build a context string from retrieved chunks for LLM injection.

        Args:
            query: User question.
            report_id: Report to query.

        Returns:
            Formatted context string.
        """
        results = await self.retrieve(query=query, report_id=report_id)
        if not results:
            return "No relevant information found in the medical report."

        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(f"[Passage {i}]:\n{result['text']}")

        return "\n\n".join(context_parts)

    def delete_index(self, report_id: str) -> None:
        """Delete FAISS index files for a report (on soft-delete or cleanup)."""
        for path in [self._get_index_path(report_id), self._get_chunks_path(report_id)]:
            if path.exists():
                path.unlink()
                logger.info(f"Deleted FAISS index: {path}")
