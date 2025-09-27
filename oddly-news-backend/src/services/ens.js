const { ethers } = require("ethers");

// L2Registrar contract ABI - only the functions we need
const L2_REGISTRAR_ABI = [
  {
    inputs: [
      { internalType: "string", name: "label", type: "string" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "register",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "label", type: "string" }],
    name: "available",
    outputs: [{ internalType: "bool", name: "available", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "string", name: "label", type: "string" },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "NameRegistered",
    type: "event",
  },
];

// Contract configuration
const CONTRACT_ADDRESS = "0x3596e71996193D6467D9098401452937a199C200";
const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org"; // Base mainnet
const REGISTRAR_PRIVATE_KEY = process.env.REGISTRAR_PRIVATE_KEY;

/**
 * Gets the provider and contract instances
 * @returns {object} Provider and contract instances
 */
function getContractInstances() {
  if (!REGISTRAR_PRIVATE_KEY) {
    throw new Error("REGISTRAR_PRIVATE_KEY not found in environment variables");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(REGISTRAR_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    L2_REGISTRAR_ABI,
    wallet
  );

  return { provider, wallet, contract };
}

/**
 * Checks if a subdomain label is available for registration
 * @param {string} label - The subdomain label (e.g., "politics" for "politics.oddly.eth")
 * @returns {Promise<boolean>} True if available, false if taken
 */
async function isSubdomainAvailable(label) {
  try {
    const { contract } = getContractInstances();
    const available = await contract.available(label);
    return available;
  } catch (error) {
    console.error(`Error checking subdomain availability for ${label}:`, error);
    throw error;
  }
}

/**
 * Registers a new subdomain for an agent
 * @param {string} label - The subdomain label (e.g., "politics")
 * @param {string} ownerAddress - The wallet address that will own this subdomain
 * @returns {Promise<object>} Transaction result with hash and subdomain
 */
async function registerSubdomain(label, ownerAddress) {
  try {
    console.log(
      `Registering subdomain: ${label}.oddly.eth for ${ownerAddress}`
    );

    // Validate inputs
    if (!label || typeof label !== "string") {
      throw new Error("Invalid label provided");
    }
    if (!ethers.isAddress(ownerAddress)) {
      throw new Error("Invalid owner address provided");
    }

    // Check if subdomain is available
    const available = await isSubdomainAvailable(label);
    if (!available) {
      throw new Error(`Subdomain ${label}.oddly.eth is already taken`);
    }

    const { contract } = getContractInstances();

    // Estimate gas
    const gasEstimate = await contract.register.estimateGas(
      label,
      ownerAddress
    );
    console.log(`Estimated gas: ${gasEstimate.toString()}`);

    // Register the subdomain
    const tx = await contract.register(label, ownerAddress, {
      gasLimit: (gasEstimate * 120n) / 100n, // Add 20% buffer
    });

    console.log(`Transaction submitted: ${tx.hash}`);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      subdomain: `${label}.oddly.eth`,
      owner: ownerAddress,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error(`Error registering subdomain ${label}:`, error);
    throw error;
  }
}

/**
 * Gets the current gas price for transaction estimation
 * @returns {Promise<string>} Current gas price in wei
 */
async function getCurrentGasPrice() {
  try {
    const { provider } = getContractInstances();
    const gasPrice = await provider.getFeeData();
    return gasPrice.gasPrice.toString();
  } catch (error) {
    console.error("Error getting gas price:", error);
    throw error;
  }
}

/**
 * Validates that the registrar wallet has sufficient balance for transactions
 * @returns {Promise<object>} Balance information
 */
async function checkRegistrarBalance() {
  try {
    const { provider, wallet } = getContractInstances();
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);

    return {
      address: wallet.address,
      balance: balance.toString(),
      balanceInEth: balanceInEth,
      hasSufficientBalance: parseFloat(balanceInEth) > 0.001, // At least 0.001 ETH
    };
  } catch (error) {
    console.error("Error checking registrar balance:", error);
    throw error;
  }
}

module.exports = {
  isSubdomainAvailable,
  registerSubdomain,
  getCurrentGasPrice,
  checkRegistrarBalance,
  CONTRACT_ADDRESS,
};
