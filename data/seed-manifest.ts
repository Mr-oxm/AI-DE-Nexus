/**
 * Static imports for seed — dynamic import() fails for some modules in Next.js.
 */

// ML docs
import * as mlIntro from "./ml/intro";
import * as mlStats from "./ml/stats-probability";
import * as mlLinearAlgebra from "./ml/linear-algebra";
import * as mlCalculus from "./ml/calculus";
import * as mlPreprocessing from "./ml/preprocessing";
import * as mlLinearRegression from "./ml/linear-regression";
import * as mlDecisionTrees from "./ml/decision-trees";
import * as mlPerformance from "./ml/performance";
import * as mlImbalance from "./ml/imbalance";
import * as mlKnn from "./ml/knn";
import * as mlNaiveBayes from "./ml/naive-bayes";
import * as mlFeatureEngineering from "./ml/feature-engineering";
import * as mlLogisticRegression from "./ml/logistic-regression";
import * as mlBiasVariance from "./ml/bias-variance";
import * as mlSvm from "./ml/svm";
import * as mlMulticlass from "./ml/multiclass";
import * as mlEnsemble from "./ml/ensemble";
import * as mlDimensionality from "./ml/dimensionality";
import * as mlClustering from "./ml/clustering";
import * as mlAnomaly from "./ml/anomaly";
import * as mlPipelines from "./ml/pipelines";
import * as mlNeuralNetworks from "./ml/neural-networks";

// DE docs
import * as deFundamentals from "./de/fundamentals";
import * as deSql from "./de/sql";
import * as deSpark from "./de/spark";
import * as deStreaming from "./de/streaming";
import * as dePipelines from "./de/pipelines";
import * as deOrchestration from "./de/orchestration";
import * as deModeling from "./de/modeling";
import * as deFileFormats from "./de/file-formats";
import * as deNosql from "./de/nosql";
import * as deGovernance from "./de/governance";
import * as deCloud from "./de/cloud";

// Exercises
import * as deExercisesMod from "./de_exercises";
import * as pythonExercisesMod from "./python_exercises";
import * as pandasExercisesMod from "./pandas_exercises";
import * as sparkExercisesMod from "./spark_exercises";

export const mlDocs: Record<string, { data: { title: string; subtitle?: string; accent?: string; blocks: unknown[] } }> = {
  intro: mlIntro,
  "stats-probability": mlStats,
  "linear-algebra": mlLinearAlgebra,
  calculus: mlCalculus,
  preprocessing: mlPreprocessing,
  "linear-regression": mlLinearRegression,
  "decision-trees": mlDecisionTrees,
  performance: mlPerformance,
  imbalance: mlImbalance,
  knn: mlKnn,
  "naive-bayes": mlNaiveBayes,
  "feature-engineering": mlFeatureEngineering,
  "logistic-regression": mlLogisticRegression,
  "bias-variance": mlBiasVariance,
  svm: mlSvm,
  multiclass: mlMulticlass,
  ensemble: mlEnsemble,
  dimensionality: mlDimensionality,
  clustering: mlClustering,
  anomaly: mlAnomaly,
  pipelines: mlPipelines,
  "neural-networks": mlNeuralNetworks,
};

export const deDocs: Record<string, { data: { title: string; subtitle?: string; accent?: string; blocks: unknown[] } }> = {
  fundamentals: deFundamentals,
  sql: deSql,
  spark: deSpark,
  streaming: deStreaming,
  pipelines: dePipelines,
  orchestration: deOrchestration,
  modeling: deModeling,
  "file-formats": deFileFormats,
  nosql: deNosql,
  governance: deGovernance,
  cloud: deCloud,
};

export const exerciseSets = {
  de_exercises: deExercisesMod,
  python_exercises: pythonExercisesMod,
  pandas_exercises: pandasExercisesMod,
  spark_exercises: sparkExercisesMod,
};
