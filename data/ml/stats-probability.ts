import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Statistics & Probability",
subtitle: "Everything you need to understand data mathematically — explained simply with real-world examples before diving into ML.",
accent: "#38bdf8",
blocks: [

                // ── DATA FUNDAMENTALS
                { type: "h2", text: "What Is Data?" },
                { type: "p", text: "Data is just a collection of facts or observations. When you write down the height of every person in a room, that's data. When a hospital records every patient's temperature every hour, that's data. Data lets us understand the world as it is right now AND make predictions about what will happen next." },
                { type: "p", text: "In machine learning, data is the fuel. Without data, no learning happens. So before we can talk about algorithms, we need to understand what data looks like and how to describe it." },

                { type: "h3", text: "Types of Data" },
                { type: "p", text: "Not all data is the same. The type of data you have determines which tools you can use on it." },
                {
                    type: "table", headers: ["Type", "Sub-type", "Example", "Can you do math on it?"], rows: [
                        ["Qualitative (Categorical)", "Nominal (no order)", "Color: Red, Blue, Green | City: Cairo, Alex", "No — just count"],
                        ["Qualitative (Categorical)", "Ordinal (has order)", "Size: Small < Medium < Large | Rating: 1-5 stars", "Sort, but not add"],
                        ["Quantitative (Numerical)", "Discrete (whole numbers)", "Number of children: 0, 1, 2, 3 | Goals scored: 2", "Yes — fully"],
                        ["Quantitative (Numerical)", "Continuous (any value)", "Height: 174.3 cm | Temperature: 36.7°C", "Yes — fully"],
                    ]
                },
                {
                    type: "callout", variant: "tip", text: "Quick mental test: 'Can I have 2.5 of this?' If yes → continuous. 'Can I sort these in a meaningful way?' If yes → ordinal or numeric. 'Are they just labels with no order?' → nominal."
                },

                { type: "h3", text: "Population vs Sample" },
                { type: "p", text: "Imagine you want to know the average height of ALL Egyptians. You can't measure every single person — there are 100 million of them. Instead, you measure 1,000 people randomly chosen. Those 1,000 are your sample. All 100 million are the population." },
                {
                    type: "code", lang: "text", code: `Population: EVERYONE you care about
             (all Egyptian adults, all products sold, all past transactions)

Sample:      A small representative SUBSET you can actually measure
             (1,000 people, 500 products, 10,000 transactions)

Why does this matter?
  - We collect statistics from the SAMPLE
  - We make conclusions about the POPULATION
  - The quality of the sample determines how trustworthy our conclusions are

Good sample: randomly chosen, representative of the population
Bad sample: only asking people at a gym about average exercise habits`
                },

                { type: "divider" },

                // ── DESCRIPTIVE STATISTICS
                { type: "h2", text: "Descriptive Statistics — Summarizing Data" },
                { type: "p", text: "Descriptive statistics gives you tools to summarize a dataset with a few numbers. Instead of looking at 10,000 rows, you can say 'the average salary is 8,500 EGP, the spread is about 2,000 EGP, and half the employees earn less than 8,000.' That's descriptive statistics at work." },

                { type: "h3", text: "A. Measures of Central Tendency — Where Is the Middle?" },
                { type: "p", text: "Central tendency tells you what a 'typical' value looks like in your dataset." },

                { type: "h3", text: "The Mean (Average)" },
                { type: "p", text: "Add up all values and divide by how many there are. The most common summary statistic in the world." },
                {
                    type: "code", lang: "text", code: `Salaries: [5000, 6000, 7000, 8000, 9000, 10000, 50000]  ← one CEO

  Sample Mean (x̄ = x-bar):
    x̄ = (5000 + 6000 + 7000 + 8000 + 9000 + 10000 + 50000) / 7
    x̄ = 95000 / 7
    x̄ = 13,571 EGP

  Is this representative? NO! The 50,000 CEO drags the mean way up.
  Most employees earn 5,000–10,000 but the mean says 13,571.

  Formula:
    Sample mean:     x̄ = (Σ xᵢ) / n       (using your data = sample)
    Population mean: μ  = (Σ xᵢ) / N       (using everyone = population)

  x̄ (x-bar) = sample mean
  μ (mu)    = population mean (Greek letter, used for the true unknown value)`
                },

                { type: "h3", text: "The Median — The Real Middle" },
                { type: "p", text: "The median is the value that divides the dataset exactly in half when sorted. 50% of values are below it, 50% are above it. Outliers don't affect it — this makes it much more reliable than the mean when your data has extreme values." },
                {
                    type: "code", lang: "text", code: `Same salaries: [5000, 6000, 7000, 8000, 9000, 10000, 50000]
                             ↑ sorted already

  How to find the median:
    Sort the data (it already is)
    n = 7 (odd number of values)
    Middle position = (7+1)/2 = 4th value
    Median = 8,000 EGP

  Median = 8,000  vs  Mean = 13,571
  → Median is MUCH more representative of what most people earn!

  What if n is even?
    Sorted data: [5000, 6000, 7000, 8000] (4 values)
    Two middle values: 6000 and 7000
    Median = (6000 + 7000) / 2 = 6,500

  Rule of thumb:
    Use MEAN when data has no extreme outliers (symmetric distribution)
    Use MEDIAN when data has outliers or is skewed (income, house prices)`
                },

                { type: "h3", text: "The Mode — Most Popular Value" },
                { type: "p", text: "The mode is simply the value that appears most often. It's mainly useful for categorical data." },
                {
                    type: "code", lang: "text", code: `Shoe sizes sold today: [40, 41, 41, 42, 42, 42, 43, 43, 44]
  Mode = 42  (appears 3 times — most frequent)

  City of birth: [Cairo, Cairo, Alex, Cairo, Giza, Alex, Cairo]
  Mode = Cairo  (appears 4 times)

  A dataset can have:
    No mode  → all values appear once
    One mode → unimodal
    Two modes → bimodal (two peaks in the distribution)
    Three+ modes → multimodal`
                },

                { type: "h3", text: "B. Measures of Dispersion — How Spread Out Is It?" },
                { type: "p", text: "Two datasets can have the same mean but be completely different in how they are distributed. Class A: all students score 70. Class B: half score 40, half score 100. Mean = 70 in both cases, but the experience is totally different. Dispersion measures capture this spread." },

                { type: "h3", text: "Range" },
                {
                    type: "code", lang: "text", code: `Range = Maximum value − Minimum value

  Temperatures this week: [18, 22, 25, 30, 32, 28, 19]
  Range = 32 − 18 = 14°C

  Problem: Range only looks at 2 values (max and min).
  One extreme outlier completely changes the range.
  It tells us nothing about what's happening in the middle.`
                },

                { type: "h3", text: "Variance — The Average Squared Distance from the Mean" },
                { type: "p", text: "Variance measures how far each data point is from the mean, on average. We square the distances so that positive and negative differences don't cancel out, and so larger deviations get penalized more heavily." },
                {
                    type: "code", lang: "text", code: `Step-by-step Variance calculation:

  Data: exam scores = [70, 75, 80, 85, 90]
  Mean (x̄) = (70+75+80+85+90) / 5 = 400/5 = 80

  Step 1: Find each score's distance from mean:
    70 - 80 = -10
    75 - 80 = -5
    80 - 80 =  0
    85 - 80 = +5
    90 - 80 = +10

  Step 2: Square each distance (makes all positive):
    (-10)² = 100
    (-5)²  =  25
    (0)²   =   0
    (+5)²  =  25
    (+10)² = 100

  Step 3: Average the squared distances:
    Population variance: σ² = (100+25+0+25+100) / 5 = 250/5 = 50
    Sample variance:     s² = (100+25+0+25+100) / (5-1) = 250/4 = 62.5

  Why divide by (n-1) for sample variance?
    This is called Bessel's Correction. When we use a SAMPLE, dividing by n
    underestimates the true population variance. Dividing by (n-1) corrects this.
    Think of it as: we "used up" one degree of freedom by calculating the mean.

  Formula:
    Population: σ² = Σ(xᵢ − μ)² / N
    Sample:     s² = Σ(xᵢ − x̄)² / (n−1)`
                },

                { type: "h3", text: "Standard Deviation — Back to Original Units" },
                { type: "p", text: "Variance is in squared units (°C², kg², etc.) which is hard to interpret. Standard deviation is just the square root of variance, bringing it back to the same units as the data." },
                {
                    type: "code", lang: "text", code: `Continuing the exam scores example:
  Sample variance s² = 62.5
  Sample standard deviation s = √62.5 ≈ 7.9 points

  Interpretation: "On average, exam scores are about 7.9 points away from the mean"
  Mean = 80 points, SD = 7.9 points → typical range: [72, 88]

  Formula:
    Population: σ = √(Σ(xᵢ − μ)² / N)
    Sample:     s = √(Σ(xᵢ − x̄)² / (n−1))

  The 68-95-99.7 Rule (for Normal distributions):
    68%  of data falls within ±1σ of the mean
    95%  of data falls within ±2σ of the mean
    99.7% of data falls within ±3σ of the mean`
                },

                { type: "h3", text: "C. Measures of Variability — Quartiles, IQR, and Box Plots" },
                { type: "p", text: "Quartiles divide your sorted data into four equal parts. They describe the shape of the distribution, identify where data concentrates, and help spot outliers." },
                {
                    type: "code", lang: "text", code: `Sorted data: [12, 15, 18, 20, 22, 25, 28, 30, 35, 40]
              (10 data points)

  Q1 (First Quartile, 25th percentile):
    → Median of the LOWER half: [12, 15, 18, 20, 22]
    → Q1 = 18

  Q2 (Second Quartile = Median, 50th percentile):
    → Middle of all data
    → Q2 = (22 + 25) / 2 = 23.5

  Q3 (Third Quartile, 75th percentile):
    → Median of the UPPER half: [25, 28, 30, 35, 40]
    → Q3 = 30

  IQR (Interquartile Range):
    IQR = Q3 − Q1 = 30 − 18 = 12
    → The middle 50% of data is spread across 12 units

  Outlier detection using fences:
    Lower fence = Q1 − 1.5 × IQR = 18 − 1.5×12 = 18 − 18 = 0
    Upper fence = Q3 + 1.5 × IQR = 30 + 1.5×12 = 30 + 18 = 48

    Any value < 0 or > 48 → outlier
    All our data [12..40] is within [0, 48] → no outliers here

  Box Plot shape:
    Min─────[Q1────────Q2────────Q3]─────Max
         (whisker)  (box)         (whisker)`
                },
                { type: "callout", variant: "info", text: "The IQR is the foundation of outlier detection in ML preprocessing. When you need a robust measure of spread that isn't affected by outliers, use IQR. When data is clean and symmetric, use standard deviation." },

                { type: "divider" },

                // ── INFERENTIAL STATISTICS
                { type: "h2", text: "Inferential Statistics — Making Predictions" },
                { type: "p", text: "Descriptive statistics describes what's in your sample. Inferential statistics lets you make conclusions about the population based on your sample. It's what makes ML possible — we train on a sample and hope it generalizes to the whole world." },

                { type: "h3", text: "Data Relationships — Covariance and Correlation" },

                { type: "h3", text: "Covariance — Do Two Variables Move Together?" },
                { type: "p", text: "Covariance measures whether two variables tend to increase together (positive) or do the opposite of each other (negative), or are unrelated (near zero)." },
                {
                    type: "code", lang: "text", code: `Example: study hours vs exam score

  Person | Hours (x) | Score (y) | x − x̄ | y − ȳ | (x−x̄)(y−ȳ)
  -------|-----------|-----------|-------|-------|------------
  Ali    |    2      |   55      |  -2   |  -20  |    +40
  Mona   |    3      |   65      |  -1   |  -10  |    +10
  Omar   |    4      |   75      |   0   |    0  |      0
  Sara   |    5      |   85      |  +1   |  +10  |    +10
  Ahmed  |    6      |   95      |  +2   |  +20  |    +40

  x̄ = 4 hours,  ȳ = 75 score

  Cov(x, y) = Σ(xᵢ − x̄)(yᵢ − ȳ) / N
             = (40 + 10 + 0 + 10 + 40) / 5
             = 100 / 5
             = 20   ← positive! More hours → higher score (makes sense)

  Interpretation:
    Cov > 0: both increase together (study → score, temp → ice cream sales)
    Cov < 0: one increases, other decreases (rain → mood, price → demand)
    Cov ≈ 0: no linear relationship

  Problem: covariance value depends on the SCALE of the variables.
  Cov(study_hours, score) = 20 (hours × points)
  What does 20 mean? Hard to interpret or compare!`
                },

                { type: "h3", text: "Pearson Correlation — Standardized Covariance" },
                { type: "p", text: "Pearson correlation (r) fixes the scale problem. It divides covariance by the product of the two standard deviations, giving a value always between -1 and +1 that's easy to interpret." },
                {
                    type: "code", lang: "text", code: `Pearson Correlation:

  r = Cov(x, y) / (σₓ × σᵧ)

  From our example:
    Cov(x, y) = 20
    σₓ = 1.414 hours (std of hours)
    σᵧ = 14.14 points (std of scores)
    
    r = 20 / (1.414 × 14.14) = 20 / 20 = 1.0  ← perfect positive correlation!

  Interpreting r:
    r = +1.0:   Perfect positive linear relationship
    r = +0.8:   Strong positive correlation
    r = +0.5:   Moderate positive correlation
    r = 0:      No linear correlation (might still have nonlinear relationship!)
    r = -0.5:   Moderate negative correlation
    r = -0.8:   Strong negative correlation
    r = -1.0:   Perfect negative linear relationship

  ⚠️ IMPORTANT: Correlation ≠ Causation!
    Ice cream sales and drowning deaths are positively correlated.
    (Both peak in summer!)
    Correlation just says "these move together."
    It does NOT say "one causes the other."`
                },

                { type: "divider" },

                // ── PROBABILITY
                { type: "h2", text: "Probability — How Likely Is Something?" },
                { type: "p", text: "Probability is how we put a number on uncertainty. Instead of guessing 'I think it might rain', we say 'there's a 70% chance of rain.' This mathematical framework is the foundation of ALL of machine learning — every model is ultimately making probabilistic predictions." },

                { type: "h3", text: "The Basic Definition" },
                {
                    type: "code", lang: "text", code: `Probability of event A:

  P(A) = (Number of ways A can happen) / (Total number of possible outcomes)

  Example 1: Rolling a fair die
    P(getting a 3) = 1/6 ≈ 0.167  (only one face shows 3, out of 6 faces)
    P(getting even) = 3/6 = 0.5   (faces 2,4,6 → 3 out of 6)

  Example 2: Drawing a card from a deck of 52
    P(heart) = 13/52 = 0.25   (13 hearts out of 52 cards)
    P(Ace)   = 4/52  ≈ 0.077  (4 aces in the deck)

  Rules:
    P(A) always between 0 and 1:   0 ≤ P(A) ≤ 1
    P(impossible event) = 0        (P(rolling a 7 on a 6-sided die) = 0)
    P(certain event)    = 1        (P(rolling something 1-6)        = 1)
    Sum of all outcomes = 1        (P(1) + P(2) + P(3) + P(4) + P(5) + P(6) = 1)`
                },

                { type: "h3", text: "Permutations vs Combinations" },
                { type: "p", text: "When counting possibilities, order sometimes matters and sometimes doesn't." },
                {
                    type: "code", lang: "text", code: `PERMUTATIONS — order matters (abc ≠ bca ≠ cab)

  "How many ways can 3 runners (from 10) finish 1st, 2nd, 3rd?"
  → Order matters! (Ali 1st, Omar 2nd is DIFFERENT from Omar 1st, Ali 2nd)

  P(n, r) = n! / (n−r)!
  P(10, 3) = 10! / (10−3)! = 10! / 7! = 10 × 9 × 8 = 720 ways

  n! (n factorial) = n × (n−1) × (n−2) × ... × 2 × 1
  5! = 5 × 4 × 3 × 2 × 1 = 120

COMBINATIONS — order does NOT matter (abc = bca = cab)

  "How many ways can we choose 3 people (from 10) for a committee?"
  → Order doesn't matter! A committee of {Ali, Omar, Sara} is the same
    regardless of the order we list them.

  C(n, r) = n! / (r! × (n−r)!)  = [n choose r]
  C(10, 3) = 10! / (3! × 7!) = 720 / 6 = 120 ways

  Notice: C(10,3) = 120,  P(10,3) = 720
  P / C = 3! = 6  → we're dividing out the orderings we don't care about`
                },

                { type: "h3", text: "Probability Operations" },
                {
                    type: "code", lang: "text", code: `UNION — P(A or B) — probability that A OR B (or both) happen:
  P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
  (subtract the overlap, otherwise we count it twice)

  Example: Student passes Math P(M)=0.7, passes Physics P(P)=0.6,
           passes both P(M∩P)=0.5
  P(passes at least one) = 0.7 + 0.6 − 0.5 = 0.8

INTERSECTION — P(A and B):
  P(A ∩ B) = P(A) × P(B|A)    ← if dependent (one affects the other)
  P(A ∩ B) = P(A) × P(B)      ← if independent (one doesn't affect other)

  Example independent: flipping two coins
  P(Head on 1st AND Head on 2nd) = 0.5 × 0.5 = 0.25

COMPLEMENT — P(NOT A):
  P(Ā) = 1 − P(A)
  
  "What's P(it doesn't rain)?"
  If P(rain) = 0.3, then P(no rain) = 1 − 0.3 = 0.7`
                },

                { type: "h3", text: "Conditional Probability — Given That Something Already Happened" },
                { type: "p", text: "Conditional probability P(A|B) means: 'What's the probability of A, given that we KNOW B already happened?' This is one of the most used concepts in ML — updating probabilities based on new evidence." },
                {
                    type: "code", lang: "text", code: `P(A | B) = P(A ∩ B) / P(B)

  Read as: "Probability of A given B"

  Example: In a class of 100 students:
    60 are male, 40 are female
    15 males play football, 5 females play football

  P(plays football | male) = P(football ∩ male) / P(male)
                            = (15/100) / (60/100)
                            = 0.15 / 0.60
                            = 0.25

  Interpretation: Given that a student is male, there's a 25% chance 
  they play football. This is very different from unconditional 
  P(football) = 20/100 = 0.20.

  Dependence vs Independence:
    A and B are INDEPENDENT if: P(A|B) = P(A)
    → Knowing B happened doesn't change P(A)
    → Example: coin 1 landing heads doesn't affect coin 2`
                },

                { type: "h3", text: "Bayes' Theorem — The Most Important Formula in ML" },
                { type: "p", text: "Bayes' theorem is the mathematical backbone of Naive Bayes classifiers, probabilistic models, and the philosophical foundation of how we should update our beliefs when we get new evidence." },
                {
                    type: "code", lang: "text", code: `Bayes' Theorem:

  P(A | B) = P(B | A) × P(A) / P(B)

  Naming convention (for ML):
    P(A)     = Prior       — our INITIAL belief about A (before seeing B)
    P(B | A) = Likelihood  — how likely is B if A were true?
    P(B)     = Evidence    — total probability of observing B
    P(A | B) = Posterior   — our UPDATED belief about A after seeing B

  ──────────────────────────────────────────────────
  Famous example: Medical test for a rare disease

  Setup:
    Disease prevalence (prior):  P(Disease) = 0.001  (1 in 1000 people)
    Test sensitivity (TPR):      P(+test | Disease) = 0.99  (99% catches disease)
    Test false positive rate:    P(+test | No Disease) = 0.05  (5% false alarm)

  You test POSITIVE. What's the probability you actually have the disease?

  P(Disease | +test) = P(+test | Disease) × P(Disease) / P(+test)

  P(+test) = P(+test|Disease) × P(Disease)  +  P(+test|No Disease) × P(No Disease)
            = 0.99 × 0.001                  +  0.05 × 0.999
            = 0.00099 + 0.04995 = 0.05094

  P(Disease | +test) = (0.99 × 0.001) / 0.05094
                     = 0.00099 / 0.05094
                     ≈ 0.019  ← only 1.9%!

  SHOCKING: Even with a positive test, you only have a 1.9% chance of having
  the disease! This is because the disease is so rare.

  This is why Bayes is crucial: it properly accounts for base rates (priors).`
                },

                { type: "divider" },

                // ── PROBABILITY DISTRIBUTIONS
                { type: "h2", text: "Random Variables and Probability Distributions" },
                { type: "p", text: "A random variable is a variable whose value depends on a random experiment. When you roll a die, X = the number you get is a random variable. Probability distributions describe all possible values of a random variable and how likely each one is." },

                { type: "h3", text: "Discrete Distributions" },

                { type: "h3", text: "Bernoulli Distribution — One Coin Flip" },
                { type: "p", text: "The simplest distribution: one experiment with two possible outcomes — success (1) or failure (0). The probability of success is p." },
                {
                    type: "code", lang: "text", code: `Bernoulli Distribution:

  P(X = 1) = p        (success, e.g., heads, pass, fraud)
  P(X = 0) = 1 − p   (failure, e.g., tails, fail, not fraud)

  Mean (expected value): E(X) = μ = p
  Variance:              σ² = p(1−p)
  Standard deviation:    σ = √(p(1−p))

  Example: Biased coin with P(heads) = 0.6
    E(X) = 0.6         (on average, 60% heads)
    σ²   = 0.6 × 0.4 = 0.24
    σ    = √0.24 ≈ 0.49

  ML connection: Binary classification targets (spam/not-spam,
  fraud/not-fraud, churn/stay) follow a Bernoulli distribution.`
                },

                { type: "h3", text: "Binomial Distribution — Many Coin Flips" },
                { type: "p", text: "Extends Bernoulli to n independent trials. X = total number of successes in n trials." },
                {
                    type: "code", lang: "text", code: `Binomial Distribution:

  P(X = k) = C(n,k) × pᵏ × (1−p)^(n−k)

  where:
    n = number of trials
    k = number of successes we want
    p = probability of success per trial
    C(n,k) = "n choose k" (combinations)

  Example: Roll a fair die 10 times. What's P(getting exactly 3 sixes)?
    n=10, k=3, p=1/6

    P(X=3) = C(10,3) × (1/6)³ × (5/6)⁷
            = 120 × 0.00463 × 0.2791
            = 120 × 0.001293
            ≈ 0.155  ← about 15.5% chance

  Mean:     E(X) = μ = n × p = 10 × (1/6) ≈ 1.67 sixes
  Variance: σ² = n × p × (1−p) = 10 × (1/6) × (5/6) ≈ 1.39`
                },

                { type: "h3", text: "Continuous Distributions" },

                { type: "h3", text: "Normal Distribution — The Bell Curve" },
                { type: "p", text: "The most important distribution in all of statistics and ML. Nature loves the normal distribution: heights, weights, errors, IQ scores, test scores all tend to be normally distributed. It has a beautiful symmetric bell shape." },
                {
                    type: "code", lang: "text", code: `Normal Distribution — the Bell Curve:

  X ~ N(μ, σ²)   read as: "X follows a Normal distribution with mean μ and variance σ²"

  Properties:
    ● Perfectly symmetric around its mean μ
    ● Mean = Median = Mode (all equal!)
    ● Bell-shaped curve
    ● Fully defined by just 2 numbers: μ (center) and σ (spread)
    ● The tails never quite touch zero (extends to ±∞)

  The 68-95-99.7 Rule:
    μ ± 1σ : contains 68.3%  of the data
    μ ± 2σ : contains 95.4%  of the data
    μ ± 3σ : contains 99.7%  of the data

  Example: Heights of adult Egyptian men
    μ = 170 cm,  σ = 8 cm
    68% of men are between 162 and 178 cm  (170 ± 8)
    95% of men are between 154 and 186 cm  (170 ± 16)
    99.7% between 146 and 194 cm           (170 ± 24)
    A man 210 cm (170 + 5×8) tall would be EXTREMELY rare!`
                },

                { type: "h3", text: "The Standard Normal Distribution (Z-distribution)" },
                { type: "p", text: "The standard normal distribution is a special normal with μ=0 and σ=1. We can convert ANY normal distribution into the standard one using standardization (Z-score)." },
                {
                    type: "code", lang: "text", code: `Standardization — converting to Z-scores:

  Z = (x − μ) / σ

  This tells you: "How many standard deviations is x away from the mean?"

  Example: A man is 186 cm tall. μ=170, σ=8
    Z = (186 − 170) / 8 = 16/8 = 2.0

    Meaning: He is 2 standard deviations ABOVE average.
    From the 95% rule: only 2.5% of men are taller than him.

  Z-scores in ML:
    StandardScaler does exactly this to every feature!
    It subtracts the mean and divides by std deviation.
    This is called feature standardization / Z-score normalization.

  Why? Without it, a feature with large scale (income: 0–100,000)
  dominates over small-scale features (age: 0–100) in distance calculations.
  After Z-scoring, both features are on the same scale (roughly −3 to +3).`
                },

                { type: "h3", text: "The Central Limit Theorem (CLT) — Why Statistics Works" },
                { type: "p", text: "The Central Limit Theorem is arguably the most important theorem in statistics. It explains why we can use normal-distribution-based tools even when our data isn't normally distributed." },
                {
                    type: "code", lang: "text", code: `Central Limit Theorem (CLT):

  Statement: If you take many random samples of size n from ANY distribution,
             the distribution of the SAMPLE MEANS will be approximately Normal,
             as long as n is large enough (usually n ≥ 30).

  More precisely, the sampling distribution of x̄ is:
    x̄ ~ N(μ, σ²/n)

  where μ and σ are the population mean and std deviation.

  Example: Imagine a very skewed distribution (household income in a city)
    Population: mean μ=300,000 EGP/year,  std σ=200,000 (very skewed)
    
    Take 1000 random samples, each of size n=50
    Compute x̄ for each sample
    → Those 1000 x̄ values will form a NORMAL DISTRIBUTION!
       mean ≈ 300,000,  std ≈ 200,000/√50 ≈ 28,284

  Why it matters for ML:
    - It justifies using statistical tests that assume normality
    - It explains why averaging predictions (ensemble methods) works
    - It's why gradient descent with mini-batches works
    - It's the foundation of confidence intervals and hypothesis testing`
                },

                { type: "h3", text: "Expected Value — The Long-Run Average" },
                {
                    type: "code", lang: "text", code: `Expected Value E(X): the theoretical average if you repeated the experiment
                      infinitely many times.

  Discrete:    E(X) = Σ xᵢ × P(X = xᵢ)
  Continuous:  E(X) = ∫ x × f(x) dx

  Example: Fair die
    Values: 1, 2, 3, 4, 5, 6   each with probability 1/6
    E(X) = 1×(1/6) + 2×(1/6) + 3×(1/6) + 4×(1/6) + 5×(1/6) + 6×(1/6)
          = (1+2+3+4+5+6)/6 = 21/6 = 3.5

    You'll never roll a 3.5, but if you roll the die 1,000,000 times,
    the average of all results will be very close to 3.5.

  Properties:
    E(aX+b) = aE(X) + b         (linear transformation)
    E(X+Y)  = E(X) + E(Y)       (always true)
    E(X×Y)  = E(X)×E(Y)         (only if X and Y are independent!)
    
  Variance from expected value:
    Var(X) = E[(X − E(X))²] = E(X²) − [E(X)]²`
                },

                { type: "divider" },

                { type: "h2", text: "Putting It All Together — How These Connect to ML" },
                {
                    type: "table", headers: ["ML Concept", "Statistics/Probability Foundation"], rows: [
                        ["Feature scaling (StandardScaler)", "Z-score normalization: Z = (x−μ)/σ"],
                        ["Outlier detection (IQR, Z-score)", "Descriptive statistics: quartiles, std deviation"],
                        ["Naive Bayes classifier", "Bayes' theorem + conditional probability"],
                        ["Model evaluation (any metric)", "Counting correct/incorrect predictions — basic probability"],
                        ["Class imbalance (e.g., fraud 1%)", "Bayes: rare events have low prior probability"],
                        ["K-Means clustering", "Mean calculation, variance minimization"],
                        ["Linear/Logistic Regression", "MSE = variance of errors, MLE = maximizing likelihood"],
                        ["Cross-validation", "Central Limit Theorem — sample means estimate population mean"],
                        ["Random Forests", "Ensemble → averaging reduces variance (CLT)"],
                        ["Confidence intervals, p-values", "Normal distribution, sampling distribution"],
                    ]
                },
                { type: "callout", variant: "important", text: "You don't need to memorize every formula. The key insight is: statistics gives us a principled way to describe uncertainty in data, and probability gives us a language to make predictions under that uncertainty. ML is just applying these ideas at scale, automatically." },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
