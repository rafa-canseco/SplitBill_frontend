import { createPublicClient, createWalletClient, custom, http, PublicClient, WalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRACT_ADDRESS, RPC_URL } from '../config/contractConfig';
import ExpensesBalancerABI from '../abi/ExpensesBalancerABI.json';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}
interface WalletType {
  getEthereumProvider: () => Promise<EthereumProvider>;
}

let publicClient: PublicClient;
let walletClient: WalletClient;

async function initializeClients(wallet: WalletType) {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });
  }

  if (!walletClient) {
    const provider = await wallet.getEthereumProvider();
    walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(provider),
    });
  }
}

export async function createSessionOnChain(wallet: WalletType, invitedParticipants: string[]) {
  try {
    await initializeClients(wallet);
    const [address] = await walletClient.getAddresses();

    const { result } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'createSession',
      args: [invitedParticipants],
      account: address,
    });

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'createSession',
      args: [invitedParticipants],
      account: address,
      chain: sepolia,
    });

    const sessionId = Number(result);

    return { sessionId, hash };
  } catch (error) {
    console.error('Error creating session on chain:', error);
    throw error;
  }
}

export async function joinSessionOnChain(wallet: WalletType, sessionId: number) {
  try {
    await initializeClients(wallet);
    const [address] = await walletClient.getAddresses();

    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'joinSession',
      args: [BigInt(sessionId)],
      account: address,
      chain: sepolia,
    });

    return hash;
  } catch (error) {
    console.error('Error joining session on chain:', error);
    throw error;
  }
}

export async function checkAllParticipantsJoined(wallet: WalletType, sessionId: number): Promise<boolean> {
  try {
    await initializeClients(wallet);

    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'allParticipantsJoined',
      args: [BigInt(sessionId)],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error checking if all participants joined:', error);
    throw error;
  }
}
