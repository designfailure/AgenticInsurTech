import gradio as gr
import plotly.graph_objects as go
from typing import Dict
import logging

logger = logging.getLogger(__name__)

def create_ui(mga_analyst, underwriter, policy_manager, risk_exposure, esg_compliance):
    with gr.Blocks(theme=gr.themes.Soft()) as app:
        gr.Markdown("""
        # 🏢 Insur.Cap - Avtonomni InsurTech Sistem
        Dobrodošli v sistemu za avtomatsko analizo zavarovalniških povpraševanj.
        """)
        
        with gr.Row():
            with gr.Column(scale=2):
                input_text = gr.Textbox(
                    label="Vnesite vaše povpraševanje",
                    placeholder="Opišite vaše zavarovalniške potrebe...",
                    lines=5
                )
                file_input = gr.File(
                    label="Naložite dokumente",
                    file_types=[".pdf", ".csv", ".xlsx", ".xls", ".doc", ".docx"],
                    file_count="multiple"
                )
                location_input = gr.Textbox(
                    label="Lokacija",
                    placeholder="Vnesite lokacijo (npr. Ljubljana)",
                    value="Ljubljana"
                )
                
                with gr.Row():
                    submit_btn = gr.Button("📊 Analiziraj", variant="primary")
                    clear_btn = gr.Button("🗑️ Počisti")

            with gr.Column(scale=3):
                with gr.Tabs() as tabs:
                    with gr.TabItem("📋 Povzetek"):
                        summary_output = gr.Markdown()
                    
                    with gr.TabItem("🔍 Podrobna analiza"):
                        with gr.Accordion("Kategorija in tveganja", open=True):
                            category_output = gr.JSON()
                        with gr.Accordion("Ocena tveganja"):
                            risk_output = gr.JSON()
                        with gr.Accordion("ESG in okoljski vpliv"):
                            esg_output = gr.JSON()
                    
                    with gr.TabItem("📈 Vizualizacija"):
                        with gr.Row():
                            risk_chart = gr.Plot(label="Ocena tveganj")
                            esg_chart = gr.Plot(label="ESG analiza")
        
        with gr.Row():
            status_bar = gr.Markdown()

        async def process_request(text, files, location):
            try:
                # MGA Analiza
                mga_results = mga_analyst.analyze_input(text)
                
                # Ocena tveganja
                risk_eval = underwriter.evaluate_risk(mga_results)
                
                # Generiranje police
                policy = policy_manager.create_policy_draft(risk_eval)
                
                # Analiza izpostavljenosti
                exposure = risk_exposure.calculate_exposure(policy)
                
                # ESG analiza
                esg_impact = await esg_compliance.analyze_esg_impact(policy)
                
                # Generiranje vizualizacij
                risk_fig = create_risk_visualization(exposure)
                esg_fig = create_esg_visualization(esg_impact)
                
                summary = f"""
                ## 📊 Povzetek analize
                
                ### 🎯 Kategorija zavarovanja
                {mga_results['category']}
                
                ### ⚠️ Identificirana tveganja
                {', '.join(mga_results['risks'])}
                
                ### 💡 Priporočilo
                {mga_results['recommendation']}
                
                ### 📈 Ocena tveganja
                {risk_eval['risk_score']}
                
                ### 🌍 ESG ocena
                {esg_impact['esg_score']}
                """
                
                return {
                    summary_output: summary,
                    category_output: mga_results,
                    risk_output: risk_eval,
                    esg_output: esg_impact,
                    risk_chart: risk_fig,
                    esg_chart: esg_fig,
                    status_bar: "✅ Analiza uspešno zaključena"
                }
                
            except Exception as e:
                logger.error(f"Napaka pri procesiranju zahteve: {str(e)}")
                return {
                    status_bar: f"❌ Napaka: {str(e)}"
                }

        def create_risk_visualization(exposure_data: Dict) -> go.Figure:
            fig = go.Figure(data=[
                go.Bar(
                    x=['Požar', 'Poplava', 'Vlom', 'Potres'],
                    y=[0.3, 0.5, 0.2, 0.4]
                )
            ])
            fig.update_layout(title='Ocena tveganj po kategorijah')
            return fig

        def create_esg_visualization(esg_data: Dict) -> go.Figure:
            fig = go.Figure(data=[
                go.Scatterpolar(
                    r=[4, 3, 5],
                    theta=['Okoljski vpliv', 'Socialni vpliv', 'Upravljanje'],
                    fill='toself'
                )
            ])
            fig.update_layout(title='ESG Analiza')
            return fig

        def clear_inputs():
            return {
                input_text: "",
                file_input: None,
                location_input: "Ljubljana",
                status_bar: ""
            }

        # Povezovanje dogodkov
        submit_btn.click(
            fn=process_request,
            inputs=[input_text, file_input, location_input],
            outputs=[
                summary_output,
                category_output,
                risk_output,
                esg_output,
                risk_chart,
                esg_chart,
                status_bar
            ]
        )
        
        clear_btn.click(
            fn=clear_inputs,
            inputs=[],
            outputs=[input_text, file_input, location_input, status_bar]
        )

    return app 