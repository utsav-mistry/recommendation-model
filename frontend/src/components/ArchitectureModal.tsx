import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Copy, 
  Check, 
  Database, 
  Workflow, 
  Sparkles, 
  ExternalLink, 
  FileCode,
  Layers,
  BarChart3,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { ARCHITECTURE_MODULES, UNIVERSAL_CHATBOT_PROMPT } from '../data/systemArchitecture';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDashboardDesign: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  onOpenDashboardDesign
}) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'diagram' | 'prompt' | 'references'>('modules');
  const [copied, setCopied] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('data-ingestion');

  if (!isOpen) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(UNIVERSAL_CHATBOT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedModule = ARCHITECTURE_MODULES.find((m) => m.id === selectedModuleId) || ARCHITECTURE_MODULES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex justify-center p-2 sm:p-4">
      <div className="bg-[#0f172a] text-slate-100 w-full max-w-6xl my-auto rounded-xl shadow-2xl overflow-hidden relative border border-slate-700 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Ecommerce Recommendation Model: System Architecture
                </h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono">
                  Modular RecSys v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end data ingestion, review processing, Two-Tower recommendation, and telemetry specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close architecture modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/60 px-6 border-b border-slate-800 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'modules'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Modular System Design</span>
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'diagram'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span>End-to-End Pipeline Flow</span>
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'prompt'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Universal Chatbot Prompt</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
                Copy-Ready
              </span>
            </button>
            <button
              onClick={() => setActiveTab('references')}
              className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'references'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Dataset & Notebook Links</span>
            </button>
          </div>

          <button
            onClick={onOpenDashboardDesign}
            className="hidden md:flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium py-1.5 px-3 rounded bg-sky-950/60 border border-sky-800/80 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Open Dashboard Preview</span>
          </button>
        </div>

        {/* Tab 1: Modular Architecture */}
        {activeTab === 'modules' && (
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar list of modules */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                System Modules
              </span>
              {ARCHITECTURE_MODULES.map((m) => {
                const isSelected = m.id === selectedModuleId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400/80 text-white shadow-md'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 font-semibold">{m.badge}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-100">{m.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{m.subtitle}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Module Detail */}
            <div className="lg:col-span-8 bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-5 overflow-y-auto">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {selectedModule.badge}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5">{selectedModule.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedModule.subtitle}</p>
              </div>

              {/* Components breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Core Components & Technologies
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedModule.components.map((comp, idx) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-lg space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-amber-300">{comp.name}</span>
                        <span className="text-[11px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                          {comp.tech}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{comp.purpose}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Inputs:</span>
                          <span className="text-slate-200 font-mono text-[10px]">{comp.inputs}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Outputs:</span>
                          <span className="text-slate-200 font-mono text-[10px]">{comp.outputs}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Benchmark:</span>
                          <span className="text-emerald-400 font-semibold">{comp.keyMetric}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Pipeline Execution Flow
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-300">
                  {selectedModule.flowSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Key Decisions */}
              <div className="space-y-2 bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-lg">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Architectural Rationale & Guarantees
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-amber-200/90">
                  {selectedModule.keyDecisions.map((dec, idx) => (
                    <li key={idx} className="leading-relaxed">{dec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Visual Pipeline Flow */}
        {activeTab === 'diagram' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    End-to-End System Dataflow Diagram
                  </h3>
                  <p className="text-xs text-slate-400">
                    From raw Hugging Face 20-core partitions to milliseconds storefront candidate delivery
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                  Sub-50ms P99 SLA
                </span>
              </div>

              {/* Flow Steps Visual */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {/* Step 1 */}
                <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">STAGE 01</span>
                    <h4 className="font-bold text-xs text-white mt-1">Raw Ingestion</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Hugging Face 20-Core Parquet shards streamed into PySpark
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] font-mono text-slate-400">
                    &gt; 20-core user/item filtering gate
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-sky-400 font-bold">STAGE 02</span>
                    <h4 className="font-bold text-xs text-white mt-1">ReviewStream NLP</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      RoBERTa sentiment polarity &amp; verified purchase weights
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] font-mono text-slate-400">
                    &gt; 384-dim text embeddings
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-800/80 border border-indigo-500/50 p-3.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">STAGE 03</span>
                    <h4 className="font-bold text-xs text-white mt-1">Candidate Retrieval</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Two-Tower DSSM + Faiss HNSW vector index search
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] font-mono text-emerald-400">
                    1M items &rarr; Top 200 (12ms)
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold">STAGE 04</span>
                    <h4 className="font-bold text-xs text-white mt-1">Deep Ranker &amp; MMR</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      DCN-v2 scores pCTR x pCVR with diversity penalty
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] font-mono text-purple-300">
                    Top 200 &rarr; Top 24 items
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-slate-800/80 border border-amber-500/50 p-3.5 rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">STAGE 05</span>
                    <h4 className="font-bold text-xs text-white mt-1">Storefront Rails</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Mounted into Amazon UI recommendation rails &amp; cart cross-sells
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] font-mono text-amber-300">
                    Clickstream impression telemetry
                  </div>
                </div>
              </div>

              {/* Data Ingestion Contract */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
                <span className="text-amber-400 font-bold text-[11px] block">
                  // Data Contract: Standardized Record Schema from Kaggle Pipeline
                </span>
                <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "user_id": "U3812739174",            // String identifier, minimum 20 verified interactions
  "parent_asin": "B09XS7JWHH",         // Standardized product catalog key
  "rating": 5.0,                       // Float [1.0 - 5.0]
  "timestamp": 1694649600000,          // Epoch timestamp for temporal split
  "title": "Sony WH-1000XM5...",       // Cleaned product title
  "text": "The ANC is quiet...",       // Review body (tokenized)
  "verified_purchase": true,           // Boost factor = 1.5x in sentiment aggregation
  "helpful_vote": 342,                 // Popularity weighting coefficient
  "sentiment_polarity": 0.95           // RoBERTa fine-tuned polarity score
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Copy-Paste Prompt for Other Chatbots */}
        {activeTab === 'prompt' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/30 border border-amber-500/40 p-4 rounded-lg">
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Universal System Design Prompt for Chatbots
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Copy this comprehensive architecture prompt into ChatGPT, Claude, Gemini, or any AI assistant to generate identical, production-grade recommendation pipelines.
                </p>
              </div>

              <button
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-slate-950 font-bold text-xs px-4 py-2 rounded-full transition shadow cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Full Architecture Prompt'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[500px]">
              <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {UNIVERSAL_CHATBOT_PROMPT}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Dataset & Notebook Links */}
        {activeTab === 'references' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ref 1: Hugging Face Dataset */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">DATASET REPOSITORY</span>
                  <h4 className="font-bold text-sm text-white mt-1">Amazon 2023 20-Core</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Hugging Face repository containing dense 20-core filtered user interactions, metadata, and verified review text.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-2">
                    ChenglongMa/amazon-2023-all-category-k-core/20-core
                  </p>
                </div>
                <a
                  href="https://huggingface.co/datasets/ChenglongMa/amazon-2023-all-category-k-core/tree/main/20-core"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>Open Hugging Face Tree</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Ref 2: Kaggle Processing Pipeline */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">KAGGLE NOTEBOOK</span>
                  <h4 className="font-bold text-sm text-white mt-1">Dataset Tests &amp; Pipeline</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Kaggle pipeline notebook implementing data loading, parquet chunking, and review preprocessing scripts.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-2">
                    utsavmistry30/hugging-face-dataset-tests (v362242617)
                  </p>
                </div>
                <a
                  href="https://www.kaggle.com/code/utsavmistry30/hugging-face-dataset-tests?scriptVersionId=362242617"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  <span>Open Kaggle Script</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Ref 3: Notion Architecture Summary */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">NOTION DOCUMENT</span>
                  <h4 className="font-bold text-sm text-white mt-1">Core RecSys Architecture</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Architecture summary specifying candidate retrieval, heavy ranking layers, offline feature stores, and SLAs.
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-2">
                    Core-Recommendation-Engine-Team-Architecture-Summary
                  </p>
                </div>
                <a
                  href="https://www.notion.so/Core-Recommendation-Engine-Team-Architecture-Summary-4041c7a97cf78009bbdedad1c02626ab?source=copy_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Open Notion Architecture</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Project: <strong>Ecommerce Recommendation model</strong> (ReviewStream Ingestion)</span>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied System Prompt' : 'Copy Prompt for Other Chatbots'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
