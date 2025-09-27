import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Radio,
  Volume2,
  BarChart3,
  Zap,
  ExternalLink,
  SkipBack,
  SkipForward,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001/api";

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingAgent, setGeneratingAgent] = useState(null);
  const [currentBriefing, setCurrentBriefing] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [generationStep, setGenerationStep] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  // Set up audio when briefing is loaded
  useEffect(() => {
    if (currentBriefing && audioRef.current) {
      console.log("Setting up audio with URL:", currentBriefing.audioUrl);
      audioRef.current.src = currentBriefing.audioUrl;
      audioRef.current.load();
      console.log("Audio source set and loaded");

      // Reset play state when loading new audio
      setIsPlaying(false);
    }
  }, [currentBriefing]);

  // Sync isPlaying state with actual audio state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentBriefing]);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if briefing is recent (within 30 minutes)
  const isBriefingRecent = (timestamp) => {
    if (!timestamp) return false;
    const utcTimestamp = timestamp.endsWith("Z") ? timestamp : timestamp + "Z";
    const created = new Date(utcTimestamp);
    const now = new Date();
    const diffMinutes = (now - created) / (1000 * 60);
    return diffMinutes <= 30;
  };

  const generateOrLoadBriefing = async (topic, forceNew = false) => {
    const agent = agents.find((a) => a.topic === topic);
    setSelectedAgent(agent);

    // If briefing is recent and not forcing new, skip generation modal
    if (!forceNew && isBriefingRecent(agent?.lastGenerated)) {
      try {
        console.log(`Loading recent briefing for ${topic}...`);
        const response = await fetch(
          `${API_BASE_URL}/agents/${topic}/generate`
        );
        const data = await response.json();

        if (data.success) {
          console.log("✅ Loaded recent briefing");
          setCurrentBriefing(data.briefing);
          return;
        }
      } catch (error) {
        console.error("Error loading recent briefing:", error);
        // Fall through to generation if loading fails
      }
    }

    // Show generation modal for new/forced generation
    setGeneratingAgent(topic);

    // Start progress indicators
    const steps = [
      "Scanning prediction markets...",
      "Analyzing market sentiment...",
      "Gathering breaking news...",
      "Cross-referencing data sources...",
      "Generating insights...",
      "Creating audio briefing...",
      "Finalizing report...",
    ];

    let stepIndex = 0;
    let countdownValue = 45; // Estimated time in seconds
    setCountdown(countdownValue);
    setGenerationStep(steps[stepIndex]);

    const progressInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setGenerationStep(steps[stepIndex]);
    }, 6000); // Change step every 6 seconds

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      console.log(`Generating briefing for ${topic}...`);

      // Let the backend handle recent briefing logic
      const url = forceNew
        ? `${API_BASE_URL}/agents/${topic}/generate?force=true`
        : `${API_BASE_URL}/agents/${topic}/generate`;
      const response = await fetch(url);
      const data = await response.json();

      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(countdownInterval);

      console.log("API Response:", data);

      if (data.success) {
        console.log("✅ API call successful");
        console.log("Briefing data:", data.briefing);
        console.log("Audio URL:", data.briefing?.audioUrl);

        if (!data.briefing) {
          console.error("❌ No briefing data in response");
          alert("No briefing data received from server");
          return;
        }

        console.log("Setting currentBriefing...");
        setCurrentBriefing(data.briefing);
        console.log("currentBriefing set successfully");

        // Audio will be set up when the player UI renders

        // Log whether this was cached or newly generated
        if (data.cached) {
          console.log(`Using cached briefing from ${data.briefing.createdAt}`);
        } else {
          console.log(`Generated new briefing`);
        }
      } else {
        alert("Failed to load briefing: " + data.error);
      }
    } catch (error) {
      console.error("Error loading briefing:", error);
      alert("Error loading briefing");
    } finally {
      setGeneratingAgent(null);
      setGenerationStep("");
      setCountdown(0);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch((error) => {
          console.error("Play failed:", error);
          alert("Unable to play audio. Please try again.");
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();

    // Ensure timestamp is treated as UTC
    // Supabase timestamps don't include 'Z', so we need to add it
    const utcTimestamp = timestamp.endsWith("Z") ? timestamp : timestamp + "Z";
    const created = new Date(utcTimestamp);

    const diffMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getAgentIcon = (topic) => {
    const icons = {
      politics: "🏛️",
      crypto: "₿",
      economy: "📈",
      congress: "🏢",
      breaking: "📰",
    };
    return icons[topic] || "🤖";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading agents...</div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {agents.length} stations available
            </div>
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`max-w-7xl mx-auto px-6 py-8 ${
          currentBriefing && (isPlayerMinimized || isPlaying) ? "pb-24" : ""
        }`}
      >
        {!currentBriefing || isPlayerMinimized ? (
          /* Agent Selection */
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Get Your 2-Minute News Report
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Covering highly active prediction markets, breaking research,
                and real market sentiment. Choose your AI agent to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getAgentIcon(agent.topic)}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {agent.display_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {agent.ens_subdomain}
                        </p>
                      </div>
                    </div>
                    {isBriefingRecent(agent.lastGenerated) ? (
                      <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span>Stale</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>Tag: {agent.tag_id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>${agent.x402_price_usd}</span>
                    </div>
                  </div>

                  {/* Last Generated Info */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Last Report:</span>
                      </span>
                      <span className="text-gray-800 font-medium">
                        {agent.lastGenerated
                          ? getTimeAgo(agent.lastGenerated)
                          : "Never"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => generateOrLoadBriefing(agent.topic)}
                      disabled={generatingAgent !== null}
                      className={`w-full py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                        isBriefingRecent(agent.lastGenerated)
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {generatingAgent === agent.topic ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : isBriefingRecent(agent.lastGenerated) ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Listen Now</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Generate & Listen</span>
                        </>
                      )}
                    </button>

                    {isBriefingRecent(agent.lastGenerated) && (
                      <button
                        onClick={() =>
                          generateOrLoadBriefing(agent.topic, true)
                        }
                        disabled={generatingAgent !== null}
                        className="w-full border-2 border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Generate Fresh Update</span>
                      </button>
                    )}

                    <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>API Access</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Full Player View */
          <div className="pb-24">
            {/* Header with Back and Minimize */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setIsPlayerMinimized(true);
                }}
                className="text-green-600 hover:text-green-700 flex items-center space-x-2"
              >
                <SkipBack className="w-4 h-4" />
                <span>Back to Stations</span>
              </button>

              <button
                onClick={() => setIsPlayerMinimized(true)}
                className="text-gray-600 hover:text-gray-700 flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <span>Minimize</span>
                <div className="w-4 h-4 flex flex-col justify-center space-y-0.5">
                  <div className="w-full h-0.5 bg-current"></div>
                  <div className="w-full h-0.5 bg-current"></div>
                  <div className="w-full h-0.5 bg-current"></div>
                </div>
              </button>
            </div>
            {/* Briefing Info Card */}
            <div className="bg-gradient-to-r from-white to-green-50 rounded-2xl shadow-lg p-8 mb-8 border border-green-100">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white text-3xl flex-shrink-0 shadow-lg">
                  {getAgentIcon(selectedAgent?.topic)}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedAgent?.display_name}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {selectedAgent?.description}
                  </p>
                  {currentBriefing.createdAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <p className="text-green-600 text-sm font-medium">
                        Generated {getTimeAgo(currentBriefing.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      generateOrLoadBriefing(selectedAgent.topic, true)
                    }
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 shadow-sm hover:shadow-md transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Generate Update</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {currentBriefing.marketCount}
                </div>
                <div className="text-sm text-gray-500">Markets Analyzed</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {Math.round(currentBriefing.duration)}s
                </div>
                <div className="text-sm text-gray-500">Report Duration</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  Live
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
            {/* Transcript Section */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  <span>Full Transcript</span>
                </h3>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentBriefing.script}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden audio element - Always present */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        className="hidden"
      />

      {/* Spotify-like Bottom Player - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gray-200 cursor-pointer"
            onClick={currentBriefing ? handleSeek : undefined}
          >
            <div
              className="bg-green-600 h-1 transition-all"
              style={{
                width: currentBriefing
                  ? `${(currentTime / duration) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
                {currentBriefing ? getAgentIcon(selectedAgent?.topic) : "🎵"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {currentBriefing
                    ? selectedAgent?.display_name
                    : "No track selected"}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {currentBriefing
                    ? `Generated ${
                        currentBriefing.createdAt
                          ? getTimeAgo(currentBriefing.createdAt)
                          : "now"
                      }`
                    : "Choose an agent to start listening"}
                </p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-400 hover:text-gray-600 p-2"
                disabled={!currentBriefing}
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={currentBriefing ? togglePlayPause : undefined}
                className={`p-3 rounded-full transition-colors shadow-sm ${
                  currentBriefing
                    ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!currentBriefing}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                className="text-gray-400 hover:text-gray-600 p-2"
                disabled={!currentBriefing}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Time and Actions */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <div className="text-xs text-gray-500 tabular-nums">
                {currentBriefing
                  ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                  : "--:-- / --:--"}
              </div>
              {currentBriefing && (
                <button
                  onClick={() => setIsPlayerMinimized(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded"
                  title="Expand Player"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                className="text-gray-400 hover:text-gray-600 p-2"
                disabled={!currentBriefing}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      {generatingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-10 h-10 text-green-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generating Fresh Insights
              </h3>
              <p className="text-gray-600">{selectedAgent?.display_name}</p>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">{generationStep}</div>
              {countdown > 0 && (
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, "0")}
                </div>
              )}
              <div className="text-xs text-gray-500">
                Estimated time remaining
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                style={{
                  width:
                    countdown > 0
                      ? `${((45 - countdown) / 45) * 100}%`
                      : "100%",
                }}
              ></div>
            </div>

            <div className="text-xs text-gray-500">
              Analyzing prediction markets • Gathering breaking news • Creating
              audio briefing
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
