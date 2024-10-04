import LogButton from './LogButton';
import { ModeToggle } from './mode-toggle';

function Navbar() {
  return (
    <nav className="flex items-center justify-end p-4 w-full">
      <div className="flex items-center">
        <ModeToggle />
        <LogButton className="mr-4 ml-4" />
      </div>
    </nav>
  );
}

export default Navbar;
