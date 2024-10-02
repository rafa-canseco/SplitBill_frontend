import { usePrivy } from "@privy-io/react-auth"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import LogButton from "@/componentsUX/LogButton"

function Home() {
  const { authenticated, ready } = usePrivy();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && authenticated) {
      navigate("/dashboard");
    }
  }, [authenticated,navigate,ready])


  return (
    <div>
      <h1>Enter the dApp </h1>
    <LogButton className="mt-4"/>
    </div>
  )
}

export default Home