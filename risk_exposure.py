from typing import Dict, List, Optional
import logging
from datetime import datetime
import math

logger = logging.getLogger(__name__)

class RiskExposure:
    def __init__(self):
        self.risk_factors = {
            "avtomobilsko": {
                "starost_vozila": 0.3,
                "voznikove_izkušnje": 0.4,
                "območje_vožnje": 0.3
            },
            "nepremičninsko": {
                "lokacija": 0.4,
                "starost_objekta": 0.3,
                "varnostni_sistemi": 0.3
            },
            "zdravstveno": {
                "starost": 0.4,
                "življenjski_slog": 0.3,
                "zdravstvena_zgodovina": 0.3
            },
            "življenjsko": {
                "starost": 0.3,
                "poklic": 0.3,
                "zdravstveno_stanje": 0.4
            }
        }

    def calculate_exposure(self, policy_draft: Dict) -> Dict:
        try:
            policy_type = policy_draft.get("policy_type")
            exposure_score = self._calculate_exposure_score(policy_type, policy_draft)
            risk_factors = self._analyze_risk_factors(policy_type, policy_draft)
            mitigation = self._suggest_mitigation(exposure_score, risk_factors)
            
            return {
                "exposure_score": exposure_score,
                "risk_factors": risk_factors,
                "mitigation_suggestions": mitigation,
                "analysis_timestamp": datetime.now().isoformat(),
                "confidence_level": self._calculate_confidence(risk_factors)
            }
        except Exception as e:
            logger.error(f"Napaka pri izračunu izpostavljenosti: {str(e)}")
            raise

    def _calculate_exposure_score(self, policy_type: str, policy_data: Dict) -> float:
        """Izračuna skupno oceno izpostavljenosti"""
        factors = self.risk_factors.get(policy_type, {})
        total_score = 0.0
        
        for factor, weight in factors.items():
            factor_score = self._evaluate_factor(factor, policy_data)
            total_score += factor_score * weight
            
        return round(total_score, 2)

    def _evaluate_factor(self, factor: str, policy_data: Dict) -> float:
        """Ovrednoti posamezni faktor tveganja"""
        factor_data = policy_data.get(factor, {})
        
        if isinstance(factor_data, (int, float)):
            return self._normalize_value(factor_data, factor)
        elif isinstance(factor_data, str):
            return self._evaluate_categorical(factor_data, factor)
        else:
            return 0.5  # Privzeta vrednost za neznane podatke

    def _normalize_value(self, value: float, factor: str) -> float:
        """Normalizira številske vrednosti na lestvico 0-1"""
        factor_ranges = {
            "starost": (18, 100),
            "starost_vozila": (0, 20),
            "starost_objekta": (0, 100)
        }
        
        min_val, max_val = factor_ranges.get(factor, (0, 1))
        normalized = (value - min_val) / (max_val - min_val)
        return max(0, min(1, normalized))

    def _evaluate_categorical(self, value: str, factor: str) -> float:
        """Ovrednoti kategorične vrednosti"""
        category_scores = {
            "voznikove_izkušnje": {
                "začetnik": 0.8,
                "izkušen": 0.4,
                "profesionalec": 0.2
            },
            "območje_vožnje": {
                "mesto": 0.6,
                "podeželje": 0.4,
                "avtocesta": 0.5
            }
        }
        
        return category_scores.get(factor, {}).get(value, 0.5)

    def _analyze_risk_factors(self, policy_type: str, policy_data: Dict) -> List[Dict]:
        """Analizira posamezne faktorje tveganja"""
        factors = self.risk_factors.get(policy_type, {})
        analysis = []
        
        for factor, weight in factors.items():
            score = self._evaluate_factor(factor, policy_data)
            analysis.append({
                "factor": factor,
                "score": score,
                "weight": weight,
                "impact": score * weight,
                "severity": self._determine_severity(score)
            })
            
        return analysis

    def _determine_severity(self, score: float) -> str:
        """Določi resnost tveganja"""
        if score < 0.3:
            return "nizko"
        elif score < 0.7:
            return "srednje"
        else:
            return "visoko"

    def _suggest_mitigation(self, exposure_score: float, risk_factors: List[Dict]) -> List[str]:
        """Predlaga ukrepe za zmanjšanje tveganja"""
        suggestions = []
        
        for factor in risk_factors:
            if factor["severity"] == "visoko":
                suggestions.append(f"Zmanjšajte {factor['factor']} z dodatnimi varnostnimi ukrepi")
            elif factor["severity"] == "srednje":
                suggestions.append(f"Spremljajte {factor['factor']} in načrtujte preventivne ukrepe")
                
        return suggestions

    def _calculate_confidence(self, risk_factors: List[Dict]) -> float:
        """Izračuna stopnjo zaupanja v analizo"""
        known_factors = sum(1 for factor in risk_factors if factor["score"] != 0.5)
        total_factors = len(risk_factors)
        
        return round(known_factors / total_factors, 2) if total_factors > 0 else 0.0 