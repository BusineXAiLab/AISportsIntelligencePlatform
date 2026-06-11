from app.services.responsible_language_service import (
    DISCLAIMER,
    ResponsibleLanguageService,
)

service = ResponsibleLanguageService()


class TestResponsibleLanguageFilter:
    def test_replaces_banned_phrases(self):
        text = "This is a guaranteed win, a sure prediction. Bet now!"
        clean, replacements = service.filter_text(text)
        assert "guaranteed win" not in clean.lower()
        assert "sure prediction" not in clean.lower()
        assert "bet now" not in clean.lower()
        assert len(replacements) == 3

    def test_replacement_is_case_insensitive(self):
        clean, replacements = service.filter_text("GUARANTEED WIN and Risk-Free returns")
        assert "guaranteed win" not in clean.lower()
        assert "risk-free" not in clean.lower()
        assert len(replacements) == 2

    def test_clean_text_unchanged(self):
        text = "Model probability indicates higher likelihood of a home win."
        clean, replacements = service.filter_text(text)
        assert clean == text
        assert replacements == []

    def test_contains_banned_language(self):
        assert service.contains_banned_language("this is 100% accurate")
        assert not service.contains_banned_language("high-confidence model signal")

    def test_disclaimer_appended_once(self):
        text = "Some analysis."
        with_disclaimer = service.append_disclaimer(text)
        assert DISCLAIMER in with_disclaimer
        again = service.append_disclaimer(with_disclaimer)
        assert again.count(DISCLAIMER) == 1
