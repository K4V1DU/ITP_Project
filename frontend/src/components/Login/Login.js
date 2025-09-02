import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const history = useNavigate();
  const [user, setUser] = useState({ username: "", password: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/Users/login", {
        username: user.username,
        password: user.password
      });
  
      if (response.data.status === "ok") {
        alert("Login Success");
        const role = response.data.user.role;
  
        if (role === "Admin") {
          history("/users");

        } else if (role === "Customer") {
          history("/home");

        }  else if (role === "Marketing Manager") {
            history("/Contact");  //meka wenas karanna oni........

        } else {
          history("/login");
        }
      } else {
        alert(response.data.message || "Login Error");
      }
    } catch (err) {
      alert("error: " + err.message);
    }
  };

  
  return (
    <div>
      <h1>User Login</h1>
      <form onSubmit={handleSubmit}>
        <label>User Name</label><br />
        <input
          type="text"
          value={user.username}
          onChange={handleInputChange}
          name="username"
          required
        />
        <br /><br />

        <label>Password</label><br />
        <input
          type="password"
          value={user.password}
          onChange={handleInputChange}
          name="password"
          required
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
