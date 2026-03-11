import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Linear Algebra for ML",
subtitle: "The language of machine learning — understanding vectors, matrices, and transformations from the ground up.",
accent: "#c084fc",
blocks: [

                { type: "h2", text: "Why Does ML Need Linear Algebra?" },
                { type: "p", text: "Every dataset is a matrix (rows = samples, columns = features). Every model transformation is matrix multiplication. Neural network layers are matrix operations. PCA uses eigendecomposition. Even the simple act of making a prediction is a dot product. Linear algebra is not optional — it IS machine learning's math language." },
                { type: "p", text: "The good news: you don't need to be a mathematician. You need intuition. This guide explains every concept from first principles as if you've never seen algebra before." },

                // ── SCALARS
                { type: "h2", text: "Scalars — Just a Single Number" },
                { type: "p", text: "A scalar is the simplest object in linear algebra: a single number. No arrows, no tables, just one value." },
                {
                    type: "code", lang: "text", code: `Scalars are just regular numbers:

  a = 5           (integer)
  π = 3.14159     (real number)
  λ = 0.001       (Greek letter — often used for learning rates)

  Scalar operations:
    Addition:       5 + 3 = 8
    Multiplication: 4 × 2.5 = 10
    Division:       15 / 3 = 5

  In ML, scalars appear as:
    - A single prediction: ŷ = 0.87 (probability of spam)
    - The learning rate: α = 0.01
    - A loss value: L = 0.342
    - A regularization strength: λ = 0.001`
                },

                // ── VECTORS
                { type: "h2", text: "Vectors — A List of Numbers with Direction" },
                { type: "p", text: "A vector is an ordered list of numbers. Think of it as an arrow in space. In 2D space, a vector [3, 4] points 3 units to the right and 4 units up. Each number in the vector is called a component or element." },
                {
                    type: "code", lang: "text", code: `Column vector (the default in ML):
  
       [3 ]
  x =  [4 ]     ← 2D vector, lives in 2D space
  
       [25  ]
  x =  [50000]  ← data for one person: age=25, income=50000
       [1    ]

  Row vector (transpose):
  xᵀ = [25, 50000, 1]

  Notation:
    Bold lowercase: x, y, w  (vectors)
    Regular uppercase: N, K  (scalars)
    The ᵀ superscript means TRANSPOSE (flip row→column or column→row)

  A vector with n elements is called an n-dimensional vector
  and lives in n-dimensional space (ℝⁿ).

  In ML:
    One training example → one feature vector x ∈ ℝᵖ  (p = number of features)
    Model weights        → weight vector w ∈ ℝᵖ
    Predictions          → output vector ŷ ∈ ℝⁿ  (n = number of samples)`
                },

                { type: "h3", text: "Vector Operations" },
                {
                    type: "code", lang: "text", code: `ADDITION — add element by element (vectors must be the SAME size):

  a = [1]    b = [4]         a + b = [1+4]   = [5]
      [2]        [5]                 [2+5]     [7]
      [3]        [6]                 [3+6]     [9]

  Geometric meaning: put arrows tip-to-tail → the result is the total displacement.

SCALAR MULTIPLICATION — multiply every element by a scalar:

  3 × [2]   = [3×2]  = [6]
      [4]     [3×4]    [12]
      [-1]    [3×(-1)] [-3]

  Geometric meaning: scales the length of the arrow (3× longer).

DOT PRODUCT (a·b or aᵀb) — most important vector operation in ML!

  a · b = a₁b₁ + a₂b₂ + a₃b₃ + ...  (multiply pairs, then sum)

  Example:
    a = [2]    b = [3]
        [4]        [-1]
        [1]        [5]

    a · b = (2×3) + (4×(-1)) + (1×5)
           = 6 + (-4) + 5
           = 7    ← a scalar!

  GEOMETRIC MEANING of dot product:
    a · b = ||a|| × ||b|| × cos(θ)
    where θ = angle between the two vectors, ||·|| = length of vector

    a · b > 0:  vectors point in similar direction (θ < 90°)
    a · b = 0:  vectors are PERPENDICULAR (θ = 90°) — called orthogonal
    a · b < 0:  vectors point in opposite directions (θ > 90°)

  ML example: prediction = dot product of weights and features!
    z = w · x = w₁x₁ + w₂x₂ + ... + wₚxₚ  (linear model's core computation)`
                },

                { type: "h3", text: "Vector Length (Norm)" },
                {
                    type: "code", lang: "text", code: `The length (magnitude) of a vector x is called its norm.

L2 Norm (Euclidean length) — the most common:
  ||x||₂ = √(x₁² + x₂² + ... + xₙ²)

  Example: x = [3, 4]
    ||x||₂ = √(3² + 4²) = √(9 + 16) = √25 = 5
    (This is just the Pythagorean theorem — the length of the hypotenuse!)

L1 Norm (Manhattan length):
  ||x||₁ = |x₁| + |x₂| + ... + |xₙ|

  Example: x = [3, -4]
    ||x||₁ = |3| + |-4| = 3 + 4 = 7

ML connections:
  L2 norm     → Ridge regularization (λ||w||₂²)
  L1 norm     → Lasso regularization (λ||w||₁)
  Euclidean distance between vectors = ||a − b||₂  (used in KNN, K-Means)`
                },

                { type: "divider" },

                // ── MATRICES
                { type: "h2", text: "Matrices — Tables of Numbers" },
                { type: "p", text: "A matrix is a 2D array of numbers organized in rows and columns. If a vector is a 1D list of numbers, a matrix is a 2D grid. Matrices are how we represent entire datasets at once." },
                {
                    type: "code", lang: "text", code: `A matrix A with m rows and n columns is an m×n matrix:

        Age  Income  Education
  Ali [  25   50000     16   ]   ← row 1 (one person's data)
  A = [  30   70000     18   ]   ← row 2
      [  45  120000     16   ]   ← row 3
      [  28   60000     14   ]   ← row 4

  Shape of A: 4×3 (4 rows, 3 features)

  In ML:
    X ∈ ℝ^(n×p)  — design matrix (n samples, p features) — THE core object
    W ∈ ℝ^(p×k)  — weight matrix (p inputs, k outputs) — what models learn
    
  Indexing:
    Aᵢⱼ = element in row i, column j  (1-indexed in math)
    A₂₃ = row 2, col 3 → 18 (education of second person)

  In Python/NumPy:
    A[1, 2]  # row index 1, col index 2 (0-indexed) → 18`
                },

                { type: "h3", text: "Matrix Operations" },
                {
                    type: "code", lang: "text", code: `MATRIX ADDITION — element by element, must be SAME SHAPE:

  A = [1  2]    B = [5  6]    A + B = [1+5  2+6] = [6   8]
      [3  4]        [7  8]             [3+7  4+8]   [10  12]

SCALAR MULTIPLICATION — multiply every element:

  3 × [1  2] = [3   6]
      [3  4]   [9  12]

MATRIX-VECTOR MULTIPLICATION — the core ML operation!

  Multiplying an m×n matrix A by an n×1 vector x gives an m×1 vector:
  Ax = result

  A = [2  3]    x = [1]
      [1  4]        [2]
      [0  5]

  Row 1: (2×1) + (3×2) = 2 + 6 = 8
  Row 2: (1×1) + (4×2) = 1 + 8 = 9
  Row 3: (0×1) + (5×2) = 0 + 10 = 10

  Ax = [8 ]
       [9 ]
       [10]

  ML meaning: ŷ = Xw  — compute predictions for ALL samples at once!
    X is (n×p), w is (p×1), result ŷ is (n×1)  — all n predictions together`
                },

                { type: "h3", text: "Matrix Multiplication — Combining Transformations" },
                { type: "p", text: "Matrix-matrix multiplication (A × B) combines two transformations. The result contains dot products of every row from A with every column from B. The key size rule: for (m×n) × (n×k) = (m×k) — the inner dimensions MUST match." },
                {
                    type: "code", lang: "text", code: `Matrix Multiplication: (m×n) × (n×k) = (m×k)
                         ↑inner dims must match

  A = [1  2]    B = [5  6]     A is 2×2, B is 2×2, result is 2×2
      [3  4]        [7  8]

  C = A × B:
    C₁₁ = row 1 of A · col 1 of B = [1,2]·[5,7] = 1×5 + 2×7 = 5+14 = 19
    C₁₂ = row 1 of A · col 2 of B = [1,2]·[6,8] = 1×6 + 2×8 = 6+16 = 22
    C₂₁ = row 2 of A · col 1 of B = [3,4]·[5,7] = 3×5 + 4×7 = 15+28 = 43
    C₂₂ = row 2 of A · col 2 of B = [3,4]·[6,8] = 3×6 + 4×8 = 18+32 = 50

    C = [19  22]
        [43  50]

  CRITICAL RULES:
    AB ≠ BA  (matrix multiplication is NOT commutative!)
    Dimension check: (2×3) × (3×4) = (2×4)  ✓
                     (2×3) × (4×3) = ERROR   ✗  (3 ≠ 4)

  In Python:  C = A @ B   or   C = np.matmul(A, B)
  In ML:      output = weight_matrix @ input_vector   (every layer in neural net!)`
                },

                { type: "h3", text: "Transpose — Flipping Rows and Columns" },
                {
                    type: "code", lang: "text", code: `Transpose (Aᵀ): swap rows and columns
  If A is (m×n), then Aᵀ is (n×m)
  Element: (Aᵀ)ᵢⱼ = Aⱼᵢ

  Example:
       [1  2  3]              [1  4]
  A =  [4  5  6]    Aᵀ =     [2  5]
                              [3  6]

  A is 2×3, Aᵀ is 3×2.

  Rules:
    (Aᵀ)ᵀ = A             (transposing twice returns original)
    (A+B)ᵀ = Aᵀ + Bᵀ      (transpose distributes over addition)
    (AB)ᵀ = BᵀAᵀ           (order REVERSES for products)

  Symmetric matrix: A = Aᵀ  (the matrix equals its own transpose)
    Example: covariance matrix Σ is always symmetric

  In ML: the dot product xᵀy is used EVERYWHERE
    If x and y are column vectors → xᵀ is a row vector → xᵀy is a scalar`
                },

                // ── IDENTITY AND INVERSE
                { type: "h2", text: "Special Matrices" },

                { type: "h3", text: "Identity Matrix — The 'Number 1' of Matrices" },
                {
                    type: "code", lang: "text", code: `The Identity Matrix I has 1s on the diagonal and 0s everywhere else.

  I₂ = [1  0]    I₃ = [1  0  0]
       [0  1]         [0  1  0]
                       [0  0  1]

  Property:  A × I = I × A = A  (multiplying by I doesn't change anything)
  (Just like multiplying any number by 1 gives that number back)

  In Python:   np.eye(3)   creates a 3×3 identity matrix`
                },

                { type: "h3", text: "Matrix Inverse — The 'Dividing' Operation" },
                { type: "p", text: "For a scalar, the inverse of 5 is 1/5. Multiplying 5 × (1/5) = 1. For a matrix, the inverse A⁻¹ is the matrix such that A × A⁻¹ = I (the identity). Not all matrices have inverses." },
                {
                    type: "code", lang: "text", code: `Matrix Inverse A⁻¹:

  If A × A⁻¹ = I, then A⁻¹ is the inverse of A.

  A = [2  1]
      [5  3]

  A⁻¹ = [  3  -1]   (computed by hand is painful — NumPy handles this)
         [ -5   2]

  Verify: A × A⁻¹ = [2×3 + 1×(-5)  2×(-1) + 1×2] = [1  0] = I  ✓
                     [5×3 + 3×(-5)  5×(-1) + 3×2]   [0  1]

  In NumPy:  np.linalg.inv(A)

  Why it matters in ML:
    The OLS solution for linear regression:
      w* = (XᵀX)⁻¹ Xᵀy   ← matrix inverse is right there!
    
    When can't you invert?
      • Matrix is not square (m ≠ n)
      • Rows/columns are linearly dependent (singular/degenerate matrix)
      • Features are perfectly correlated → XᵀX is not invertible!
        → This is exactly why correlated features cause problems in linear models`
                },

                { type: "h3", text: "Determinant — Is This Matrix Invertible?" },
                {
                    type: "code", lang: "text", code: `The determinant is a scalar that tells us if a matrix is invertible.

  For a 2×2 matrix [a  b]:
                   [c  d]

  det(A) = ad − bc

  Example:
    A = [2  1]    det(A) = 2×3 − 1×5 = 6 − 5 = 1  → invertible! ✓
        [5  3]

    B = [2  4]    det(B) = 2×6 − 4×3 = 12 − 12 = 0  → NOT invertible! ✗
        [3  6]

  Geometric meaning of determinant:
    |det(A)| = the factor by which A stretches/shrinks area (or volume in 3D)
    det = 0: the matrix squashes space to a lower dimension
    det = 1: preserves area/volume
    det < 0: flips orientation (like a mirror)

  In Python: np.linalg.det(A)`
                },

                { type: "divider" },

                // ── LINEAR TRANSFORMATIONS
                { type: "h2", text: "Matrices as Transformations" },
                { type: "p", text: "Here's the deep intuition: a matrix is not just a table of numbers — it's a transformation of space. When you multiply a matrix by a vector, you're moving the vector to a new location. Different matrices perform different geometric transformations." },
                {
                    type: "code", lang: "text", code: `Common Geometric Transformations:

  SCALING (stretch/shrink along axes):
    [s  0]   scales x-axis by s
    [0  t]   scales y-axis by t

    [2  0] × [1] = [2]  ← point (1,1) moved to (2,3)
    [0  3]   [1]   [3]

  ROTATION (by angle θ):
    [cos θ  -sin θ]
    [sin θ   cos θ]

    90° rotation of point (1, 0):
    [0  -1] × [1] = [-0×1 + -1×0] = [0]
    [1   0]   [0]   [1×1  +  0×0]   [1]
    Point (1,0) → (0,1)  ✓ (rotated 90°)

  REFLECTION (mirror across x-axis):
    [1   0]
    [0  -1]

    [1   0] × [3] = [3 ]  ← same x, flipped y
    [0  -1]   [4]   [-4]

  This is exactly what neural network layers do!
  Each layer is a matrix transformation + non-linear activation.
  Deep learning = composing many transformations to gradually
  convert raw images/text into class predictions.`
                },

                { type: "divider" },

                // ── EIGENVALUES
                { type: "h2", text: "Eigenvalues and Eigenvectors — The Axes of a Transformation" },
                { type: "p", text: "This is the most abstract but also one of the most powerful concepts. When a matrix transforms a vector, it usually changes both its direction AND its length. But for special vectors called eigenvectors, the matrix only changes their length — not their direction. These special vectors reveal the 'natural axes' of a transformation." },
                {
                    type: "code", lang: "text", code: `The Eigenvector Definition:

  For matrix A and vector v ≠ 0:
    Av = λv

  This says: "Multiplying A by v is the same as scaling v by λ"
  → The direction of v doesn't change after the transformation!
  → Only the LENGTH changes (scaled by λ)

  λ (lambda) = eigenvalue  — how much the vector is stretched/shrunk
  v           = eigenvector — the special direction that doesn't rotate

  Example intuition:
    Imagine A = [3  0] (scaling matrix: 3x horizontal, 2x vertical)
                [0  2]

    Try vector v₁ = [1]:   A × [1] = [3] = 3 × [1]
                    [0]       [0]   [0]       [0]
    → λ₁ = 3, v₁ = [1, 0]  ← purely scaled by 3, direction unchanged!

    Try vector v₂ = [0]:   A × [0] = [0] = 2 × [0]
                    [1]       [1]   [2]       [1]
    → λ₂ = 2, v₂ = [0, 1]  ← purely scaled by 2, direction unchanged!

    Any other vector? Its direction WOULD change.
    [1] → [3] = different direction (more horizontal now)
    [1]   [2]`
                },

                { type: "h3", text: "How to Find Eigenvalues" },
                {
                    type: "code", lang: "text", code: `Finding eigenvalues mathematically:

  Av = λv
  Av - λv = 0
  (A - λI)v = 0

  For this to have a non-zero solution v, the matrix (A − λI) must be singular:
  det(A − λI) = 0   ← the characteristic equation

  Example: A = [4  1]
               [2  3]

  A − λI = [4-λ   1 ]
            [2    3-λ]

  det(A − λI) = (4-λ)(3-λ) − (1)(2) = 0
              = 12 - 4λ - 3λ + λ² − 2 = 0
              = λ² − 7λ + 10 = 0
              = (λ − 5)(λ − 2) = 0

  λ₁ = 5  and  λ₂ = 2  ← the two eigenvalues

  Interpretation of eigenvalues:
    Large λ:  this direction is AMPLIFIED by the transformation
    Small λ:  this direction is diminished
    λ = 1:    this direction is unchanged
    λ = 0:    this direction is collapsed (the matrix is singular in this direction)
    λ < 0:    this direction is flipped AND scaled

  In Python:  eigenvalues, eigenvectors = np.linalg.eig(A)`
                },

                { type: "h3", text: "Finding Eigenvectors" },
                {
                    type: "code", lang: "text", code: `Once you have eigenvalue λ, find eigenvector v using: (A − λI)v = 0

  Continuing our example: A = [4  1]
                               [2  3]

  For λ₁ = 5:
    (A − 5I)v = 0
    [4-5   1 ] × v = [−1  1] × v = 0
    [2    3-5]        [2  −2]

    Row 1:  −v₁ + v₂ = 0  →  v₁ = v₂
    Any vector with v₁ = v₂ works: v₁ = [1]
                                          [1]

  For λ₂ = 2:
    (A − 2I)v = 0
    [2  1] × v = 0
    [2  1]

    Row 1:  2v₁ + v₂ = 0  →  v₂ = −2v₁
    v₂ = [1]
          [-2]

  Summary:
    Eigenvalue λ₁=5,  Eigenvector v₁=[1,1]  → this direction is STRETCHED by 5x
    Eigenvalue λ₂=2,  Eigenvector v₂=[1,-2] → this direction is stretched by 2x`
                },

                { type: "h3", text: "Why Eigenvalues Matter in ML" },
                {
                    type: "table", headers: ["ML Application", "How Eigenvalues/Eigenvectors Are Used"], rows: [
                        ["PCA (Principal Component Analysis)", "Eigenvectors of the covariance matrix = principal components (directions of max variance). Eigenvalues = amount of variance in each direction."],
                        ["Spectral Clustering", "Eigenvalues of the graph Laplacian reveal the natural clusters in the data"],
                        ["Understanding model stability", "Eigenvalues of the Hessian matrix determine if gradient descent converges"],
                        ["Matrix decomposition (SVD)", "SVD = generalization of eigen-decomposition to non-square matrices. Used everywhere."],
                        ["PageRank (Google's algorithm)", "The web graph's principal eigenvector gives page importance"],
                        ["Deep learning analysis", "Largest eigenvalue of weight matrices determines gradient explosion/vanishing"],
                    ]
                },

                { type: "divider" },

                // ── SVD
                { type: "h2", text: "Singular Value Decomposition (SVD) — The Swiss Army Knife" },
                { type: "p", text: "SVD is one of the most important matrix decompositions. It generalizes eigendecomposition to ANY matrix (even non-square). It decomposes any matrix into three simple matrices representing rotation, scaling, and rotation." },
                {
                    type: "code", lang: "text", code: `SVD: A = U Σ Vᵀ

  where A ∈ ℝ^(m×n):
    U ∈ ℝ^(m×m):   orthogonal matrix (columns = left singular vectors)
    Σ ∈ ℝ^(m×n):   diagonal matrix of singular values σ₁ ≥ σ₂ ≥ ... ≥ 0
    Vᵀ ∈ ℝ^(n×n):  orthogonal matrix (rows = right singular vectors)

  Geometric interpretation:
    Any linear transformation = Rotate → Scale → Rotate

  Relationship to eigenvalues:
    Singular values σᵢ of A = √(eigenvalues of AᵀA)
    Left singular vectors U  = eigenvectors of AAᵀ
    Right singular vectors V = eigenvectors of AᵀA

  ML applications:
    → PCA is essentially SVD on the centered data matrix X
    → Recommender systems (matrix factorization)
    → Text analysis (Latent Semantic Analysis)
    → Solving least-squares problems robustly
    → Dimensionality reduction in general

  In Python: U, s, Vt = np.linalg.svd(A, full_matrices=False)
             # s is array of singular values (not a matrix)`
                },

                { type: "divider" },

                // ── LINEAR SYSTEMS
                { type: "h2", text: "System of Linear Equations" },
                { type: "p", text: "Many ML problems reduce to solving systems of linear equations — finding the weights w that satisfy a set of conditions simultaneously." },
                {
                    type: "code", lang: "text", code: `System of equations:
  2x + 3y = 8
  x − y  = 1

  Matrix form:   Ax = b
  [2   3] [x]   [8]
  [1  -1] [y] = [1]

  Solution:  x = A⁻¹b  (if A is invertible)
    A⁻¹ = [1/5   3/5]   (computed)
           [1/5  -2/5]

    [x]   [1/5   3/5] [8]   [1/5×8 + 3/5×1]   [8/5+3/5]   [11/5]   [2.2]
    [y] = [1/5  -2/5] [1] = [1/5×8 + (-2/5)×1] = [8/5-2/5] = [6/5]  = [1.2]

  In ML, solving Aw = y gives us the optimal linear regression weights!
    (XᵀX)w = Xᵀy  → w = (XᵀX)⁻¹Xᵀy  (Normal Equation)

  Types of solutions:
    Unique solution:    A is invertible, one answer exists  (exactly solvable)
    No solution:        Equations contradict each other     (overdetermined, use least-squares)
    Infinite solutions: Equations are dependent             (underdetermined, add regularization)`
                },

                { type: "divider" },

                // ── PRACTICAL
                { type: "h2", text: "Linear Algebra in NumPy — Practical Reference" },
                {
                    type: "code", lang: "python", code: `import numpy as np

# ── Creating arrays
scalar = 5.0
vector = np.array([1, 2, 3])           # 1D array (vector)
matrix = np.array([[1, 2], [3, 4]])    # 2D array (matrix)

# ── Shapes
print(vector.shape)   # (3,)      — 3D vector
print(matrix.shape)   # (2, 2)    — 2×2 matrix

# ── Basic operations
a, b = np.array([1,2,3]), np.array([4,5,6])
a + b                # element-wise addition  → [5, 7, 9]
3 * a                # scalar multiplication  → [3, 6, 9]
a * b                # element-wise mult      → [4, 10, 18]  (NOT dot product)
np.dot(a, b)         # dot product           → 32  (1×4 + 2×5 + 3×6)
a @ b                # dot product (modern)  → 32

# ── Matrix operations
A = np.array([[1,2],[3,4]])
B = np.array([[5,6],[7,8]])
A + B                  # matrix addition
A @ B                  # matrix multiplication   → [[19,22],[43,50]]
A.T                    # transpose               → [[1,3],[2,4]]
np.linalg.inv(A)       # matrix inverse
np.linalg.det(A)       # determinant             → -2.0
np.linalg.norm(a)      # L2 norm of vector       → √14 ≈ 3.74
np.linalg.norm(a, 1)   # L1 norm                → 6

# ── Eigendecomposition
eigenvalues, eigenvectors = np.linalg.eig(A)
print("Eigenvalues:", eigenvalues)      # [-0.37, 5.37]
print("Eigenvectors:", eigenvectors)    # columns are eigenvectors

# ── SVD
U, s, Vt = np.linalg.svd(A, full_matrices=False)
# Reconstruct: A ≈ U @ np.diag(s) @ Vt    (exact for square matrices)

# ── Identity and special matrices
np.eye(3)              # 3×3 identity matrix
np.zeros((3,4))        # 3×4 matrix of zeros
np.ones((2,5))         # 2×5 matrix of ones`
                },

                { type: "h2", text: "The Complete ML Math Picture" },
                {
                    type: "table", headers: ["ML Concept", "Linear Algebra Operation"], rows: [
                        ["Dataset of n samples with p features", "Matrix X ∈ ℝ^(n×p)"],
                        ["One training example", "Vector x ∈ ℝ^p"],
                        ["Model prediction (linear model)", "ŷ = Xw = matrix-vector product"],
                        ["OLS solution (linear regression)", "w = (XᵀX)⁻¹ Xᵀy — matrix inverse"],
                        ["PCA components", "Eigenvectors of covariance matrix (Xᵀ X)/n"],
                        ["PCA compression", "Z = X Vₖ — matrix multiplication with top-k eigenvectors"],
                        ["Neural network forward pass", "h = ReLU(Wx + b) — matrix multiply + activation"],
                        ["Euclidean distance (KNN, K-Means)", "||a − b||₂ = √((a−b)ᵀ(a−b))"],
                        ["Regularization penalty (Ridge)", "||w||₂² = wᵀw — squared L2 norm"],
                        ["Kernel (SVM)", "K(x,z) = xᵀz — dot product in feature space"],
                        ["Gradient (backpropagation)", "∂L/∂W — matrix of partial derivatives"],
                    ]
                },
                { type: "callout", variant: "important", text: "You don't need to compute eigenvalues by hand in real projects — NumPy and scikit-learn do all the computation. What you DO need is the intuition: matrices are transformations, eigenvectors are preferred directions, and the dot product is how features combine into predictions. With that intuition, all ML algorithms become much clearer." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
