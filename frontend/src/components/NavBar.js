import { Link } from "react-router-dom";

const Navbar = () => {

  return (
    <header>
      <div className="container">
        <Link to="/">
          <h3>Planning Poker</h3>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
