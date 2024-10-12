import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBalance } from '@/utils/formatters';

export function ParticipantTable({ participants, balances, statuses, loadingProgress }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">Balance</TableHead>
          <TableHead className="text-center">Payment Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>{participant.name}</TableCell>
            <TableCell>
              {loadingProgress < 100
                ? 'Loading...'
                : `$${formatBalance(balances[participant.walletAddress] || BigInt(0))}`}
            </TableCell>
            <TableCell>
              {loadingProgress < 100 ? 'Loading...' : statuses[participant.walletAddress] ? 'Paid' : 'Pending'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
