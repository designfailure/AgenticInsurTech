from typing import Dict, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class PolicyManager:
    def __init__(self):
        self.coverage_types = {
            "avtomobilsko": [
                "osnovno",
                "delni kasko",
                "polni kasko",
                "asistenca"
            ],
            "nepremičninsko": [
                "požar",
                "vlom",
                "poplave",
                "potres"
            ],
            "zdravstveno": [
                "osnovno",
                "dodatno",
                "zobozdravstvo",
                "specialistični pregledi"
            ],
            "življenjsko": [
                "smrt",
                "nezgoda",
                "kritične bolezni",
                "varčevanje"
            ]
        }

    def create_policy_draft(self, risk_evaluation: Dict) -> Dict:
        try:
            policy_type = risk_evaluation.get("suggested_policy")
            coverage = self._determine_coverage(policy_type, risk_evaluation)
            exclusions = self._determine_exclusions(policy_type, risk_evaluation)
            terms = self._generate_terms(coverage, risk_evaluation)
            
            return {
                "policy_type": policy_type,
                "coverage": coverage,
                "exclusions": exclusions,
                "terms": terms,
                "created_at": datetime.now().isoformat(),
                "status": "draft"
            }
        except Exception as e:
            logger.error(f"Napaka pri ustvarjanju osnutka police: {str(e)}")
            raise

    def _determine_coverage(self, policy_type: str, risk_evaluation: Dict) -> List[str]:
        """Določi primerno kritje glede na tip police in oceno tveganja"""
        base_coverage = self.coverage_types.get(policy_type, [])
        risk_score = risk_evaluation.get("risk_score", 0.0)
        
        if risk_score > 0.7:
            return base_coverage  # Polno kritje
        elif risk_score > 0.4:
            return base_coverage[:-1]  # Osnovno + nekaj dodatnih
        else:
            return base_coverage[:2]  # Samo osnovno kritje

    def _determine_exclusions(self, policy_type: str, risk_evaluation: Dict) -> List[str]:
        """Določi izključitve glede na tip police in oceno tveganja"""
        standard_exclusions = {
            "avtomobilsko": ["namerna škoda", "vožnja pod vplivom"],
            "nepremičninsko": ["vojna", "jedrska nesreča"],
            "zdravstveno": ["predhodne bolezni", "kozmetični posegi"],
            "življenjsko": ["samomor v prvem letu", "ekstremni športi"]
        }
        
        return standard_exclusions.get(policy_type, [])

    def _generate_terms(self, coverage: List[str], risk_evaluation: Dict) -> Dict:
        """Generira pogoje police"""
        return {
            "duration": "1 leto",
            "payment_frequency": "mesečno",
            "waiting_period": "30 dni",
            "coverage_details": {item: True for item in coverage},
            "special_conditions": self._get_special_conditions(risk_evaluation)
        }

    def _get_special_conditions(self, risk_evaluation: Dict) -> List[str]:
        """Določi posebne pogoje glede na oceno tveganja"""
        conditions = []
        risk_score = risk_evaluation.get("risk_score", 0.0)
        
        if risk_score > 0.8:
            conditions.append("Potreben predhodni ogled")
        if risk_score > 0.6:
            conditions.append("Potrebna dodatna dokumentacija")
            
        return conditions 