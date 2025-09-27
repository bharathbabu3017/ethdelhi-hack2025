import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

// Create a public client for Ethereum Sepolia testnet
const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

async function lookupEnsAddress(ensName) {
  try {
    console.log(
      `Looking up address for ENS name: ${ensName} on Sepolia testnet`
    );

    // Normalize the ENS name
    const normalizedName = normalize(ensName);
    console.log(`Normalized name: ${normalizedName}`);

    // Get the address for the ENS name
    const address = await client.getEnsAddress({
      name: normalizedName,
    });

    if (address) {
      console.log(`✅ Address found: ${address}`);
      return address;
    } else {
      console.log(`❌ No address found for ${ensName}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error looking up ENS name ${ensName}:`, error.message);

    // If ENS is not available on Sepolia, suggest using mainnet
    if (error.message.includes("ENS") || error.message.includes("resolver")) {
      console.log(
        `💡 Note: ENS might not be fully deployed on Sepolia testnet. Consider using mainnet for ENS queries.`
      );
    }

    return null;
  }
}

async function reverseEnsLookup(address) {
  try {
    console.log(
      `Looking up ENS name for address: ${address} on Sepolia testnet`
    );

    // Get the ENS name for the address (reverse resolution)
    const ensName = await client.getEnsName({
      address: address,
    });

    if (ensName) {
      console.log(`✅ ENS name found: ${ensName}`);
      return ensName;
    } else {
      console.log(`❌ No ENS name found for ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error looking up address ${address}:`, error.message);

    // If ENS is not available on Sepolia, suggest using mainnet
    if (error.message.includes("ENS") || error.message.includes("resolver")) {
      console.log(
        `💡 Note: ENS reverse resolution might not be fully deployed on Sepolia testnet. Consider using mainnet for ENS queries.`
      );
    }

    return null;
  }
}

// Example usage
async function main() {
  // Forward resolution: ENS name -> Address
  console.log("🔍 Starting ENS forward resolution on Sepolia testnet...\n");

  const ensNames = ["politics.oddly.eth"];
  for (const name of ensNames) {
    await lookupEnsAddress(name);
    console.log("---");
  }

  // Reverse resolution: Address -> ENS name
  console.log("\n🔄 Starting ENS reverse resolution on Sepolia testnet...\n");

  const addresses = [
    "0x90DD14cD9ce555b3059c388c7791e973BE16fbf5", // User provided address
    "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5", // vitalik.eth
    "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5", // nick.eth
  ];

  for (const address of addresses) {
    await reverseEnsLookup(address);
    console.log("---");
  }


// Run the script
main().catch(console.error);
