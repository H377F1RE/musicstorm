import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginField, password);
      navigate('/');
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2>Вход</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="loginField" className="form-label"> Логин </label>
            <input type="text" className="form-control" id="loginField" value={loginField} onChange={(e) => setLoginField(e.target.value)} required placeholder="Введите ваш логин" />
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label"> Пароль </label>
            <div className="input-group">
              <input type={showPass ? 'text' : 'password'} className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass((prev) => !prev)} tabIndex={-1}>
                {showPass ? ( <i className="bi bi-eye-slash"></i> ) : ( <i className="bi bi-eye"></i> )}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary"> Войти </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
