import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Streaming & Kafka",
subtitle: "Real-time data processing — from event stream fundamentals to production Kafka operations and Spark Structured Streaming.",
accent: "#ef4444",
blocks: [
                { type: "h2", text: "Why Real-Time Streaming?" },
                { type: "p", text: "Batch processing is the default — you collect data, process it at midnight, and analysts have results in the morning. That was enough for most businesses, and still is for many use cases. But some problems genuinely require processing data within seconds of it being generated." },
                { type: "p", text: "A fraud detection system can't wait until midnight. If a stolen credit card is being used at 2PM, the alert needs to fire before the next transaction at 2:01PM — not tomorrow morning. A recommendation engine that suggests the next video only after the user has already left is useless. These latency constraints are what push companies to streaming." },
                {
                    type: "table", headers: ["Use Case", "Required Latency", "Why Streaming?"], rows: [
                        ["Payment fraud detection", "< 100ms", "Fraudulent transactions must be blocked before they complete"],
                        ["Live sports dashboards", "< 2 seconds", "Statistics must update in real-time during the game"],
                        ["IoT sensor monitoring", "< 5 seconds", "Machine failure must alert before physical damage"],
                        ["Real-time recommendation", "< 500ms", "Suggest next content while user is still engaged"],
                        ["Log-based alerting", "< 30 seconds", "Application errors must alert engineers immediately"],
                        ["Ad bidding systems", "< 10ms", "Bid must be calculated before the page loads"],
                    ]
                },

                { type: "h2", text: "The Streaming Data Model" },
                { type: "p", text: "In batch processing, data has a clear start and end — you have yesterday's 1M orders and you process all of them. In streaming, data is an infinite, continuous flow — events keep arriving forever with no defined end. This changes how you think about computation." },
                {
                    type: "code", lang: "text", code: `BATCH MODEL:
→ [bounded dataset: 1M records from yesterday] → process all → result
   Start                                         End

STREAMING MODEL:
→ [infinite stream: events arriving every millisecond]
   e1 → e2 → e3 → e4 → e5 → e6 → e7 → e8 → ...
                                              ∞ (never ends)

KEY DIFFERENCES:
1. State: streaming computations build state over time (running totals,
   session tracking). Batch doesn't need to track state across runs.

2. Time: batch processes historical data. Streaming processes time-ordered
   events. Time semantics (event time vs processing time) become critical.

3. Fault tolerance: if batch fails, restart. If streaming fails,
   you need to resume EXACTLY where you left off without reprocessing or losing events.

4. Correctness: when does a window close? What if events arrive late?
   These questions don't exist in batch processing.` },

                { type: "h2", text: "Apache Kafka — The Streaming Backbone" },
                { type: "p", text: "Apache Kafka is a distributed event streaming platform — the infrastructure layer that stores and transports events between producers (systems that generate data) and consumers (systems that process data). It acts as a highly durable, ordered, fault-tolerant message queue." },
                { type: "p", text: "Before tools like Kafka, real-time data transfer meant direct connections: app A calls app B's API, app B calls app C. This creates tight coupling — if B goes down, A fails. Kafka decouples them: A writes events to Kafka (without knowing who reads them), and B reads at its own pace." },
                {
                    type: "code", lang: "text", code: `Without Kafka (tightly coupled):
App A → HTTP Call → App B → HTTP Call → App C → HTTP Call → App D
Problem: If App B crashes, App A fails. If App C is slow, App B waits.

With Kafka (loosely coupled):
                     ┌─────────────┐
App A → produce →   │   Kafka     │  → App B reads (its own pace)
App X → produce →   │  (durable   │  → App C reads (its own pace)
                     │   buffer)   │  → App D reads (its own pace)
                     └─────────────┘
App A doesn't know or care who reads its events.
Kafka buffers everything (days or weeks of retention).
If App B crashes and restarts, it resumes from exactly where it stopped.` },

                { type: "h2", text: "Kafka Core Concepts — Deep Dive" },

                { type: "h3", text: "Topics" },
                { type: "p", text: "A topic is a named category of events, like a database table but for a stream. Producers write to a topic, consumers read from a topic. Topics are append-only — events are added at the end and never modified. Events are retained for a configurable duration (default: 7 days)." },
                {
                    type: "code", lang: "bash", code: `# Create a topic
kafka-topics.sh --create \
  --topic order-events \
  --partitions 20 \           # parallelism: 20 consumers max
  --replication-factor 3 \    # 3 copies of data (tolerate 2 broker failures)
  --bootstrap-server kafka:9092

# Topic configuration
kafka-configs.sh --alter --entity-type topics --entity-name order-events \
  --add-config retention.ms=604800000   # 7 days retention

# List topics
kafka-topics.sh --list --bootstrap-server kafka:9092

# Describe topic details
kafka-topics.sh --describe --topic order-events --bootstrap-server kafka:9092
# Shows: partitions, leader, replicas, ISRs (in-sync replicas)` },

                { type: "h3", text: "Partitions — The Unit of Parallelism" },
                { type: "p", text: "Topics are split into N partitions. Each partition is an ordered, immutable sequence of events. Events within one partition maintain strict ordering. Different partitions can be stored on different Kafka brokers (machines), enabling horizontal scaling and parallel consumption." },
                {
                    type: "code", lang: "text", code: `Topic: order-events with 4 partitions

Partition 0: [e0, e1, e2, e3, e4, ...]  → Broker 1 (Leader)
Partition 1: [e0, e1, e2, ...]          → Broker 2 (Leader)
Partition 2: [e0, e1, e2, e3, ...]      → Broker 3 (Leader)
Partition 3: [e0, e1, ...]              → Broker 1 (Leader)

How a message sent by producer is routed to a partition:
  1. If key=null: round-robin across partitions (even distribution)
  2. If key='user_101': hash(key) % num_partitions → always same partition

Why key-based routing matters:
  - All events for user_101 go to partition 2 (always)
  - Consumer of partition 2 gets ALL user_101 events IN ORDER
  - This enables stateful computations per user (sessions, running totals)
  - Without key: user_101 events scattered across partitions → unordered!` },

                { type: "h3", text: "Offsets — How Kafka Tracks Position" },
                { type: "p", text: "Every event in a partition has a unique sequential integer called an offset. Offset 0, 1, 2, 3... monotonically increasing. Consumer groups store their current offset (latest read position) per partition. This enables fault tolerance: if a consumer crashes to restart, it resumes from the last committed offset." },
                {
                    type: "code", lang: "text", code: `Partition 0 state:
Offset:    0    1    2    3    4    5    6    7    8   ...
Events:   [e0] [e1] [e2] [e3] [e4] [e5] [e6] [e7] [e8]
                              ↑ consumer has read up to here
                              Committed offset = 3

On restart: consumer says "give me offset 4 onwards"
→ Reads e4, e5, e6, e7, e8...
→ No events lost, no events re-read (exactly-once if acked after processing)

Log end offset: 8 (latest event)
Consumer offset: 3 (where consumer is)
Consumer lag: 8 - 3 = 5 (5 events consumer hasn't read yet)
↑ This is what you monitor! Rising lag = consumer falling behind.` },

                { type: "h3", text: "Consumer Groups — Parallel Consumption" },
                { type: "p", text: "A consumer group is a set of consumers that share the work of reading a topic. Each partition is consumed by EXACTLY ONE consumer in the group at any time. More consumers = more parallelism. But you can't have more consumers than partitions — extra consumers sit idle." },
                {
                    type: "code", lang: "text", code: `Topic: order-events (4 partitions)

─── Consumer Group A (4 consumers) ───
Consumer A1 → reads Partition 0 exclusively
Consumer A2 → reads Partition 1 exclusively
Consumer A3 → reads Partition 2 exclusively
Consumer A4 → reads Partition 3 exclusively
Result: full parallelism, no waiting

─── Consumer Group B (2 consumers) ───
Consumer B1 → reads Partition 0 AND Partition 1
Consumer B2 → reads Partition 2 AND Partition 3
Result: each consumer handles 2 partitions (half the parallelism)

─── Consumer Group C (6 consumers) ───
Consumer C1 → reads Partition 0
Consumer C2 → reads Partition 1
Consumer C3 → reads Partition 2
Consumer C4 → reads Partition 3
Consumer C5 → IDLE (no partition available!)
Consumer C6 → IDLE
Result: 2 consumers are wasted! Can't have more consumers than partitions.

Multiple consumer groups:
Group A (analytics service) reads at its own pace
Group B (ML service) reads at its own pace
Both get INDEPENDENT copies of all events
Kafka stores events for everyone — each group maintains its own offsets` },

                { type: "h2", text: "Kafka Producers in Python" },
                {
                    type: "code", lang: "python", code: `from kafka import KafkaProducer
import json
import time
from datetime import datetime

# ─── Basic Producer ───
producer = KafkaProducer(
    bootstrap_servers=['kafka-broker-1:9092', 'kafka-broker-2:9092'],
    # Serializers: convert Python objects to bytes for transmission
    key_serializer=lambda k: k.encode('utf-8') if k else None,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
)

def send_order_event(order_id: str, user_id: str, amount: float):
    event = {
        'order_id': order_id,
        'user_id': user_id,
        'amount': amount,
        'currency': 'USD',
        'event_time': datetime.utcnow().isoformat(),
        'event_type': 'order_placed'
    }
    # Key = user_id: all events for same user go to same partition (ordered)
    future = producer.send('order-events', key=user_id, value=event)
    # future resolves when broker acknowledges receipt
    return future

# ─── Production Producer Configuration ───
producer_prod = KafkaProducer(
    bootstrap_servers=['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092'],

    # Reliability settings
    acks='all',                    # wait for ALL in-sync replicas to confirm
    retries=5,                     # retry transient failures
    retry_backoff_ms=100,          # wait 100ms between retries

    # Exactly-once semantics (producers)
    enable_idempotence=True,       # prevent duplicate messages on retry
    max_in_flight_requests_per_connection=5,  # max with idempotence

    # Performance settings
    batch_size=16384,              # bytes to batch before sending (default: 16KB)
    linger_ms=10,                  # wait 10ms to fill batch (trade latency for throughput)
    compression_type='snappy',     # compress batches before sending

    # Serialization
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: str(k).encode('utf-8'),
)

# ─── Error handling and callbacks ───
def on_success(record_metadata):
    print(f"Sent to topic={record_metadata.topic} "
          f"partition={record_metadata.partition} "
          f"offset={record_metadata.offset}")

def on_error(exception):
    print(f"Failed to send: {exception}")
    # Alert, log, or push to Dead Letter Queue

future = producer.send('order-events', key='user_101', value=event)
future.add_callback(on_success)
future.add_errback(on_error)

producer.flush()  # block until all pending messages are sent` },

                { type: "h2", text: "Kafka Consumers in Python" },
                {
                    type: "code", lang: "python", code: `from kafka import KafkaConsumer
import json

# ─── Simple Consumer ───
consumer = KafkaConsumer(
    'order-events',                           # topics to subscribe
    bootstrap_servers=['kafka:9092'],
    group_id='fraud-detection-service',       # consumer group ID
    auto_offset_reset='latest',               # start from latest (not beginning)
    value_deserializer=lambda x: json.loads(x.decode('utf-8')),
    key_deserializer=lambda x: x.decode('utf-8') if x else None,
)

for message in consumer:
    event = message.value
    partition = message.partition
    offset = message.offset
    key = message.key

    print(f"Partition {partition}, Offset {offset}: {event}")
    # Process the event...
    check_for_fraud(event)

# ─── Production Consumer (manual offset control) ───
consumer_prod = KafkaConsumer(
    'order-events',
    bootstrap_servers=['kafka:9092'],
    group_id='analytics-service',

    # Offset management
    enable_auto_commit=False,     # control commit ourselves
    auto_offset_reset='earliest', # start from beginning if no committed offset

    # Performance
    fetch_min_bytes=1024,         # wait for 1KB before returning messages
    fetch_max_wait_ms=500,        # max 500ms wait even if min_bytes not reached
    max_poll_records=500,         # max records per poll() call
    max_poll_interval_ms=300000,  # if no poll for 5 min, heart failure = rebalance
)

batch = []
for message in consumer_prod:
    batch.append(message)

    # Process in micro-batches for efficiency
    if len(batch) >= 100:
        try:
            # Process all 100 messages
            for msg in batch:
                process(msg.value)

            # Only commit offsets AFTER successful processing
            consumer_prod.commit()   # marks current position as processed
            batch = []               # clear the batch
        except Exception as e:
            print(f"Processing failed: {e}")
            # Don't commit — messages will be reprocessed on restart
            # Or: push to Dead Letter Topic
            for msg in batch:
                send_to_dlq(msg)
            consumer_prod.commit()   # commit even failed ones (to avoid infinite loop)
            batch = []` },

                { type: "h2", text: "Event Time vs Processing Time" },
                { type: "p", text: "One of the trickiest concepts in streaming. Every event has two timestamps: when it actually happened (event time) and when Kafka/Spark received and processed it (processing time). These can be very different." },
                {
                    type: "code", lang: "text", code: `Example: Mobile app that records user clicks

Event time (in payload):     11:30:00  ← user clicked at 11:30
Processing time (Kafka):     11:45:00  ← app was offline, sent data 15 min later

Why does this matter?
Scenario: Count clicks per minute from 11:00-12:00

Using PROCESSING TIME:
  - Simple: window by when Spark receives the event
  - Problem: if an event arrives 15 min late, it's counted in the 11:45 window
    NOT the 11:30 window where it actually happened
  - Revenue report by hour will be wrong!
  - Use when: approximate metrics, monitoring (logs, metrics), when lateness is rare

Using EVENT TIME:
  - Complex: use the timestamp from inside the event payload
  - Correct: 11:30 event counted in 11:00-11:30 window (correct!)
  - Problem: we might receive 11:30 events at 12:00 — window already closed!
  - Solution: WATERMARKING — "accept events up to N minutes late"
  - Use when: accurate business metrics, revenue reports, SLA compliance` },

                { type: "h2", text: "Spark Structured Streaming — In Depth" },
                { type: "p", text: "Spark Structured Streaming extends Spark's DataFrame API to work on unbounded streaming data. It treats a live Kafka topic as an infinite table that continuously grows. Your code looks almost identical to batch Spark — Spark handles the continuous micro-batch execution." },
                {
                    type: "code", lang: "python", code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *

spark = SparkSession.builder \
    .appName("OrderStreamProcessing") \
    .config("spark.sql.shuffle.partitions", "20") \
    .config("spark.streaming.stopGracefullyOnShutdown", "true") \
    .getOrCreate()

# ─── Define schema for incoming events ───
order_schema = StructType([
    StructField("order_id",   StringType(), True),
    StructField("user_id",    StringType(), True),
    StructField("amount",     DoubleType(), True),
    StructField("product_id", StringType(), True),
    StructField("event_time", TimestampType(), True),  # UTC timestamp
    StructField("country",    StringType(), True),
])

# ─── Read from Kafka ───
df_raw = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka-1:9092,kafka-2:9092") \
    .option("subscribe", "order-events") \
    .option("startingOffsets", "latest")    \   # latest = process only new events
    .option("maxOffsetsPerTrigger", 100000) \   # process max 100K events per batch
    .option("failOnDataLoss", "false") \         # don't fail if Kafka deletes old offsets
    .load()

# ─── Parse the Kafka message ───
# Kafka messages: key (bytes), value (bytes), topic, partition, offset, timestamp
df_parsed = df_raw \
    .selectExpr("CAST(value AS STRING) as json_string") \
    .select(from_json(col("json_string"), order_schema).alias("data")) \
    .select("data.*")

# ─── Apply watermark for late-arriving events ───
df_watermarked = df_parsed \
    .withWatermark("event_time", "10 minutes")
# Means: "accept events up to 10 minutes late"
# Events older than (latest seen event time - 10 minutes) are DROPPED

# ─── Windowed aggregation: revenue per product per 5-minute window ───
df_windows = df_watermarked \
    .groupBy(
        window(col("event_time"), "5 minutes"),  # 5-min tumbling window
        col("product_id"),
        col("country")
    ) \
    .agg(
        sum("amount").alias("total_revenue"),
        count("*").alias("order_count"),
        avg("amount").alias("avg_order_value"),
        max("amount").alias("max_order_value")
    ) \
    .select(
        col("window.start").alias("window_start"),
        col("window.end").alias("window_end"),
        col("product_id"),
        col("country"),
        col("total_revenue"),
        col("order_count"),
        col("avg_order_value"),
        col("max_order_value")
    )

# ─── Write to multiple sinks ───

# Sink 1: Write to Delta Lake (for analytics)
query_delta = df_windows.writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "s3://bucket/checkpoints/order_windows/") \
    .option("path", "s3://bucket/delta/order_windows/") \
    .trigger(processingTime="30 seconds") \   # run every 30 seconds
    .start()

# Sink 2: Write aggregated results back to Kafka (for alerting)
df_alerts = df_windows.filter(col("total_revenue") > 10000)
query_alerts = df_alerts \
    .selectExpr("CAST(product_id AS STRING) AS key",
                "to_json(struct(*)) AS value") \
    .writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("topic", "high-revenue-alerts") \
    .option("checkpointLocation", "s3://checkpoints/alerts/") \
    .start()

# Wait for both queries
query_delta.awaitTermination()
query_alerts.awaitTermination()` },

                { type: "h2", text: "Window Types" },
                { type: "p", text: "When you aggregate streaming data, you need to define a window — a time range over which to compute. Three types of windows handle different business problems." },
                {
                    type: "table", headers: ["Window Type", "Definition", "Example", "Overlapping?"], rows: [
                        ["Tumbling", "Fixed size, non-overlapping. Events in exactly one window.", "Count orders per hour: [0:00-1:00], [1:00-2:00]", "No"],
                        ["Sliding", "Fixed size but shifts every N time units. Events can be in multiple windows.", "7-day average, updated hourly", "Yes"],
                        ["Session", "Starts with an event, closes after N time of inactivity", "User session ends after 30 min idle", "Depends"],
                    ]
                },
                {
                    type: "code", lang: "python", code: `from pyspark.sql.functions import window

# Tumbling window: 5-minute non-overlapping buckets
df.groupBy(window(col("event_time"), "5 minutes"), "product_id") \
  .agg(sum("amount"))
# Windows: [0:00-0:05], [0:05-0:10], [0:10-0:15]...
# Event at 0:03 → goes to [0:00-0:05] only

# Sliding window: 10-minute window, updated every 2 minutes
df.groupBy(window(col("event_time"), "10 minutes", "2 minutes"), "user_id") \
  .agg(count("*"))
# Event at 0:03 → appears in:
#   [0:00-0:10], [-2:00-0:08], [-4:00-0:06]... (overlapping windows)
# Used for: "orders per user in rolling 10-min window, updated every 2 min"

# Session window (Spark 3.2+): close after 30-min inactivity
from pyspark.sql.functions import session_window
df.groupBy(session_window(col("event_time"), "30 minutes"), "user_id") \
  .agg(count("*").alias("clicks_in_session"))
# Sessions close 30 min after last event — variable length` },

                { type: "h2", text: "Delivery Semantics — At-Least-Once vs Exactly-Once" },
                { type: "p", text: "This is a critical concept for streaming systems. When events flow through a system, failures can happen anywhere. The question is: when we restart after a failure, how many times does each event get processed?" },
                {
                    type: "code", lang: "text", code: `At-Most-Once (fire and forget):
 - Producer sends to Kafka → doesn't wait for ack
 - Consumer reads → processes → crashes BEFORE committing offset
 - On restart: reads from last committed offset = EVENT WAS LOST
 - Use when: loss is acceptable (monitoring metrics you don't need 100% of)

At-Least-Once (default for most systems):
 - Producer sends → waits for broker ack
 - Consumer reads → processes → commits offset
 - If crash BETWEEN process and commit: same event re-read on restart
 - Effect: event processed TWICE (or more)
 - Fix: make your processing IDEMPOTENT (processing same event twice = same result as once)
 - Use when: you can deduplicate downstream or processing is naturally idempotent

Exactly-Once (hardest):
 - Each event processed precisely once — no loss, no duplication
 - Requires: idempotent producers + transactional consumers + atomic write
 - Kafka implementation:
   1. Producer: enable_idempotence=True (dedup at broker level)
   2. Consumer: manual offset commit, transactional writes
   3. Spark: checkpointing + idempotent output (Delta MERGE, not APPEND)
 - Use when: financial transactions, billing, fraud decisions` },
                {
                    type: "code", lang: "python", code: `# Exactly-once in Spark Structured Streaming
# Requires: checkpointing + idempotent sink

def write_to_delta_idempotently(batch_df, batch_id):
    """
    This function is called by foreachBatch for each micro-batch.
    batch_id is unique per trigger — used to prevent double-processing.
    """
    target = DeltaTable.forPath(spark, "s3://bucket/delta/orders/")

    # MERGE (upsert) — same order_id updated, not duplicated
    target.alias("t").merge(
        batch_df.alias("s"),
        "t.order_id = s.order_id"
    ).whenMatchedUpdateAll() \
     .whenNotMatchedInsertAll() \
     .execute()

query = df_stream.writeStream \
    .foreachBatch(write_to_delta_idempotently) \
    .option("checkpointLocation", "s3://checkpoints/orders/") \
    .trigger(processingTime="60 seconds") \
    .start()
# Checkpoint stores: what Kafka offsets have been processed
# If job fails and restarts: picks up from checkpoint, calls write function again
# Since write is MERGE (not append), re-processing the same batch = safe` },

                { type: "h2", text: "Kafka Architecture for Production" },
                {
                    type: "code", lang: "text", code: `Production Kafka Cluster:

Brokers (servers):       [Broker 1] [Broker 2] [Broker 3]
ZooKeeper / KRaft:       Coordinates broker elections, stores metadata

Partition distribution:
  Topic 'orders' with 6 partitions, replication-factor=3:

  Partition | Leader  | Replica 1 | Replica 2
  ──────────│─────────│───────────│──────────
  P0        │ Broker1 │ Broker2   │ Broker3
  P1        │ Broker2 │ Broker3   │ Broker1
  P2        │ Broker3 │ Broker1   │ Broker2
  P3        │ Broker1 │ Broker3   │ Broker2
  P4        │ Broker2 │ Broker1   │ Broker3
  P5        │ Broker3 │ Broker2   │ Broker1

  Leader: handles all reads and writes for that partition
  Replicas: passively follow the leader (stay in-sync)
  ISR (In-Sync Replicas): replicas caught up with leader

Fault tolerance:
  Broker 2 fails → Broker 1 becomes leader for P1
  Data for P1 still available (replicated to Broker1 and Broker3)
  min.insync.replicas=2 means write confirmed only when 2 replicas have it` },
                {
                    type: "list", items: [
                        "Replication factor ≥ 3: survive 2 broker failures. Most production clusters use 3.",
                        "min.insync.replicas = 2: guarantees data on at least 2 machines before ack. Combined with acks='all' prevents data loss.",
                        "Retention: Keep events for 7-30 days (they're cheap to store). Enables replay of historical data if downstream fails.",
                        "Schema Registry: Enforces Avro/Protobuf schemas centrally. Producers can't write events that violate the schema.",
                        "Monitoring: Track consumer lag (offset gap) per group per partition. Alert when lag exceeds threshold — consumer falling behind.",
                        "Partition count: choose based on expected parallelism. More partitions = more consumers possible, but more leader election overhead.",
                    ]
                },

                { type: "h2", text: "Monitoring Streaming Pipelines" },
                {
                    type: "code", lang: "bash", code: `# ─── Kafka Consumer Group Monitoring ───

# Check consumer group lag (MOST IMPORTANT streaming metric)
kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 \
  --group fraud-detection-service \
  --describe

# Output:
# GROUP                    TOPIC        PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
# fraud-detection-service  order-events 0          15234           15240           6   ← 6 behind
# fraud-detection-service  order-events 1          20100           21000           900 ← 900 behind! Alert!
# fraud-detection-service  order-events 2          18500           18500           0   ← caught up

# Rising lag on partition 1 → consumer too slow, needs more instances

# ─── Kafka Broker Metrics (via JMX / Prometheus) ───
# kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec → throughput
# kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions → replication health
# kafka.network:type=RequestMetrics,name=ResponseQueueTimeMs → broker latency

# ─── Spark Streaming Query Status ───` },
                {
                    type: "code", lang: "python", code: `# Monitor Spark Streaming query health
query = df.writeStream.start()

# Query status
print(query.status)
# {'message': 'Waiting for data to arrive', 'isDataAvailable': False, ...}

# Recent progress (events processed, throughput)
print(query.recentProgress)
# Shows: numInputRows, processedRowsPerSecond, durationMs, watermark

# Exception info if query failed
if query.exception():
    print(query.exception())

# Graceful shutdown (process remaining data before stopping)
query.stop()` },

                { type: "h2", text: "Kafka Connect — Moving Data Without Code" },
                { type: "p", text: "Kafka Connect is a framework for creating connectors that move data into Kafka (source connectors) or out of Kafka (sink connectors) without writing producer/consumer code. There are hundreds of pre-built connectors for databases, cloud services, and file systems." },
                {
                    type: "code", lang: "json", code: `// JDBC Source Connector: stream database table changes to Kafka
{
  "name": "postgres-orders-connector",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSourceConnector",
    "connection.url": "jdbc:postgresql://prod-db:5432/app",
    "connection.user": "kafka_user",
    "connection.password": "\${file:/secrets/db.properties:password}",
    "table.whitelist": "orders,customers,products",
        "mode": "timestamp+incrementing",        // detect new/updated rows
            "timestamp.column.name": "updated_at",
                "incrementing.column.name": "id",
                    "topic.prefix": "postgres.",             // → postgres.orders, postgres.customers
                        "poll.interval.ms": "1000"              // check for new rows every 1 second
}
}

// S3 Sink Connector: write Kafka topic to S3 as Parquet
{
    "name": "s3-parquet-sink",
        "config": {
        "connector.class": "io.confluent.connect.s3.S3SinkConnector",
            "s3.bucket.name": "company-data-lake",
                "s3.part.size": "67108864",
                    "topics": "order-events,click-events",
                        "format.class": "io.confluent.connect.s3.format.parquet.ParquetFormat",
                            "storage.class": "io.confluent.connect.s3.storage.S3Storage",
                                "flush.size": "100000",                  // write file every 100K records
                                    "rotate.interval.ms": "600000"           // OR every 10 minutes
    }
} ` },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["Why Kafka over a database queue?", "Kafka is append-only log with sequential reads (very fast), supports multiple independent consumer groups (each reads independently), retains messages for days (enables replay), handles millions of events/second, partitioned for horizontal scale. A DB queue doesn't scale and doesn't support multiple independent readers."],
                        ["What is consumer lag and why does it matter?", "Consumer lag = difference between latest Kafka offset and consumer's committed offset. Rising lag means the consumer can't process events as fast as they're produced. Left unchecked, the consumer falls infinitely behind. Alert when lag exceeds a threshold. Fix: add more consumer instances (up to partition count limit)."],
                        ["What is a watermark in streaming?", "Watermark is a threshold defining how late an event can arrive and still be included in a window aggregation. Without it, Spark must keep state for all possible late events forever — infinite memory. With watermark('event_time', '10 minutes'): events older than (max_seen - 10min) are dropped. Windows close and state is freed."],
                        ["At-least-once vs exactly-once?", "At-least-once: event processed at minimum once; failure during processing causes reprocessing → duplicates. Fix with idempotent sinks. Exactly-once: each event processed precisely once, requires idempotent producers, transactional consumers, and idempotent sinks. Significantly more complex — only use for financial/billing pipelines."],
                        ["How do you handle out-of-order events?", "Use event_time (timestamp from the event payload) instead of processing_time. Apply a watermark to define how late events are accepted. Use windowed aggregations — window result is only emitted after watermark passes the window's end + late threshold. Late-beyond-watermark events are dropped (acceptable for real-time analytics)."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
