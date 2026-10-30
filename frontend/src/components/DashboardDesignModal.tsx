import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface DashboardDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArchitecture: () => void;
}

export const DashboardDesignModal: React.FC<DashboardDesignModalProps> = ({
  isOpen,
  onClose,
  onOpenArchitecture
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-2 sm:p-4">
      <div className="bg-[#0b1120] text-slate-100 w-full max-w-6xl my-auto rounded-xl shadow-2xl overflow-hidden relative border border-slate-700 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Suggested RecSys &amp; ReviewStream Dashboard Design
                </h2>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  Live Preview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Recommended UI/UX layout for monitoring model inference, review feedback ingestion, and A/B experiments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenArchitecture}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-2.5 rounded bg-amber-400/10 border border-amber-400/30 hidden sm:inline-flex cursor-pointer"
            >
              View System Blueprint
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close dashboard design"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Filter Bar */}
        <div className="bg-slate-900/60 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Time Range:</span>
            {(['1h', '24h', '7d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
                  selectedTimeframe === tf
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Inference Gateway: Healthy (P99 42ms)
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px]">Dataset: Amazon 2023 20-Core</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Row 1: Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: NDCG@10 */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>NDCG@10 Ranking Quality</span>
                <span className="text-emerald-400 font-bold flex items-center text-[11px]">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">0.438</div>
              <p className="text-[11px] text-slate-400">
                Baseline: 0.384 • Offline test split on 20-core holdout
              </p>
            </div>

            {/* Metric 2: Online CTR Lift */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Recommendation Rail CTR</span>
                <span className="text-emerald-400 font-bold flex items-center text-[11px]">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono">4.82%</div>
              <p className="text-[11px] text-slate-400">
                vs Popularity Baseline (3.12%) on 120k impressions
              </p>
            </div>

            {/* Metric 3: P99 Serving Latency */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>P99 Serving Latency</span>
                <span className="text-emerald-400 font-bold text-[11px]">Target: &lt; 60ms</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">42 ms</div>
              <p className="text-[11px] text-slate-400">
                Retrieval: 12ms • Ranker: 24ms • MMR Re-rank: 6ms
              </p>
            </div>

            {/* Metric 4: ReviewStream Throughput */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>ReviewStream Ingestion</span>
                <span className="text-sky-400 font-bold text-[11px]">Kafka Batch</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">1,850 / hr</div>
              <p className="text-[11px] text-slate-400">
                99.8% verified purchase validation rate
              </p>
            </div>
          </div>

          {/* Row 2: Charts Grid (ReviewStream Sentiment & Serving Latency Waterfall) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: ReviewStream Sentiment Polarity Distribution (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    ReviewStream: Sentiment Polarity &amp; Trend Shifts
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time RoBERTa sentiment scores from verified customer feedback
                  </p>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded font-mono">
                  Rolling 24h
                </span>
              </div>

              {/* Visual Bars for Sentiment */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Positive Sentiment (&gt; 0.70 score)
                    </span>
                    <span className="font-mono text-slate-300">78.4% (1,450 reviews)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Neutral Sentiment (0.40 - 0.70 score)
                    </span>
                    <span className="font-mono text-slate-300">14.1% (261 reviews)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '14.1%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Negative Sentiment (&lt; 0.40 score)
                    </span>
                    <span className="font-mono text-slate-300">7.5% (139 reviews)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '7.5%' }} />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between">
                <span>
                  <strong>Sentiment Drift Action:</strong> Products with negative sentiment shift &gt; 12% in 24h are automatically demoted by the MMR Re-ranker.
                </span>
                <span className="text-emerald-400 font-semibold shrink-0 ml-2">Active Policy</span>
              </div>
            </div>

            {/* Chart 2: Pipeline Latency Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Two-Stage Serving Latency Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Target SLA: P99 under 60ms end-to-end
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-slate-300">
                    <span>1. Faiss HNSW Candidate Retrieval (1M &rarr; 200)</span>
                    <span className="font-mono text-sky-400 font-bold">12 ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-slate-300">
                    <span>2. DCN-v2 Scoring &amp; Feature Fetch</span>
                    <span className="font-mono text-purple-400 font-bold">24 ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full" style={{ width: '57%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 text-slate-300">
                    <span>3. MMR Diversity &amp; Out-of-Stock Filter</span>
                    <span className="font-mono text-amber-400 font-bold">6 ms</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Round-Trip:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">42 ms (P99)</span>
              </div>
            </div>
          </div>

          {/* Row 3: A/B Testing Matrix Table */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Production A/B Experimentation Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Live cohort split across candidate generation strategies on Amazon storefront
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Split: 40% / 40% / 20%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Model Variant</th>
                    <th className="py-2.5 px-3 font-semibold">Architecture</th>
                    <th className="py-2.5 px-3 font-semibold">NDCG@10</th>
                    <th className="py-2.5 px-3 font-semibold">Online CTR</th>
                    <th className="py-2.5 px-3 font-semibold">Conversion Lift</th>
                    <th className="py-2.5 px-3 font-semibold">Catalog Coverage</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr className="hover:bg-slate-800/40 text-slate-200">
                    <td className="py-2.5 px-3 font-bold text-amber-300">Model A (Challenger)</td>
                    <td className="py-2.5 px-3 text-slate-300">Two-Tower DSSM + DCN-v2</td>
                    <td className="py-2.5 px-3 text-emerald-400">0.438</td>
                    <td className="py-2.5 px-3 text-emerald-400">4.82%</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">+18.4%</td>
                    <td className="py-2.5 px-3">89.4%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-sans font-bold">
                        Leading (p &lt; 0.01)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-200">
                    <td className="py-2.5 px-3 font-bold text-sky-300">Model B</td>
                    <td className="py-2.5 px-3 text-slate-300">Graph Neural Net (PinSage)</td>
                    <td className="py-2.5 px-3 text-slate-300">0.412</td>
                    <td className="py-2.5 px-3 text-slate-300">4.10%</td>
                    <td className="py-2.5 px-3 text-slate-300">+9.2%</td>
                    <td className="py-2.5 px-3">92.1%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-sans font-semibold">
                        Evaluating
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2.5 px-3 font-bold text-slate-400">Control (Baseline)</td>
                    <td className="py-2.5 px-3">Category Popularity Heuristic</td>
                    <td className="py-2.5 px-3">0.384</td>
                    <td className="py-2.5 px-3">3.12%</td>
                    <td className="py-2.5 px-3">0.0% (ref)</td>
                    <td className="py-2.5 px-3">41.2%</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-sans">
                        Control
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Row 4: ReviewStream Quality & Defect Anomaly Feed */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>ReviewStream Product Quality &amp; Defect Anomaly Feed</span>
              </h3>
              <span className="text-xs text-slate-400">Automated NLP Quality Triggers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/40 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-400 font-bold">ASIN B08F9V4P3G</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">
                    Negative Shift Spike (+8%)
                  </span>
                </div>
                <p className="text-slate-300">
                  Keywords flagged in last 12 reviews: <em>"Bluetooth scroll lag", "firmware disconnect"</em>
                </p>
                <p className="text-[11px] text-slate-500">
                  Action taken: Recommendation ranking score dampened by 15% pending seller resolution.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/40 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold">ASIN B09XS7JWHH</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                    High Sentiment Peak (96%)
                  </span>
                </div>
                <p className="text-slate-300">
                  Keywords flagged in last 40 reviews: <em>"ANC silence", "earcup comfort", "crystal clear"</em>
                </p>
                <p className="text-[11px] text-slate-500">
                  Action taken: Boosted priority in "Top Rated in Audio" candidate pool.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Dashboard Specification for <strong>Ecommerce Recommendation model</strong> (Grafana / React Tremor stack)
          </span>
          <button
            onClick={onClose}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-1.5 rounded-full cursor-pointer"
          >
            Back to Amazon Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
