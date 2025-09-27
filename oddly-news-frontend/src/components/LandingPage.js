import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Mic,
  Cpu,
  Radio,
  Play,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function OddlyNewsLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">oddly.news</h1>
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
            <Link to="/dashboard">
              <button className="bg-green-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base font-medium flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Launch App</span>
              </button>
            </Link>
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
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Main Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              <span>Real Money, Real Insights</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6 lg:mb-8">
              Get Your
              <br />
              <span className="text-green-600">
                2-Minute
                <br />
                Market Report
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-xl text-gray-600 mb-8 lg:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              AI agents analyze prediction markets and breaking news to deliver
              personalized audio briefings. Discover what traders actually
              believe vs what headlines claim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/dashboard">
                <button className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all text-lg font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Play className="w-5 h-5" />
                  <span>Start Listening</span>
                </button>
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-green-600 hover:text-green-600 transition-all text-lg font-semibold flex items-center justify-center space-x-3">
                <Zap className="w-5 h-5" />
                <span>See Demo</span>
              </button>
            </div>
          </div>

          {/* Right Side - Audio Player Demo */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all overflow-hidden">
            {/* Player Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-700 p-4 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-xl">🏛️</span>
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Political Markets Expert
                  </h3>
                  <p className="text-green-100 text-xs">politics.oddly.news</p>
                </div>
              </div>
              <div className="text-green-100 text-xs">
                Generated 2h ago • 2:15 duration
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 py-3 bg-gray-50">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-500">0:00</span>
                <div className="flex-1 bg-gray-200 h-1 rounded-full">
                  <div className="bg-green-600 h-1 rounded-full w-1/3 transition-all"></div>
                </div>
                <span className="text-xs text-gray-500">2:15</span>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center space-x-3">
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                  </svg>
                </button>

                <button className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-lg">
                  <Play className="w-4 h-4 ml-0.5" />
                </button>

                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* News Headlines Preview */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Mic className="w-4 h-4 text-green-600" />
                <span>Today's Market Intelligence</span>
              </h4>

              <div className="space-y-2">
                <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Election markets show 67% probability shift
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Polymarket data vs mainstream polls analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Policy prediction markets surge 15%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Breaking: Fed rate decision impact
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Congressional betting odds update
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Real money vs headline sentiment gap
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-base font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Markets</div>
                </div>
                <div>
                  <div className="text-base font-bold text-green-600">Live</div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900">2:15</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>
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
                AI agents compare headlines vs actual market odds from
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
                Polymarket
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
