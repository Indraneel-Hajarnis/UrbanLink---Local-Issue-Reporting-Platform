import { Link } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  return (
    <div className="page-center">
      <div className="card">
        <h2>User Registration</h2>

        <form>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />

          <button className="btn">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
