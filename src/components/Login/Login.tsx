import React, { useState } from 'react';
import './Login.css'; // Make sure to create a corresponding SCSS file for styling
import { useDispatch, useSelector } from 'react-redux';
import { AsyncThunkAction } from '@reduxjs/toolkit';
import { AsyncThunkConfig } from '@reduxjs/toolkit/dist/createAsyncThunk';
// import { loginPage } from '../../redux/authReducer';
import { fetchUser } from '../../redux/authReducer';
import { register } from '../../redux/authReducer';
import { useNavigate } from 'react-router-dom';


const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serError, setSerError] = useState('');
  const dispatch = useDispatch();
  const {loading, error} = useSelector((state: any) => state.login);
  const userinfo = useSelector((state: any) => state.login);
  let navigate = useNavigate();

  const handleLogin = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const loginPromise = dispatch(fetchUser({username, password}) as any);
    loginPromise
    .then((res: any) => { 
      if(res.payload.detail === "Incorrect username or password"){
        window.alert("Incorrect username or password");
        return;
      }
      else{
        navigate('/chat');
      }
    })
  };

  const handleRegister = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const registerPromise = dispatch(register({username, password}) as any);
    registerPromise.then((res: any) => {
      navigate('/chat');
    });
  };


  const togglePassword = () => {
    setShowPassword(!showPassword);
  }

  return (
    <div className="login-container">
      <form 
      // onSubmit={handleSubmit} 
      className="login-form">
        <h1>Login</h1>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            // type="email"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i

            style={{
              position: 'absolute',
              cursor: 'pointer',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            className={`psswrd_icon ${showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}`}
            onClick={togglePassword}
            ></i>
        </div>
        <button 
          // type="submit" 
          onClick={handleLogin} className="login-button">Log In</button>
        <br />
        <button 
          // type="submit" 
          onClick={handleRegister} className="login-button">Regiser</button>
      </form>
    </div>
  );
};

export default Login;


