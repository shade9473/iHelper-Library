import os
import json
import sqlite3
import numpy as np
import pandas as pd
import plotly.graph_objs as go
import plotly.io as pio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

class ModelPerformanceDashboard:
    """
    Intelligent Model Performance Monitoring System
    
    Design Philosophy: Transparent, actionable machine learning insights
    Local Economic Context: Optimize professional resource recommendations
    """
    
    def __init__(self, 
                 training_data_path: str = None, 
                 model_metrics_path: str = None):
        """
        Initialize Model Performance Dashboard
        
        Args:
            training_data_path: Path to training data database
            model_metrics_path: Path to model performance metrics
        """
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        
        # Default paths
        self.training_data_path = training_data_path or os.path.join(
            self.project_root, 'TRAINING_DATA', 'user_interactions.db'
        )
        self.model_metrics_path = model_metrics_path or os.path.join(
            self.project_root, 'MODEL_PERFORMANCE_METRICS.json'
        )
        
        # Dashboard output directory
        self.dashboard_output_dir = os.path.join(self.project_root, 'PERFORMANCE_DASHBOARDS')
        os.makedirs(self.dashboard_output_dir, exist_ok=True)
    
    def _load_training_data(self) -> pd.DataFrame:
        """
        Load training data from SQLite database
        
        Returns:
            Pandas DataFrame with user interactions
        """
        try:
            with sqlite3.connect(self.training_data_path) as conn:
                query = "SELECT * FROM user_interactions"
                df = pd.read_sql_query(query, conn)
                
                # Parse context metadata
                df['context_metadata'] = df['context_metadata'].apply(
                    lambda x: json.loads(x) if x else {}
                )
                
                return df
        except Exception as e:
            print(f"❌ Error loading training data: {e}")
            return pd.DataFrame()
    
    def _load_model_metrics(self) -> Dict[str, Any]:
        """
        Load model performance metrics
        
        Returns:
            Dictionary of model performance metrics
        """
        try:
            with open(self.model_metrics_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "recommendation_scoring": {
                    "mean_squared_error": [],
                    "r2_score": [],
                    "precision": [],
                    "recall": []
                },
                "ml_optimizer": {
                    "learning_rate": [],
                    "model_complexity": [],
                    "convergence_speed": []
                }
            }
    
    def generate_interaction_analysis(self) -> go.Figure:
        """
        Generate interaction analysis visualization
        
        Returns:
            Plotly interactive figure
        """
        df = self._load_training_data()
        
        # Interaction distribution by professional stage
        stage_interactions = df['professional_stage'].value_counts()
        
        fig = go.Figure(data=[
            go.Bar(
                x=stage_interactions.index, 
                y=stage_interactions.values,
                marker_color=['#1E90FF', '#2ECC71', '#FFA500']
            )
        ])
        
        fig.update_layout(
            title='User Interactions by Professional Stage',
            xaxis_title='Professional Stage',
            yaxis_title='Number of Interactions',
            template='plotly_white'
        )
        
        return fig
    
    def generate_recommendation_performance(self) -> go.Figure:
        """
        Generate recommendation performance visualization
        
        Returns:
            Plotly interactive figure
        """
        metrics = self._load_model_metrics()
        scoring_metrics = metrics.get('recommendation_scoring', {})
        
        fig = go.Figure()
        
        # Mean Squared Error
        fig.add_trace(go.Scatter(
            y=scoring_metrics.get('mean_squared_error', []),
            mode='lines+markers',
            name='Mean Squared Error',
            line=dict(color='#FF6384')
        ))
        
        # R² Score
        fig.add_trace(go.Scatter(
            y=scoring_metrics.get('r2_score', []),
            mode='lines+markers',
            name='R² Score',
            line=dict(color='#36A2EB')
        ))
        
        fig.update_layout(
            title='Recommendation Model Performance',
            xaxis_title='Training Iterations',
            yaxis_title='Score',
            template='plotly_white'
        )
        
        return fig
    
    def generate_ml_optimizer_performance(self) -> go.Figure:
        """
        Generate ML optimizer performance visualization
        
        Returns:
            Plotly interactive figure
        """
        metrics = self._load_model_metrics()
        optimizer_metrics = metrics.get('ml_optimizer', {})
        
        fig = go.Figure()
        
        # Learning Rate
        fig.add_trace(go.Scatter(
            y=optimizer_metrics.get('learning_rate', []),
            mode='lines+markers',
            name='Learning Rate',
            line=dict(color='#FFCE56')
        ))
        
        # Model Complexity
        fig.add_trace(go.Scatter(
            y=optimizer_metrics.get('model_complexity', []),
            mode='lines+markers',
            name='Model Complexity',
            line=dict(color='#4BC0C0')
        ))
        
        fig.update_layout(
            title='ML Optimizer Performance',
            xaxis_title='Training Iterations',
            yaxis_title='Metric Value',
            template='plotly_white'
        )
        
        return fig
    
    def generate_comprehensive_dashboard(self):
        """
        Generate comprehensive performance dashboard
        """
        # Create dashboard figures
        interaction_fig = self.generate_interaction_analysis()
        recommendation_performance_fig = self.generate_recommendation_performance()
        ml_optimizer_performance_fig = self.generate_ml_optimizer_performance()
        
        # Combine figures
        dashboard_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Port Townsend Professional Resource Library - Model Performance Dashboard</title>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <style>
                body {{ font-family: Arial, sans-serif; max-width: 1200px; margin: auto; }}
                .dashboard-section {{ margin-bottom: 30px; }}
                h1 {{ color: #2C3E50; }}
                .plot {{ width: 100%; height: 400px; }}
            </style>
        </head>
        <body>
            <h1>🌐 Model Performance Dashboard</h1>
            
            <div class="dashboard-section">
                <h2>User Interactions by Professional Stage</h2>
                <div id="interaction-plot" class="plot"></div>
            </div>
            
            <div class="dashboard-section">
                <h2>Recommendation Model Performance</h2>
                <div id="recommendation-plot" class="plot"></div>
            </div>
            
            <div class="dashboard-section">
                <h2>ML Optimizer Performance</h2>
                <div id="optimizer-plot" class="plot"></div>
            </div>
            
            <script>
                Plotly.newPlot('interaction-plot', {interaction_fig.to_json()});
                Plotly.newPlot('recommendation-plot', {recommendation_performance_fig.to_json()});
                Plotly.newPlot('optimizer-plot', {ml_optimizer_performance_fig.to_json()});
            </script>
        </body>
        </html>
        """
        
        # Save dashboard
        dashboard_path = os.path.join(
            self.dashboard_output_dir, 
            f'performance_dashboard_{datetime.now().strftime("%Y%m%d_%H%M%S")}.html'
        )
        
        with open(dashboard_path, 'w') as f:
            f.write(dashboard_html)
        
        print(f"🖥️ Performance dashboard generated: {dashboard_path}")

def main():
    """
    Demonstration of Model Performance Dashboard
    """
    print("🌐 Port Townsend Professional Resource Library - Model Performance Dashboard")
    
    # Initialize dashboard
    dashboard = ModelPerformanceDashboard()
    
    # Generate comprehensive dashboard
    dashboard.generate_comprehensive_dashboard()

if __name__ == "__main__":
    main()
