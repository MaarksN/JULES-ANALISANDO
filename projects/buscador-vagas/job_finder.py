#!/usr/bin/env python3
"""Buscador automático de vagas baseado em currículo (sem dependências externas)."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qs, quote_plus, urlparse
from urllib.request import Request, urlopen

SITES = [
    {"name": "Vagas.com.br", "domain": "vagas.com.br"},
    {"name": "Indeed", "domain": "indeed.com"},
    {"name": "Gupy", "domain": "gupy.io"},
    {"name": "InfoJobs", "domain": "infojobs.com.br"},
    {"name": "LinkedIn Jobs", "domain": "linkedin.com"},
    {"name": "Empregos.com.br", "domain": "empregos.com.br"},
    {"name": "Glassdoor", "domain": "glassdoor.com.br"},
    {"name": "Catho", "domain": "catho.com.br"},
    {"name": "Sólides Vagas", "domain": "solides.com.br"},
    {"name": "Jobsora", "domain": "jobsora.com"},
    {"name": "Emprega Brasil / SINE", "domain": "gov.br"},
]

STOPWORDS_PT = {
    "de", "da", "do", "das", "dos", "e", "em", "na", "no", "nas", "nos", "para", "por", "com",
    "uma", "um", "ao", "aos", "às", "as", "os", "o", "a", "que", "como", "mais", "menos", "sobre",
    "entre", "desde", "até", "se", "ser", "são", "sou", "foi", "me", "minha", "meu", "currículo",
    "curriculo", "perfil",
}

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"


@dataclass
class JobResult:
    site: str
    title: str
    url: str
    snippet: str
    score: float


class DDGParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_link = False
        self.current_href = ""
        self.current_title = []
        self.capture_snippet = False
        self.current_snippet = []
        self.results: list[dict] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        class_name = attrs_dict.get("class", "") or ""
        if tag == "a" and "result__a" in class_name:
            self.in_link = True
            self.current_href = attrs_dict.get("href", "") or ""
            self.current_title = []
        if tag in {"a", "div"} and "result__snippet" in class_name:
            self.capture_snippet = True
            self.current_snippet = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.in_link:
            title = " ".join("".join(self.current_title).split())
            url = extract_ddg_target_url(self.current_href)
            if title and url:
                self.results.append({"title": title, "url": url, "snippet": ""})
            self.in_link = False
            self.current_href = ""
        if tag in {"a", "div"} and self.capture_snippet:
            snippet = " ".join("".join(self.current_snippet).split())
            if self.results and snippet:
                self.results[-1]["snippet"] = snippet
            self.capture_snippet = False

    def handle_data(self, data: str) -> None:
        if self.in_link:
            self.current_title.append(data)
        if self.capture_snippet:
            self.current_snippet.append(data)


def read_resume_text(pdf_path: Path) -> str:
    data = pdf_path.read_bytes()
    text_chunks: list[str] = []
    for raw in re.findall(rb"\(([^)]{3,200})\)", data):
        try:
            chunk = raw.decode("utf-8")
        except UnicodeDecodeError:
            chunk = raw.decode("latin-1", errors="ignore")
        if re.search(r"[A-Za-zÀ-ÿ]{3,}", chunk):
            text_chunks.append(chunk)
    return " ".join(text_chunks)


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def extract_keywords(resume_text: str, top_n: int = 30) -> list[str]:
    tokens = re.findall(r"[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9+.#-]{2,}", resume_text.lower())
    tokens = [t for t in tokens if t not in STOPWORDS_PT and not t.isdigit()]
    freq = Counter(tokens)
    return [token for token, _ in freq.most_common(top_n)]


def fetch_url(url: str, timeout: int = 30) -> str:
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="ignore")


def duckduckgo_site_search(domain: str, query: str, max_results: int = 12) -> list[dict]:
    ddg_query = f'site:{domain} ("vaga" OR "jobs" OR "emprego") {query}'
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(ddg_query)}"
    html = fetch_url(url)
    parser = DDGParser()
    parser.feed(html)
    return parser.results[:max_results]


def extract_ddg_target_url(raw_url: str) -> str:
    if raw_url.startswith("http"):
        return raw_url
    parsed = urlparse(raw_url)
    if parsed.path.startswith("/l/") or parsed.path == "/l/":
        return parse_qs(parsed.query).get("uddg", [""])[0]
    return ""


def compute_score(result: dict, resume_keywords: Iterable[str], location: str) -> float:
    resume_kw = list(resume_keywords)
    text = normalize_text(f"{result.get('title', '')} {result.get('snippet', '')}")
    matches = sum(1 for kw in resume_kw if kw in text)
    title_boost = sum(1 for kw in resume_kw if kw in normalize_text(result.get("title", "")))
    location_boost = 3 if normalize_text(location) in text else 0
    return matches + (title_boost * 1.8) + location_boost


def rank_and_dedupe(results: list[JobResult]) -> list[JobResult]:
    dedup: dict[str, JobResult] = {}
    for item in results:
        if item.url not in dedup or item.score > dedup[item.url].score:
            dedup[item.url] = item
    return sorted(dedup.values(), key=lambda x: x.score, reverse=True)


def generate_report(results: list[JobResult], resume_keywords: list[str], location: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "# Relatório Automático de Vagas",
        "",
        f"- Gerado em: **{ts}**",
        f"- Local alvo: **{location}**",
        f"- Palavras-chave do currículo: {', '.join(resume_keywords[:20])}",
        "",
        "## Top vagas encontradas",
        "",
    ]
    if not results:
        lines.append("Nenhuma vaga encontrada com os filtros atuais.")
        return "\n".join(lines)

    for idx, result in enumerate(results, start=1):
        lines.extend([
            f"### {idx}. {result.title}",
            f"- Plataforma: **{result.site}**",
            f"- Score de aderência: **{result.score:.1f}**",
            f"- Link: {result.url}",
            f"- Resumo: {result.snippet or 'Sem resumo.'}",
            "",
        ])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Buscador automático de vagas por currículo")
    parser.add_argument("--resume", default="Profile.pdf")
    parser.add_argument("--location", default="Ribeirão Preto, SP")
    parser.add_argument("--query", default="")
    parser.add_argument("--max-results-per-site", type=int, default=8)
    parser.add_argument("--json-output", default="jobs_results.json")
    parser.add_argument("--md-output", default="jobs_report.md")
    parser.add_argument("--sleep", type=float, default=1.0)
    args = parser.parse_args()

    resume_path = Path(args.resume)
    if not resume_path.exists():
        print(f"ERRO: currículo não encontrado: {resume_path}", file=sys.stderr)
        return 1

    resume_text = read_resume_text(resume_path)
    resume_keywords = extract_keywords(resume_text)
    if not resume_keywords:
        print("ERRO: falha ao extrair palavras-chave do currículo", file=sys.stderr)
        return 1

    base_query = " ".join(resume_keywords[:10])
    if args.query:
        base_query = f"{base_query} {args.query}"

    all_results: list[JobResult] = []
    for site in SITES:
        try:
            raw_results = duckduckgo_site_search(
                domain=site["domain"],
                query=f'{base_query} "{args.location}"',
                max_results=args.max_results_per_site,
            )
            print(f"[{site['name']}] resultados coletados: {len(raw_results)}")
            for raw in raw_results:
                all_results.append(JobResult(
                    site=site["name"],
                    title=raw["title"],
                    url=raw["url"],
                    snippet=raw.get("snippet", ""),
                    score=compute_score(raw, resume_keywords, args.location),
                ))
        except Exception as exc:
            print(f"[{site['name']}] falhou: {exc}")
        time.sleep(args.sleep)

    ranked = rank_and_dedupe(all_results)
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "location": args.location,
        "resume_keywords": resume_keywords,
        "total_results": len(ranked),
        "results": [asdict(item) for item in ranked],
    }

    Path(args.json_output).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    Path(args.md_output).write_text(generate_report(ranked, resume_keywords, args.location), encoding="utf-8")

    print(f"\nOK: {len(ranked)} vagas processadas")
    print(f"JSON: {args.json_output}")
    print(f"Relatório: {args.md_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
