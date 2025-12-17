osint/document_summary.py#!/usr/bin/env python3
"""
OSINT Document Summary Module
Extracción y resumen automático de documentos educativos

Issue: #2 - feat(osint): Implement Document Summary use case
Author: SAM-v3.0 AI Framework
Date: 2025-12-17
"""

import os
import json
from typing import Optional, Dict, List
from dataclasses import dataclass, asdict
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

@dataclass
class DocumentSummary:
    """Resumen de documento extraído"""
    titulo: str
    url_o_archivo: str
    resumen: str
    conceptos_clave: List[str]
    palabras: int
    fuente: str = "OSINT"
    timestamp: str = None
    confianza: float = 0.0

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

    def to_dict(self) -> Dict:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)


class DocumentSummaryEngine:
    """Motor de resumen de documentos usando múltiples fuentes"""

    def __init__(self):
        self.perplexity_api_key = os.getenv("PERPLEXITY_API_KEY", "mock_key")
        self.cache = {}

    def summarize(self, url_o_archivo: str, titulo: str = "") -> DocumentSummary:
        """
        Resume un documento desde URL o archivo.

        Args:
            url_o_archivo: URL del documento o ruta local
            titulo: Título del documento (opcional)

        Returns:
            DocumentSummary con resumen + conceptos clave
        """
        cache_key = url_o_archivo.lower()
        if cache_key in self.cache:
            return self.cache[cache_key]

        # Caso 1: Mock data para testing
        summary = self._summarize_mock(url_o_archivo, titulo)

        # TODO: Integración real con Perplexity API + BeautifulSoup
        # summary = self._summarize_perplexity(url_o_archivo)

        self.cache[cache_key] = summary
        return summary

    def _summarize_mock(self, url_o_archivo: str, titulo: str) -> DocumentSummary:
        """
        Resumen mock para testing.
        En producción vendría de Perplexity + web scraping.
        """
        mock_summaries = {
            "diploma": {
                "resumen": "Diplomado en Salud Pública: Formación avanzada en gestión sanitaria, epidemiología aplicada y políticas públicas. Dirigido a profesionales del sector salud.",
                "conceptos_clave": ["Salud Pública", "Epidemiología", "Gestión Sanitaria", "Políticas de Salud"],
                "confianza": 0.92,
                "palabras": 450,
            },
            "aps": {
                "resumen": "Atención Primaria de Salud: Estrategia integral para fortalecer sistemas de salud basados en comunidades. Incluyenecesidades de poblaciones vulnerables y equidad en acceso.",
                "conceptos_clave": ["APS", "Atención Primaria", "Equidad", "Comunidad", "Determinantes de Salud"],
                "confianza": 0.88,
                "palabras": 380,
            },
        }

        # Detectar tipo de documento
        tipo = "diploma" if "diploma" in url_o_archivo.lower() else "aps" if "aps" in url_o_archivo.lower() else "diploma"
        data = mock_summaries.get(tipo, mock_summaries["diploma"])

        return DocumentSummary(
            titulo=titulo or f"Documento: {url_o_archivo}",
            url_o_archivo=url_o_archivo,
            resumen=data["resumen"],
            conceptos_clave=data["conceptos_clave"],
            palabras=data["palabras"],
            confianza=data["confianza"],
        )

    def batch_summarize(self, documentos: List[Dict]) -> List[DocumentSummary]:
        """
        Resumen en lote de múltiples documentos.

        Args:
            documentos: Lista de dicts con 'url' y 'titulo' (opcional)

        Returns:
            Lista de DocumentSummary
        """
        results = []
        for doc in documentos:
            try:
                summary = self.summarize(doc.get("url", ""), doc.get("titulo", ""))
                results.append(summary)
            except Exception as e:
                print(f"Error en resumen de {doc}: {e}")
        return results


def main():
    """Test rápido"""
    engine = DocumentSummaryEngine()

    # Test 1: Resumen simple
    print("\n=== TEST 1: Resumen Simple ===")
    summary = engine.summarize("https://ejemplo.com/diploma-salud.pdf", "Diplomado Salud Pública")
    print(summary.to_json())

    # Test 2: Batch
    print("\n=== TEST 2: Batch Summarize ===")
    docs = [
        {"url": "https://ejemplo.com/diploma.pdf", "titulo": "Diplomado"},
        {"url": "https://ejemplo.com/aps.pdf", "titulo": "APS"},
    ]
    results = engine.batch_summarize(docs)
    for r in results:
        print(f"- {r.titulo}: {len(r.conceptos_clave)} conceptos clave")


if __name__ == "__main__":
    main()
