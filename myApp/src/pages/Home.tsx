/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  Mail,
  MessageSquare,
  Network,
  Scale,
  Sparkles,
  UserSearch,
  Users,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
export default function App() {
  const navigate = useNavigate();
  const handleAnalysis = () => {
    navigate("/workplace");
  };

  return (
    <div className="dark relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark text-slate-100 antialiased font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <Brain className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">ReqMind AI</h2>
              <span className="-mt-1 block text-xs font-normal text-slate-400">Your AI Business Analyst</span>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-primary">
              Features
            </a>
            <a href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-primary">
              Solutions
            </a>
            <a href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-primary">
              Demo
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden h-10 items-center justify-center rounded-lg bg-primary/10 px-5 text-sm font-semibold text-white transition-all hover:bg-primary/20 sm:flex">
              Login
            </button>
            <button className="flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90"  onClick={handleAnalysis}>
              Start Analysis
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-16 pt-20">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-full -translate-x-1/2 bg-gradient-to-b from-primary/10 to-transparent"></div>
          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Next-Gen Business Analysis
            </div>
            <h1 className="mb-8 text-5xl font-black leading-[1.1] tracking-tight text-white md:text-7xl">
              Turn <span className="text-primary">messy conversations</span> into structured product requirements
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
              Automatically extract functional requirements, stakeholders, and decisions from your team's communication.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="w-full rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-transform hover:scale-[1.02] sm:w-auto" onClick={handleAnalysis}>
                Start Analysis
              </button>
              <button className="w-full rounded-xl border border-primary/20 bg-primary/10 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-primary/20 sm:w-auto">
                View Demo
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative mx-auto mt-20 max-w-6xl">
            <div className="rounded-3xl border border-primary/20 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm md:p-12">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-11">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-4 lg:col-span-3">
                  <div className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center transition-all">
                    <Mail className="size-8 text-primary" />
                    <span className="text-xs font-semibold opacity-70">Emails</span>
                  </div>
                  <div className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center transition-all">
                    <MessageSquare className="size-8 text-primary" />
                    <span className="text-xs font-semibold opacity-70">Chats</span>
                  </div>
                  <div className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center transition-all">
                    <Users className="size-8 text-primary" />
                    <span className="text-xs font-semibold opacity-70">Meetings</span>
                  </div>
                  <div className="group flex flex-col items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center transition-all">
                    <FileText className="size-8 text-primary" />
                    <span className="text-xs font-semibold opacity-70">Docs</span>
                  </div>
                </div>

                {/* Arrow 1 */}
                <div className="flex justify-center rotate-90 lg:col-span-1 lg:rotate-0">
                  <ArrowRight className="size-10 animate-pulse text-primary" />
                </div>

                {/* AI Core */}
                <div className="flex justify-center lg:col-span-3">
                  <div className="relative">
                    <div className="absolute -inset-8 rounded-full bg-primary/20 blur-2xl"></div>
                    <div className="relative flex size-32 items-center justify-center rounded-full border-4 border-primary bg-slate-900 shadow-[0_0_50px_rgba(71,41,224,0.4)] md:size-48">
                      <div className="flex flex-col items-center">
                        <Sparkles className="mb-2 size-12 text-white md:size-16" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary md:text-xs">
                          ReqMind AI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow 2 */}
                <div className="flex justify-center rotate-90 lg:col-span-1 lg:rotate-0">
                  <ArrowRight className="size-10 animate-pulse text-primary" />
                </div>

                {/* Outputs */}
                <div className="lg:col-span-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border-l-4 border-primary bg-primary/5 p-3">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-primary">
                        Structured Requirements
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-2 opacity-80">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span className="text-xs">Functional Specs</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-2 opacity-60">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span className="text-xs">Stakeholder Map</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-2 opacity-40">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span className="text-xs">Decision Log</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-900/30 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  Powerful Capabilities
                </h2>
                <h3 className="text-4xl font-bold tracking-tight text-white">
                  Streamline Your Analysis Workflow
                </h3>
              </div>
              <p className="max-w-sm text-slate-400">
                Automate the heavy lifting of requirement engineering using our custom-tuned machine learning models.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm transition-all hover:border-primary/50">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Code className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-white">Requirement Extraction</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Automatically pull functional and non-functional requirements from any source with 98% accuracy.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm transition-all hover:border-primary/50">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <UserSearch className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-white">Stakeholder Detection</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Identify key decision-makers and their specific needs and pain points across multiple threads.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm transition-all hover:border-primary/50">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Scale className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-white">Decision Tracking</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Log every pivot and final decision with linked context, timestamps, and approval chains.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm transition-all hover:border-primary/50">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Clock className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-white">Timeline Detection</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Extract deadlines, milestones, and delivery estimates from unstructured text and meeting transcripts.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm transition-all hover:border-primary/50">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <AlertCircle className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-white">Feature Prioritization</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Automatically rank features based on stakeholder impact, business value, and technical feasibility.
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm transition-all hover:border-primary/50">
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Network className="size-6" />
                </div>
                <h4 className="mb-3 text-xl font-bold text-white">Knowledge Graph</h4>
                <p className="text-sm leading-relaxed text-slate-400">
                  Visualize the complex relationships between requirements, features, and overall business goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden px-6 py-24">
          <div className="pointer-events-none absolute inset-0 bg-primary/5"></div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-4xl font-black tracking-tight text-white md:text-5xl">
              Ready to transform your messy data into clear requirements?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
              Join hundreds of product teams who have replaced hours of manual documentation with ReqMind AI's automated intelligence.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="w-full rounded-xl bg-primary px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-primary/40 transition-transform hover:scale-105 sm:w-auto"  onClick={handleAnalysis}>
                Start Analysis
              </button>
              <button className="w-full rounded-xl border border-primary/40 bg-transparent px-10 py-4 text-lg font-bold text-white transition-all hover:bg-primary/10 sm:w-auto">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-background-dark px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-white">
              <Brain className="size-4" />
            </div>
            <span className="font-bold tracking-tight text-white">ReqMind AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="transition-colors hover:text-primary">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-primary">Terms of Service</a>
            <a href="#" className="transition-colors hover:text-primary">Documentation</a>
            <a href="#" className="transition-colors hover:text-primary">Support</a>
          </div>
          <div className="text-sm text-slate-600">
            © 2024 ReqMind AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
