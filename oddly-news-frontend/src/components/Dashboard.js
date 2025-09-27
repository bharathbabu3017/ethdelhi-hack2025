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
    }
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

  const generateOrLoadBriefing = async (topic) => {
    setGeneratingAgent(topic);
    setSelectedAgent(agents.find((a) => a.topic === topic));

    try {
      console.log(`Loading briefing for ${topic}...`);

      // Let the backend handle recent briefing logic
      const response = await fetch(`${API_BASE_URL}/agents/${topic}/generate`);
      const data = await response.json();

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
    const created = new Date(timestamp);
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radio className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">oddly.news</h1>
              <p className="text-sm text-gray-600">
                AI Market Intelligence Radio
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {agents.length} stations available
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!currentBriefing ? (
          /* Agent Selection */
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose Your Station
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
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
                    <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Live</span>
                    </div>
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

                  <div className="space-y-3">
                    <button
                      onClick={() => generateOrLoadBriefing(agent.topic)}
                      disabled={generatingAgent === agent.topic}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {generatingAgent === agent.topic ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Listen Now</span>
                        </>
                      )}
                    </button>

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
          /* Music Player UI */
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => setCurrentBriefing(null)}
              className="mb-6 text-green-600 hover:text-green-700 flex items-center space-x-2"
            >
              <SkipBack className="w-4 h-4" />
              <span>Back to Stations</span>
            </button>

            {/* Album Art Style Player */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Cover Art Section */}
              <div className="bg-gradient-to-br from-green-500 to-green-700 p-12 text-center text-white">
                <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-4xl">
                    {getAgentIcon(selectedAgent?.topic)}
                  </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {selectedAgent?.display_name}
                </h1>
                <p className="text-green-100">{selectedAgent?.ens_subdomain}</p>
                {currentBriefing.createdAt && (
                  <p className="text-green-200 text-sm mt-2">
                    Generated {getTimeAgo(currentBriefing.createdAt)}
                  </p>
                )}
              </div>

              {/* Player Controls */}
              <div className="p-8">
                {/* Custom Audio Player */}
                <div className="mb-8">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div
                      className="bg-gray-200 h-2 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center space-x-6 mb-8">
                    <button className="text-gray-400 hover:text-gray-600">
                      <SkipBack className="w-6 h-6" />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="bg-green-600 text-white p-4 rounded-full hover:bg-green-700 transition-colors shadow-lg"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" />
                      )}
                    </button>

                    <button className="text-gray-400 hover:text-gray-600">
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {currentBriefing.marketCount}
                    </div>
                    <div className="text-sm text-gray-500">Markets</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(currentBriefing.duration)}s
                    </div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      Live
                    </div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript Section */}
            <div className="mt-8 bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-green-600" />
                  <span>Live Transcript</span>
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
    </div>
  );
}
