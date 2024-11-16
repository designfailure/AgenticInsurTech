import os
from dotenv import load_dotenv
import logging
from agents.mga_analyst import MGAAnalyst
from agents.underwriter import Underwriter
from agents.policy_manager import PolicyManager
from agents.risk_exposure import RiskExposure
from agents.esg_compliance import ESGCompliance
from utils.document_processor import DocumentProcessor
from utils.input_validator import InputValidator
from utils.api_client import APIClient
from ui.gradio_interface import create_ui

# Nalaganje okoljskih spremenljivk
load_dotenv()

# Konfiguracija beleženja
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='insurance_system.log'
)

logger = logging.getLogger(__name__)

async def main():
    try:
        # Inicializacija agentov in pomožnih razredov
        mga_analyst = MGAAnalyst()
        underwriter = Underwriter()
        policy_manager = PolicyManager()
        risk_exposure = RiskExposure()
        esg_compliance = ESGCompliance()
        
        # Zagon uporabniškega vmesnika
        app = create_ui(
            mga_analyst,
            underwriter,
            policy_manager,
            risk_exposure,
            esg_compliance
        )
        
        # Zagon strežnika
        await app.launch(
            server_name=os.getenv("GRADIO_SERVER_NAME"),
            server_port=int(os.getenv("GRADIO_SERVER_PORT")),
            share=True,
            debug=True
        )
    except Exception as e:
        logger.error(f"Napaka pri zagonu aplikacije: {str(e)}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
