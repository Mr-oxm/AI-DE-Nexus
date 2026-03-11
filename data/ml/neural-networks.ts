import { DocBlock } from "@/app/components/DocSection";

export const data = {
    title: "Introduction to Neural Networks",
    subtitle: "From the perceptron to deep networks — the mathematical foundations of the most powerful models in modern ML.",
    accent: "#f59e0b",
    blocks: [
        { type: "h2", text: "Biological vs Artificial Neurons" },
        { type: "p", text: "Neural networks are loosely inspired by biological brains. A biological neuron receives signals from dendrites, integrates them in the cell body, and if the total signal exceeds a threshold, fires a signal through its axon to other neurons. An artificial neuron follows the same pattern: take weighted inputs, add a bias, apply an activation function to decide the output." },
        {
            type: "code", lang: "text", code: `Artificial Neuron (Perceptron):

  Inputs:    x = [x₁, x₂, ..., xₚ]
  Weights:   w = [w₁, w₂, ..., wₚ]
  Bias:      b

  Step 1 - Weighted sum (pre-activation):
    z = w₁x₁ + w₂x₂ + ... + wₚxₚ + b = wᵀx + b

  Step 2 - Apply activation function:
    a = f(z)    where f is the activation function

  Output: a (a scalar value between some range)

  The weights w and bias b are the LEARNABLE PARAMETERS.
  The activation function f is chosen by the network designer.`
        },

        { type: "h2", text: "Activation Functions" },
        { type: "p", text: "The activation function introduces non-linearity into the network. Without it, a multi-layer network would just be a linear model regardless of depth. Non-linear activations give neural networks the ability to learn arbitrary complex functions." },
        {
            type: "table", headers: ["Function", "Formula", "Range", "Pros / Cons / Use Case"], rows: [
                ["Sigmoid", "1/(1+e^(-z))", "(0, 1)", "Output probabilities; vanishing gradient in deep nets"],
                ["Tanh", "tanh(z)", "(-1, 1)", "Zero-centered (better than sigmoid); still vanishing gradient"],
                ["ReLU", "max(0, z)", "[0, +∞)", "Most common in hidden layers; fast; dying ReLU problem"],
                ["Leaky ReLU", "max(0.01z, z)", "(-∞, +∞)", "Fixes dying ReLU; allows small negative gradient"],
                ["ELU", "z if z>0, α(e^z-1) if z≤0", "(-α, +∞)", "Smooth, reduces bias shift"],
                ["Softmax", "e^zₖ/Σe^zⱼ", "(0,1), sums to 1", "Multi-class output layer only"],
                ["Linear", "z", "(-∞, +∞)", "Regression output layer only"],
            ]
        },
        {
            type: "code", lang: "text", code: `ReLU Intuition:

  ReLU(z) = max(0, z)

  z < 0 → output 0 (inactive neuron)
  z > 0 → output z (active, passes signal unchanged)

  Why ReLU works well:
    - No vanishing gradient for positive values (derivative = 1 always)
    - Sparse activation (~50% neurons inactive) → less computation
    - Simple and fast to compute
    
  Dying ReLU problem:
    If a neuron always gets negative input (z < 0) for ALL training samples,
    it always outputs 0 → gradient is always 0 → weights never update.
    The neuron is "dead" and cannot recover.
    Fix: Leaky ReLU (small negative slope instead of 0)`
        },

        { type: "h2", text: "Multilayer Perceptron (MLP) — Architecture" },
        { type: "p", text: "Stacking multiple layers of neurons creates a Multilayer Perceptron (MLP), also called a feedforward neural network or deep neural network. Each layer transforms its input into a higher-level representation, allowing the network to learn hierarchical features." },
        {
            type: "code", lang: "text", code: `MLP Architecture:

  Input Layer:     x ∈ ℝᵖ     (p input features)
  Hidden Layer 1:  h⁽¹⁾ = f(W⁽¹⁾x + b⁽¹⁾)     (h₁ neurons)
  Hidden Layer 2:  h⁽²⁾ = f(W⁽²⁾h⁽¹⁾ + b⁽²⁾)   (h₂ neurons)
  ...
  Output Layer:    ŷ = g(W⁽ᴸ⁾h⁽ᴸ⁻¹⁾ + b⁽ᴸ⁾)     (K outputs)

  where:
    W⁽ˡ⁾ = weight matrix for layer l
    b⁽ˡ⁾ = bias vector for layer l
    f    = hidden layer activation (e.g., ReLU)
    g    = output activation (sigmoid for binary, softmax for multi-class)

  Universal Approximation Theorem:
    An MLP with one hidden layer and enough neurons can approximate
    ANY continuous function. In practice, deeper networks learn
    more efficiently than very wide shallow networks.

  Example architecture (binary classification):
    Input(10) → Dense(128, ReLU) → Dense(64, ReLU) → Dense(1, Sigmoid)`
        },

        { type: "h2", text: "Forward Pass" },
        { type: "p", text: "The forward pass propagates the input through the network layer by layer to produce a prediction. This is pure matrix multiplication + activation functions." },
        {
            type: "code", lang: "python", code: `import numpy as np

# Manual forward pass (simplified, no library)
def relu(z):
    return np.maximum(0, z)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

# Random example: 4 inputs → 3 hidden → 1 output
np.random.seed(42)
x = np.array([0.5, -0.3, 0.8, 0.1])  # input

# Layer 1 params (3 neurons, 4 inputs each)
W1 = np.random.randn(3, 4) * 0.01
b1 = np.zeros(3)

# Layer 2 params (1 neuron output, 3 inputs from layer 1)
W2 = np.random.randn(1, 3) * 0.01
b2 = np.zeros(1)

# Forward pass
z1 = W1 @ x + b1      # linear combination
h1 = relu(z1)          # hidden layer activations

z2 = W2 @ h1 + b2     # output linear combination
y_pred = sigmoid(z2)   # binary classification output

print(f"Predicted probability: {y_pred[0]:.4f}")`
        },

        { type: "h2", text: "The Loss Function" },
        { type: "p", text: "The loss function measures how wrong the network's predictions are. The choice depends on the task. The training goal is to find weights W that minimize the average loss over all training examples." },
        {
            type: "table", headers: ["Task", "Output Activation", "Loss Function"], rows: [
                ["Binary Classification", "Sigmoid", "Binary Cross-Entropy: –[y·log(p) + (1–y)·log(1–p)]"],
                ["Multi-Class Classification", "Softmax", "Categorical Cross-Entropy: –Σₖ yₖ·log(pₖ)"],
                ["Regression", "Linear (none)", "MSE: (y – ŷ)²  or  MAE: |y – ŷ|"],
            ]
        },

        { type: "h2", text: "Backpropagation — Learning the Weights" },
        { type: "p", text: "Backpropagation is the algorithm that computes gradients of the loss with respect to ALL weights in the network, enabling gradient descent to update them. It efficiently applies the chain rule of calculus from the output layer backward through the network." },
        {
            type: "code", lang: "text", code: `Backpropagation (conceptual):

  Forward pass: compute ŷ and loss L

  Backward pass: compute ∂L/∂W for every weight W

  Using the chain rule:
    ∂L/∂W⁽¹⁾ = ∂L/∂ŷ × ∂ŷ/∂h² × ∂h²/∂h¹ × ∂h¹/∂W⁽¹⁾
    
  Each term is easy to compute (simple derivatives of matrix ops + activations)
  The "back" in backpropagation = propagating gradient backward through layers

  Why does it work?
    Each weight's gradient tells us: if I increase this weight by ε,
    how much does the loss change? (approximately ε × gradient)
    
    We move weights in the OPPOSITE direction (gradient descent):
    W ← W − α × ∂L/∂W

  Key insight: gradients can be computed efficiently using the
  intermediate values cached during the forward pass.`
        },

        { type: "h2", text: "Vanishing & Exploding Gradients" },
        { type: "p", text: "Deep networks face a challenge: gradients are multiplied many times during backpropagation. Small multiplications → gradients shrink exponentially → early layers learn nothing (vanishing gradient). Large multiplications → gradients grow exponentially → training fails (exploding gradient)." },
        {
            type: "table", headers: ["Problem", "Cause", "Solution"], rows: [
                ["Vanishing gradient", "Sigmoid/tanh activations: derivative < 0.25, so repeated multiplication → 0", "ReLU activation, batch normalization, residual connections"],
                ["Exploding gradient", "Weights with large magnitude, recursive signal amplification", "Gradient clipping, careful weight initialization"],
                ["Weight initialization", "If weights too small → vanishing; too large → exploding", "Xavier/He initialization: scale by 1/√n_inputs"],
            ]
        },
        {
            type: "code", lang: "python", code: `import torch
import torch.nn as nn

# ── PyTorch MLP (industry standard for deep learning)
class MLP(nn.Module):
    def __init__(self, input_size, hidden_sizes, output_size):
        super().__init__()
        layers = []
        in_size = input_size
        for h_size in hidden_sizes:
            layers.append(nn.Linear(in_size, h_size))
            layers.append(nn.BatchNorm1d(h_size))  # normalize activations
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(p=0.3))  # regularization
            in_size = h_size
        layers.append(nn.Linear(in_size, output_size))
        self.net = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.net(x)

model = MLP(input_size=20, hidden_sizes=[128, 64, 32], output_size=1)

# Loss and optimizer
criterion = nn.BCEWithLogitsLoss()  # binary classification
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# Training loop
for epoch in range(100):
    model.train()
    optimizer.zero_grad()              # clear gradients
    logits = model(X_batch)            # forward pass
    loss = criterion(logits, y_batch)  # compute loss
    loss.backward()                    # backpropagation
    
    # Gradient clipping (prevent exploding gradients)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    
    optimizer.step()                   # update weights

# ── Scikit-learn MLP (simpler, for tabular data)
from sklearn.neural_network import MLPClassifier
mlp = MLPClassifier(
    hidden_layer_sizes=(128, 64),
    activation='relu',
    solver='adam',
    alpha=0.001,         # L2 regularization
    batch_size='auto',
    learning_rate_init=0.001,
    max_iter=300,
  Output: a (a scalar value between some range)

  The weights w and bias b are the LEARNABLE PARAMETERS.
  The activation function f is chosen by the network designer.`
        },

        { type: "h2", text: "Activation Functions" },
        { type: "p", text: "The activation function introduces non-linearity into the network. Without it, a multi-layer network would just be a linear model regardless of depth. Non-linear activations give neural networks the ability to learn arbitrary complex functions." },
        {
            type: "table", headers: ["Function", "Formula", "Range", "Pros / Cons / Use Case"], rows: [
                ["Sigmoid", "1/(1+e^(-z))", "(0, 1)", "Output probabilities; vanishing gradient in deep nets"],
                ["Tanh", "tanh(z)", "(-1, 1)", "Zero-centered (better than sigmoid); still vanishing gradient"],
                ["ReLU", "max(0, z)", "[0, +∞)", "Most common in hidden layers; fast; dying ReLU problem"],
                ["Leaky ReLU", "max(0.01z, z)", "(-∞, +∞)", "Fixes dying ReLU; allows small negative gradient"],
                ["ELU", "z if z>0, α(e^z-1) if z≤0", "(-α, +∞)", "Smooth, reduces bias shift"],
                ["Softmax", "e^zₖ/Σe^zⱼ", "(0,1), sums to 1", "Multi-class output layer only"],
                ["Linear", "z", "(-∞, +∞)", "Regression output layer only"],
            ]
        },
        {
            type: "code", lang: "text", code: `ReLU Intuition:

  ReLU(z) = max(0, z)

  z < 0 → output 0 (inactive neuron)
  z > 0 → output z (active, passes signal unchanged)

  Why ReLU works well:
    - No vanishing gradient for positive values (derivative = 1 always)
    - Sparse activation (~50% neurons inactive) → less computation
    - Simple and fast to compute
    
  Dying ReLU problem:
    If a neuron always gets negative input (z < 0) for ALL training samples,
    it always outputs 0 → gradient is always 0 → weights never update.
    The neuron is "dead" and cannot recover.
    Fix: Leaky ReLU (small negative slope instead of 0)`
        },

        { type: "h2", text: "Multilayer Perceptron (MLP) — Architecture" },
        { type: "p", text: "Stacking multiple layers of neurons creates a Multilayer Perceptron (MLP), also called a feedforward neural network or deep neural network. Each layer transforms its input into a higher-level representation, allowing the network to learn hierarchical features." },
        {
            type: "code", lang: "text", code: `MLP Architecture:

  Input Layer:     x ∈ ℝᵖ     (p input features)
  Hidden Layer 1:  h⁽¹⁾ = f(W⁽¹⁾x + b⁽¹⁾)     (h₁ neurons)
  Hidden Layer 2:  h⁽²⁾ = f(W⁽²⁾h⁽¹⁾ + b⁽²⁾)   (h₂ neurons)
  ...
  Output Layer:    ŷ = g(W⁽ᴸ⁾h⁽ᴸ⁻¹⁾ + b⁽ᴸ⁾)     (K outputs)

  where:
    W⁽ˡ⁾ = weight matrix for layer l
    b⁽ˡ⁾ = bias vector for layer l
    f    = hidden layer activation (e.g., ReLU)
    g    = output activation (sigmoid for binary, softmax for multi-class)

  Universal Approximation Theorem:
    An MLP with one hidden layer and enough neurons can approximate
    ANY continuous function. In practice, deeper networks learn
    more efficiently than very wide shallow networks.

  Example architecture (binary classification):
    Input(10) → Dense(128, ReLU) → Dense(64, ReLU) → Dense(1, Sigmoid)`
        },

        { type: "h2", text: "Forward Pass" },
        { type: "p", text: "The forward pass propagates the input through the network layer by layer to produce a prediction. This is pure matrix multiplication + activation functions." },
        {
            type: "code", lang: "python", code: `import numpy as np

# Manual forward pass (simplified, no library)
def relu(z):
    return np.maximum(0, z)

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

# Random example: 4 inputs → 3 hidden → 1 output
np.random.seed(42)
x = np.array([0.5, -0.3, 0.8, 0.1])  # input

# Layer 1 params (3 neurons, 4 inputs each)
W1 = np.random.randn(3, 4) * 0.01
b1 = np.zeros(3)

# Layer 2 params (1 neuron output, 3 inputs from layer 1)
W2 = np.random.randn(1, 3) * 0.01
b2 = np.zeros(1)

# Forward pass
z1 = W1 @ x + b1      # linear combination
h1 = relu(z1)          # hidden layer activations

z2 = W2 @ h1 + b2     # output linear combination
y_pred = sigmoid(z2)   # binary classification output

print(f"Predicted probability: {y_pred[0]:.4f}")`
        },

        { type: "h2", text: "The Loss Function" },
        { type: "p", text: "The loss function measures how wrong the network's predictions are. The choice depends on the task. The training goal is to find weights W that minimize the average loss over all training examples." },
        {
            type: "table", headers: ["Task", "Output Activation", "Loss Function"], rows: [
                ["Binary Classification", "Sigmoid", "Binary Cross-Entropy: –[y·log(p) + (1–y)·log(1–p)]"],
                ["Multi-Class Classification", "Softmax", "Categorical Cross-Entropy: –Σₖ yₖ·log(pₖ)"],
                ["Regression", "Linear (none)", "MSE: (y – ŷ)²  or  MAE: |y – ŷ|"],
            ]
        },

        { type: "h2", text: "Backpropagation — Learning the Weights" },
        { type: "p", text: "Backpropagation is the algorithm that computes gradients of the loss with respect to ALL weights in the network, enabling gradient descent to update them. It efficiently applies the chain rule of calculus from the output layer backward through the network." },
        {
            type: "code", lang: "text", code: `Backpropagation (conceptual):

  Forward pass: compute ŷ and loss L

  Backward pass: compute ∂L/∂W for every weight W

  Using the chain rule:
    ∂L/∂W⁽¹⁾ = ∂L/∂ŷ × ∂ŷ/∂h² × ∂h²/∂h¹ × ∂h¹/∂W⁽¹⁾
    
  Each term is easy to compute (simple derivatives of matrix ops + activations)
  The "back" in backpropagation = propagating gradient backward through layers

  Why does it work?
    Each weight's gradient tells us: if I increase this weight by ε,
    how much does the loss change? (approximately ε × gradient)
    
    We move weights in the OPPOSITE direction (gradient descent):
    W ← W − α × ∂L/∂W

  Key insight: gradients can be computed efficiently using the
  intermediate values cached during the forward pass.`
        },

        { type: "h2", text: "Vanishing & Exploding Gradients" },
        { type: "p", text: "Deep networks face a challenge: gradients are multiplied many times during backpropagation. Small multiplications → gradients shrink exponentially → early layers learn nothing (vanishing gradient). Large multiplications → gradients grow exponentially → training fails (exploding gradient)." },
        {
            type: "table", headers: ["Problem", "Cause", "Solution"], rows: [
                ["Vanishing gradient", "Sigmoid/tanh activations: derivative < 0.25, so repeated multiplication → 0", "ReLU activation, batch normalization, residual connections"],
                ["Exploding gradient", "Weights with large magnitude, recursive signal amplification", "Gradient clipping, careful weight initialization"],
                ["Weight initialization", "If weights too small → vanishing; too large → exploding", "Xavier/He initialization: scale by 1/√n_inputs"],
            ]
        },
        {
            type: "code", lang: "python", code: `import torch
import torch.nn as nn

# ── PyTorch MLP (industry standard for deep learning)
class MLP(nn.Module):
    def __init__(self, input_size, hidden_sizes, output_size):
        super().__init__()
        layers = []
        in_size = input_size
        for h_size in hidden_sizes:
            layers.append(nn.Linear(in_size, h_size))
            layers.append(nn.BatchNorm1d(h_size))  # normalize activations
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(p=0.3))  # regularization
            in_size = h_size
        layers.append(nn.Linear(in_size, output_size))
        self.net = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.net(x)

model = MLP(input_size=20, hidden_sizes=[128, 64, 32], output_size=1)

# Loss and optimizer
criterion = nn.BCEWithLogitsLoss()  # binary classification
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# Training loop
for epoch in range(100):
    model.train()
    optimizer.zero_grad()              # clear gradients
    logits = model(X_batch)            # forward pass
    loss = criterion(logits, y_batch)  # compute loss
    loss.backward()                    # backpropagation
    
    # Gradient clipping (prevent exploding gradients)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    
    optimizer.step()                   # update weights

# ── Scikit-learn MLP (simpler, for tabular data)
from sklearn.neural_network import MLPClassifier
mlp = MLPClassifier(
    hidden_layer_sizes=(128, 64),
    activation='relu',
    solver='adam',
    alpha=0.001,         # L2 regularization
    batch_size='auto',
    learning_rate_init=0.001,
    max_iter=300,
    early_stopping=True,
    random_state=42
)
mlp.fit(X_train_scaled, y_train)`
        },
        { type: "callout", variant: "important", text: "Neural networks are the most powerful class of ML models, but they need large amounts of data to generalize well. For tabular data with < 100K samples, Random Forest and XGBoost usually outperform neural networks. Use neural networks when: you have > 100K samples, for unstructured data (images, text, audio), or when you need to learn representations automatically." },

        { type: "divider" },

        { type: "h2", text: "Weight Initialization — Where You Start Matters" },
        { type: "p", text: "All weights must start at some value before training begins. This choice is far more important than most beginners realize. Bad initialization can cause training to fail immediately due to vanishing or exploding gradients, even before a single learnable step is taken." },
        {
            type: "code", lang: "text", code: `Why NOT initialize all weights to zero?
  If all weights are 0, then z = 0 for every neuron.
  Every neuron in a layer produces the SAME output.
  Every neuron gets the SAME gradient.
  Every weight updates by the SAME amount.
  → All neurons remain identical forever! (Symmetry problem)
  → The network behaves as if it only has ONE neuron per layer.

Why NOT initialize with huge values?
  Large weights → large z values → sigmoid/tanh saturates (output ≈ 1 or -1)
  → Derivative is near 0 → Vanishing gradient immediately.

The Solution: Scale initialization by the layer size.

Xavier (Glorot) Initialization (for sigmoid / tanh activations):
  Variance of weights = 2 / (n_inputs + n_outputs)
  Keeps variance of activations roughly equal across layers.

He (Kaiming) Initialization (for ReLU activations):
  Variance of weights = 2 / n_inputs
  Accounts for the fact that ReLU kills 50% of neurons (z<0 → 0),
  so we need a larger initial spread to compensate.`
        },
        {
            type: "code", lang: "python", code: `import torch
import torch.nn as nn

# PyTorch uses He init by default for Linear layers (sensible choice)
linear = nn.Linear(128, 64)
print(linear.weight.shape)   # torch.Size([64, 128])

# Apply Xavier init manually
nn.init.xavier_uniform_(linear.weight)

# Apply He init manually (best for ReLU networks)
nn.init.kaiming_normal_(linear.weight, mode='fan_in', nonlinearity='relu')

# The rule of thumb:
#   ReLU activation → He initialization
#   tanh/sigmoid   → Xavier initialization`
        },

        { type: "h2", text: "Batch Normalization — Keeping Activations Healthy" },
        { type: "p", text: "As data flows through many layers, the distribution of activations shifts layer by layer. Layer 5 might receive inputs in the range [−50, 50] while Layer 6 receives [0.001, 0.01]. This 'Internal Covariate Shift' makes training slow and unstable. Batch Normalization (BatchNorm) fixes this by normalizing the activations within each mini-batch." },
        {
            type: "code", lang: "text", code: `BatchNorm Algorithm (applied BEFORE the activation function):

  Given a mini-batch of activations z = [z₁, z₂, ..., zᵦ]:

  1. Compute batch mean:    μᵦ = (1/B) · Σ zᵢ
  2. Compute batch variance: σ²ᵦ = (1/B) · Σ (zᵢ - μᵦ)²
  3. Normalize:              ẑᵢ = (zᵢ - μᵦ) / √(σ²ᵦ + ε)
  4. Scale & shift:          yᵢ = γ·ẑᵢ + β

  γ (gamma) and β (beta) are LEARNABLE parameters.
  The network can CHOOSE to undo normalization if it helps!

Benefits:
  → Higher learning rates (training is faster and more stable)
  → Less sensitive to weight initialization
  → Acts as a mild regularizer (adds noise via batch statistics)
  → Reduces the need for Dropout sometimes`
        },

        { type: "h2", text: "Dropout — Preventing Over-Reliance on Any Neuron" },
        { type: "p", text: "Dropout is a powerful regularization technique. During training, each neuron is randomly 'switched off' with probability p (typically 0.2–0.5). This forces the network to learn redundant representations — no single neuron can become too important." },
        {
            type: "code", lang: "text", code: `Dropout: Train time vs Inference time

  During TRAINING (p = 0.4 dropout rate):
    Each neuron is independently set to 0 with probability p=0.4.
    The surviving 60% of neurons are scaled UP by 1/0.6 to keep output magnitudes consistent.
    → Each forward pass sees a DIFFERENT random "thinned" network!
    → Equivalent to training an ensemble of 2^N different architectures.

  During INFERENCE (prediction):
    Dropout is turned OFF. All neurons are used.
    No scaling needed (already handled during training with the 1/(1-p) factor).
    → We get the ensemble's averaged prediction for free!

In PyTorch:
  # Training mode (dropout is active)
  model.train()
  
  # Evaluation mode (dropout is disabled automatically)
  model.eval()
  # ↑ CRITICAL: Forgetting this is a very common bug!
  #   If you predict with model.train(), random neurons drop out → wrong predictions!`
        },
        { type: "callout", variant: "warning", text: "Always call model.eval() before making predictions or evaluating your network! Forgetting this leaves Dropout and BatchNorm in training mode, producing different results every inference call." },

        { type: "h2", text: "Putting it All Together: A Complete Training Run" },
        {
            type: "code", lang: "python", code: `import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

# ── 1. Create synthetic dataset
X = torch.randn(1000, 10)
y = (X[:, 0] + X[:, 1] > 0).float().unsqueeze(1)  # binary target

dataset = TensorDataset(X, y)
train_loader = DataLoader(dataset, batch_size=64, shuffle=True)

# ── 2. Define network
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(10, 64),
            nn.BatchNorm1d(64),     # normalize activations
            nn.ReLU(),
            nn.Dropout(p=0.3),      # regularization
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),       # output logit (no sigmoid here)
        )
        # Apply He initialization to all Linear layers
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')

    def forward(self, x):
        return self.net(x)

model = Net()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.BCEWithLogitsLoss()  # sigmoid + binary cross-entropy combined

# ── 3. Training loop
for epoch in range(20):
    model.train()         # activate dropout + batchnorm training mode
    total_loss = 0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()              # clear last step's gradients
        logits = model(X_batch)            # forward pass
        loss = criterion(logits, y_batch)  # compute loss
        loss.backward()                    # backprop (Chain Rule!)
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # clip exploding grads
        optimizer.step()                   # update weights
        total_loss += loss.item()
    print(f"Epoch {epoch+1}: Loss = {total_loss/len(train_loader):.4f}")

# ── 4. Evaluate
model.eval()              # IMPORTANT: disable dropout/batchnorm training mode
with torch.no_grad():     # disable gradient tracking for inference
    preds = torch.sigmoid(model(X)) > 0.5
    acc = (preds == y).float().mean()
    print(f"Accuracy: {acc.item():.4f}")`
        },
    ]
} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
