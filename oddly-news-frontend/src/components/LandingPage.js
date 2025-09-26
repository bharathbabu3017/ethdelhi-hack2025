import React from "react";
import { BarChart3, Mic, Cpu } from "lucide-react";

export default function OddlyNewsLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              oddly.news
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a
              href="#features"
              className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#api"
              className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              API Access
            </a>
            <button className="bg-gray-900 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm lg:text-base font-medium">
              Launch App
            </button>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
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
              Get news backed by real money delivered through AI-powered audio
              briefings. Our agents analyze prediction markets and breaking news
              to reveal what traders actually believe vs what headlines claim.
            </p>
            <div className="flex justify-center lg:justify-start">
              <button className="bg-green-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-lg text-lg sm:text-xl hover:bg-green-700 font-medium transition-colors shadow-lg hover:shadow-xl">
                Launch App
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
                <span className="text-xs sm:text-sm text-gray-600 font-medium">
                  Live
                </span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center py-3 sm:py-4 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-700 font-medium">
                  Election Outcome
                </span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-bold text-green-600">
                    67%
                  </span>
                  <div className="text-xs sm:text-sm text-gray-500">
                    vs 45% headlines
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 sm:py-4 border-b border-gray-100">
                <span className="text-sm sm:text-base text-gray-700 font-medium">
                  Fed Rate Cut
                </span>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-bold text-red-500">
                    23%
                  </span>
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
                  <span className="text-lg sm:text-xl font-bold text-green-600">
                    89%
                  </span>
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
      <section
        id="features"
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Market Intelligence, Simplified
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge AI technology meets real market data
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <div className="text-center group">
              <div className="bg-white p-6 lg:p-8 rounded-2xl w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow">
                <BarChart3 className="w-10 h-10 lg:w-12 lg:h-12 text-gray-900 group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Market vs News Analysis
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                AI agents compare headlines vs actual market odds from Kalshi &
                Polymarket, plus real-time news analysis
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-white p-6 lg:p-8 rounded-2xl w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow">
                <Mic className="w-10 h-10 lg:w-12 lg:h-12 text-gray-900 group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Real-Time Audio Briefings
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                90-second AI agent analysis on politics, sports, crypto, economy
                & breaking markets
              </p>
            </div>
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="bg-white p-6 lg:p-8 rounded-2xl w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-shadow">
                <Cpu className="w-10 h-10 lg:w-12 lg:h-12 text-gray-900 group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                API for AI Agents
              </h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                External AI agents access detailed market intelligence and news
                analysis via x402 micropayments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to get market-backed insights
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="bg-gray-900 text-white w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center font-bold text-2xl lg:text-3xl mx-auto mb-6 lg:mb-8 group-hover:bg-green-600 transition-colors">
                1
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                  Choose Your AI Agent
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                  Select from specialized AI agents covering politics, sports,
                  crypto, economy, and breaking markets
                </p>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-gray-900 text-white w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center font-bold text-2xl lg:text-3xl mx-auto mb-6 lg:mb-8 group-hover:bg-green-600 transition-colors">
                2
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                  Get Market Reality Check
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                  Receive audio briefings comparing news headlines vs actual
                  prediction market data
                </p>
              </div>
            </div>
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="bg-gray-900 text-white w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex items-center justify-center font-bold text-2xl lg:text-3xl mx-auto mb-6 lg:mb-8 group-hover:bg-green-600 transition-colors">
                3
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                  Access Deep Insights
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                  Optional paid API access for detailed market analysis and
                  trading intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
              Powered By Real Market Data
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by traders and backed by industry-leading platforms
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-gray-600 mb-3 text-sm sm:text-base lg:text-lg font-medium">
                Market Data
              </p>
              <p className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">
                Kalshi & Polymarket
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <p className="text-gray-600 mb-3 text-sm sm:text-base lg:text-lg font-medium">
                News Analysis
              </p>
              <p className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">
                Perplexity AI
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-sm hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <p className="text-gray-600 mb-3 text-sm sm:text-base lg:text-lg font-medium">
                Accuracy
              </p>
              <p className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl">
                Real Money, Real Insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                oddly.news
              </div>
              <div className="text-xs sm:text-sm text-gray-500">© 2025</div>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500">
              <button className="hover:text-gray-900 transition-colors">
                Privacy
              </button>
              <button className="hover:text-gray-900 transition-colors">
                Terms
              </button>
              <button className="hover:text-gray-900 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
