import { DocBlock } from "@/app/components/DocSection";

export const data = {
    title: "Calculus for Machine Learning",
    subtitle: "The mathematical engine behind training models. Learn how derivatives and the Chain Rule help us find the perfect parameters.",
    accent: "#f43f5e",
    blocks: [
        { type: "h2", text: "Why Does an ML Engineer Need Calculus?" },
        { type: "p", text: "Imagine you are blindfolded on a mountain, and your goal is to find the lowest valley. You can't see the valley, but you can feel with your foot whether the ground slopes up or down. If the ground slopes up in front of you, you step backward. If it slopes down, you step forward." },
        { type: "p", text: "In Machine Learning:" },
        {
            type: "table", headers: ["Analogy", "Machine Learning Equivelant"], rows: [
                ["The Mountain", "The Loss Function (how many mistakes we are making)"],
                ["The Lowest Valley", "The Global Minimum (the least possible mistakes)"],
                ["Feeling the Slope", "Calculating the Derivative / Gradient"],
                ["Taking a Step", "Updating our Weights (Gradient Descent)"]
            ]
        },
        { type: "callout", variant: "important", text: "Calculus gives us the 'slope'. Without calculus, an ML model wouldn't know which direction to change its weights to get smarter. It would just have to guess randomly!" },

        { type: "h2", text: "1. The Derivative: Measuring the Slope" },
        { type: "p", text: "A derivative simply answers one question: 'If I change my input (x) by a tiny amount, how much does my output (y) change?'" },
        { type: "p", text: "If we have a Loss function L(w), where 'w' is a weight in our model, the derivative tells us what happens to our error if we tweak that weight." },
        {
            type: "code", lang: "text", code: `Understanding the Derivative sign:

- If the derivative is POSITIVE (+): 
  Increasing the weight will INCREASE the error. 
  Action: We should decrease the weight!

- If the derivative is NEGATIVE (-): 
  Increasing the weight will DECREASE the error.
  Action: We should increase the weight!

- If the derivative is ZERO (0):
  We are at the bottom of the valley.
  Action: Stop! We found the perfect weight.`
        },

        { type: "h3", text: "Simple Derivative Rules" },
        { type: "p", text: "You don't need to be a math major. 90% of ML calculus boils down to understanding these basics:" },
        {
            type: "code", lang: "text", code: `1. The Power Rule: Move the exponent to the front, subtract 1.
   If f(x) = x^2, then derivative f'(x) = 2x
   If f(x) = x^3, then derivative f'(x) = 3x^2

2. A straight line: The slope is constant.
   If f(x) = 5x, then derivative f'(x) = 5

3. A constant: A flat line has zero slope.
   If f(x) = 10, then derivative f'(x) = 0`
        },

        { type: "h2", text: "2. Partial Derivatives: Multiple Weights" },
        { type: "p", text: "Models almost never have just one weight. A small Neural Network might have 1,000 weights. To handle this, we use Partial Derivatives." },
        { type: "p", text: "A partial derivative (symbol: ∂) is identical to a regular derivative, but with one special rule: **Pretend all other variables are just numbers.**" },
        {
            type: "code", lang: "text", code: `Example: f(x, y) = x^2 + 3y

Partial derivative with respect to x (∂f/∂x):
- We only care about x. 
- Pretend '3y' is just a constant number (like 10).
- The derivative of x^2 is 2x. 
- The derivative of a constant is 0.
=> Result: 2x

Partial derivative with respect to y (∂f/∂y):
- We only care about y. 
- Pretend 'x^2' is just a constant number.
- The derivative of 3y is 3. 
- The derivative of a constant is 0.
=> Result: 3`
        },
        { type: "callout", variant: "info", text: "Why do we do this? Because during training, we treat each weight independently. We want to ask: 'How should I change Weight #1, assuming all other weights stay exactly where they are?'" },

        { type: "h2", text: "3. The Gradient: Putting it all Together" },
        { type: "p", text: "Once we calculate the partial derivative for every single weight in our model, we pack them all into a giant array (vector). This vector is called the **Gradient** (denoted by the upside-down triangle symbol ∇)." },
        { type: "p", text: "The magic property of the Gradient is that it always points exactly in the direction of steepest **ascent** (the fastest way UP the mountain). Since we want to go down to reduce error, we always subtract the gradient from our weights." },

        { type: "h2", text: "4. The Chain Rule: Deep Learning's Secret Weapon" },
        { type: "p", text: "In a Deep Neural Network, data passes through multiple layers. Layer 1 feeds into Layer 2, which feeds into Layer 3, and so on. This creates 'nested functions'." },
        { type: "p", text: "Imagine you are trying to figure out how changing a weight in Layer 1 affects the final Loss at the very end. This is hard because the output doesn't jump directly to the loss; it has to travel through Layer 2 and Layer 3 first." },
        { type: "p", text: "The **Chain Rule** solves this by letting us multiply the derivatives of each step backward." },

        { type: "h3", text: "The Bicycle Analogy" },
        { type: "p", text: "Suppose you want to know how fast a bicycle moves based on how hard you pedal." },
        { type: "p", text: "1. Moving the pedal turns the front gear (A depends on B)." },
        { type: "p", text: "2. The front gear turns the back wheel (B depends on C)." },
        { type: "p", text: "3. The back wheel moves the bike forward (C depends on D)." },
        {
            type: "code", lang: "text", code: `If:
- 1 pedal rotation = 2 gear rotations
- 1 gear rotation  = 4 wheel rotations
- 1 wheel rotation = 2 meters moved

How many meters do you move per pedal rotation?
Just multiply them! 
(2 gears) * (4 wheels) * (2 meters) = 16 meters.

This is exactly the Chain Rule in calculus!
dy/dx = (dy/du) * (du/dz) * (dz/dx)`
        },
        { type: "callout", variant: "important", text: "In Machine Learning, applying the Chain Rule backwards from the output layer to the first hidden layer is called Backpropagation. It is the algorithm that makes training Neural Networks possible." },

        { type: "h3", text: "The Computational Graph" },
        { type: "p", text: "Under the hood, Neural Networks build a 'Computational Graph'—a diagram where every mathematical operation (addition, multiplication, activation) is a node connected by arrows. During the forward pass, data flows from left to right. During the backward pass (Backpropagation), the Chain Rule is applied step-by-step from right to left, multiplying the local derivative of each node to compute the final gradient." },
        {
            type: "code", lang: "text", code: `Example Computational Graph for: f(x, y, z) = (x + y) * z

Inputs: x=2, y=3, z=4

1. FORWARD PASS:
   Node_1 (Add) = x + y = 2 + 3 = 5
   Node_2 (Mult) = Node_1 * z = 5 * 4 = 20
   Output = 20

2. BACKWARD PASS (Chain Rule):
   - How does Output change with Node_1? 
     (Derivative of 'Node_1 * z' with respect to Node_1 is z). So local gradient = 4.
   - How does Output change with x? 
     Chain Rule: (Derivative of Output wrt Node_1) * (Derivative of Node_1 wrt x)
                 = 4 * 1 = 4.
   
The network knows exactly how a tweak in 'x' will impact the final output by multiplying backward!`
        },

        { type: "h2", text: "5. Second Derivatives & Convexity" },
        { type: "p", text: "The first derivative tells us the slope (is it going up or down?). But what if we take the derivative OF the derivative? This is called the Second Derivative. It tells us the curvature (is the slope getting steeper, or is it flattening out?)." },
        { type: "callout", variant: "info", text: "If a function is 'Convex', its second derivative is constantly positive. Visually, it looks like a perfect bowl (a U-shape). Convex functions are the holy grail of ML because they only have ONE valley: the Global Minimum. If you use Gradient Descent on a convex function, you are mathematically guaranteed to find the perfect solution!" },
        { type: "p", text: "Linear and Logistic Regression create perfectly Convex loss mountains. However, Deep Neural Networks create highly 'Non-Convex' mountains. They are filled with:" },
        {
            type: "table", headers: ["Terrain Feature", "Calculus Description", "Why it's bad"], rows: [
                ["Local Minima", "Derivative is 0, but it's just a shallow crater.", "Model stops learning, but it's not the best solution."],
                ["Saddle Points", "Derivative is 0, sloping up in one direction and down in another.", "Model gets stuck thinking it finished learning."],
                ["Vanishing Gradients", "Derivatives become incredibly close to 0 (flat).", "The 'steps' become so tiny the model basically stops updating."]
            ]
        },

        { type: "h2", text: "6. Advanced Optimizers (Calculus + Physics)" },
        { type: "p", text: "Because Neural Network mountains are so rugged and jagged, basic Gradient Descent can easily get stuck. Calculus and physics give us advanced tools to fix this:" },
        {
            type: "table", headers: ["Optimizer", "How it uses Calculus & Physics"], rows: [
                ["Momentum", "Adds 'inertia' to the gradients. If you are rolling downhill and hit a small bump (local minimum), the previous momentum powers you right over it."],
                ["AdaGrad", "Shrinks the learning rate for weights with huge derivatives, and boosts it for weights with tiny derivatives. Great for text and sparse data."],
                ["Adam (Adaptive Moment Est.)", "The industry standard. It combines Momentum and AdaGrad, keeping a running average of both the first derivative (the slope) and the second derivative (the curvature)."]
            ]
        },

        { type: "h2", text: "7. Doing this in Python" },
        { type: "p", text: "The great news is that you will almost never calculate derivatives by hand. Libraries like PyTorch and TensorFlow have built-in 'Automatic Differentiation' (Autograd). You define the math, and they dynamically build the Computational Graph and run the Chain Rule for you instantly." },
        {
            type: "code", lang: "python", code: `import torch

# 1. Provide an initial random weight
# requires_grad=True tells PyTorch: "Watch this variable, build a computational graph!"
w = torch.tensor([3.0], requires_grad=True)

# 2. Define our "Loss" calculation
# For example, let's say Loss = w^2 + 2w
loss = w**2 + 2*w

# 3. MAGIC HAPPENS HERE
# This one line computes the derivative using the Chain Rule (Backpropagation)
loss.backward()

# 4. Check the gradient (the slope)
# Mathematically, derivative of w^2 + 2w is 2w + 2.
# Since w = 3: 2(3) + 2 = 8.
print(f"The gradient is: {w.grad.item()}") # Output: 8.0

# 5. Gradient Descent Step
# Since slope is positive (8), increasing w increases error. We must subtract.
learning_rate = 0.1
new_w = w - (learning_rate * w.grad)

print(f"Old weight: {w.item()} | New weight: {new_w.item()}")`
        },

        { type: "divider" },

        { type: "h2", text: "8. Limits: What Does a Function Approach?" },
        { type: "p", text: "Before you can define a derivative, you need the concept of a Limit. A limit asks: 'As my input x gets infinitely close to some value a (but never actually equals it), what value does my function f(x) approach?'" },
        { type: "p", text: "Notation: lim(x→a) f(x) = L means 'as x approaches a, f(x) approaches L'." },
        {
            type: "code", lang: "text", code: `Example 1: Obvious limit
  f(x) = 3x + 1
  lim(x→2) f(x) = 3(2) + 1 = 7

Example 2: The 0/0 form (where limits shine)
  f(x) = (x² - 4) / (x - 2)

  At x=2, this is 0/0 (undefined!). But the LIMIT still exists:
  We factor the top:  (x-2)(x+2) / (x-2)
  Cancel (x-2):       x+2
  Now:  lim(x→2) (x+2) = 4

  Why it matters: the derivative formula IS a limit! 
  We compute slopes of smaller and smaller triangles until the triangle disappears.

The Formal Derivative as a Limit:
  f'(x) = lim(h→0) [ f(x+h) - f(x) ] / h
  
  This is the slope of a tiny triangle with width h, 
  as h shrinks to zero. The result is the instantaneous slope.`
        },
        { type: "callout", variant: "info", text: "You will never compute limits by hand in ML. But understanding them demystifies the derivative formula — it is not magic, just increasingly precise slope estimates." },

        { type: "h2", text: "9. More Differentiation Rules" },
        { type: "p", text: "Beyond the Power Rule, there are a few more rules that appear constantly in ML and are worth knowing by name, even if you let libraries compute them." },
        {
            type: "table", headers: ["Rule", "What it covers", "Formula", "Example"], rows: [
                ["Sum Rule", "Derivative of two things added together", "(f + g)' = f' + g'", "d/dx(x² + 3x) = 2x + 3"],
                ["Product Rule", "Derivative of two things multiplied", "(fg)' = f'g + fg'", "d/dx(x² · sin(x)) = 2x·sin(x) + x²·cos(x)"],
                ["Quotient Rule", "Derivative of a fraction", "(f/g)' = (f'g - fg') / g²", "d/dx(x/e^x) = (e^x - x·e^x) / e^(2x)"],
                ["Chain Rule", "Derivative of a nested function", "d/dx f(g(x)) = f'(g(x)) · g'(x)", "d/dx(sin(x²)) = cos(x²) · 2x"],
                ["Exponential", "Very common in probability and loss functions", "d/dx(e^x) = e^x", "d/dx(e^(3x)) = 3e^(3x)"],
                ["Logarithm", "Appears in cross-entropy loss", "d/dx(ln x) = 1/x", "d/dx(ln(w)) = 1/w"],
            ]
        },
        { type: "callout", variant: "tip", text: "The Logarithm derivative is critical! Cross-entropy loss uses log(p), so the gradient of the loss with respect to p involves 1/p. This is why numerically stable implementations clamp p to avoid log(0) = -infinity." },

        { type: "h2", text: "10. The Derivative of Key ML Functions" },
        { type: "p", text: "These are the derivatives you will encounter most in ML. They are applied by automatic differentiation every training step." },
        {
            type: "code", lang: "text", code: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. MSE Loss:  L = (y - ŷ)²
   dL/dŷ = -2(y - ŷ)
   → When prediction ŷ is higher than truth y, slope is positive: decrease ŷ.

2. Sigmoid:  σ(z) = 1 / (1 + e^(-z))
   σ'(z) = σ(z) · (1 - σ(z))
   → Derivative is always between 0 and 0.25. Very small!
   → This is exactly WHY sigmoid causes vanishing gradients in deep nets.

3. ReLU:  f(z) = max(0, z)
   f'(z) = 0   if z < 0
         = 1   if z > 0   (undefined at z=0, treated as 0)
   → Derivative is 1 for active neurons: gradient flows freely!

4. Softmax:  pₖ = e^(zₖ) / Σⱼ e^(zⱼ)
   The derivative is a matrix (Jacobian), not a scalar.
   ∂pₖ/∂zⱼ = pₖ(δₖⱼ - pⱼ)   where δₖⱼ = 1 if k=j, else 0

5. Log Loss (Cross-Entropy):  L = -y·log(p) - (1-y)·log(1-p)
   dL/dp = -y/p + (1-y)/(1-p)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        },

        { type: "h2", text: "11. Integration: The Other Half of Calculus" },
        { type: "p", text: "If a derivative is about splitting things into infinitely small pieces to measure slopes, an integral is about adding infinitely many pieces together to measure area. In ML, you encounter integration primarily in probability theory — areas under probability distributions." },
        {
            type: "code", lang: "text", code: `Intuition: The Area Under a Curve

  Imagine a histogram of heights for 1000 people.
  The total area (all bars) = 1.0 (100% of people).
  The area from 160cm to 175cm = fraction of people in that range.

  For a continuous probability distribution f(x):
    P(a ≤ x ≤ b) = ∫ₐᵇ f(x) dx    (integral from a to b)

  The whole area must equal 1:
    ∫₋∞^+∞ f(x) dx = 1   (fundamental rule of probability distributions)

  The Normal distribution's "bell" is just a specific mathematical shape 
  whose total area under the entire curve equals exactly 1.`
        },
        { type: "callout", variant: "info", text: "You don't need to compute integrals by hand for ML. But understanding that a probability distribution is just a curve that totals to 1 area explains why StandardScaler, Z-scores, and p-values all make sense." },

        { type: "h2", text: "12. The Taylor Series: Approximating Curves With Polynomials" },
        { type: "p", text: "Any smooth mathematical function can be approximated nearby a point using a sum of polynomial terms. This is the Taylor Series. It is fundamental to understanding WHY gradient descent works and how optimizers like Newton's Method improve upon it." },
        {
            type: "code", lang: "text", code: `Taylor Series expansion around point x = a:
  f(x) ≈ f(a) + f'(a)(x-a) + f''(a)/2!(x-a)² + f'''(a)/3!(x-a)³ + ...

Key special case (expand around a = 0):
  f(x) ≈ f(0) + f'(0)·x + f''(0)/2 · x² + ...

Example: e^x  (the most famous expansion)
  f(x)   = eˣ      f(0) = 1
  f'(x)  = eˣ      f'(0) = 1
  f''(x) = eˣ      f''(0) = 1
  
  eˣ ≈ 1 + x + x²/2 + x³/6 + x⁴/24 + ...

Where it matters in ML:
  Gradient descent essentially uses the first-order Taylor approximation:
    L(w + Δw) ≈ L(w) + ∇L(w)ᵀ · Δw
  (The loss at a new position ≈ current loss + gradient step)

  Second-order methods (Newton's Method) use the second term too:
    L(w + Δw) ≈ L(w) + ∇L(w)ᵀ·Δw + ½ Δwᵀ H Δw
  where H is the Hessian (the matrix of second-order derivatives).`
        },

        { type: "h2", text: "13. The Jacobian: Gradient of a Vector Function" },
        { type: "p", text: "The gradient (∇f) works when our function outputs a single scalar number. But what if the function outputs a vector? For example, the Softmax layer outputs a vector of probabilities — we need a derivative for vector-to-vector functions. This is what the Jacobian does." },
        {
            type: "code", lang: "text", code: `Gradient recap:  scalar output → vector of partial derivatives (∇f)
Jacobian:        vector output → MATRIX of partial derivatives (J)

If f: ℝⁿ → ℝᵐ  (n inputs, m outputs)
Then the Jacobian J is an m×n matrix:

  Jᵢⱼ = ∂fᵢ/∂xⱼ   (how does output i change when input j changes?)

  [∂f₁/∂x₁  ∂f₁/∂x₂  ...  ∂f₁/∂xₙ]
  [∂f₂/∂x₁  ∂f₂/∂x₂  ...  ∂f₂/∂xₙ]
  [   ...                          ]
  [∂fₘ/∂x₁  ∂fₘ/∂x₂  ...  ∂fₘ/∂xₙ]

Example: Softmax(z) with z = [z₁, z₂]
  p₁ = e^z₁ / (e^z₁ + e^z₂)
  p₂ = e^z₂ / (e^z₁ + e^z₂)

  ∂p₁/∂z₁ = p₁(1-p₁)   (how p₁ changes with z₁)
  ∂p₁/∂z₂ = -p₁·p₂     (how p₁ changes with z₂)
  ∂p₂/∂z₁ = -p₂·p₁
  ∂p₂/∂z₂ = p₂(1-p₂)

  Jacobian J = [p₁(1-p₁)   -p₁p₂  ]
               [-p₂p₁       p₂(1-p₂)]

In PyTorch, torch.autograd.functional.jacobian(func, inputs) computes this for you.`
        },

        { type: "h2", text: "14. The Hessian: Curvature in All Directions" },
        { type: "p", text: "The Hessian (H) is the matrix of all second-order partial derivatives of a scalar function. While the Gradient tells us the slope in every direction, the Hessian tells us the curvature in every direction." },
        {
            type: "code", lang: "text", code: `For a function f(x₁, x₂, ..., xₙ):

  Hᵢⱼ = ∂²f / (∂xᵢ ∂xⱼ)

  H = [∂²f/∂x₁²     ∂²f/∂x₁∂x₂  ...]
      [∂²f/∂x₂∂x₁   ∂²f/∂x₂²    ...]
      [    ...                      ]

  Note: H is ALWAYS symmetric  (Hᵢⱼ = Hⱼᵢ, mixed partials are equal)

What the Hessian's eigenvalues tell you:
  All positive → the function curves UP in all directions → local minimum!
  All negative → the function curves DOWN in all directions → local maximum!
  Mixed signs  → some directions up, some down → SADDLE POINT

In ML:
  → Newton's Method uses H⁻¹ to take smarter steps: Δw = -H⁻¹ · ∇L
    (Instead of just following the slope, it accounts for curvature)
  → For deep networks, H has BILLIONS of entries — impossible to compute directly.
  → That's why we use Adam and similar methods that approximate curvature cheaply.`
        },
        { type: "callout", variant: "warning", text: "The Hessian is the reason second-order methods don't scale to deep learning. A neural network with 100M parameters would have a 100M×100M Hessian — that's 10¹⁶ numbers. Instead, modern optimizers like Adam keep running estimates of the diagonal of the Hessian only." },

        { type: "h2", text: "15. Gradient Descent: All Variants Explained" },
        { type: "p", text: "Now that we have a full understanding of gradients, let's look at ALL the variants of Gradient Descent and understand the exact tradeoffs:" },
        {
            type: "table", headers: ["Variant", "Gradient computed on", "Speed per step", "Noise", "Memory"], rows: [
                ["Batch Gradient Descent", "All n training samples", "Slow (reads entire dataset)", "Very stable, smooth path", "High (all data in memory)"],
                ["Stochastic GD (SGD)", "1 random sample at a time", "Very fast", "Very noisy (zigzags)", "Low (one sample)"],
                ["Mini-Batch GD (default)", "b samples (batch_size=32-512)", "Fast", "Moderate — best tradeoff", "Moderate (one batch)"],
                ["Momentum SGD", "Mini-batch + momentum term", "Fast", "Lower noise, overshoots less", "Low (stores velocity)"],
                ["Adam", "Mini-batch + momentum + adaptive LR", "Fast", "Very low effective noise", "Moderate (stores m and v)"],
            ]
        },
        {
            type: "code", lang: "text", code: `The Momentum Update Rule (intuition = a ball gaining speed rolling downhill):
  v ← β·v + (1-β)·∇L(w)          (velocity = friction × old velocity + new slope)
  w ← w - α·v                     (take step in velocity direction)

  β = 0.9 is standard (retain 90% of old velocity per step)

The Adam Update Rule (Adaptive Moment Estimation):
  m ← β₁·m + (1-β₁)·g            (1st moment = running mean of gradient)
  v ← β₂·v + (1-β₂)·g²           (2nd moment = running mean of gradient²)
  m̂ = m / (1-β₁ᵗ)                (bias-corrected 1st moment)
  v̂ = v / (1-β₂ᵗ)                (bias-corrected 2nd moment)
  w ← w - α · m̂ / (√v̂ + ε)      (update weights!)

  Default values: α=0.001, β₁=0.9, β₂=0.999, ε=1e-8
  
  m̂ = estimates the gradient direction (average slope)
  √v̂ = estimates how much this weight usually changes (curvature approximation)
  Dividing by √v̂ shrinks the step for weights with large, erratic gradients,
  and enlarges it for weights with small, consistent gradients.`
        },

    ]
} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
