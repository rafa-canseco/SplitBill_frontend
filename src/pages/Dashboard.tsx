import LogButton from "@/componentsUX/LogButton"
import { usePrivy } from '@privy-io/react-auth';



function Dashboard() {
      const { user } = usePrivy();
  return (
    <div>
      <LogButton className="mt-4"/>
      <h1>Dashboard</h1>
      <p>You're logged in! !</p>
      <li>Wallet: {user.wallet ? user.wallet.address : 'None'}</li>

    </div>
  )
}

export default Dashboard