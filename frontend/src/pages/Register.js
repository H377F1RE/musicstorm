import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loginAvailable, setLoginAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loginTimer, setLoginTimer] = useState(null);
  const [emailTimer, setEmailTimer] = useState(null);

  const [error, setError] = useState(null);
  useEffect(() => {
    setError(null);
  }, [login, email, password, confirmPassword]);

  const navigate = useNavigate();
  useEffect(() => {
    if (!login) {
      setLoginAvailable(null);
      setCheckingLogin(false);
      if (loginTimer) {
        clearTimeout(loginTimer);
        setLoginTimer(null);
      }
      return;
    }

    if (loginTimer) clearTimeout(loginTimer);

    const timer = setTimeout(async () => {
      setCheckingLogin(true);
      try {
        const res = await register.api.get( `/user/check-login?login=${encodeURIComponent(login)}` );
        setLoginAvailable(res.data.available);
      } catch {
        setLoginAvailable(null);
      } finally {
        setCheckingLogin(false);
      }
    }, 1000);

    setLoginTimer(timer);
    return () => clearTimeout(timer);
  }, [login]);

  useEffect(() => {
    if (!email) {
      setEmailAvailable(null);
      setCheckingEmail(false);
      if (emailTimer) {
        clearTimeout(emailTimer);
        setEmailTimer(null);
      }
      return;
    }

    if (emailTimer) clearTimeout(emailTimer);

    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await register.api.get( `/user/check-email?email=${encodeURIComponent(email)}` );
        setEmailAvailable(res.data.available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 1000);

    setEmailTimer(timer);
    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!login || !email || !password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }
    if (checkingLogin || checkingEmail) {
      setError('Пожалуйста, дождитесь результатов проверки логина и почты');
      return;
    }
    if (loginAvailable === false) {
      setError('Логин уже занят');
      return;
    }
    if (emailAvailable === false) {
      setError('Email уже занят');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await register(login, email, password, confirmPassword);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        const messages = [];
        for (const key in data) {
          if (Array.isArray(data[key])) {
            messages.push(...data[key]);
          } else {
            messages.push(data[key]);
          }
        }
        setError(messages[0] || 'Ошибка регистрации');
      } else {
        setError('Ошибка регистрации');
      }
    }
  };

  const isSubmitDisabled =
    !login ||
    !email ||
    !password ||
    !confirmPassword ||
    checkingLogin ||
    checkingEmail ||
    loginAvailable === false ||
    emailAvailable === false;

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login" className="form-label"> Логин </label>
            <input type="text" className="form-control" id="login" value={login} onChange={(e) => setLogin(e.target.value.trim())} placeholder="Введите ваш логин" />
            {checkingLogin && (
              <div className="form-text text-muted">Проверяем логин…</div>
            )}
            {loginAvailable === true && (
              <div className="form-text text-success">Логин свободен</div>
            )}
            {loginAvailable === false && (
              <div className="form-text text-danger">Логин уже занят</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label"> Email </label>
            <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="you@example.com" />
            {checkingEmail && (
              <div className="form-text text-muted">Проверяем почту…</div>
            )}
            {emailAvailable === true && (
              <div className="form-text text-success">Email свободен</div>
            )}
            {emailAvailable === false && (
              <div className="form-text text-danger">Email уже занят</div>
            )}
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label"> Пароль </label>
            <div className="input-group">
              <input type={showPass ? 'text' : 'password'} className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass((p) => !p)} tabIndex={-1} >
                {showPass ? ( <i className="bi bi-eye-slash"></i> ) : ( <i className="bi bi-eye"></i> )}
              </button>
            </div>
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="confirmPassword" className="form-label"> Подтвердите пароль </label>
            <div className="input-group">
              <input type={showPass ? 'text' : 'password'} className="form-control" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторите пароль" />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass((p) => !p)} tabIndex={-1} >
                {showPass ? ( <i className="bi bi-eye-slash"></i> ) : ( <i className="bi bi-eye"></i> )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && ( <div className="form-text text-danger">Пароли не совпадают</div> )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled} > Зарегистрироваться </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
