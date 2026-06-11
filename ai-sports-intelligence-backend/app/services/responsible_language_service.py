"""Responsible AI language filtering for all generated content.

Replaces gambling-adjacent absolute claims with measured, data-driven
phrasing before any content is stored or published.
"""
import re

BANNED_PHRASES: dict[str, str] = {
    "guaranteed win": "model probability indicates higher likelihood",
    "guaranteed wins": "model probability indicates higher likelihood",
    "sure prediction": "high-confidence model signal",
    "sure predictions": "high-confidence model signals",
    "sure win": "high-confidence model signal",
    "risk-free": "lower-risk according to current model factors",
    "risk free": "lower-risk according to current model factors",
    "100% accurate": "historically tracked accuracy",
    "100% accuracy": "historically tracked accuracy",
    "100% sure": "high-confidence model signal",
    "bet now": "review the data-driven insight",
    "place your bet": "review the data-driven insight",
    "guaranteed profit": "model probability indicates higher likelihood",
    "can't lose": "lower-risk according to current model factors",
    "cannot lose": "lower-risk according to current model factors",
}

DISCLAIMER = (
    "Insights are model-generated probabilities, not guarantees. "
    "Past accuracy does not assure future outcomes."
)


class ResponsibleLanguageService:
    def filter_text(self, text: str) -> tuple[str, list[dict]]:
        """Replace banned phrases. Returns (clean_text, replacement_log)."""
        replacements: list[dict] = []
        clean = text
        for banned, replacement in BANNED_PHRASES.items():
            pattern = re.compile(re.escape(banned), re.IGNORECASE)
            matches = pattern.findall(clean)
            if matches:
                replacements.append(
                    {"found": banned, "replaced_with": replacement, "count": len(matches)}
                )
                clean = pattern.sub(replacement, clean)
        return clean, replacements

    def contains_banned_language(self, text: str) -> bool:
        lowered = text.lower()
        return any(banned in lowered for banned in BANNED_PHRASES)

    def append_disclaimer(self, text: str) -> str:
        if DISCLAIMER.lower() in text.lower():
            return text
        return f"{text}\n\n{DISCLAIMER}"
