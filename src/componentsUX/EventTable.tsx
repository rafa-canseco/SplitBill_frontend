import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBalance } from '@/utils/formatters';

export function EventTable({ events }) {
  if (!events) return <p>Loading events...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Event Type</TableHead>
          <TableHead className="text-center">Transaction Hash</TableHead>
          <TableHead className="text-center">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...events.paymentMade, ...events.paymentReceived, ...events.balanceSettled].map((event, index) => (
          <TableRow key={index}>
            <TableCell>{event.eventName}</TableCell>
            <TableCell>
              <a
                href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {event.transactionHash.slice(0, 10)}...
              </a>
            </TableCell>
            <TableCell>${formatBalance(event.args.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
