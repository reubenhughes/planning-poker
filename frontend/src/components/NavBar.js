import { Link } from "react-router-dom";
import Switch from "@mui/material/Switch";

const Navbar = () => {
  // handles light and dark mode switching
  const switchTheme = (e) => {
    if (e.target.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  return (
    <header>
      <div className="container">
        <Link to="/">
          <h2>Planning Poker</h2>
        </Link>
        <span>
          <Switch onChange={switchTheme} />
        </span>
      </div>
    </header>
  );
};

export default Navbar;
