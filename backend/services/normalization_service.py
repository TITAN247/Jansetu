from deep_translator import GoogleTranslator
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
from langdetect import detect
import re

class NormalizationService:
    def __init__(self):
        self.translator = GoogleTranslator(source='auto', target='hi')

    def detect_language(self, text):
        try:
            return detect(text)
        except:
            return "en" # Fallback

    def translate_to_hindi(self, text):
        """
        Translates text to Hindi (Devanagari script)
        """
        try:
            return self.translator.translate(text)
        except Exception as e:
            print(f"Translation Error: {e}")
            return text

    def transliterate_to_hinglish(self, hindi_text):
        """
        Converts Hindi (Devanagari) -> Hinglish (Roman Script)
        Example: "पानी नहीं है" -> "pani nahi hai"
        """
        try:
            # Transliterate Devanagari to IAST (Roman with diacritics)
            # We use ITRANS or IAST. Let's use HK (Harvard-Kyoto) or ITRANS for closer phonetic mapping to common Hinglish
            # Actually, 'hk' or 'itrans' produces 'pAnI', we want 'pani'.
            # Let's try simple transliteration and then clean up.
            roman_text = transliterate(hindi_text, sanscript.DEVANAGARI, sanscript.ITRANS)
            return roman_text.lower()
        except Exception as e:
            print(f"Transliteration Error: {e}")
            return hindi_text

    def clean_text(self, text):
        """
        Simple cleanup: lowercase, remove special chars
        """
        text = text.lower()
        # Remove diacritics/accents to make it "plain" Hinglish (e.g. 'pānī' -> 'pani')
        # This is optional but good for matching training data which is likely plain ASCII 
        return text

    def normalize(self, text):
        """
        Main pipeline:
        1. Detect Language
        2. If NOT Hindi/Hinglish (Devanagari or Roman Hindi), Translate to Hindi
        3. Transliterate Hindi -> Hinglish (Roman)
        4. Clean
        """
        if not text:
            return ""

        original_text = text
        lang = self.detect_language(text)
        
        # Strategy:
        # If text has Devanagari chars -> It is Hindi -> Transliterate directly
        # If text is English/Other -> Translate to Hindi -> Transliterate
        # If text is Hinglish (Roman script but Hindi words) -> ? Hard to distinguish from English without context.
        # Assumption: If 'en' is detected but it's actually Hinglish, translation might be weird.
        # BUT: The requirement says inputs can be English. "Road is broken".
        # If we send "Road is broken" to a Hinglish model, it might fail if trained ONLY on "Sadak toot gayi".
        # So "Road is broken" -> [Translate] -> "सड़क टूटी है" -> [Transliterate] -> "sadak tuti hai". -> This is GOOD for the model.
        
        # Check for Devanagari characters
        if re.search(r'[\u0900-\u097F]', text):
            # Contains Hindi script - Verify if it's mixed or full. 
            # Treat as Hindi.
            pass
        else:
            # Roman script. Could be English or Hinglish.
            # If lang detects 'en', we assume it's English intent and translate to Hindi first.
            # If it's Hinglish "Paani nahi aa raha", Google Translate from "auto" to "hi" might actually handle it well (leave it or fix it).
            # Let's rely on Google Translate 'auto' -> 'hi'.
            # If input is "Paani nahi aa raha", GT might output "पानी नहीं आ रहा". -> Then we transliterate back.
            # If input is "Water is not coming", GT outputs "पानी नहीं आ रहा". -> Transliterate back.
            # This unified flow works for both!
            try:
                translated = self.translate_to_hindi(text)
                if translated:
                    text = translated
            except:
                pass

        # Now we (ideally) have Hindi Devanagari. Transliterate to Roman.
        hinglish = self.transliterate_to_hinglish(text)
        
        # Cleanup
        normalized_text = self.clean_text(hinglish)
        
        print(f"Normalization: '{original_text}' -> '{normalized_text}'")
        return normalized_text

normalization_service = NormalizationService()
