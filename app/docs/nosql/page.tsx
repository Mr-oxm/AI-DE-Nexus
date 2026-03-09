"use client";
import { DocSection } from "../DocSection";

export default function NoSQLDocPage() {
    return (
        <DocSection
            title="NoSQL Databases"
            subtitle="When relational tables aren't the right fit — types of NoSQL, trade-offs, and how data engineers use them in real pipelines."
            accent="#10b981"
            blocks={[
                { type: "h2", text: "Why NoSQL Exists" },
                { type: "p", text: "Relational databases are nearly 50 years old — invented at IBM by Edgar Codd in 1970 when the hardest data engineering problems were keeping employee records and tracking accounting ledgers. The relational model (tables, rows, foreign keys, JOINs) was brilliantly designed for that era's problems." },
                { type: "p", text: "Fast forward to 2004: Google is storing the entire web's crawl data. The web is not a table. A webpage has links, metadata, content, versions, outbound links, inbound links, update history — a deeply nested, variable-length, interconnected graph of information. Trying to fit this into relational tables required dozens of JOINs, massive schema migrations for every new feature, and couldn't scale horizontally across thousands of machines." },
                { type: "p", text: "Google, Amazon, Facebook, and LinkedIn independently published papers describing new database architectures designed for these web-scale problems: Bigtable (Google), Dynamo (Amazon), Cassandra (Facebook), Voldemort (LinkedIn). The NoSQL movement emerged from these papers going open-source. Each solved a specific problem that relational databases couldn't handle at scale." },
                { type: "p", text: "Relational databases excel at structured data with well-defined, consistent schemas. But modern applications generate data that doesn't fit neatly into fixed rows and columns — a social profile with 2 or 200 interests, a product catalog with wildly different attributes per category, sensor streams at millions of events/second. NoSQL databases were purpose-built for these patterns." },
                { type: "callout", variant: "info", text: "NoSQL means 'Not Only SQL' — not 'no SQL syntax'. Many NoSQL databases support SQL-like queries. The key differences: flexible schema, horizontal scale, and relaxed consistency guarantees (in exchange for availability and speed)." },

                { type: "h2", text: "ACID vs BASE — Two Different Philosophies" },
                { type: "p", text: "Traditional SQL databases implement ACID properties: Atomicity (a transaction fully succeeds or fully fails — no partial states), Consistency (every transaction leaves the database in a valid state), Isolation (concurrent transactions don't interfere with each other), Durability (committed data survives system failures). ACID is why your bank account never shows a partial transfer — the debit and credit either both happen or neither does." },
                { type: "p", text: "Many NoSQL databases implement BASE instead: Basically Available (the system responds even during partial failures), Soft state (data may be changing as replicas sync), Eventually Consistent (given enough time without new writes, all replicas converge to the same value). BASE trades the strong guarantees of ACID for higher availability and better performance at massive scale." },
                { type: "p", text: "A practical example of eventual consistency: you like a tweet. Twitter's servers accept your like immediately (available). Your like count might be '47,813' on one server and '47,812' on another server for a fraction of a second. Within milliseconds, both sync. For a like count, this is completely acceptable — nobody is harmed. For a bank balance during a transfer, it would be catastrophic. This is why the choice of database type must match the use case." },

                { type: "h2", text: "SQL vs NoSQL — Core Trade-offs" },
                {
                    type: "comparison",
                    left: {
                        label: "SQL (Relational)", items: [
                            "Fixed schema — all rows have the same columns",
                            "ACID transactions (fully consistent writes)",
                            "Join multiple tables to reconstruct relationships",
                            "Vertical scaling (more powerful machine)",
                            "Schema changes require careful migrations",
                            "Best for: OLTP, finance, structured analytics",
                        ]
                    },
                    right: {
                        label: "NoSQL", items: [
                            "Flexible schema — each document can differ",
                            "BASE: eventually consistent, prioritizes availability",
                            "Denormalized — duplicate data to avoid joins",
                            "Horizontal scaling (add more machines)",
                            "Schema changes are application-level only",
                            "Best for: variable-shape data, high write throughput",
                        ]
                    }
                },

                { type: "h2", text: "CAP Theorem — The Foundation of NoSQL Design" },
                { type: "p", text: "Every distributed database must choose two of three guarantees: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (system survives a network split). Since partitions are inevitable in distributed systems, databases choose between CP or AP." },
                {
                    type: "code", lang: "text", code: `CP (Consistency + Partition Tolerance):
  HBase, ZooKeeper, MongoDB (with majority reads)
  → May reject requests during a partition to stay consistent
  → Use when: financial data, inventory systems

AP (Availability + Partition Tolerance):
  Cassandra, DynamoDB, CouchDB
  → Always responds, but may return stale data during a partition
  → Use when: social feeds, event logging, carts, user activity

CA (Consistency + Availability — no partition tolerance):
  Traditional RDBMS (PostgreSQL, MySQL on single node)
  → Perfect on one machine, but not distributed` },

                { type: "h2", text: "Horizontal vs Vertical Scaling — Why It Matters" },
                { type: "p", text: "Vertical scaling means upgrading to a bigger server: more RAM, faster CPU, bigger disk. There's a hard limit — the biggest server you can buy. And it's expensive to go from 32GB to 256GB RAM in a single machine. SQL databases were designed for this model — they work best on one powerful server." },
                { type: "p", text: "Horizontal scaling means adding more servers and distributing data across them. Instead of one 256GB machine, use 8 servers with 32GB each. NoSQL databases are designed for this — data is partitioned (sharded) across machines by a partition key. Adding capacity means spinning up more machines, not buying more expensive ones. For internet-scale companies (millions of users, billions of events), horizontal scaling is the only economic option." },

                { type: "h2", text: "The 4 NoSQL Types" },
                {
                    type: "table", headers: ["Type", "Data Model", "Key Strength", "Products", "DE Use Case"], rows: [
                        ["Document", "JSON/BSON documents with flexible fields", "Variable-shape data, nested structures", "MongoDB, Firestore", "API response ingestion, user profiles, content metadata"],
                        ["Key-Value", "Simple key → value dictionary", "Fastest lookup by key, in-memory", "Redis, DynamoDB", "Caching, sessions, feature flags, rate limiting"],
                        ["Wide-Column", "Rows with dynamic columns, partitioned", "Massive write throughput, time-series", "Cassandra, HBase", "IoT streams, clickstream, event logs at scale"],
                        ["Graph", "Nodes (entities) + Edges (relationships)", "Multi-hop relationship traversal", "Neo4j, Amazon Neptune", "Fraud rings, recommendation graphs"],
                    ]
                },

                { type: "h2", text: "Document Databases — MongoDB" },
                { type: "p", text: "The 'document' in document database is just a JSON object — nothing more exotic than that. A document is a self-contained unit of data that can have any structure. There's no enforced schema that says 'every document in this collection must have these exact fields'. Some documents can have 5 fields, others 50, and the database stores them all happily." },
                { type: "p", text: "MongoDB is the most popular document database. It was designed for the web era, where every application stores JSON objects from its API. Instead of parsing JSON and inserting into relational tables (with normalization, joins, migrations), MongoDB stores the JSON directly. Your application object maps 1:1 to your database document — no impedance mismatch." },
                { type: "p", text: "The trade-off: without a fixed schema, data integrity becomes the application's responsibility. MongoDB won't reject a document that's missing a 'required' field — your code has to validate that. As a data engineer, this is why MongoDB documents you receive from application teams often have messy, inconsistent structures that require careful parsing and validation before loading into a warehouse." },
                { type: "p", text: "MongoDB stores data as BSON documents — each document is self-contained and can have completely different fields from its neighbors. This is ideal for variable-schema data like API responses, product catalogs, or user profiles." },
                {
                    type: "code", lang: "text", code: `Collection: 'products'

Document 1 (laptop):                  Document 2 (t-shirt) — same collection, different shape:
{                                      {
  "_id": ObjectId("abc123"),             "_id": ObjectId("def456"),
  "name": "MacBook Pro 14",             "name": "Classic Tee",
  "brand": "Apple",                     "brand": "Nike",
  "price": 1999.99,                     "price": 29.99,
  "specs": {                            "sizes": ["S", "M", "L", "XL"],
    "ram_gb": 16,                       "colors": ["white", "black"],
    "storage_gb": 512                   "category": "clothing"
  },                                  }
  "tags": ["laptop", "apple"]
}

In SQL: many NULL columns needed to accommodate both.
In MongoDB: each document defines its own shape.` },
                {
                    type: "code", lang: "python", code: `from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
products = client['ecommerce']['products']

# Insert with nested document and array
products.insert_one({
    'name': 'MacBook Pro 14', 'brand': 'Apple', 'price': 1999.99,
    'specs': {'ram_gb': 16, 'storage_gb': 512},
    'tags': ['laptop', 'apple'],
    'created_at': datetime.utcnow()
})

# Query — dollar operators for comparisons
docs = products.find({
    'brand': 'Apple',
    'tags': 'laptop',          # array contains 'laptop'
    'price': {'$lt': 3000}
})

# Aggregation pipeline (equivalent to SQL GROUP BY)
result = list(products.aggregate([
    {'$match': {'price': {'$gt': 100}}},
    {'$group': {
        '_id': '$brand',
        'avg_price': {'$avg': '$price'},
        'count': {'$sum': 1}
    }},
    {'$sort': {'avg_price': -1}}
]))

# Indexes are REQUIRED for performance on large collections
products.create_index([('brand', 1), ('price', 1)])
products.create_index([('tags', 1)])   # index array field` },

                { type: "h3", text: "Embedding vs Referencing" },
                {
                    type: "code", lang: "text", code: `EMBEDDING — put related data inside the document:
{
  "order_id": "ORD-001",
  "customer": {"name": "Ali", "country": "Egypt"},  ← embedded
  "items": [{"product": "MacBook", "qty": 1, "price": 1999}]
}
PROS: Single read = all data. No join needed.
CONS: Duplicates customer across all orders. Update = update everywhere.
USE WHEN: Related data is small, stable, always read together.

REFERENCING — store an ID, look up separately:
{
  "order_id": "ORD-001",
  "customer_id": ObjectId("abc123")   ← reference
}
PROS: Customer stored once. Consistent across all orders.
CONS: Two database round-trips.
USE WHEN: Related data changes often, many:many relationships.` },

                { type: "h2", text: "Key-Value Databases — Redis" },
                { type: "p", text: "A key-value store is conceptually the simplest database: a giant dictionary. You store something under a key, you retrieve it by that key. Set('user:1001', 'Ali') then Get('user:1001') returns 'Ali'. The power comes from: (1) all data in RAM — reads are sub-millisecond, (2) automatic expiry (TTL) — set data to self-delete after N seconds, perfect for sessions and caches, (3) atomic operations — increment a counter from 100 different clients simultaneously without race conditions." },
                { type: "p", text: "Redis is the dominant key-value database. 'Redis' stands for Remote Dictionary Server. It's primarily used as a cache or session store alongside a primary database. The pattern: check Redis first (fast), if the data isn't there (cache miss), query the real database (slow), store the result in Redis with a TTL so subsequent requests are fast. This pattern can reduce database load by 90% for read-heavy workloads." },
                { type: "p", text: "Redis stores data entirely in RAM — making it the fastest database for simple lookups (sub-millisecond). It supports rich types: strings, lists, sets, sorted sets, hashes, and streams. Redis is most commonly used as a caching layer alongside a primary SQL or NoSQL database." },
                {
                    type: "code", lang: "python", code: `import redis, json
from datetime import timedelta

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# ─── Basic string + TTL ───
r.set('session:usr001', json.dumps({'user': 'Ali', 'role': 'admin'}), ex=3600)
session = json.loads(r.get('session:usr001'))

# ─── Hash (mini-dictionary per key) ───
r.hset('user:1001', mapping={'name': 'Ali', 'country': 'Egypt', 'logins': 42})
r.hincrby('user:1001', 'logins', 1)     # atomic increment
user = r.hgetall('user:1001')

# ─── Caching pattern ───
def get_top_products(category: str):
    cache_key = f"top:{category}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)         # cache hit — ~0.2ms

    results = db.execute("SELECT ... FROM products WHERE category=%s", [category])
    r.setex(cache_key, 600, json.dumps(results))  # cache 10 min
    return results

# ─── Sorted set — leaderboard ───
r.zadd('revenue:2025-03', {'Egypt': 45200, 'USA': 120500, 'UK': 38000})
top3 = r.zrevrange('revenue:2025-03', 0, 2, withscores=True)

# ─── Rate limiting ───
def is_rate_limited(user_id: str, limit=100, window=60):
    import time
    key = f"rate:{user_id}:{int(time.time() // window)}"
    count = r.incr(key)
    if count == 1: r.expire(key, window)
    return count > limit` },

                { type: "h2", text: "Wide-Column — Apache Cassandra" },
                { type: "p", text: "Cassandra was created at Facebook to handle their inbox search — billions of messages, each belonging to a conversation, needing millisecond lookup by user. The relational model required complex JOINs across massive tables, which were far too slow. Cassandra's design: store all messages for a given conversation physically together on the same server, sorted by time. That single design decision makes 'get messages for conversation X' a single fast disk read." },
                { type: "p", text: "The term 'wide-column' refers to the fact that Cassandra tables can have a very large number of columns (thousands), and different rows can have different columns active. More importantly, data is organized by a partition key that determines physical co-location. All rows with the same partition key live on the same node, sorted by the clustering key. This physical organization is what makes Cassandra fast for its target queries." },
                { type: "p", text: "The most important thing to understand about Cassandra: you design the table around the query, not the data. This is opposite to relational design. If you have two queries ('get all readings for device X' and 'get all devices with temperature above Y'), you create two Cassandra tables — one optimized for each query. Trying to answer both queries from one table leads to full table scans which are catastrophically slow." },
                { type: "p", text: "Cassandra is built for massive write throughput and horizontal scale. Unlike SQL, you design the table schema around your query patterns — not around normalization principles. Cassandra has no JOINs; data is denormalized by design." },
                {
                    type: "code", lang: "text", code: `Cassandra Table: IoT sensor readings

CREATE TABLE sensor_readings (
    device_id   UUID,        ← Partition Key (all rows for one device live on same node)
    timestamp   TIMESTAMP,   ← Clustering Key (sorted order within partition)
    temperature DECIMAL,
    humidity    DECIMAL,
    PRIMARY KEY (device_id, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

FAST query (uses partition key):
  SELECT * FROM sensor_readings WHERE device_id = ? LIMIT 100;
  → single partition read, milliseconds

SLOW query (avoid!):
  SELECT * FROM sensor_readings WHERE temperature > 50;
  → full table scan across all nodes = NEVER do this on production

Rule: In Cassandra, you create one table per query pattern.` },
                {
                    type: "code", lang: "python", code: `from cassandra.cluster import Cluster

session = Cluster(['cassandra-node-1']).connect('iot')

# Prepared statement for high-throughput writes
insert_stmt = session.prepare("""
    INSERT INTO sensor_readings (device_id, timestamp, temperature, humidity)
    VALUES (?, ?, ?, ?)
    USING TTL 2592000   -- auto-delete after 30 days
""")

# Async writes for maximum throughput
futures = [
    session.execute_async(insert_stmt, [r['device_id'], r['ts'], r['temp'], r['humidity']])
    for r in batch_of_readings
]
for f in futures: f.result()   # wait for all` },

                { type: "h2", text: "Amazon DynamoDB — Managed NoSQL on AWS" },
                { type: "p", text: "DynamoDB is AWS's serverless key-value and document database. Define a partition key (and optional sort key), and DynamoDB handles scaling, replication, and backups automatically. It's the default choice for NoSQL in AWS-native applications." },
                {
                    type: "code", lang: "python", code: `import boto3
from boto3.dynamodb.conditions import Key

table = boto3.resource('dynamodb').Table('UserSessions')

# Put item
table.put_item(Item={
    'user_id':    'USR-001',         # Partition key
    'session_id': 'SESS-ABC',        # Sort key
    'created_at': '2025-03-08T10:00:00Z',
    'data': {'page': '/home', 'duration_sec': 120}
})

# Get — fastest (direct key lookup)
item = table.get_item(Key={'user_id': 'USR-001', 'session_id': 'SESS-ABC'})['Item']

# Query — all sessions for a user (partition = fast)
sessions = table.query(
    KeyConditionExpression=Key('user_id').eq('USR-001'),
    ScanIndexForward=False,  # newest first
    Limit=10
)['Items']

# DynamoDB Streams → Lambda trigger for real-time pipelines
# Every INSERT/UPDATE/DELETE → event in stream → process change` },

                { type: "h2", text: "NoSQL in Data Pipelines" },
                { type: "p", text: "As a DE, you'll commonly extract from NoSQL sources. Key patterns:" },
                {
                    type: "code", lang: "python", code: `# ─── MongoDB → Parquet (incremental pull by updated_at) ───
from pymongo import MongoClient
from datetime import datetime, timedelta
import pandas as pd

collection = MongoClient('mongodb://host:27017/')['db']['orders']
since = datetime.utcnow() - timedelta(days=1)

docs = list(collection.find({'updated_at': {'$gte': since}}, {'_id': 0}))

# Flatten nested documents
rows = []
for doc in docs:
    for item in doc.get('items', []):
        rows.append({
            'order_id':        doc.get('order_id'),
            'customer_name':   doc.get('customer', {}).get('name'),
            'customer_country':doc.get('customer', {}).get('country'),
            'product_id':      item.get('product_id'),
            'qty':             item.get('qty'),
            'unit_price':      item.get('price'),
            'created_at':      doc.get('created_at'),
        })

pd.DataFrame(rows).to_parquet('s3://bucket/silver/orders.parquet', index=False)

# ─── DynamoDB → S3 via Streams (event-driven) ───
# DynamoDB Streams → Kinesis Firehose → S3 (all handled by AWS, no code needed)
# OR: DynamoDB Streams → Lambda → transform → write to S3` },

                { type: "h2", text: "Decision Guide" },
                {
                    type: "table", headers: ["Scenario", "Best Choice", "Why"], rows: [
                        ["Financial transactions, billing", "PostgreSQL / MySQL", "ACID required — partial failures are catastrophic"],
                        ["User profiles with variable attributes", "MongoDB", "Schema-less documents handle different fields per user"],
                        ["Session cache, auth tokens", "Redis", "In-memory speed, built-in TTL expiry"],
                        ["IoT sensor data — millions writes/sec", "Cassandra", "Write-optimized, horizontal scale, TTL for retention"],
                        ["Social graph, fraud network traversal", "Neo4j / Neptune", "Multi-hop traversal 1000x faster than SQL joins"],
                        ["AWS app, needs managed NoSQL", "DynamoDB", "Serverless, pay-per-request, deep AWS ecosystem integration"],
                        ["Full-text search", "Elasticsearch / OpenSearch", "Inverted index purpose-built for search queries"],
                    ]
                },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["When would you NOT use SQL?", "When the schema changes frequently or varies per record (use document DB). When millions of writes/sec are needed with simple lookups (wide-column). When the core query is deep relationship traversal (graph). When sub-millisecond in-memory speed is required (Redis)."],
                        ["What is eventual consistency?", "After a write, it takes some milliseconds for the update to propagate to all replicas. During that window, different nodes may return different values. Eventually all nodes converge. Most NoSQL systems offer tunable consistency — you trade higher latency for stronger guarantees."],
                        ["Good vs bad Cassandra partition key?", "Good: (device_id) for IoT — all device reads on one node, evenly distributed across devices. Bad: Just timestamp — all recent writes go to one node (hotspot). Bad: A low-cardinality column like 'status' — three partition values for a trillion rows means three giant partitions."],
                        ["How do you extract from MongoDB incrementally?", "Add an indexed updated_at field to every collection. Each pipeline run queries WHERE updated_at > last_watermark. Flatten nested documents and explode arrays into separate rows. Store the max(updated_at) from each run as the watermark for the next run. Hard deletes are invisible — use a soft-delete is_deleted flag instead."],
                    ]
                },
            ]}
        />
    );
}
