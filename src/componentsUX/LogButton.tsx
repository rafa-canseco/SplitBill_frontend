import {Button} from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "react-router-dom"

interface LogButtonProps {
  className?: string
}

function LogButton({ className }: LogButtonProps) {
  const { ready, authenticated, login, logout } = usePrivy();
  const navigate = useNavigate();
  
  const handleClick = async () => {
    if (authenticated) {
      await logout();
      navigate("/Dashboard");
    } else { 
      await login();
    }
  }
  
  return (
    <Button className={className} onClick={handleClick}
    >
      {authenticated ? "Log out" : "Log in"}
    </Button>
  
    
    )
}

export default LogButton