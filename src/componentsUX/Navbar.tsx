import LogButton from './LogButton';
import { ModeToggle } from './mode-toggle';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import HomeSvg from '@/assets/home.svg';

function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 w-full">
      <Link to="/" className="flex items-center ml-10">
        <Avatar className="bg-white">
          <AvatarImage src={HomeSvg} alt="Home" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex items-center">
        <ModeToggle />
        <LogButton className="mr-4 ml-4" />
      </div>
    </nav>
  );
}

export default Navbar;
