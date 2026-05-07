"""
AI/LLM-based Entity Extractor using OpenAI or Gemini API
"""
import json
import re
import os
from typing import List, Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class ExtractedEntity:
    entity_type: str
    value: str
    normalized_value: str = ""
    confidence: float = 0.0


class AIEntityExtractor:
    """Uses LLM to extract entities from text"""
    
    def __init__(self, api_key: str = None, provider: str = "openai"):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.provider = provider
        self.model = "gpt-4" if provider == "openai" else "gemini-pro"
        
        if not self.api_key:
            print("[AI] WARNING: No API key provided, falling back to ML")
            
    def extract_entities(self, text: str, entity_types: List[str]) -> List[ExtractedEntity]:
        """Use LLM to extract entities from document text"""
        
        if not self.api_key:
            # Fall back to ML extractor
            from src.extraction.ml_entity_extractor import ml_entity_extractor
            return ml_entity_extractor.extract_entities(text, entity_types)
        
        # Build prompt for entity extraction
        prompt = self._build_extraction_prompt(text, entity_types)
        
        try:
            response = self._call_llm(prompt)
            entities = self._parse_llm_response(response)
            print(f"[AI] Extracted {len(entities)} entities using LLM")
            return entities
        except Exception as e:
            print(f"[AI] LLM extraction failed: {e}, falling back to ML")
            from src.extraction.ml_entity_extractor import ml_entity_extractor
            return ml_entity_extractor.extract_entities(text, entity_types)
    
    def _build_extraction_prompt(self, text: str, entity_types: List[str]) -> str:
        """Build prompt for entity extraction"""
        
        prompt = f"""Extract the following information from the document below.

Document:
{text[:3000]}

Extract these entity types: {', '.join(entity_types) if entity_types else 'all relevant'}

Return in JSON format:
[
  {{"type": "entity_type", "value": "found value", "normalized": "standardized value", "confidence": 0.95}}
]

Entity types to find:
- gst_number: GST registration number (format: 15 chars like 27AAACM1234A1Z5)
- pan_number: PAN card number (format: AAABC1234D)  
- company_name: Business/company name
- turnover: Financial amounts (convert to rupees, use 'Lakh' for 100000, 'Crore' for 10000000)
- experience_years: Years of experience (number only)
- certification: ISO or quality certifications
- date: Important dates

Return ONLY valid JSON array, no other text."""
        
        return prompt
    
    def _call_llm(self, prompt: str) -> str:
        """Call LLM API"""
        
        if self.provider == "openai":
            return self._call_openai(prompt)
        elif self.provider == "gemini":
            return self._call_gemini(prompt)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")
    
    def _call_openai(self, prompt: str) -> str:
        """Call OpenAI API"""
        import requests
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4",
            "messages": [
                {"role": "system", "content": "You are a document extraction expert."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenAI API error: {response.text}")
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    def _call_gemini(self, prompt: str) -> str:
        """Call Google Gemini API"""
        import requests
        
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={self.api_key}"
        
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2000
            }
        }
        
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code != 200:
            raise Exception(f"Gemini API error: {response.text}")
        
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]
    
    def _parse_llm_response(self, response: str) -> List[ExtractedEntity]:
        """Parse LLM response to extract entities"""
        entities = []
        
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                data = json.loads(json_match.group(0))
                
                for item in data:
                    try:
                        entity = ExtractedEntity(
                            entity_type=item.get('type', 'unknown'),
                            value=item.get('value', ''),
                            normalized_value=item.get('normalized', item.get('value', '')),
                            confidence=item.get('confidence', 0.85)
                        )
                        entities.append(entity)
                    except:
                        pass
        except Exception as e:
            print(f"[AI] Failed to parse LLM response: {e}")
        
        return entities
    
    def validate_entity(self, entity: ExtractedEntity) -> tuple:
        """Validate extracted entity"""
        
        if entity.entity_type == "gst_number":
            if len(entity.value) >= 14:
                return True, "Valid GST format"
            return False, "Invalid GST format"
        
        if entity.entity_type == "pan_number":
            if len(entity.value) == 10:
                return True, "Valid PAN format"
            return False, "Invalid PAN format"
        
        if entity.entity_type == "experience_years":
            try:
                years = int(entity.normalized_value)
                if 0 < years <= 50:
                    return True, f"Valid: {years} years"
                return False, "Out of range"
            except:
                return False, "Invalid value"
        
        if entity.entity_type == "turnover":
            try:
                amount = int(entity.normalized_value.replace(",", ""))
                if amount > 0:
                    return True, f"Valid: Rs. {amount:,}"
                return False, "Must be positive"
            except:
                return False, "Invalid value"
        
        return True, "Valid"


class AICriteriaExtractor:
    """Uses LLM to extract criteria from tender documents"""
    
    def __init__(self, api_key: str = None, provider: str = "openai"):
        self.ai_extractor = AIEntityExtractor(api_key, provider)
        
    def extract_criteria(self, text: str) -> List[Dict]:
        """Use LLM to extract evaluation criteria from tender"""
        
        if not self.ai_extractor.api_key:
            from src.extraction.ml_entity_extractor import ml_criteria_extractor
            return ml_criteria_extractor.extract_criteria(text)
        
        prompt = self._build_criteria_prompt(text)
        
        try:
            response = self.ai_extractor._call_llm(prompt)
            criteria = self._parse_criteria_response(response)
            print(f"[AI] Extracted {len(criteria)} criteria using LLM")
            return criteria
        except Exception as e:
            print(f"[AI] Criteria extraction failed: {e}")
            from src.extraction.ml_entity_extractor import ml_criteria_extractor
            return ml_criteria_extractor.extract_criteria(text)
    
    def _build_criteria_prompt(self, text: str) -> str:
        """Build prompt for criteria extraction"""
        
        prompt = f"""Extract ALL evaluation criteria from this tender document.

Tender Document:
{text[:4000]}

For each criterion, identify:
1. ID (like C001, C002, C003...)
2. Label (what it evaluates)
3. Type: technical, financial, compliance, experience
4. Nature: MANDATORY or DESIRABLE
5. Threshold: numeric requirement if any

Return as JSON array:
[
  {{"id": "C001", "label": "Valid GST Registration", "type": "compliance", "nature": "MANDATORY", "threshold": null}},
  {{"id": "C002", "label": "Minimum 5 Years Experience", "type": "experience", "nature": "MANDATORY", "threshold": "5 years"}},
  ...
]

Look for:
- GST/PAN requirements
- Experience/qualification requirements  
- Turnover/financial requirements
- Certification requirements (ISO, etc)
- Any other eligibility conditions

Return ONLY valid JSON array."""
        
        return prompt
    
    def _parse_criteria_response(self, response: str) -> List[Dict]:
        """Parse LLM response for criteria"""
        criteria = []
        
        try:
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                data = json.loads(json_match.group(0))
                
                for item in data:
                    try:
                        criterion = {
                            'id': item.get('id', f"C{len(criteria)+1:03d}"),
                            'label': item.get('label', 'Unknown'),
                            'type': item.get('type', 'technical'),
                            'nature': item.get('nature', 'MANDATORY'),
                            'threshold': item.get('threshold')
                        }
                        criteria.append(criterion)
                    except:
                        pass
        except Exception as e:
            print(f"[AI] Failed to parse criteria: {e}")
        
        return criteria


# Create instances - will be initialized with API key
ai_entity_extractor = None
ai_criteria_extractor = None


def init_ai_extractor(api_key: str, provider: str = "openai") -> tuple:
    """Initialize AI extractors with API key"""
    global ai_entity_extractor, ai_criteria_extractor
    
    ai_entity_extractor = AIEntityExtractor(api_key, provider)
    ai_criteria_extractor = AICriteriaExtractor(api_key, provider)
    
    print(f"[AI] Initialized {provider} extractor with API key")
    
    return ai_entity_extractor, ai_criteria_extractor