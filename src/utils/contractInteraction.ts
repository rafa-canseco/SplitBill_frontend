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

async function initializeClients(wallet?: WalletType) {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(RPC_URL),
    });
  }

  if (wallet && !walletClient) {
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

export async function checkoutSession(wallet: WalletType, sessionId: number, expenses: number[]) {
  try {
    await initializeClients(wallet);
    const [address] = await walletClient.getAddresses();

    const { result } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'checkout',
      args: [BigInt(sessionId), expenses.map(BigInt)],
      account: address,
    });
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'checkout',
      args: [BigInt(sessionId), expenses.map(BigInt)],
      account: address,
      chain: sepolia,
    });

    console.log('Checkout transaction hash:', hash);

    return result as bigint[];
  } catch (error) {
    console.error('Error checking out session:', error);
    throw error;
  }
}

export async function getParticipantPaymentStatus(sessionId: string, participantAddress: string): Promise<boolean> {
  try {
    await initializeClients();
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'getParticipantHasPaid',
      args: [BigInt(sessionId), participantAddress],
    });

    return result as boolean;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

export async function getSessionState(wallet: WalletType, sessionId: number): Promise<number> {
  try {
    await initializeClients();
    const result = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'sessions',
      args: [BigInt(sessionId)],
    })) as unknown[];

    return Number(result[3]);
  } catch (error) {
    console.error('Error getting session state:', error);
    throw error;
  }
}

export function getSessionStateString(stateNumber: number): string {
  switch (stateNumber) {
    case 0:
      return 'Pending';
    case 1:
      return 'Active';
    case 2:
      return 'AwaitingPayment';
    case 3:
      return 'Completed';
    default:
      return 'Unknown';
  }
}
export async function getParticipantBalance(sessionId: string, participantAddress: string): Promise<bigint> {
  try {
    await initializeClients(); // Initialize without wallet, as we only need publicClient
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'getParticipantBalance',
      args: [BigInt(sessionId), participantAddress],
    });

    return result as bigint;
  } catch (error) {
    console.error('Error getting participant balance:', error);
    throw error;
  }
}
