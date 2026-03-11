import { DocBlock } from "@/app/components/DocSection";

export const data = {
            title: "Orchestration & Airflow",
subtitle: "Scheduling, managing, and monitoring production data pipelines — from simple batch jobs to complex multi-system workflows.",
accent: "#06b6d4",
blocks: [
                { type: "h2", text: "What Is Pipeline Orchestration?" },
                { type: "p", text: "Writing a data pipeline script is the easy part. Running it reliably every day — handling failures, retries, dependencies, alerting, and monitoring — is the hard part. Orchestration is the system that manages all of this operational complexity." },
                { type: "p", text: "Without an orchestrator, your pipeline might be a cron job that runs a Python script. What happens if the script fails halfway? You won't know. What if step 3 depends on step 2 finishing? You have to manually coordinate that. What if you need to re-run Monday's failed job on Friday? You'd have to do it manually. Orchestrators solve all of this." },
                {
                    type: "table", headers: ["Problem Without Orchestration", "How Orchestration Solves It"], rows: [
                        ["Job fails at 3AM — nobody knows until morning", "Alerts via email/Slack/PagerDuty immediately on failure"],
                        ["Step 3 ran before step 2 finished", "Dependency graph ensures correct execution order"],
                        ["Network timeout — whole pipeline failed", "Configurable retries with delay: retry 3x with 5-min backoff"],
                        ["Need to re-run every day from Jan 1 - March 1", "Built-in backfill via a single CLI command"],
                        ["New engineer asks 'what did Monday's pipeline do?'", "Full history, logs, and execution details in the UI"],
                        ["Need to run 20 tables in parallel", "Configure max_parallel_tasks — done automatically"],
                    ]
                },

                { type: "h2", text: "Why Airflow Became the Industry Standard" },
                { type: "p", text: "Apache Airflow was created at Airbnb in 2014 and open-sourced shortly after. It became the de facto standard for data pipeline orchestration because it solved real problems at scale: Python-native DAG definitions (no XML/YAML), a powerful web UI, a rich operator ecosystem, and a large community." },
                {
                    type: "list", items: [
                        "Python-native: define pipelines in Python — full language expressiveness, no DSL to learn",
                        "Rich ecosystem: 700+ pre-built operators for AWS, GCP, dbt, Spark, Docker, HTTP, email, Slack, and more",
                        "Powerful UI: visual DAG graph, Gantt chart, task logs, dependency view — full observability",
                        "Backfilling: replay historical runs by date range with one CLI command",
                        "Dynamic DAGs: generate tasks programmatically based on configs, database tables, or API responses",
                        "Multi-team scale: RBAC, multiple DAGs, separate connections per environment",
                    ]
                },

                { type: "h2", text: "Airflow Architecture — Every Component" },
                {
                    type: "code", lang: "text", code: `Airflow Architecture:

┌─────────────────────────────────────────────────────────────┐
│                     Airflow Deployment                      │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐ │
│  │  WEBSERVER   │    │  SCHEDULER   │    │  DAG files    │ │
│  │ (Flask app)  │    │              │    │  /dags/*.py   │ │
│  │  :8080       │    │ Parses DAGs  │    │               │ │
│  │  - View DAGs │    │ Checks       │◄───│ Python files  │ │
│  │  - Trigger   │    │ schedules    │    │ defining your │ │
│  │  - Logs      │    │ Queues tasks │    │ pipelines     │ │
│  │  - Admin     │    │              │    │               │ │
│  └──────┬───────┘    └──────┬───────┘    └───────────────┘ │
│         │                  │                               │
│         ▼                  ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              METADATA DATABASE (PostgreSQL)          │  │
│  │  - DAG definitions + run history                     │  │
│  │  - Task state: queued, running, success, failed      │  │
│  │  - XCom values (inter-task messages)                 │  │
│  │  - Connections (auth credentials)                    │  │
│  │  - Variables (config values)                         │  │
│  └─────────────────────────┬────────────────────────────┘  │
│                            │                               │
│  ┌─────────────────────────▼────────────────────────────┐  │
│  │                   EXECUTOR                           │  │
│  │  LocalExecutor → runs tasks in subprocess (dev)      │  │
│  │  CeleryExecutor → distributes tasks to workers       │  │
│  │  KubernetesExecutor → each task = new K8s pod        │  │
│  └─────────────────────────┬────────────────────────────┘  │
│                            │                               │
│  ┌─────────────────────────▼────────────────────────────┐  │
│  │                    WORKERS                           │  │
│  │  (CeleryExecutor / Kubernetes Pods)                  │  │
│  │  Actually run task code (PythonOperator function,    │  │
│  │  BashOperator command, SparkOperator job, etc.)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘` },

                { type: "h2", text: "What Is a DAG?" },
                { type: "p", text: "A DAG (Directed Acyclic Graph) is a graph where nodes are tasks and arrows show dependencies. 'Directed' means arrows only flow one way. 'Acyclic' means no cycles — you can't have task A depend on task B which depends on task A (that would be an infinite loop). In Airflow, you define one DAG per pipeline file." },
                {
                    type: "code", lang: "text", code: `Example DAG: Daily Orders Pipeline

    extract_from_api
           │
           ▼
    validate_schema
           │
      ┌────┴────┐
      ▼         ▼
 transform    archive_raw
  _orders      _data
      │
      ▼
 load_to_warehouse
      │
      ▼
 run_dbt_models
      │
   ┌──┴──┐
   ▼     ▼
alert  create_
team  dashboard

Reading: "extract_from_api must complete before validate_schema starts.
         validate_schema must complete before both transform_orders
         AND archive_raw_data can start (they run in parallel).
         Only after transform_orders finishes can load_to_warehouse run."

This is the power vs cron: dependencies are explicit and enforced.` },

                { type: "h2", text: "Writing DAGs in Python" },
                {
                    type: "code", lang: "python", code: `from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.operators.empty import EmptyOperator
from airflow.utils.dates import days_ago
from datetime import datetime, timedelta
import logging

# ─── Default arguments (applied to all tasks unless overridden) ───
default_args = {
    'owner': 'data-engineering',
    'depends_on_past': False,    # don't wait for previous run to succeed
    'retries': 3,                # retry failed tasks 3 times
    'retry_delay': timedelta(minutes=5),  # wait 5 min between retries
    'email_on_failure': True,
    'email_on_retry': False,
    'email': ['data-team@company.com'],
    'execution_timeout': timedelta(hours=2),  # task fails if running > 2h
}

# ─── DAG Definition ───
with DAG(
    dag_id='daily_orders_pipeline',
    description='Extract orders → validate → transform → load',
    schedule_interval='0 6 * * *',     # every day at 6 AM UTC
    start_date=datetime(2025, 1, 1),   # pipeline started tracking from Jan 1
    end_date=None,                     # runs indefinitely
    catchup=False,                     # don't run all missed dates on deploy
    max_active_runs=1,                 # only one run at a time (prevent overlap)
    max_active_tasks=5,                # max 5 tasks running simultaneously
    tags=['orders', 'daily', 'production'],
    default_args=default_args,
    doc_md="""
    ## Daily Orders Pipeline
    Extracts orders from the source API, validates schema,
    transforms and loads into the warehouse.
    **Oncall:** #data-engineering Slack channel
    **SLA:** Must complete by 8 AM UTC
    """
) as dag:

    # ─── Task 1: Extract ───
    def extract_orders(**context):
        """Extract orders from source API since last run."""
        execution_date = context['ds']  # '2025-03-08' (the logical date)
        logging.info(f"Extracting orders for {execution_date}")
        # ...actual extraction code...
        return {'rows_extracted': 15234}  # value pushed to XCom automatically

    extract_task = PythonOperator(
        task_id='extract_from_api',
        python_callable=extract_orders,
    )

    # ─── Task 2: Validate Schema ───
    validate_task = BashOperator(
        task_id='validate_schema',
        bash_command='python /scripts/validate_orders_schema.py --date={{ ds }}',
        # {{ ds }} is a Jinja template → renders to '2025-03-08'
    )

    # ─── Task 3: Parallel branches ───
    transform_task = PythonOperator(
        task_id='transform_orders',
        python_callable=run_spark_transform,
        op_kwargs={'date': '{{ ds }}'},
    )

    archive_task = PythonOperator(
        task_id='archive_raw_data',
        python_callable=archive_to_s3_glacier,
        retries=1,  # override default_args for this task
    )

    # ─── Task 4: Load ───
    load_task = PythonOperator(
        task_id='load_to_warehouse',
        python_callable=load_to_bigquery,
        pool='bigquery_pool',   # rate limit BigQuery writes
    )

    # ─── Task 5: Success marker ───
    done = EmptyOperator(task_id='pipeline_complete')

    # ─── Define the execution order ───
    extract_task >> validate_task >> [transform_task, archive_task]
    transform_task >> load_task >> done` },

                { type: "h2", text: "Task States and Lifecycle" },
                {
                    type: "table", headers: ["State", "Meaning", "Next State"], rows: [
                        ["scheduled", "Scheduler has queued this run for execution", "queued"],
                        ["queued", "Waiting for an executor/worker slot to become free", "running"],
                        ["running", "Task code is actively executing on a worker", "success / failed / up_for_retry"],
                        ["success", "Task completed without errors", "downstream tasks become scheduled"],
                        ["failed", "Task raised an exception. Retries exhausted.", "skipped (if upstream_failed on downstream)"],
                        ["up_for_retry", "Failed but retries remaining — waiting retry_delay", "running (next attempt)"],
                        ["skipped", "Task was skipped (e.g., BranchOperator chose different path)", "—"],
                        ["upstream_failed", "A dependency task failed — this task won't run", "—"],
                    ]
                },
                { type: "callout", variant: "info", text: "A common interview trick: if task A fails and has no more retries, all downstream tasks (B, C, D...) get marked 'upstream_failed' — they will NOT run. The pipeline effectively stops at the failure point." },

                { type: "h2", text: "Jinja Templating — Dynamic Values in Tasks" },
                { type: "p", text: "Airflow supports Jinja templating in task parameters. Templates are resolved at runtime with the DAG run's context — execution date, run_id, previous execution date, etc. This lets you write generic tasks that process the correct date automatically." },
                {
                    type: "code", lang: "python", code: `# Common Airflow template variables:
# {{ ds }}               → '2025-03-08' (logical date as YYYY-MM-DD)
# {{ ds_nodash }}        → '20250308'
# {{ execution_date }}   → datetime object of the logical execution date
# {{ prev_ds }}          → previous execution date
# {{ next_ds }}          → next scheduled execution date
# {{ run_id }}           → unique identifier for this DAG run
# {{ dag.dag_id }}       → name of the current DAG
# {{ task.task_id }}     → name of the current task

# EXAMPLE: Extract only one day's data per run
BashOperator(
    task_id='extract_daily',
    bash_command="""
        python extract.py \\
            --start_date {{ ds }} \\
            --end_date {{ next_ds }} \\
            --output s3://bucket/raw/{{ ds_nodash }}/
    """
)

# PythonOperator: access context directly
def extract(**context):
    date = context['ds']                # '2025-03-08'
    prev_date = context['prev_ds']      # '2025-03-07'
    run_id = context['run_id']
    print(f"Processing {date} (previous: {prev_date})")` },

                { type: "h2", text: "XCom — Sharing Data Between Tasks" },
                { type: "p", text: "Airflow tasks are isolated processes — they don't share variables or memory. XCom (cross-communication) is the mechanism for passing small values (file paths, counts, status flags) from one task to another." },
                {
                    type: "code", lang: "python", code: `# ─── Pushing an XCom value ───
def extract(**context):
    rows_processed = 15234
    output_path = "s3://bucket/raw/2025-03-08/"

    # Push to XCom (stored in Airflow's metadata DB)
    context['ti'].xcom_push(key='rows_count', value=rows_processed)
    context['ti'].xcom_push(key='output_path', value=output_path)

    # Returning a value auto-pushes with key='return_value'
    return output_path

# ─── Pulling an XCom value ───
def transform(**context):
    # Pull from a specific task and key
    input_path = context['ti'].xcom_pull(
        task_ids='extract_from_api',
        key='output_path'
    )
    row_count = context['ti'].xcom_pull(
        task_ids='extract_from_api',
        key='rows_count'
    )

    print(f"Transforming {row_count} rows from {input_path}")

# ─── XCom in Jinja templates ───
BashOperator(
    task_id='load_data',
    bash_command="python load.py --input {{ ti.xcom_pull(task_ids='extract_from_api', key='output_path') }}"
)` },
                { type: "callout", variant: "warning", text: "XCom is stored in Airflow's metadata database (PostgreSQL). NEVER push large datasets through XCom — it will crash the database. XCom is only for small metadata: file paths, counts, status strings. Large data lives in S3/GCS — pass the path via XCom." },

                { type: "h2", text: "Sensors — Waiting for External Conditions" },
                { type: "p", text: "Sensors are special tasks that WAIT until a condition is true. They poll the condition every N seconds (poke_interval) until it's true or timeout expires. Use sensors to wait for an upstream file to arrive, an API to become available, or another DAG to complete." },
                {
                    type: "code", lang: "python", code: `from airflow.sensors.filesystem import FileSensor
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor

# Wait for a file to appear in S3
wait_for_upload = S3KeySensor(
    task_id='wait_for_data_file',
    bucket_name='company-data',
    bucket_key='uploads/{{ ds }}/orders.csv',
    aws_conn_id='aws_default',
    poke_interval=60,          # check every 60 seconds
    timeout=3600,              # fail after 1 hour if file not found
    mode='reschedule',         # release worker slot while waiting (recommended)
)

# Wait for another DAG's task to complete first
wait_for_upstream = ExternalTaskSensor(
    task_id='wait_for_ingestion_dag',
    external_dag_id='raw_data_ingestion',
    external_task_id='ingestion_complete',
    execution_date_fn=lambda dt: dt,  # same execution date
    poke_interval=120,
    timeout=7200,
    mode='reschedule',
)

wait_for_upload >> transform_task` },

                { type: "h2", text: "Branching — Conditional Task Execution" },
                { type: "p", text: "BranchPythonOperator lets you write a Python function that returns a task_id (or list of task_ids) to execute next. Other branches are automatically skipped. Use for implementing different logic paths based on data conditions." },
                {
                    type: "code", lang: "python", code: `from airflow.operators.python import BranchPythonOperator

def decide_load_strategy(**context):
    row_count = context['ti'].xcom_pull(task_ids='count_rows', key='return_value')

    if row_count == 0:
        return 'no_data_alert'            # send alert, skip load
    elif row_count > 10_000_000:
        return 'full_parallel_load'       # use heavy parallel loading
    else:
        return 'standard_load'            # normal load

branch_task = BranchPythonOperator(
    task_id='decide_load_strategy',
    python_callable=decide_load_strategy,
)

no_data_alert = PythonOperator(task_id='no_data_alert', ...)
standard_load = PythonOperator(task_id='standard_load', ...)
full_parallel_load = PythonOperator(task_id='full_parallel_load', ...)

branch_task >> [no_data_alert, standard_load, full_parallel_load]` },

                { type: "h2", text: "Dynamic DAGs — Generating Tasks Programmatically" },
                { type: "p", text: "One of Airflow's most powerful features: DAG structure can be computed from code. Instead of manually writing 50 identical tasks for 50 tables, you write a loop that generates them. Same DAG, but tasks adapt to config changes automatically." },
                {
                    type: "code", lang: "python", code: `# ─── Pattern 1: Generate tasks from a list ───
TABLES_TO_PROCESS = [
    {'name': 'orders', 'priority': 'high', 'timeout': 3600},
    {'name': 'customers', 'priority': 'medium', 'timeout': 1800},
    {'name': 'products', 'priority': 'low', 'timeout': 900},
    {'name': 'payments', 'priority': 'high', 'timeout': 3600},
]

with DAG('multi_table_pipeline', ...) as dag:
    start = EmptyOperator(task_id='start')
    end = EmptyOperator(task_id='end')

    for table_config in TABLES_TO_PROCESS:
        table = table_config['name']

        extract = PythonOperator(
            task_id=f'extract_{table}',
            python_callable=extract_table,
            op_kwargs={'table_name': table},
            priority_weight=2 if table_config['priority'] == 'high' else 1,
            execution_timeout=timedelta(seconds=table_config['timeout']),
        )

        transform = PythonOperator(
            task_id=f'transform_{table}',
            python_callable=transform_table,
            op_kwargs={'table_name': table},
        )

        load = PythonOperator(
            task_id=f'load_{table}',
            python_callable=load_table,
            op_kwargs={'table_name': table},
        )

        start >> extract >> transform >> load >> end

# ─── Pattern 2: Generate tasks from external config (database, YAML) ───
import yaml

with open('/config/pipeline_config.yaml') as f:
    config = yaml.safe_load(f)

for pipeline in config['pipelines']:
    task = PythonOperator(
        task_id=f"run_{pipeline['name']}",
        python_callable=run_pipeline,
        op_kwargs=pipeline,
    )` },

                { type: "h2", text: "Pools and Priority Queues — Managing Resources" },
                { type: "p", text: "If you have 100 DAGs all running at the same time and all trying to hit the same database or API, you'll overwhelm the resource. Pools limit how many tasks can use a resource simultaneously." },
                {
                    type: "code", lang: "python", code: `# In Airflow UI: Admin → Pools → Create pool 'bigquery_pool' with 5 slots

# Now any task using this pool is limited to 5 concurrent executions
load_task = PythonOperator(
    task_id='load_to_bigquery',
    python_callable=load_fn,
    pool='bigquery_pool',         # only 5 of these tasks run at once
    pool_slots=1,                 # this task uses 1 slot
    priority_weight=10,           # higher = runs first when slots available
)

heavy_load = PythonOperator(
    task_id='heavy_bigquery_load',
    python_callable=heavy_fn,
    pool='bigquery_pool',
    pool_slots=3,                 # this task uses 3 slots (counts as 3)
)` },

                { type: "h2", text: "Connections and Variables" },
                { type: "p", text: "Airflow stores credentials and configuration centrally so they're not hardcoded in your DAG files." },
                {
                    type: "code", lang: "python", code: `# Connections: store in Airflow UI (Admin → Connections)
# or in environment variables (AIRFLOW_CONN_{CONN_ID})
# Access in code:
from airflow.hooks.base import BaseHook

conn = BaseHook.get_connection('my_postgres_db')
# conn.host, conn.port, conn.login, conn.password

# Variables: key-value config stored in Airflow (Admin → Variables)
from airflow.models import Variable

env = Variable.get('environment', default_var='development')   # 'production'
config = Variable.get('pipeline_config', deserialize_json=True)  # JSON → dict

# Environment variables (alternative to Airflow Variables)
import os
aws_region = os.environ.get('AWS_DEFAULT_REGION', 'us-east-1')` },

                { type: "h2", text: "Monitoring and Alerting" },
                {
                    type: "code", lang: "python", code: `# ─── Slack alert on failure ───
from airflow.providers.slack.operators.slack_webhook import SlackWebhookOperator

def on_failure_callback(context):
    """Called automatically when any task fails."""
    dag_id = context['dag'].dag_id
    task_id = context['task'].task_id
    exec_date = context['ds']
    log_url = context['task_instance'].log_url

    slack_msg = f"""
    ❌ *Pipeline Failure Alert*
    DAG:  *{dag_id}*
    Task: *{task_id}*
    Date: *{exec_date}*
    Logs: {log_url}
    """

    SlackWebhookOperator(
        task_id='slack_alert',
        webhook_token_conn_id='slack_webhook',
        message=slack_msg,
    ).execute(context=context)

# Apply to all tasks in DAG
default_args = {
    'on_failure_callback': on_failure_callback,
    ...
}

# ─── SLA Monitoring ───
# Alert if task doesn't finish within expected time
PythonOperator(
    task_id='critical_transform',
    python_callable=transform_fn,
    sla=timedelta(hours=2),  # alert if task takes > 2 hours
)` },

                {
                    type: "h2", text: "Airflow vs Modern Alternatives"
                },
                {
                    type: "table", headers: ["Tool", "Designed By", "Key Advantage", "Best For"], rows: [
                        ["Apache Airflow", "Airbnb (2014)", "Most mature, largest ecosystem, most operators", "Complex enterprise workflows, most team familiarity"],
                        ["Prefect", "Prefect team (2019)", "Better Python integration, easier local testing, Flow API", "Python-first teams, simpler deployments"],
                        ["Dagster", "Elementl (2018)", "Asset-centric (models data assets not tasks), great lineage", "Companies wanting data lineage and asset tracking"],
                        ["Mage.ai", "Mage team (2022)", "Low-code, visual editor, built-in notebook UI", "Small teams, fast prototyping"],
                        ["dbt Cloud", "dbt Labs", "SQL-native orchestration for transformation layer only", "Teams using dbt — schedules dbt models only"],
                        ["AWS Step Functions", "Amazon", "Native AWS integration, serverless, pay-per-use", "AWS-native serverless workflows"],
                    ]
                },

                { type: "h2", text: "Interview Q&A" },
                {
                    type: "table", headers: ["Question", "Strong Answer"], rows: [
                        ["What does the Airflow Scheduler do?", "It parses all DAG files, checks their schedule_interval, and when a run is due, it marks the first tasks as 'scheduled'. It does NOT run tasks itself — it just queues them for the Executor."],
                        ["What is the metadata database?", "A PostgreSQL (or MySQL) database that stores the state of every DAG run, task instance, XCom value, connection, variable, and log location. The scheduler, webserver, and workers all read from and write to it."],
                        ["What does catchup=False mean?", "Without it, Airflow would try to run every missed DAG run between start_date and today when you first deploy a DAG. If start_date is 2024-01-01 and you deploy in 2025, that's 365 missed runs. catchup=False runs only from the most recent scheduled time."],
                        ["What's the difference between execution_date and schedule_interval?", "execution_date is the logical date the run represents (yesterday's data in a daily pipeline). schedule_interval is the cron pattern determining when runs are triggered. A daily pipeline with schedule 6 AM on March 8 has execution_date of March 7 (it processes yesterday's data)."],
                        ["How do you handle a task that sometimes runs in 1 hour and sometimes in 3?", "Set execution_timeout to a reasonable upper bound (e.g., 5 hours). Use SLA for alerting if it exceeds expected time. Set retries and retry_delay for transient failures. Monitor the Gantt chart in the UI to spot abnormal durations."],
                    ]
                },
            ]} as { title: string, subtitle?: string, accent: string, blocks: DocBlock[] };
