import os
from dotenv import load_dotenv
import logging
from mga_analyst import MGAAnalyst
from underwriter import Underwriter
from policy_manager import PolicyManager
from risk_exposure import RiskExposure
from esg_compliance import ESGCompliance
from utils.document_processor import DocumentProcessor
from utils.input_validator import InputValidator
from utils.api_client import APIClient
from gradio_interface import create_ui

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
        server_name = os.getenv("GRADIO_SERVER_NAME", "0.0.0.0")
        try:
            server_port_str = os.getenv("GRADIO_SERVER_PORT")
            if server_port_str is not None:
                server_port = int(server_port_str)
            else:
                server_port = 7860
                logger.info("GRADIO_SERVER_PORT not set, using default port 7860.")
        except ValueError:
            server_port = 7860
            logger.warning(
                f"Invalid value for GRADIO_SERVER_PORT: '{os.getenv('GRADIO_SERVER_PORT')}'. "
                "Using default port 7860."
            )
        
        await app.launch(
            server_name=server_name,
            server_port=server_port,
            share=True,
            debug=True
        )
    except Exception as e:
        logger.error(f"Napaka pri zagonu aplikacije: {str(e)}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
