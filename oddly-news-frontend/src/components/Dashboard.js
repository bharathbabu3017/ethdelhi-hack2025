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
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Copy,
  Check,
  Globe,
  Plus,
  Search,
  X,
} from "lucide-react";
import CreateAgentModal from "./CreateAgentModal";

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
  const [copiedItems, setCopiedItems] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
          // Navigate to detailed player view
          setIsPlayerMinimized(false);
          console.log("Navigated to detailed player view");
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

        // Navigate to detailed player view
        setIsPlayerMinimized(false);
        console.log("Navigated to detailed player view");

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

  const copyToClipboard = async (text, itemId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems({ ...copiedItems, [itemId]: true });
      setTimeout(() => {
        setCopiedItems({ ...copiedItems, [itemId]: false });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleAgentCreated = (newAgent) => {
    // Refresh the agents list
    fetchAgents();
    console.log("New agent created:", newAgent);
  };

  // Filter and sort agents
  const getFilteredAndSortedAgents = () => {
    let filteredAgents = agents;

    // Filter by search query
    if (searchQuery.trim()) {
      filteredAgents = agents.filter(
        (agent) =>
          agent.display_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          agent.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          agent.ens_subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: Ready agents first, then by display name
    return filteredAgents.sort((a, b) => {
      const aReady = isBriefingRecent(a.lastGenerated);
      const bReady = isBriefingRecent(b.lastGenerated);

      if (aReady && !bReady) return -1;
      if (!aReady && bReady) return 1;

      return a.display_name.localeCompare(b.display_name);
    });
  };

  const getAgentIcon = (topic) => {
    const icons = {
      politics: "🏛️",
      crypto: "₿",
      economy: "📈",
      congress: "🏢",
      breaking: "📰",
      elon: "🚀",
      earnings: "💰",
      sports: "⚽",
      world: "🌍",
    };
    return icons[topic] || "🤖";
  };

  if (loading) {
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
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
          {/* Skeleton Title */}
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-300 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-3xl mx-auto mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 max-w-2xl mx-auto animate-pulse"></div>
          </div>

          {/* Skeleton Agent Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="w-12 h-5 bg-gray-200 rounded-full"></div>
                </div>

                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="w-full h-12 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Bottom Player */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
              <div className="bg-gray-300 h-1 rounded-full w-0"></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded p-2"></div>
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded p-2"></div>
              </div>

              <div className="flex items-center space-x-4 flex-1 justify-end">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="w-8 h-8 bg-gray-200 rounded p-2"></div>
              </div>
            </div>
          </div>
        </div>
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
              {agents.length} stations available • Ready first
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Agent</span>
            </button>
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`max-w-7xl mx-auto px-6 py-8 ${
          currentBriefing && (isPlayerMinimized || isPlaying) ? "pb-32" : ""
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

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {getFilteredAndSortedAgents().length} agent
                  {getFilteredAndSortedAgents().length !== 1 ? "s" : ""} found
                </p>
              )}
            </div>

            {getFilteredAndSortedAgents().length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No agents found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No agents match "${searchQuery}". Try a different search term.`
                    : "No agents available at the moment."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAndSortedAgents().map((agent) => (
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
                          {agent.ens_subdomain && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <Globe className="w-3 h-3" />
                                <span className="font-medium">
                                  {agent.ens_subdomain}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    agent.ens_subdomain,
                                    `ens-${agent.id}`
                                  )
                                }
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Copy ENS subdomain"
                              >
                                {copiedItems[`ens-${agent.id}`] ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            </div>
                          )}
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
            )}
          </div>
        ) : (
          /* Full Player View */
          <div className="pb-32">
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

                  {/* ENS and Wallet Info */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {selectedAgent?.ens_subdomain && (
                      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {selectedAgent.ens_subdomain}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedAgent.ens_subdomain,
                              `player-ens-${selectedAgent.id}`
                            )
                          }
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Copy ENS subdomain"
                        >
                          {copiedItems[`player-ens-${selectedAgent.id}`] ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-blue-500 hover:text-blue-700" />
                          )}
                        </button>
                      </div>
                    )}

                    {selectedAgent?.wallet_address && (
                      <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-lg">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-mono text-purple-700">
                          {selectedAgent.wallet_address.slice(0, 6)}...
                          {selectedAgent.wallet_address.slice(-4)}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              selectedAgent.wallet_address,
                              `player-wallet-${selectedAgent.id}`
                            )
                          }
                          className="p-1 hover:bg-purple-100 rounded transition-colors"
                          title="Copy wallet address"
                        >
                          {copiedItems[`player-wallet-${selectedAgent.id}`] ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-purple-500 hover:text-purple-700" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

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
            {/* Market Overview Stats */}
            {currentBriefing.marketStats && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span>Market Overview</span>
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        Total Volume
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {currentBriefing.marketStats.totalVolume}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Active Markets
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {currentBriefing.marketStats.activeMarkets}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">
                        Total Markets
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {currentBriefing.marketStats.totalMarkets}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Featured</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {currentBriefing.marketStats.featuredMarkets}
                    </div>
                  </div>
                </div>

                {/* Top Events */}
                {currentBriefing.marketStats.topEvents &&
                  currentBriefing.marketStats.topEvents.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Top Market Events
                      </h4>
                      <div className="grid gap-3">
                        {currentBriefing.marketStats.topEvents.map(
                          (event, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-2">
                                    {event.title}
                                  </h5>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <DollarSign className="w-3 h-3" />
                                      <span>Volume: {event.volume}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Activity className="w-3 h-3" />
                                      <span>24h: {event.volume24hr}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <BarChart3 className="w-3 h-3" />
                                      <span>Liquidity: {event.liquidity}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        Comments: {event.commentCount}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  {event.featured && (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                                      Featured
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      event.active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {event.active ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* AI Insights Section */}
            {currentBriefing.aiInsights &&
              currentBriefing.aiInsights.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg mb-8">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span>AI-Driven Market Insights</span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4">
                      {currentBriefing.aiInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {insight.title}
                              </h4>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {insight.content}
                              </p>
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  {insight.source}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAgentCreated={handleAgentCreated}
      />
    </div>
  );
}
