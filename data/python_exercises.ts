export const exercises = [
  // ── DATA TYPES ────────────────────────────────────────
  { id: 1, tag: "TYPES",
    q: "What is the difference between a list, tuple, and set? Create one of each containing [1, 2, 2, 3].",
    a: "my_list  = [1, 2, 2, 3]   # ordered, mutable, allows duplicates\nmy_tuple = (1, 2, 2, 3)   # ordered, immutable, allows duplicates\nmy_set   = {1, 2, 2, 3}   # unordered, mutable, NO duplicates → {1,2,3}\n\n# Sets are great for deduplication!\nprint(my_set)  # {1, 2, 3}"},

  { id: 2, tag: "TYPES",
    q: "Convert the string '42' to int, float, and bool. What does bool('') return?",
    a: "print(int('42'))    # 42\nprint(float('42'))  # 42.0\nprint(bool('42'))   # True  (any non-empty string is truthy)\nprint(bool(''))     # False (empty string is falsy)"},

  { id: 3, tag: "TYPES",
    q: "What is the difference between '==' and 'is'? Give an example where they differ.",
    a: "a = [1, 2, 3]\nb = [1, 2, 3]\n\nprint(a == b)   # True  → same VALUE\nprint(a is b)   # False → different OBJECTS in memory\n\n# 'is' checks identity (same memory address)\n# '==' checks equality (same value)"},

  // ── STRINGS ───────────────────────────────────────────
  { id: 4, tag: "STRINGS",
    q: "Given name='Alice Johnson', extract the first name and last name separately.",
    a: "name = 'Alice Johnson'\n\nfirst, last = name.split()\nprint(first)  # Alice\nprint(last)   # Johnson\n\n# Or\nparts = name.split(' ')\nprint(parts[0], parts[-1])"},

  { id: 5, tag: "STRINGS",
    q: "Given 'order_id: 1042', extract just the number using string methods.",
    a: "s = 'order_id: 1042'\n\nnum = s.split(': ')[1]         # '1042'\nnum = int(num)                 # 1042\n\n# Or with strip\nnum = int(s.replace('order_id: ', ''))\n\n# Or with split and strip\nnum = int(s.split(':')[-1].strip())"},

  { id: 6, tag: "STRINGS",
    q: "Format this into a sentence using an f-string: customer='Alice', revenue=1234.5",
    a: "customer = 'Alice'\nrevenue = 1234.5\n\nmsg = f\"Customer {customer} generated ${revenue:,.2f} in revenue.\"\nprint(msg)\n# Customer Alice generated $1,234.50 in revenue."},

  { id: 7, tag: "STRINGS",
    q: "Check if an email string contains '@gmail.com', and extract the username part.",
    a: "email = 'alice@gmail.com'\n\nprint('@gmail.com' in email)         # True\nusername = email.split('@')[0]        # 'alice'\n\n# Cleaner with .endswith\nprint(email.endswith('@gmail.com'))   # True"},

  // ── LISTS ─────────────────────────────────────────────
  { id: 8, tag: "LISTS",
    q: "Given a list of revenues [200, 450, 1200, 80, 999], get the top 3 using sorting.",
    a: "revenues = [200, 450, 1200, 80, 999]\n\ntop3 = sorted(revenues, reverse=True)[:3]\nprint(top3)  # [1200, 999, 450]"},

  { id: 9, tag: "LISTS",
    q: "Use a list comprehension to get all even numbers from 1 to 20.",
    a: "evens = [x for x in range(1, 21) if x % 2 == 0]\nprint(evens)\n# [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]"},

  { id: 10, tag: "LISTS",
    q: "Flatten this nested list: [[1,2],[3,4],[5,6]]",
    a: "nested = [[1,2],[3,4],[5,6]]\n\n# List comprehension (most common)\nflat = [x for sublist in nested for x in sublist]\n\n# Or with sum\nflat = sum(nested, [])\n\nprint(flat)  # [1, 2, 3, 4, 5, 6]"},

  { id: 11, tag: "LISTS",
    q: "Remove duplicates from a list while preserving order.",
    a: "items = ['a', 'b', 'a', 'c', 'b', 'd']\n\nseen = set()\nresult = []\nfor x in items:\n    if x not in seen:\n        result.append(x)\n        seen.add(x)\n\nprint(result)  # ['a', 'b', 'c', 'd']\n\n# Python 3.7+ shortcut (dict preserves order)\nresult = list(dict.fromkeys(items))"},

  // ── DICTS ─────────────────────────────────────────────
  { id: 12, tag: "DICTS",
    q: "Count the frequency of each word in: 'apple banana apple cherry banana apple'",
    a: "text = 'apple banana apple cherry banana apple'\nwords = text.split()\n\nfreq = {}\nfor w in words:\n    freq[w] = freq.get(w, 0) + 1\n\nprint(freq)\n# {'apple': 3, 'banana': 2, 'cherry': 1}\n\n# Cleaner with Counter\nfrom collections import Counter\nprint(Counter(words))"},

  { id: 13, tag: "DICTS",
    q: "Merge two dicts: {'a':1,'b':2} and {'b':3,'c':4}. The second should overwrite.",
    a: "d1 = {'a': 1, 'b': 2}\nd2 = {'b': 3, 'c': 4}\n\n# Python 3.9+\nmerged = d1 | d2\n\n# Python 3.5+\nmerged = {**d1, **d2}\n\n# Classic\nd1.update(d2)  # modifies d1 in place\n\nprint(merged)  # {'a': 1, 'b': 3, 'c': 4}"},

  { id: 14, tag: "DICTS",
    q: "Given a list of orders, build a dict mapping order_id → revenue using a dict comprehension.",
    a: "orders = [\n    {\"order_id\": 1001, \"revenue\": 499.5},\n    {\"order_id\": 1002, \"revenue\": 89.0},\n    {\"order_id\": 1003, \"revenue\": 1200.0},\n]\n\nid_to_revenue = {o[\"order_id\"]: o[\"revenue\"] for o in orders}\nprint(id_to_revenue)\n# {1001: 499.5, 1002: 89.0, 1003: 1200.0}"},

  { id: 15, tag: "DICTS",
    q: "Sort a dict by its values in descending order.",
    a: "scores = {'Alice': 88, 'Bob': 95, 'Charlie': 72}\n\nsorted_dict = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))\nprint(sorted_dict)\n# {'Bob': 95, 'Alice': 88, 'Charlie': 72}"},

  // ── FUNCTIONS ─────────────────────────────────────────
  { id: 16, tag: "FUNCTIONS",
    q: "Write a function that takes any number of numbers and returns their average.",
    a: "def average(*args):\n    if not args:\n        return 0\n    return sum(args) / len(args)\n\nprint(average(10, 20, 30))   # 20.0\nprint(average(5))            # 5.0\nprint(average())             # 0"},

  { id: 17, tag: "FUNCTIONS",
    q: "Write a function with a default argument: greet(name, greeting='Hello').",
    a: "def greet(name, greeting='Hello'):\n    return f\"{greeting}, {name}!\"\n\nprint(greet('Alice'))            # Hello, Alice!\nprint(greet('Bob', 'Hi'))        # Hi, Bob!\nprint(greet('Eve', greeting='Hey'))  # Hey, Eve!"},

  { id: 18, tag: "FUNCTIONS",
    q: "Write a lambda to compute revenue = qty * price * (1 - discount). Apply it to a list of tuples.",
    a: "calc_revenue = lambda qty, price, discount: qty * price * (1 - discount)\n\norders = [(2, 999.99, 0.1), (1, 249.5, 0.0), (3, 59.99, 0.15)]\nrevenues = [calc_revenue(*o) for o in orders]\n\nprint(revenues)\n# [1799.982, 249.5, 152.9745]"},

  { id: 19, tag: "FUNCTIONS",
    q: "Write a function that returns multiple values: min, max, and mean of a list.",
    a: "def stats(nums):\n    return min(nums), max(nums), sum(nums) / len(nums)\n\nlo, hi, avg = stats([10, 50, 30, 20, 40])\nprint(lo, hi, avg)   # 10 50 30.0"},

  // ── LOOPS ─────────────────────────────────────────────
  { id: 20, tag: "LOOPS",
    q: "Loop over a list of cities and print index + city using enumerate.",
    a: "cities = ['New York', 'London', 'Paris', 'Tokyo']\n\nfor i, city in enumerate(cities, start=1):\n    print(f\"{i}. {city}\")\n# 1. New York\n# 2. London ..."},

  { id: 21, tag: "LOOPS",
    q: "Zip two lists (names and revenues) and print each pair.",
    a: "names    = ['Alice', 'Bob', 'Carlos']\nrevenues = [1200.5, 890.0, 2300.75]\n\nfor name, rev in zip(names, revenues):\n    print(f\"{name}: ${rev:,.2f}\")\n# Alice: $1,200.50\n# Bob: $890.00 ..."},

  { id: 22, tag: "LOOPS",
    q: "Use a while loop to keep halving a number until it's below 1.",
    a: "n = 100\nsteps = 0\n\nwhile n >= 1:\n    n /= 2\n    steps += 1\n\nprint(f\"Took {steps} steps, final value: {n:.4f}\")\n# Took 7 steps, final value: 0.7813"},

  { id: 23, tag: "LOOPS",
    q: "Use break and continue: loop 1-20, skip multiples of 3, stop at 15.",
    a: "for i in range(1, 21):\n    if i == 15:\n        break\n    if i % 3 == 0:\n        continue\n    print(i, end=' ')\n# 1 2 4 5 7 8 10 11 13 14"},

  // ── ERROR HANDLING ────────────────────────────────────
  { id: 24, tag: "ERRORS",
    q: "Write a safe int converter that returns None instead of crashing on bad input.",
    a: "def safe_int(val):\n    try:\n        return int(val)\n    except (ValueError, TypeError):\n        return None\n\nprint(safe_int('42'))     # 42\nprint(safe_int('abc'))    # None\nprint(safe_int(None))     # None"},

  { id: 25, tag: "ERRORS",
    q: "Raise a custom ValueError if a revenue value is negative.",
    a: "def validate_revenue(rev):\n    if rev < 0:\n        raise ValueError(f\"Revenue cannot be negative: {rev}\")\n    return rev\n\ntry:\n    validate_revenue(-500)\nexcept ValueError as e:\n    print(f\"Error: {e}\")\n# Error: Revenue cannot be negative: -500"},

  { id: 26, tag: "ERRORS",
    q: "Use try/except/finally to safely open and read a file.",
    a: "try:\n    with open('data.csv', 'r') as f:\n        content = f.read()\n        print(content[:100])\nexcept FileNotFoundError:\n    print(\"File not found!\")\nexcept PermissionError:\n    print(\"No permission to read file.\")\nfinally:\n    print(\"Done.\")  # always runs"},

  // ── OOP ───────────────────────────────────────────────
  { id: 27, tag: "OOP",
    q: "Create an Order class with attributes: order_id, product, revenue. Add a __repr__.",
    a: "class Order:\n    def __init__(self, order_id, product, revenue):\n        self.order_id = order_id\n        self.product  = product\n        self.revenue  = revenue\n\n    def __repr__(self):\n        return f\"Order({self.order_id}, {self.product}, ${self.revenue:.2f})\"\n\no = Order(1001, 'Laptop', 1799.98)\nprint(o)  # Order(1001, Laptop, $1799.98)"},

  { id: 28, tag: "OOP",
    q: "Add a method apply_discount(pct) to the Order class that updates revenue.",
    a: "class Order:\n    def __init__(self, order_id, product, revenue):\n        self.order_id = order_id\n        self.product  = product\n        self.revenue  = revenue\n\n    def apply_discount(self, pct):\n        self.revenue = self.revenue * (1 - pct)\n        return self\n\no = Order(1001, 'Laptop', 1000.0)\no.apply_discount(0.1)\nprint(o.revenue)  # 900.0"},

  { id: 29, tag: "OOP",
    q: "Create a subclass PriorityOrder that adds a 'priority' attribute and overrides __repr__.",
    a: "class Order:\n    def __init__(self, order_id, revenue):\n        self.order_id = order_id\n        self.revenue  = revenue\n\nclass PriorityOrder(Order):\n    def __init__(self, order_id, revenue, priority='high'):\n        super().__init__(order_id, revenue)\n        self.priority = priority\n\n    def __repr__(self):\n        return f\"PriorityOrder({self.order_id}, ${self.revenue:.2f}, priority={self.priority})\"\n\npo = PriorityOrder(2001, 5000.0)\nprint(po)  # PriorityOrder(2001, $5000.00, priority=high)"},

  // ── COMPREHENSIONS ────────────────────────────────────
  { id: 30, tag: "COMPREHENSIONS",
    q: "Dict comprehension: square each number 1–10 → {1:1, 2:4, 3:9 ...}",
    a: "squares = {n: n**2 for n in range(1, 11)}\nprint(squares)\n# {1:1, 2:4, 3:9, 4:16, 5:25, 6:36, 7:49, 8:64, 9:81, 10:100}"},

  { id: 31, tag: "COMPREHENSIONS",
    q: "Set comprehension: get unique domains from a list of emails.",
    a: "emails = ['alice@gmail.com', 'bob@yahoo.com', 'carol@gmail.com', 'dave@outlook.com']\n\ndomains = {e.split('@')[1] for e in emails}\nprint(domains)  # {'gmail.com', 'yahoo.com', 'outlook.com'}"},

  { id: 32, tag: "COMPREHENSIONS",
    q: "Generator expression: lazily compute squares of 1 to 1,000,000 and get the sum.",
    a: "# Generator — doesn't build the whole list in memory\ntotal = sum(x**2 for x in range(1, 1_000_001))\nprint(total)\n\n# vs list comprehension which builds full list first (uses more memory)\n# total = sum([x**2 for x in range(1, 1_000_001)])"},

  // ── ITERTOOLS / BUILTINS ──────────────────────────────
  { id: 33, tag: "BUILTINS",
    q: "Use map() and filter() to: double all numbers, then keep only those > 10.",
    a: "nums = [1, 3, 5, 7, 9]\n\ndoubled  = list(map(lambda x: x * 2, nums))         # [2,6,10,14,18]\nfiltered = list(filter(lambda x: x > 10, doubled))   # [14, 18]\n\nprint(filtered)  # [14, 18]\n\n# Modern Pythonic alternative:\nresult = [x*2 for x in nums if x*2 > 10]"},

  { id: 34, tag: "BUILTINS",
    q: "Use sorted() with a custom key to sort a list of dicts by 'revenue' descending.",
    a: "orders = [\n    {\"id\": 1, \"revenue\": 450},\n    {\"id\": 2, \"revenue\": 1200},\n    {\"id\": 3, \"revenue\": 80},\n]\n\nsorted_orders = sorted(orders, key=lambda x: x[\"revenue\"], reverse=True)\nfor o in sorted_orders:\n    print(o)"},

  { id: 35, tag: "BUILTINS",
    q: "Use any() and all() to check a list of revenues.",
    a: "revenues = [200, 0, 500, 1200, -50]\n\nprint(any(r < 0 for r in revenues))    # True  → at least one negative\nprint(all(r > 0 for r in revenues))    # False → not all positive\nprint(any(r > 1000 for r in revenues)) # True  → at least one > 1000"},

  // ── FILE I/O ──────────────────────────────────────────
  { id: 36, tag: "FILE I/O",
    q: "Write a list of strings to a .txt file, one per line.",
    a: "lines = ['order_id,revenue', '1001,499.5', '1002,89.0']\n\nwith open('output.txt', 'w') as f:\n    f.write('\\\\n'.join(lines))\n\n# Or line by line\nwith open('output.txt', 'w') as f:\n    for line in lines:\n        f.write(line + '\\\\n')"},

  { id: 37, tag: "FILE I/O",
    q: "Read a CSV manually (without pandas) and print each row as a dict.",
    a: "import csv\n\nwith open('pandas_practice.csv', 'r') as f:\n    reader = csv.DictReader(f)\n    for i, row in enumerate(reader):\n        print(dict(row))\n        if i == 2: break  # just first 3 rows"},

  { id: 38, tag: "FILE I/O",
    q: "Write and read a JSON file containing a list of orders.",
    a: "import json\n\norders = [{\"id\": 1001, \"revenue\": 499.5}, {\"id\": 1002, \"revenue\": 89.0}]\n\n# Write\nwith open('orders.json', 'w') as f:\n    json.dump(orders, f, indent=2)\n\n# Read\nwith open('orders.json', 'r') as f:\n    loaded = json.load(f)\n\nprint(loaded)"},

  // ── DECORATORS ────────────────────────────────────────
  { id: 39, tag: "DECORATORS",
    q: "Write a simple timer decorator that prints how long a function takes.",
    a: "import time\n\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        end = time.time()\n        print(f\"{func.__name__} took {end - start:.4f}s\")\n        return result\n    return wrapper\n\n@timer\ndef slow_sum(n):\n    return sum(range(n))\n\nslow_sum(1_000_000)"},

  { id: 40, tag: "DECORATORS",
    q: "Write a decorator that retries a function up to 3 times on exception.",
    a: "def retry(max_attempts=3):\n    def decorator(func):\n        def wrapper(*args, **kwargs):\n            for attempt in range(1, max_attempts + 1):\n                try:\n                    return func(*args, **kwargs)\n                except Exception as e:\n                    print(f\"Attempt {attempt} failed: {e}\")\n            raise RuntimeError(\"All attempts failed\")\n        return wrapper\n    return decorator\n\n@retry(max_attempts=3)\ndef flaky():\n    import random\n    if random.random() < 0.7:\n        raise ValueError(\"Random failure\")\n    return \"success\""},

  // ── GENERATORS ────────────────────────────────────────
  { id: 41, tag: "GENERATORS",
    q: "Write a generator that yields batches of N items from a list.",
    a: "def batch(lst, n):\n    for i in range(0, len(lst), n):\n        yield lst[i:i+n]\n\ndata = list(range(1, 21))\nfor chunk in batch(data, 5):\n    print(chunk)\n# [1,2,3,4,5]\n# [6,7,8,9,10] ..."},

  { id: 42, tag: "GENERATORS",
    q: "Write a generator function that yields Fibonacci numbers indefinitely.",
    a: "def fibonacci():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\ngen = fibonacci()\nfirst10 = [next(gen) for _ in range(10)]\nprint(first10)\n# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]"},

  // ── COLLECTIONS ───────────────────────────────────────
  { id: 43, tag: "COLLECTIONS",
    q: "Use defaultdict to group orders by status from a list of dicts.",
    a: "from collections import defaultdict\n\norders = [\n    {\"id\": 1, \"status\": \"completed\"},\n    {\"id\": 2, \"status\": \"pending\"},\n    {\"id\": 3, \"status\": \"completed\"},\n    {\"id\": 4, \"status\": \"cancelled\"},\n]\n\ngrouped = defaultdict(list)\nfor o in orders:\n    grouped[o[\"status\"]].append(o[\"id\"])\n\nprint(dict(grouped))\n# {'completed': [1,3], 'pending': [2], 'cancelled': [4]}"},

  { id: 44, tag: "COLLECTIONS",
    q: "Use Counter to find the 3 most common products in a list.",
    a: "from collections import Counter\n\nproducts = ['Laptop','Monitor','Laptop','Keyboard','Laptop','Monitor','Webcam']\n\nc = Counter(products)\nprint(c.most_common(3))\n# [('Laptop', 3), ('Monitor', 2), ('Keyboard', 1)]"},

  { id: 45, tag: "COLLECTIONS",
    q: "Use a deque to implement a sliding window of size 3 over a list of numbers.",
    a: "from collections import deque\n\nnums = [10, 20, 30, 40, 50, 60]\nwindow = deque(maxlen=3)\n\nfor n in nums:\n    window.append(n)\n    if len(window) == 3:\n        print(list(window), '→ avg:', sum(window)/3)\n# [10, 20, 30] → avg: 20.0\n# [20, 30, 40] → avg: 30.0 ..."},

  // ── ALGORITHMS ────────────────────────────────────────
  { id: 46, tag: "ALGORITHMS",
    q: "Write a binary search function on a sorted list.",
    a: "def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1  # not found\n\ndata = [10, 20, 30, 40, 50]\nprint(binary_search(data, 30))   # 2\nprint(binary_search(data, 99))   # -1"},

  { id: 47, tag: "ALGORITHMS",
    q: "Find duplicates in a list using a set — O(n) time.",
    a: "def find_duplicates(lst):\n    seen = set()\n    dupes = set()\n    for x in lst:\n        if x in seen:\n            dupes.add(x)\n        seen.add(x)\n    return dupes\n\nprint(find_duplicates([1, 2, 3, 2, 4, 1, 5]))\n# {1, 2}"},

  { id: 48, tag: "ALGORITHMS",
    q: "Given a list of integers, find all pairs that sum to a target using a set.",
    a: "def two_sum_pairs(nums, target):\n    seen = set()\n    pairs = []\n    for n in nums:\n        complement = target - n\n        if complement in seen:\n            pairs.append((complement, n))\n        seen.add(n)\n    return pairs\n\nprint(two_sum_pairs([2, 7, 4, 1, 11, 3], 9))\n# [(2, 7), (1, 8)... depends on list]"},

  { id: 49, tag: "ALGORITHMS",
    q: "Implement a simple group-by from scratch: group a list of dicts by a key.",
    a: "def group_by(data, key):\n    result = {}\n    for item in data:\n        k = item[key]\n        result.setdefault(k, []).append(item)\n    return result\n\norders = [\n    {\"city\": \"NYC\", \"rev\": 500},\n    {\"city\": \"LA\",  \"rev\": 300},\n    {\"city\": \"NYC\", \"rev\": 800},\n]\n\ngrouped = group_by(orders, \"city\")\nprint(grouped[\"NYC\"])   # [{'city':'NYC','rev':500}, {'city':'NYC','rev':800}]"},

  { id: 50, tag: "ALGORITHMS",
    q: "Write a recursive function to compute factorial(n).",
    a: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))   # 120\nprint(factorial(0))   # 1\n\n# Iterative version (safer for large n)\nimport math\nprint(math.factorial(10))  # 3628800"},
];

export const tagColors = {
  TYPES:          "#00C9A7",
  STRINGS:        "#F9C80E",
  LISTS:          "#FF6B35",
  DICTS:          "#845EC2",
  FUNCTIONS:      "#00B4D8",
  LOOPS:          "#FF6B6B",
  ERRORS:         "#C77DFF",
  OOP:            "#4CC9F0",
  COMPREHENSIONS: "#F77F00",
  BUILTINS:       "#52B788",
  "FILE I/O":     "#FF9CEE",
  DECORATORS:     "#F72585",
  GENERATORS:     "#7209B7",
  COLLECTIONS:    "#3A86FF",
  ALGORITHMS:     "#FB5607",
};