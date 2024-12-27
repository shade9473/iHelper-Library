import os
import json
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple

import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class AdaptiveRetrainingStrategy:
    """
    Intelligent Adaptive Retraining Mechanism
    
    Design Philosophy: Continuous learning, contextual adaptation
    Local Economic Context: Dynamic professional resource optimization
    """
    
    def __init__(
        self, 
        metadata_path: str = None,
        training_data_path: str = None,
        model_checkpoint_dir: str = None
    ):
        """
        Initialize Adaptive Retraining Strategy
        
        Args:
            metadata_path: Path to cross-referencing metadata
            training_data_path: Path to training data database
            model_checkpoint_dir: Directory for model checkpoints
        """
        self.project_root = os.path.dirname(os.path.abspath(__file__))
        
        # Configuration paths
        self.metadata_path = metadata_path or os.path.join(
            self.project_root, 'CROSS_REFERENCING_METADATA.json'
        )
        self.training_data_path = training_data_path or os.path.join(
            self.project_root, 'TRAINING_DATA', 'user_interactions.db'
        )
        self.model_checkpoint_dir = model_checkpoint_dir or os.path.join(
            self.project_root, 'MODEL_CHECKPOINTS'
        )
        
        # Ensure checkpoint directory exists
        os.makedirs(self.model_checkpoint_dir, exist_ok=True)
        
        # Load metadata and configurations
        self.metadata = self._load_metadata()
        self.retraining_config = self._load_retraining_configuration()
    
    def _load_metadata(self) -> Dict[str, Any]:
        """
        Load cross-referencing metadata
        
        Returns:
            Metadata dictionary
        """
        try:
            with open(self.metadata_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ Metadata not found. Using default configuration.")
            return {}
    
    def _load_retraining_configuration(self) -> Dict[str, Any]:
        """
        Load or generate retraining configuration
        
        Returns:
            Retraining configuration dictionary
        """
        config_path = os.path.join(self.project_root, 'ADAPTIVE_RETRAINING_CONFIG.json')
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            default_config = {
                "retraining_frequency": "weekly",
                "performance_threshold": 0.85,
                "learning_rate_decay": 0.95,
                "max_iterations": 1000,
                "early_stopping_patience": 10
            }
            
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            return default_config
    
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
    
    def _prepare_training_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data for machine learning model
        
        Args:
            df: Input DataFrame with user interactions
        
        Returns:
            Tuple of feature matrix and target vector
        """
        # Feature engineering
        features = []
        targets = []
        
        directories = list(self.metadata.get('directory_relationships', {}).keys())
        professional_stages = list(self.metadata.get('professional_growth_pathways', {}).keys())
        
        for _, row in df.iterrows():
            # Encode features
            feature_vector = [
                directories.index(row['current_directory']) / len(directories),
                directories.index(row['target_directory']) / len(directories),
                professional_stages.index(row['professional_stage']) / len(professional_stages)
            ]
            features.append(feature_vector)
            targets.append(row['interaction_score'])
        
        # Scale features
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        return features_scaled, np.array(targets)
    
    def build_adaptive_model(self, input_shape: int) -> tf.keras.Model:
        """
        Build adaptive neural network model
        
        Args:
            input_shape: Number of input features
        
        Returns:
            Compiled Keras model
        """
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(
                64, 
                activation='relu', 
                input_shape=(input_shape,),
                kernel_regularizer=tf.keras.regularizers.l2(0.001)
            ),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(
                32, 
                activation='relu',
                kernel_regularizer=tf.keras.regularizers.l2(0.001)
            ),
            tf.keras.layers.BatchNormalization(),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        # Adaptive learning rate
        initial_learning_rate = 0.001
        lr_schedule = tf.keras.optimizers.schedules.ExponentialDecay(
            initial_learning_rate,
            decay_steps=100,
            decay_rate=self.retraining_config.get('learning_rate_decay', 0.95),
            staircase=True
        )
        
        optimizer = tf.keras.optimizers.Adam(learning_rate=lr_schedule)
        
        model.compile(
            optimizer=optimizer,
            loss='mean_squared_error',
            metrics=['mae', 'mse']
        )
        
        return model
    
    def adaptive_model_retraining(self):
        """
        Perform adaptive model retraining
        """
        # Load and prepare training data
        df = self._load_training_data()
        
        if df.empty:
            print("❌ No training data available. Skipping retraining.")
            return
        
        X, y = self._prepare_training_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Build model
        model = self.build_adaptive_model(input_shape=X.shape[1])
        
        # Early stopping and model checkpointing
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=self.retraining_config.get('early_stopping_patience', 10),
            restore_best_weights=True
        )
        
        model_checkpoint = tf.keras.callbacks.ModelCheckpoint(
            os.path.join(
                self.model_checkpoint_dir, 
                f'recommendation_model_{datetime.now().strftime("%Y%m%d_%H%M%S")}.h5'
            ),
            save_best_only=True,
            monitor='val_loss'
        )
        
        # Train model
        history = model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=self.retraining_config.get('max_iterations', 1000),
            batch_size=32,
            callbacks=[early_stopping, model_checkpoint],
            verbose=1
        )
        
        # Evaluate model
        test_loss, test_mae, test_mse = model.evaluate(X_test, y_test, verbose=0)
        
        # Generate performance report
        performance_report = {
            "timestamp": datetime.now().isoformat(),
            "test_loss": float(test_loss),
            "test_mae": float(test_mae),
            "test_mse": float(test_mse),
            "training_epochs": len(history.history['loss']),
            "final_learning_rate": float(model.optimizer.learning_rate(model.optimizer.iterations).numpy())
        }
        
        # Save performance report
        report_path = os.path.join(
            self.model_checkpoint_dir, 
            f'retraining_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        )
        
        with open(report_path, 'w') as f:
            json.dump(performance_report, f, indent=2)
        
        print("🔄 Adaptive Model Retraining Completed")
        print(f"📊 Performance Report: {report_path}")

def main():
    """
    Demonstration of Adaptive Retraining Strategy
    """
    print("🌐 Port Townsend Professional Resource Library - Adaptive Retraining Strategy")
    
    # Initialize and execute adaptive retraining
    retraining_strategy = AdaptiveRetrainingStrategy()
    retraining_strategy.adaptive_model_retraining()

if __name__ == "__main__":
    main()
