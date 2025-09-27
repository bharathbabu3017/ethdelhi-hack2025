const { ethers } = require("ethers");
const bip39 = require("bip39");
const hdkey = require("hdkey");

/**
 * Generates a new mnemonic seed phrase
 * @returns {string} 12-word mnemonic phrase
 */
function generateMnemonic() {
  return bip39.generateMnemonic();
}

/**
 * Generates a new wallet address from a seed phrase and derivation path
 * @param {string} seedPhrase - The master seed phrase
 * @param {number} index - The derivation index for this agent
 * @returns {object} Object containing address and private key
 */
function generateWalletFromSeed(seedPhrase, index = 0) {
  // Validate mnemonic
  if (!bip39.validateMnemonic(seedPhrase)) {
    throw new Error("Invalid mnemonic phrase");
  }

  // Generate seed from mnemonic
  const seed = bip39.mnemonicToSeedSync(seedPhrase);

  // Create HD wallet
  const root = hdkey.fromMasterSeed(seed);

  // Derive wallet using standard Ethereum path: m/44'/60'/0'/0/{index}
  const derivationPath = `m/44'/60'/0'/0/${index}`;
  const child = root.derive(derivationPath);

  // Create wallet from private key
  const privateKey = "0x" + child.privateKey.toString("hex");
  const wallet = new ethers.Wallet(privateKey);

  return {
    address: wallet.address,
    privateKey: privateKey,
    derivationPath: derivationPath,
  };
}

/**
 * Gets the next available derivation index for a new agent
 * This should be called when creating a new agent to ensure unique wallets
 * @param {Array} existingAgents - Array of existing agents with wallet info
 * @returns {number} Next available index
 */
function getNextWalletIndex(existingAgents) {
  if (!existingAgents || existingAgents.length === 0) {
    return 0;
  }

  // Find the highest existing index and add 1
  const maxIndex = existingAgents.reduce((max, agent) => {
    const index = agent.wallet_index || 0;
    return Math.max(max, index);
  }, -1);

  return maxIndex + 1;
}

/**
 * Validates an Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
function isValidAddress(address) {
  return ethers.isAddress(address);
}

module.exports = {
  generateMnemonic,
  generateWalletFromSeed,
  getNextWalletIndex,
  isValidAddress,
};
