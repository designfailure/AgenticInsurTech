from typing import List, Dict, Union
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MGAAnalyst:
    def __init__(self):
        self.categories = {
            "avtomobilsko": ["avto", "vozilo", "motor"],
            "nepremičninsko": ["hiša", "stanovanje", "zgradba"],
            "zdravstveno": ["zdravje", "bolezen", "nezgoda"],
            "življenjsko": ["življenje", "smrt", "varčevanje"]
        }
        
    def analyze_input(self, input_data: Union[str, Dict]) -> Dict:
        try:
            input_text = input_data if isinstance(input_data, str) else str(input_data)
            detected_category = self._detect_category(input_text)
            risks = self._identify_risks(input_text)
            recommendation = self._generate_recommendation(detected_category, risks)
            
            return {
                "category": detected_category,
                "risks": risks,
                "recommendation": recommendation,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Napaka pri analizi vhodnih podatkov: {str(e)}")
            raise

    def _detect_category(self, text: str) -> str:
        for category, keywords in self.categories.items():
            if any(keyword in text.lower() for keyword in keywords):
                return category
        return "drugo"

    def _identify_risks(self, text: str) -> List[str]:
        risk_keywords = {
            "požar": ["požar", "ogenj"],
            "poplava": ["poplava", "voda"],
            "vlom": ["vlom", "kraja"],
            "potres": ["potres", "tresenje"]
        }
        
        return [risk for risk, keywords in risk_keywords.items() 
                if any(keyword in text.lower() for keyword in keywords)]

    def _generate_recommendation(self, category: str, risks: List[str]) -> str:
        recommendations = {
            "avtomobilsko": "Priporočamo avtomobilsko zavarovanje s kritjem za {risks}",
            "nepremičninsko": "Priporočamo nepremičninsko zavarovanje z vključenim kritjem za {risks}",
            "zdravstveno": "Priporočamo zdravstveno zavarovanje s poudarkom na {risks}",
            "življenjsko": "Priporočamo življenjsko zavarovanje z dodatnim kritjem za {risks}"
        }
        
        return recommendations.get(category, "Potrebna je dodatna analiza").format(
            risks=", ".join(risks) if risks else "osnovna tveganja"
        ) 