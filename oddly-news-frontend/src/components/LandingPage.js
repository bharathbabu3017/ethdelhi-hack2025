import React from "react";
import { BarChart3, Mic, Cpu } from "lucide-react";

export default function OddlyNewsLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              oddly.news
            </div>
            <div className="hidden sm:block text-xs sm:text-sm text-gray-500 max-w-48">
              Where Markets Tell The Real Story
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#features" className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a href="#api" className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors">
              API Access
            </a>
            <button className="bg-gray-900 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base font-medium">
              Login
            </button>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Main Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6 lg:mb-8">
              Discover
              <br />
              The{" "}
              <span className="text-green-600">
                Oddly
                <br />
                Accurate
              </span>{" "}
              Truth
            </h1>
            <p className="text-lg sm:text-xl lg:text-xl text-gray-600 mb-8 lg:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Get news backed by real money. Our AI agents analyze prediction
              markets and breaking news to reveal what traders actually believe
              vs what headlines claim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center lg:justify-start">
              <button className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg hover:bg-green-700 font-medium transition-colors shadow-lg hover:shadow-xl">
                Try Live Market Analysis
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg hover:bg-gray-50 font-medium transition-colors">
                View Demo
              </button>
            </div>
          </div>

          {/* Right Side - Live Data Widget */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Market vs Headlines
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Live</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-3 sm:py-4 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-700 font-medium">
                  Election Outcome
                </span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-bold text-green-600">67%</span>
                  <div className="text-xs sm:text-sm text-gray-500">
                    vs 45% headlines
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 sm:py-4 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-700 font-medium">Fed Rate Cut</span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-bold text-red-500">23%</span>
                  <div className="text-xs sm:text-sm text-gray-500">
                    vs 78% headlines
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 sm:py-4">
                <span className="text-sm sm:text-base text-gray-700 font-medium">
                  Tech Stock Rally
                </span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-bold text-green-600">89%</span>
                  <div className="text-xs sm:text-sm text-gray-500">
                    vs 34% headlines
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 text-center font-medium">
                Real-time data from Kalshi & Polymarket
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Market Intelligence, Simplified
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Market vs News Analysis
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                AI agents compare headlines vs actual market odds from Kalshi &
                Polymarket, plus real-time news analysis
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
                <Mic className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Real-Time Audio Briefings
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                90-second AI agent analysis on politics, sports, crypto, economy
                & breaking markets
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-sm">
                <Cpu className="w-10 h-10 text-gray-900" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                API for AI Agents
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                External AI agents access detailed market intelligence and news
                analysis via x402 micropayments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="space-y-12">
            <div className="flex items-start space-x-6">
              <div className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Choose Your AI Agent
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Select from specialized AI agents covering politics, sports,
                  crypto, economy, and breaking markets
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Get Market Reality Check
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Receive audio briefings comparing news headlines vs actual
                  prediction market data
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="bg-gray-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Access Deep Insights
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Optional paid API access for detailed market analysis and
                  trading intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12">
            Powered By Real Market Data
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <p className="text-gray-600 mb-3 text-lg">Market Data</p>
              <p className="font-bold text-gray-900 text-xl">
                Kalshi & Polymarket
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <p className="text-gray-600 mb-3 text-lg">News Analysis</p>
              <p className="font-bold text-gray-900 text-xl">Perplexity AI</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <p className="text-gray-600 mb-3 text-lg">Accuracy</p>
              <p className="font-bold text-gray-900 text-xl">
                Real Money, Real Insights
              </p>
            </div>
          </div>
          <p className="text-2xl text-gray-900 font-bold mt-12">
            Oddly Accurate
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">© 2025 oddly.news</p>
        </div>
      </footer>
    </div>
  );
}
