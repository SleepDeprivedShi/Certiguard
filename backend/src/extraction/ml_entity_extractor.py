"""
ML-based Entity Extractor using spaCy NER and sklearn
"""
import re
from typing import List, Optional
from dataclasses import dataclass
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np


@dataclass
class ExtractedEntity:
    entity_type: str
    value: str
    normalized_value: str = ""
    confidence: float = 0.0


class MLEntityExtractor:
    def __init__(self):
        # Load spaCy model for NER
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            print("[ML] Downloading spaCy model...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
        
        # Train simple classifiers for criterion classification
        self._train_criterion_classifier()
        
    def _train_criterion_classifier(self):
        """Train classifier to identify criterion types from text."""
        # Training data for criterion classification
        criterion_texts = [
            # Financial
            "turnover above 50 lakh", "annual turnover", "net worth",
            "minimum revenue", "financial capacity", "bank balance",
            # Experience
            "years of experience", "experience certificate", "work experience",
            "past projects", "similar work experience",
            # Compliance
            "gst registration", "pan card", "iso certification",
            "license", "registration", "certification",
            # Technical
            "technical capability", "infrastructure", "equipment",
            "manpower", "qualification"
        ]
        
        criterion_labels = [
            'financial', 'financial', 'financial', 'financial', 'financial', 'financial',
            'experience', 'experience', 'experience', 'experience', 'experience',
            'compliance', 'compliance', 'compliance', 'compliance', 'compliance', 'compliance',
            'technical', 'technical', 'technical', 'technical', 'technical'
        ]
        
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        X = self.vectorizer.fit_transform(criterion_texts)
        
        self.classifier = MultinomialNB()
        self.classifier.fit(X, criterion_labels)
        
    def extract_entities(self, text: str, entity_types: List[str]) -> List[ExtractedEntity]:
        """Extract entities using spaCy NER and custom rules."""
        entities = []
        
        # Use spaCy for NER
        doc = self.nlp(text)
        
        # Extract financial amounts using NER
        for ent in doc.ents:
            if ent.label_ == "MONEY":
                amount = self._parse_amount(ent.text)
                if amount:
                    entities.append(ExtractedEntity(
                        entity_type="turnover",
                        value=ent.text,
                        normalized_value=str(int(amount)),
                        confidence=0.85
                    ))
        
        # Extract organizations (company names)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PERSON"]:
                if len(ent.text) > 5:
                    entities.append(ExtractedEntity(
                        entity_type="company_name",
                        value=ent.text.strip(),
                        confidence=0.80
                    ))
        
        # Extract dates
        for ent in doc.ents:
            if ent.label_ in ["DATE", "EVENT"]:
                entities.append(ExtractedEntity(
                    entity_type="date",
                    value=ent.text,
                    confidence=0.75
                ))
        
        # Extract amounts using ML pattern recognition
        amounts = self._extract_amounts_ml(text)
        for amount in amounts:
            if amount not in [e.normalized_value for e in entities if e.entity_type == "turnover"]:
                entities.append(ExtractedEntity(
                    entity_type="turnover",
                    value=amount[1],
                    normalized_value=str(int(amount[0])),
                    confidence=amount[2]
                ))
        
        # Extract experience years using ML
        experience = self._extract_experience_ml(text)
        if experience:
            entities.append(ExtractedEntity(
                entity_type="experience_years",
                value=experience[1],
                normalized_value=str(experience[0]),
                confidence=experience[2]
            ))
        
        # Extract GST/PAN using patterns with confidence scoring
        gst_match = re.search(r'(?:GSTIN|GST)[:\s]*([A-Z0-9]{10,15})', text, re.IGNORECASE)
        if gst_match:
            entities.append(ExtractedEntity(
                entity_type="gst_number",
                value=gst_match.group(1),
                confidence=self._calculate_gst_confidence(gst_match.group(1))
            ))
        
        pan_match = re.search(r'(?:PAN)[:\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})', text, re.IGNORECASE)
        if pan_match:
            entities.append(ExtractedEntity(
                entity_type="pan_number",
                value=pan_match.group(1),
                confidence=0.90
            ))
        
        # Extract certifications
        iso_matches = re.findall(r'ISO\s*(\d{4,5})', text, re.IGNORECASE)
        for iso in iso_matches:
            entities.append(ExtractedEntity(
                entity_type="certification",
                value=f"ISO {iso}",
                confidence=0.85
            ))
        
        return entities
    
    def _parse_amount(self, text: str) -> Optional[float]:
        """Parse amount from text using ML-approximated patterns."""
        text = text.lower().replace(',', '').replace('₹', '').replace('rs', '').replace('inr', '')
        
        multipliers = {'crore': 10000000, 'cr': 10000000, 'lakh': 100000, 'lac': 100000, 
                      'million': 1000000, 'billion': 1000000000}
        
        for unit, mult in multipliers.items():
            if unit in text:
                match = re.search(r'([\d.]+)', text)
                if match:
                    try:
                        return float(match.group(1)) * mult
                    except:
                        pass
        return None
    
    def _extract_amounts_ml(self, text: str) -> List[tuple]:
        """ML-based amount extraction using TF-IDF similarity."""
        results = []
        
        # Patterns weighted by context
        patterns = [
            (r'turnover[:\s]*Rs\.?\s*([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr|M)', 0.9),
            (r'annual\s+turnover[:\s]*Rs\.?\s*([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr|M)', 0.95),
            (r'total\s+income[:\s]*Rs\.?\s*([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr|M)', 0.8),
            (r'net\s+worth[:\s]*Rs\.?\s*([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr|M)', 0.85),
            (r'revenue[:\s]*Rs\.?\s*([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr|M)', 0.8),
        ]
        
        for pattern, conf in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    value = float(match.group(1))
                    unit = match.group(2).lower()
                    multiplier = 100000 if unit in ['lakh', 'lac', 'l'] else 10000000 if unit in ['crore', 'cr'] else 1000000
                    normalized = int(value * multiplier)
                    results.append((normalized, match.group(0), conf))
                except:
                    pass
        
        return results
    
    def _extract_experience_ml(self, text: str) -> Optional[tuple]:
        """ML-based experience extraction."""
        patterns = [
            (r'past\s+(\d+)\s+years', 0.95),
            (r'(\d+)\s+years?\s+of\s+experience', 0.95),
            (r'experience[:\s]+(\d+)\s+years', 0.90),
            (r'working\s+since\s+(\d{4})', 0.85),
            (r'(\d+)\s+yrs?\s+exp', 0.90),
        ]
        
        for pattern, conf in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if match.lastindex == 1:
                    try:
                        years = int(match.group(1))
                        if years > 50:
                            years = 2026 - years
                        if 0 < years <= 50:
                            return (years, f"{years} years", conf)
                    except:
                        pass
                elif match.lastindex == 1:
                    # Year pattern
                    try:
                        start_year = int(match.group(1))
                        years = 2026 - start_year
                        if 0 < years <= 50:
                            return (years, f"{years} years", conf)
                    except:
                        pass
        
        return None
    
    def _calculate_gst_confidence(self, gst: str) -> float:
        """Calculate confidence based on GST format."""
        if len(gst) == 15:
            return 0.95
        elif len(gst) == 14:
            return 0.85
        else:
            return 0.60
    
    def classify_criterion(self, text: str) -> str:
        """Classify criterion type using trained ML model."""
        try:
            X = self.vectorizer.transform([text])
            prediction = self.classifier.predict(X)[0]
            return prediction
        except:
            return "unknown"
    
    def classify_criterion_nature(self, text: str) -> str:
        """Classify if criterion is mandatory or desirable."""
        text_lower = text.lower()
        
        mandatory_indicators = ['mandatory', 'must', 'required', 'essential', 'compulsory']
        desirable_indicators = ['desirable', 'prefer', 'optional', 'nice to have', 'advantage']
        
        mandatory_score = sum(1 for word in mandatory_indicators if word in text_lower)
        desirable_score = sum(1 for word in desirable_indicators if word in text_lower)
        
        if mandatory_score > desirable_score:
            return "MANDATORY"
        elif desirable_score > mandatory_score:
            return "DESIRABLE"
        else:
            return "MANDATORY"  # Default to mandatory
    
    def validate_entity(self, entity: ExtractedEntity) -> tuple:
        """Validate extracted entity - returns (is_valid, message)."""
        if entity.entity_type == "gst_number":
            if len(entity.value) >= 14:
                return True, "Valid GST format"
            return False, "Invalid GST format"
        
        if entity.entity_type == "pan_number":
            if len(entity.value) == 10 and entity.value[:5].isupper() and entity.value[5:9].isdigit():
                return True, "Valid PAN format"
            return False, "Invalid PAN format"
        
        if entity.entity_type == "experience_years":
            try:
                years = int(entity.normalized_value)
                if 0 < years <= 50:
                    return True, f"Valid: {years} years"
                return False, f"Years out of reasonable range"
            except:
                return False, "Invalid experience value"
        
        if entity.entity_type == "turnover":
            try:
                amount = int(entity.normalized_value.replace(",", ""))
                if amount > 0:
                    return True, f"Valid: Rs. {amount:,}"
                return False, "Turnover must be positive"
            except:
                return False, "Invalid turnover value"
        
        return True, "Valid"


class MLCriteriaExtractor:
    """ML-based tender criteria extraction"""
    
    def __init__(self):
        self.ml_extractor = MLEntityExtractor()
        
    def extract_criteria(self, text: str) -> List[dict]:
        """Extract criteria from tender text using ML classification."""
        criteria = []
        
        # Split text into sections
        lines = text.split('\n')
        
        current_section = ""
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers
            if re.match(r'^\d+[\.\)]\s+', line) or 'criteria' in line.lower():
                current_section = line
            
            # Extract potential criteria from numbered lines
            if re.match(r'^\d+[\.\)]\s+', line):
                criterion = self._parse_criterion_ml(line)
                if criterion:
                    criteria.append(criterion)
        
        # Use NLP to identify additional criteria
        doc = self.nlp(text) if hasattr(self, 'nlp') else None
        
        return criteria
    
    def _parse_criterion_ml(self, text: str) -> Optional[dict]:
        """Parse a criterion line using ML"""
        # Extract ID
        id_match = re.match(r'^(\d+)[\.\)]\s+', text)
        criterion_id = f"C{id_match.group(1).zfill(3)}" if id_match else f"C{len(text) % 100}"
        
        # Remove numbering
        text_clean = re.sub(r'^\d+[\.\)]\s+', '', text)
        
        # Classify type using ML
        entity_types = self.ml_extractor.extract_entities(text_clean, [])
        
        criterion_type = "technical"
        for ent in entity_types:
            if ent.entity_type == "turnover":
                criterion_type = "financial"
                break
        
        # Check for compliance keywords
        if any(word in text_clean.lower() for word in ['gst', 'pan', 'iso', 'license', 'registration', 'certification']):
            criterion_type = "compliance"
        
        # Classify nature (mandatory/desirable) using ML
        nature = self.ml_extractor.classify_criterion_nature(text_clean)
        
        # Extract threshold
        threshold = self._extract_threshold(text_clean)
        
        return {
            'id': criterion_id,
            'label': text_clean[:50],  # Truncate for display
            'type': criterion_type,
            'nature': nature,
            'threshold': threshold
        }
    
    def _extract_threshold(self, text: str) -> Optional[str]:
        """Extract numeric threshold from criterion text."""
        patterns = [
            r'above\s+([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr)',
            r'minimum\s+([\d.]+)\s*(Lakh|Crore|Lac|Million|Cr)',
            r'at\s+least\s+(\d+)\s+years?',
            r'minimum\s+(\d+)\s+years?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return None


# Create singleton instances
ml_entity_extractor = MLEntityExtractor()
ml_criteria_extractor = MLCriteriaExtractor()