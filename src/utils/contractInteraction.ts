import { createPublicClient, createWalletClient, custom, http, PublicClient, WalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRACT_ADDRESS, RPC_URL, USDC_ADDRESS } from '../config/contractConfig';
import ExpensesBalancerABI from '../abi/ExpensesBalancerABI.json';
import ERC20abi from '../abi/ERC20abi.json';
import { parseUnits } from 'viem';

const WEI_DECIMALS = 18;

function convertToWei(amount: number): bigint {
  return parseUnits(amount.toString(), WEI_DECIMALS);
}

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

    // Convertir las cantidades a wei
    const expensesInWei = expenses.map((expense) => convertToWei(expense));

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'checkout',
      args: [BigInt(sessionId), expensesInWei],
      account: address,
    });
    const hash = await walletClient.writeContract(request);

    console.log('Checkout transaction hash:', hash);

    return hash;
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
    await initializeClients();
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
async function checkAllowance(userAddress: string, amount: bigint): Promise<boolean> {
  const allowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20abi,
    functionName: 'allowance',
    args: [userAddress, CONTRACT_ADDRESS],
  });

  return allowance >= amount;
}

async function approveUSDC(wallet: WalletType, amount: bigint): Promise<string> {
  const [address] = await walletClient.getAddresses();

  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20abi,
    functionName: 'approve',
    args: [CONTRACT_ADDRESS, amount],
    account: address,
    chain: sepolia,
  });

  return hash;
}

export async function makePaymentOnChain(wallet: WalletType, sessionId: number, amountToPayInUSDC: number) {
  try {
    await initializeClients(wallet);
    const [address] = await walletClient.getAddresses();

    const amountToPayInWei = convertToWei(amountToPayInUSDC);

    console.log(`Amount to pay in USDC: ${amountToPayInUSDC}`);
    console.log(`Amount to pay in Wei: ${amountToPayInWei.toString()}`);

    console.log(`Amount to pay in USDC: ${amountToPayInUSDC}`);
    console.log(`Amount to pay in Wei: ${amountToPayInWei.toString()}`);

    // Verificar y establecer el allowance si es necesario
    const hasAllowance = await checkAllowance(address, amountToPayInWei);
    if (!hasAllowance) {
      console.log('Insufficient allowance. Requesting approval...');
      const approvalHash = await approveUSDC(wallet, amountToPayInWei);
      console.log('Approval transaction hash:', approvalHash);
      // Esperar a que la transacción de aprobación se confirme
      await publicClient.waitForTransactionReceipt({ hash: approvalHash });
    }

    // Simulate the transaction
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      functionName: 'makePayment',
      args: [BigInt(sessionId)],
      account: address,
    });

    // If simulation is successful, proceed with the actual transaction
    const hash = await walletClient.writeContract(request);

    console.log('Payment transaction hash:', hash);
    return hash;
  } catch (error) {
    console.error('Error making payment:', error);
    throw error;
  }
}

export async function getSessionEvents(sessionId: number) {
  try {
    await initializeClients();

    // Obtener el bloque actual
    const currentBlock = await publicClient.getBlockNumber();

    // Calcular el bloque de inicio (por ejemplo, 10000 bloques atrás o desde el genesis si es menos)
    const fromBlock = currentBlock - BigInt(10000) > 0 ? currentBlock - BigInt(10000) : BigInt(0);

    const events = await publicClient.getContractEvents({
      address: CONTRACT_ADDRESS,
      abi: ExpensesBalancerABI,
      fromBlock,
      toBlock: currentBlock,
      events: ['PaymentMade', 'PaymentReceived', 'BalanceSettled'],
      args: {
        sessionId: BigInt(sessionId),
      },
    });

    // Filtrar y organizar los eventos
    const paymentMadeEvents = events.filter((e) => e.eventName === 'PaymentMade');
    const paymentReceivedEvents = events.filter((e) => e.eventName === 'PaymentReceived');
    const balanceSettledEvents = events.filter((e) => e.eventName === 'BalanceSettled');

    return {
      paymentMade: paymentMadeEvents,
      paymentReceived: paymentReceivedEvents,
      balanceSettled: balanceSettledEvents,
    };
  } catch (error) {
    console.error('Error getting session events:', error);
    throw error;
  }
}
