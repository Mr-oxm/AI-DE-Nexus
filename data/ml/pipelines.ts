import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "ML Pipelines & Best Practices",
subtitle: "Building reproducible, leak-free, production-ready ML workflows with scikit-learn Pipelines and industry best practices.",
accent: "#34d399",
blocks: [
                { type: "h2", text: "Why Pipelines?" },
                { type: "p", text: "In real ML projects, every model involves a series of preprocessing steps before the estimator. If you do these steps manually, you risk data leakage (fitting the scaler on all data before splitting), code that's hard to reproduce, and bugs when deploying to production where the same transformations must be applied consistently." },
                { type: "p", text: "Scikit-learn's Pipeline chains multiple transformers and a final estimator into a single object. It ensures that preprocessing is always applied consistently, enables clean cross-validation, and makes deployment one step (save the pipeline, load it, call .predict())." },

                { type: "h2", text: "Building a Pipeline" },
                {
                    type: "code", lang: "python", code: `from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier

# Define feature groups
numeric_features  = ['age', 'income', 'credit_score']
categorical_features = ['city', 'employment_type']

# ── Build preprocessing for each feature type
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),    # handle missing
    ('scaler',  StandardScaler()),                     # normalize scale
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),  # handle missing
    ('onehot',  OneHotEncoder(handle_unknown='ignore')),   # encode
])

# ── Combine with ColumnTransformer
preprocessor = ColumnTransformer(transformers=[
    ('num', numeric_transformer,    numeric_features),
    ('cat', categorical_transformer, categorical_features),
], remainder='drop')  # drop other columns

# ── Full Pipeline: preprocessor + model
full_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier',   RandomForestClassifier(n_estimators=200, random_state=42))
])

# ── Use pipeline like a single model
full_pipeline.fit(X_train, y_train)  # fits preprocessor on X_train, then model
y_pred = full_pipeline.predict(X_test)  # applies same transforms to X_test

# ✓ No leakage! Preprocessor fits ONLY on X_train.`
                },

                { type: "h2", text: "Pipeline + GridSearchCV" },
                {
                    type: "code", lang: "python", code: `from sklearn.model_selection import GridSearchCV

# Access nested parameters with double underscore notation
param_grid = {
    'preprocessor__num__imputer__strategy': ['mean', 'median'],
    'preprocessor__num__scaler': ['passthrough', StandardScaler()],
    'classifier__n_estimators': [100, 300],
    'classifier__max_depth': [None, 5, 10],
}

grid_search = GridSearchCV(
    full_pipeline,
    param_grid=param_grid,
    cv=5,
    scoring='f1',
    n_jobs=-1,
    verbose=1
)
grid_search.fit(X_train, y_train)

print("Best params:", grid_search.best_params_)
print("Best CV score:", grid_search.best_score_)

# The best estimator is a complete pipeline
best_pipeline = grid_search.best_estimator_`
                },

                { type: "h2", text: "Avoiding Data Leakage" },
                { type: "p", text: "Data leakage is when information from the future or from the test set 'leaks' into the training process, giving the model an unfair advantage and inflating reported performance. It's the #1 source of disappointingly bad production ML models." },
                {
                    type: "table", headers: ["Leakage Type", "Example", "Fix"], rows: [
                        ["Preprocessing before split", "Scale all data, then split → test stats used to scale train", "Always split FIRST, then fit transformers on train only"],
                        ["Feature from future", "Using next week's sales to predict this week's churn", "Ensure all features are available at prediction time"],
                        ["Target encoding without CV", "Compute mean(y) per category on all data", "Use out-of-fold encoding or separate train/test"],
                        ["Using the target in features", "Including 'will_churn' in features to predict churn", "Audit features — exclude target and its derivatives"],
                        ["CV with time series", "Random split on time series → future leaks into training", "Use TimeSeriesSplit — always train on past, test on future"],
                    ]
                },

                { type: "h2", text: "Model Persistence — Save & Load" },
                {
                    type: "code", lang: "python", code: `import joblib
import pickle

# ── Save trained pipeline (includes all fitted preprocessors!)
joblib.dump(full_pipeline, 'models/fraud_detector_v1.pkl')

# ── Load and predict (exact same transformations applied)
loaded_pipeline = joblib.load('models/fraud_detector_v1.pkl')
predictions = loaded_pipeline.predict(new_raw_data)  # works directly on raw data!

# ── Save with metadata
import json
metadata = {
    'model_type': 'RandomForestClassifier',
    'trained_on': '2025-03-09',
    'features': numeric_features + categorical_features,
    'target': 'is_fraud',
    'cv_f1': 0.87,
    'threshold': 0.45
}
with open('models/fraud_detector_v1_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)`
                },

                { type: "h2", text: "Model Versioning & Experiment Tracking" },
                { type: "p", text: "As you iterate on models, tracking each experiment — hyperparameters, metrics, code version, dataset version — is essential for reproducibility. MLflow is the standard open-source tool for this." },
                {
                    type: "code", lang: "python", code: `import mlflow
import mlflow.sklearn

# ── Log an experiment run
with mlflow.start_run(run_name="rf_v3_balanced"):
    # Log hyperparameters
    mlflow.log_params({
        'n_estimators': 300,
        'max_depth': 10,
        'class_weight': 'balanced',
        'sampling': 'SMOTE'
    })
    
    # Train
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    # Log metrics
    mlflow.log_metrics({
        'f1':        f1_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall':    recall_score(y_test, y_pred),
        'auc':       roc_auc_score(y_test, model.predict_proba(X_test)[:,1])
    })
    
    # Save model as artifact
    mlflow.sklearn.log_model(model, "model")`
                },

                { type: "h2", text: "Deployment Basics" },
                { type: "p", text: "Deploying an ML model means making it accessible for real-time or batch inference. The simplest deployment is a REST API that accepts feature vectors and returns predictions." },
                {
                    type: "code", lang: "python", code: `# ── Simple ML API with FastAPI
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title: "Fraud Detection API")
model = joblib.load("models/fraud_detector_v1.pkl")

class TransactionFeatures(BaseModel):
    age: float
    income: float
    credit_score: float
    city: str
    employment_type: str

@app.post("/predict")
def predict(features: TransactionFeatures):
    # Convert to DataFrame (pipeline expects named columns)
    import pandas as pd
    data = pd.DataFrame([features.dict()])
    
    # Pipeline handles all preprocessing automatically
    probability = model.predict_proba(data)[0, 1]
    is_fraud = bool(probability >= 0.45)  # custom threshold
    
    return {
        "fraud_probability": round(float(probability), 4),
        "prediction": "fraud" if is_fraud else "legitimate",
        "confidence": "high" if abs(probability - 0.5) > 0.3 else "low"
    }

# Run: uvicorn api:app --reload`
                },

                { type: "h2", text: "ML Best Practices Checklist" },
                {
                    type: "list", items: [
                        "Always shuffle data before splitting (unless time-series)",
                        "Use stratified split for classification with class imbalance",
                        "Fit ALL transformers on training data only",
                        "Use Pipeline to chain preprocessing + model",
                        "Validate with k-fold CV, not a single train/val split",
                        "Establish a simple baseline before training complex models",
                        "Tune hyperparameters on validation; evaluate once on test",
                        "Use the right metric for your problem (F1 > Accuracy for imbalance)",
                        "Check for data leakage as the first debugging step",
                        "Version your models and track experiments",
                        "Monitor production models for data drift and performance decay",
                    ]
                },
                { type: "callout", variant: "important", text: "The most common real-world ML mistakes: (1) data leakage giving falsely high performance, (2) wrong metric choice, (3) not establishing a baseline, (4) tuning on the test set. Get these right and you're ahead of most practitioners." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
