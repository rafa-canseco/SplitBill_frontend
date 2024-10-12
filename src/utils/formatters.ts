import { formatUnits } from 'viem';
const WEI_DECIMALS = 18;
export const formatBalance = (balanceInWei: bigint): string => {
  return parseFloat(formatUnits(balanceInWei, WEI_DECIMALS)).toFixed(2);
};
