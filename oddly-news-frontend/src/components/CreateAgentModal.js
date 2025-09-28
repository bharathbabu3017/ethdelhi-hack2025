import React, { useState } from "react";
import {
  X,
  Sparkles,
  Globe,
  Wallet,
  Check,
  AlertCircle,
  Loader,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3001/api";

// Organized tag categories
const TAG_CATEGORIES = {
  "Trading & Finance": [
    { id: "100335", name: "Trending Markets" },
    { id: "102137", name: "Featured" },
    { id: "198", name: "Breaking News" },
    { id: "102127", name: "Up or Down" },
    { id: "1312", name: "Crypto Prices" },
    { id: "102321", name: "Bitcoin Prices" },
    { id: "102322", name: "Ethereum Prices" },
    { id: "102323", name: "Solana Prices" },
    { id: "100196", name: "Fed Rates" },
    { id: "102134", name: "Hit Price" },
    { id: "102368", name: "Pre-Market" },
    { id: "1384", name: "Prices" },
  ],
  Politics: [
    { id: "24", name: "USA Election" },
    { id: "188", name: "U.S. Politics" },
    { id: "2", name: "Politics" },
    { id: "1597", name: "Global Elections" },
    { id: "1605", name: "Swing States" },
    { id: "101191", name: "Trump Presidency" },
    { id: "100265", name: "Geopolitics" },
    { id: "101970", name: "World" },
  ],
  "Crypto & Tech": [
    { id: "235", name: "Bitcoin" },
    { id: "39", name: "Ethereum" },
    { id: "818", name: "Solana" },
    { id: "21", name: "Crypto" },
    { id: "439", name: "AI" },
    { id: "100150", name: "Memecoins" },
    { id: "100171", name: "Stablecoins" },
  ],
  "Sports & Entertainment": [
    { id: "1", name: "Sports" },
    { id: "100639", name: "Games" },
    { id: "64", name: "Esports" },
    { id: "53", name: "Movies" },
    { id: "18", name: "Awards" },
    { id: "596", name: "Culture" },
    { id: "100248", name: "Olympics" },
    { id: "100350", name: "Soccer" },
    { id: "745", name: "NBA" },
    { id: "1453", name: "NFL Draft" },
    { id: "683", name: "Boxing" },
    { id: "864", name: "Tennis" },
  ],
  "Business & Economy": [
    { id: "107", name: "Business" },
    { id: "100328", name: "Economy" },
    { id: "1401", name: "Tech" },
    { id: "396", name: "CEOs" },
    { id: "702", name: "Inflation" },
    { id: "100250", name: "GameStop" },
    { id: "100271", name: "DJT" },
  ],
  "World Events": [
    { id: "180", name: "Israel" },
    { id: "61", name: "Gaza" },
    { id: "96", name: "Ukraine" },
    { id: "303", name: "China" },
    { id: "78", name: "Iran" },
    { id: "245", name: "Canada" },
    { id: "518", name: "India" },
  ],
};

export default function CreateAgentModal({ isOpen, onClose, onAgentCreated }) {
  const [formData, setFormData] = useState({
    topic: "",
    display_name: "",
    description: "",
    tag_id: "",
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user types
  };

  const handleTopicChange = (e) => {
    let value = e.target.value;
    // Auto-format topic: lowercase, replace spaces with hyphens, remove invalid chars
    value = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData({ ...formData, topic: value });
    setError("");
  };

  const handleTagSelect = (tagId) => {
    setFormData({ ...formData, tag_id: tagId });
    setError("");
  };

  const validateForm = () => {
    if (!formData.topic.trim()) {
      setError("Topic is required");
      return false;
    }
    if (!formData.display_name.trim()) {
      setError("Display name is required");
      return false;
    }
    if (!formData.tag_id) {
      setError("Please select a market tag");
      return false;
    }
    if (formData.topic.length < 3) {
      setError("Topic must be at least 3 characters");
      return false;
    }
    if (formData.topic.length > 20) {
      setError("Topic must be less than 20 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/create-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data);
        // Call parent callback to refresh agents list
        if (onAgentCreated) {
          onAgentCreated(data.agent);
        }
        // Auto-close after 3 seconds
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        setError(data.error || "Failed to create agent");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error creating agent:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({ topic: "", display_name: "", description: "", tag_id: "" });
    setSelectedCategory("");
    setError("");
    setSuccess(null);
    setIsCreating(false);
    onClose();
  };

  const getSelectedTag = () => {
    for (const category of Object.values(TAG_CATEGORIES)) {
      const tag = category.find((t) => t.id === formData.tag_id);
      if (tag) return tag;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Agent
              </h2>
              <p className="text-gray-600">
                Deploy an AI agent with its own wallet and ENS subdomain
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200 flex-shrink-0">
            <div className="flex items-start space-x-3">
              <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  Agent Created Successfully! 🎉
                </h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800">
                        ENS Subdomain:
                      </span>
                    </div>
                    <div className="text-sm text-green-900 font-mono break-all">
                      {success.agent.ens_subdomain}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800">
                        Wallet Address:
                      </span>
                    </div>
                    <div className="text-sm text-green-900 font-mono break-all">
                      {success.agent.wallet_address}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-xs font-medium text-green-800 mb-1">
                      Transaction Hash:
                    </div>
                    <div className="text-xs text-green-700 font-mono break-all">
                      {success.agent.ens_transaction_hash}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-4 text-center font-medium">
                  Closing automatically in 3 seconds...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Topic *
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleTopicChange}
                    placeholder="e.g., crypto-prices"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Will become: {formData.topic || "your-topic"}.oddly.eth
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Crypto Prices Agent"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of what this agent covers..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Market Tag Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Market Tag *{" "}
                  {getSelectedTag() && (
                    <span className="text-green-600 font-normal">
                      - Selected: {getSelectedTag().name}
                    </span>
                  )}
                </label>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.keys(TAG_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category ? "" : category
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Tag Grid */}
                {selectedCategory && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {TAG_CATEGORIES[selectedCategory].map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagSelect(tag.id)}
                        className={`p-2 text-left text-sm rounded-lg border transition-colors ${
                          formData.tag_id === tag.id
                            ? "bg-green-50 border-green-300 text-green-700"
                            : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="font-medium">{tag.name}</div>
                        <div className="text-xs text-gray-500">
                          ID: {tag.id}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!selectedCategory && (
                  <div className="text-center py-8 text-gray-500">
                    Select a category above to choose a market tag
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Creating Agent...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Agent</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
