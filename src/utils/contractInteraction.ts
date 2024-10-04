import { createWalletClient, custom } from 'viem';
import { Chain } from 'viem/chains';
import { CONTRACT_ADDRESS, CONTRACT_CHAIN_ID } from '../config/contractConfig';
import ExpensesBalancerABI from '../abi/ExpensesBalancerABI.json';
type WalletType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEthereumProvider: () => Promise<any>;
};
async function getChainById(chainId: number): Promise<Chain> {
  const chains = await import('viem/chains');
  const chain = Object.values(chains).find((c) => c.id === chainId);
  if (!chain) {
    console.error(`Chain with id ${chainId} not found. Falling back to sepolia.`);
    return chains.sepolia;
  }
  return chain;
}

export async function createSessionOnChain(wallet: WalletType, sessionId: number, invitedParticipants: string[]) {
  try {
    const provider = await wallet.getEthereumProvider();
    const chain = await getChainById(CONTRACT_CHAIN_ID);
    const walletClient = createWalletClient({
      chain,
      transport: custom(provider),
    });

    const [address] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'createSession',
      args: [BigInt(sessionId), invitedParticipants],
      account: address,
    });

    console.log('Transaction hash:', hash);
    return hash;
  } catch (error) {
    console.error('Error creating session on chain:', error);
    throw error;
  }
}
