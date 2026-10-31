export interface ArchitectureModule {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  components: {
    name: string;
    tech: string;
    purpose: string;
    inputs: string;
    outputs: string;
    keyMetric: string;
  }[];
  flowSteps: string[];
  keyDecisions: string[];
}

export const ARCHITECTURE_MODULES: ArchitectureModule[] = [
  {
    id: 'data-ingestion',
    title: 'Module 1: High-Throughput Data Ingestion',
    subtitle: 'Streamlined ingestion of Amazon 2023 20-Core dataset from Hugging Face & reviews pipeline',
    badge: 'Ingestion Layer',
    components: [
      {
        name: 'Hugging Face Stream Loader',
        tech: 'Apache Arrow / datasets library / PySpark',
        purpose: 'Streams chunks of `ChenglongMa/amazon-2023-all-category-k-core/20-core` without exhausting RAM.',
        inputs: 'Raw JSON Lines / Parquet shards (Electronics, Computers, Home)',
        outputs: 'Batched RecordBatches with schema validation',
        keyMetric: 'Ingestion speed: ~180k reviews/sec'
      },
      {
        name: 'Schema Validator & Quality Gate',
        tech: 'Pydantic v2 / Great Expectations',
        purpose: 'Ensures minimum 20 interactions per user & per ASIN, strips orphan records, validates datatypes.',
        inputs: 'Raw user_id, parent_asin, rating, timestamp, verified_purchase',
        outputs: 'Cleaned, typed bronze tables',
        keyMetric: 'Zero dropped mandatory keys'
      },
      {
        name: 'Storage Sharding Layer',
        tech: 'Delta Lake / Apache Iceberg on Cloud Object Storage',
        purpose: 'Organizes reviews into time and category partitions (category=Audio/year=2023).',
        inputs: 'Validated bronze data records',
        outputs: 'Partitioned Parquet files with Z-order indexing on user_id & asin',
        keyMetric: 'Query read throughput: 1.2 GB/s'
      }
    ],
    flowSteps: [
      'Trigger incremental ingestion via Airflow / Prefect DAG matching Hugging Face dataset commits.',
      'Stream parquet batches into PySpark cluster worker nodes.',
      'Enforce k-core constraints: iteratively prune users and items with degree < 20.',
      'Write deduplicated records to Bronze Delta tables on cloud storage with manifest logging.'
    ],
    keyDecisions: [
      '20-Core Pruning: Eliminates severe sparsity and cold-start cold paths, ensuring high collaborative filtering signal.',
      'Schema Consistency: Map legacy review fields (reviewerID -> user_id, asin -> parent_asin).'
    ]
  },
  {
    id: 'data-processing',
    title: 'Module 2: Feature Engineering & Review Processing',
    subtitle: 'Kaggle pipeline implementation for review NLP, embeddings, and interaction graphs',
    badge: 'Processing & Feature Store',
    components: [
      {
        name: 'Review Text & Sentiment Pipeline',
        tech: 'Hugging Face Transformers / RoBERTa-sentiment / VADER',
        purpose: 'Extracts review sentiment polarity scores (0 to 1), helpfulness weight, and key phrase descriptors.',
        inputs: 'review text, review summary, verified_purchase, helpful_vote',
        outputs: 'Sentiment polarity, confidence score, aspect sentiment breakdown',
        keyMetric: 'Inference latency: 4ms / review on GPU batch'
      },
      {
        name: 'Two-Tower Semantic Embedding Tower',
        tech: 'all-MiniLM-L6-v2 / BGE-Large / Sentence-Transformers',
        purpose: 'Computes dense 384-dimensional item vectors from Title + Brand + Category + Top Reviews.',
        inputs: 'Item metadata concat string',
        outputs: '384-dim normalized L2 item vectors',
        keyMetric: 'Cosine alignment on co-viewed items > 0.82'
      },
      {
        name: 'User Interaction Sequence Builder',
        tech: 'Polars / DuckDB / Feast Feature Store',
        purpose: 'Constructs chronological user interaction lists [ASIN_1, ASIN_2, ... ASIN_N] with recency decay.',
        inputs: 'User chronological interaction logs with timestamps',
        outputs: 'User state vectors & point-in-time train/val feature rows',
        keyMetric: 'Point-in-time lookups < 2ms'
      }
    ],
    flowSteps: [
      'Read from Bronze Delta tables into distributed Polars / DuckDB pipeline.',
      'Generate rolling window interaction sequences (last 20 purchased / reviewed items per user).',
      'Generate dense semantic embeddings of product titles, descriptions, and verified reviews.',
      'Perform negative sampling (in-batch negatives + popularity-biased hard negatives).',
      'Publish feature sets to Offline Feast Store (BigQuery/S3) and Online Redis Feature Store.'
    ],
    keyDecisions: [
      'Verified Purchase Weighting: Reviews with verified_purchase=True receive 1.5x weight in sentiment score aggregation.',
      'Dual Embedding Space: Item semantics (text) combined with co-occurrence graph embeddings (Item2Vec).'
    ]
  },
  {
    id: 'recommendation-pipeline',
    title: 'Module 3: Recommendation Pipeline Architecture (Two-Stage Pipeline)',
    subtitle: 'Candidate generation (Retrieval) followed by heavy ranking and diversification',
    badge: 'Inference Architecture',
    components: [
      {
        name: 'Stage 1: Retrieval (Candidate Generation)',
        tech: 'Two-Tower DSSM + Approximate Nearest Neighbors (Faiss / Milvus / HNSWLib)',
        purpose: 'Filters millions of catalog items down to Top 200 relevant candidates within 15 milliseconds.',
        inputs: 'User query vector (User Tower) + Candidate item index (Item Tower)',
        outputs: 'Top 200 candidate ASINs with dot-product affinity scores',
        keyMetric: 'Candidate Recall@200: 94.2% • Latency: 12ms'
      },
      {
        name: 'Stage 2: Heavy Ranker (Scoring)',
        tech: 'Deep & Cross Network (DCN-v2) / LightGBM / BST (Behavior Sequence Transformer)',
        purpose: 'Accurately predicts Click-Through-Rate (pCTR) and Conversion Rate (pCVR) with 60+ features.',
        inputs: 'Top 200 candidates + user features + context (time of day, device, category)',
        outputs: 'Sorted list with calibrated probability scores pCTR * pCVR',
        keyMetric: 'NDCG@10: 0.438 • AUC: 0.812'
      },
      {
        name: 'Stage 3: Business Logic & Diversification',
        tech: 'MMR (Maximal Marginal Relevance) + Business Rule Filters',
        purpose: 'Removes out-of-stock items, enforces category diversity, prevents duplicate brands.',
        inputs: 'Top 50 scored items',
        outputs: 'Final 12-24 recommendation rail items rendered on storefront',
        keyMetric: 'Intra-list diversity score: 0.74'
      }
    ],
    flowSteps: [
      'User visits Amazon storefront or switches persona (e.g. Alex Vance).',
      'Client transmits user_id and current active context to Recommendation Gateway API.',
      'API queries Online Redis store for user embedding and recent interaction sequence.',
      'Faiss HNSW index executes MIPS (Maximum Inner Product Search) across 500k catalog vectors -> Returns Top 200 in 12ms.',
      'DCN-v2 ranker scores Top 200 candidates using cross-features and sentiment signals -> Returns Top 50.',
      'Re-ranking filter applies MMR diversity penalty (lambda=0.6) and strips recently purchased items.',
      'JSON response returned to frontend client and mounted into recommendation rails.'
    ],
    keyDecisions: [
      'Two-Tower separation allows offline precomputation of all item vectors, leaving only user tower inference online.',
      'Explicit separation of Candidate Retrieval from Scoring avoids running heavy neural networks over the full catalog.'
    ]
  },
  {
    id: 'visualization-dashboard',
    title: 'Module 4: Recommendation Engine & ReviewStream Dashboard',
    subtitle: 'Operational observability, recommendation metrics, review sentiment shifts, and A/B test telemetry',
    badge: 'Visualization & Operations',
    components: [
      {
        name: 'Real-time RecSys Telemetry Grid',
        tech: 'React 19 / Tailwind / Tremor / Chart.js',
        purpose: 'Visualizes online CTR, Conversion Rate, P99 API Latency, and HitRate@K across algorithmic variants.',
        inputs: 'Prometheus metrics + Clickstream event stream',
        outputs: 'Interactive metric cards, latency sparklines, throughput gauges',
        keyMetric: 'Update frequency: Real-time (1s refresh)'
      },
      {
        name: 'ReviewStream Sentiment & Anomaly Detector',
        tech: 'RoBERTa-sentiment aggregation + Statistical Process Control',
        purpose: 'Tracks sentiment shifts per product over time; triggers alerts when negative reviews spike.',
        inputs: 'Hourly ingestion review batches from Amazon 2023 stream',
        outputs: 'Sentiment polarity distribution (78% Pos, 14% Neu, 8% Neg), anomaly flags',
        keyMetric: 'Spike detection turnaround: < 5 minutes'
      },
      {
        name: 'A/B Testing & Rail Experimentation Panel',
        tech: 'Statsig / LaunchDarkly / Custom multi-armed bandit',
        purpose: 'Compares Two-Tower vs Graph Collaborative Filtering vs Popularity baseline in production.',
        inputs: 'User impression and conversion log events',
        outputs: 'Statistical significance p-value, lift calculation (+18.4% CTR)',
        keyMetric: 'Confidence level: 95% Bayesian'
      }
    ],
    flowSteps: [
      'Event logger records impression events when recommendation rails enter viewport.',
      'Click and Add-to-Cart events sent with attribution token (rec_rail_id, version_id, rank_position).',
      'Dashboard aggregates metrics across 1m, 1h, and 24h rolling windows.',
      'Product managers inspect per-category recommendation health and review stream velocity.'
    ],
    keyDecisions: [
      'Attribution Tracking: Embed recommendation rail ID and pipeline snapshot hash into every add-to-cart payload.',
      'Sentiment Trend Drift: Combine review star rating delta with NLP sentiment score delta for early quality warning.'
    ]
  }
];

export const UNIVERSAL_CHATBOT_PROMPT = `
# SYSTEM PROMPT: Production-Grade E-Commerce Recommendation System & ReviewStream Pipeline

Act as a Principal Staff Machine Learning Engineer and Distributed Systems Architect specializing in Large-Scale Recommender Systems (RecSys) and NLP Pipelines.

## 1. Project Overview
Build an end-to-end, production-ready system architecture for:
- Project Name: "Ecommerce Recommendation System" (incorporating ReviewStream for product feedback processing)
- Dataset: Hugging Face \`ChenglongMa/amazon-2023-all-category-k-core\` (specifically the 20-core filtered shards)
- Ingestion & Pipeline Reference: Kaggle script \`utsavmistry30/hugging-face-dataset-tests\`
- Core Architecture Reference: Notion "Core Recommendation Engine Team Architecture Summary"
- Objective: Design a modular system for (1) High-throughput Data Ingestion, (2) NLP Review Processing & Feature Engineering, (3) Two-Stage Candidate Retrieval & Deep Ranking, and (4) Operational Telemetry & Analytics Dashboard.

## 2. Modular Architecture Specifications

### Module A: Data Ingestion Layer
- Dataset Format: 20-Core Amazon 2023 reviews & metadata (ensures min 20 interactions per user & ASIN).
- Input Schema: { user_id: string, parent_asin: string, rating: float, timestamp: int64, title: string, text: string, images: list, helpful_vote: int, verified_purchase: bool }.
- Pipeline: Apache Spark / Polars batch stream from Hugging Face parquet partitions into Delta Lake Bronze tables.
- Guarantees: Idempotent processing, deduplication on (user_id, parent_asin, timestamp), data contract validation.

### Module B: ReviewStream & Feature Engineering Pipeline
- Text Processing: Clean raw review text, remove HTML artifacts, tokenize with BPE tokenizer.
- Sentiment Extraction: RoBERTa sentiment classifier producing continuous polarity score [-1.0 to +1.0] and verified purchase weighting.
- Sequence Analysis: Sliding window of user chronological interaction history (length=20) with exponential time decay.
- Item Embeddings: Dense 384-dim semantic representations (all-MiniLM-L6-v2) fine-tuned on Amazon product catalogs.
- Storage: Feast Feature Store (Offline: S3 Parquet / BigQuery; Online: Low-latency Redis cluster).

### Module C: Recommendation Pipeline Architecture (Two-Stage RecSys)
1. Candidate Generation / Retrieval (Stage 1):
   - Two-Tower DSSM (User Tower encodes sequence + demographics; Item Tower encodes item ID + metadata + embeddings).
   - Serving: Approximate Nearest Neighbor (ANN) index using Faiss HNSW or Milvus vector database.
   - Scale: Searches 1,000,000+ items down to Top 200 candidates in < 15ms (Recall@200 > 93%).
2. Heavy Ranker / Scoring (Stage 2):
   - Deep & Cross Network (DCN-v2) or Behavior Sequence Transformer (BST).
   - Features: User historical pCTR, item popularity in category, cross features (user_fav_brand x item_brand), review sentiment score, price tier match.
   - Loss Function: Binary Cross-Entropy with LogLoss optimization for pCTR and pCVR.
3. Diversification & Business Re-ranking (Stage 3):
   - Maximal Marginal Relevance (MMR) with diversity parameter lambda=0.6.
   - Business filters: Stock availability, category deduplication (max 2 items per category in general rail), freshness boost.

### Module D: API Gateway & Low-Latency Serving
- Framework: FastAPI / gRPC microservices in Go or C++ inference engine (Triton / ONNX Runtime).
- SLA Targets: P50 < 20ms, P95 < 45ms, P99 < 60ms end-to-end.
- Cache Strategy: Multi-tier caching with Redis (TTL=300s for user candidate pool, invalidated on new checkout).

### Module E: Visualization & Operational Dashboard Design
- Executive Metrics: Online CTR (+18.4% target), Conversion Lift, NDCG@10, Hit Rate@20, Average Order Value (AOV).
- ReviewStream Health: Hourly review ingestion rate, sentiment shift heatmaps, product defect alert spikes.
- A/B Testing: Split routing between Pipeline A (Two-Tower + DCN-v2) vs Pipeline B (Graph CF) vs Baseline (Popularity).

## 3. Implementation Requirements
- Provide complete code snippets for: PySpark ingestion script, PyTorch Two-Tower definition, FastAPI serving endpoint, and React dashboard metrics component.
- Strictly adhere to production best practices: type annotations, error handling, dockerfile, and latency benchmarking.
`.trim();
