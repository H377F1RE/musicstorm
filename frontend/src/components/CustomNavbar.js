import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CustomNavbar = () => {
  const { role, logout, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchType, setSearchType] = useState('artist');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const commonClasses = 'navbar navbar-expand-lg';
  const themeClasses = theme === 'light' ? 'navbar-light' : 'navbar-dark';
  const navStyle = { background: theme === 'light' ? 'linear-gradient(90deg, #e3f2fd, #bbdefb)' : 'linear-gradient(90deg, #1e3c72, #2a5298)', transition: 'background 0.3s ease', };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate( `/search?type=${searchType}&q=${encodeURIComponent( searchQuery.trim() )}` );
  };

  return (
    <nav className={`${commonClasses} ${themeClasses}`} style={navStyle}>
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation" >
          <span className="navbar-toggler-icon" />
        </button>
        <Link className="navbar-brand mx-auto mx-lg-0" to="/" >
          MusicStorm
        </Link>
        <div className="collapse navbar-collapse" id="navbarContent">
          <form className="d-flex mx-auto" style={{ maxWidth: '600px', width: '100%' }} onSubmit={handleSearchSubmit} >
            <input className="form-control me-2" type="search" placeholder="Введите запрос" aria-label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <select className="form-select me-2" style={{ maxWidth: '150px' }} value={searchType} onChange={(e) => setSearchType(e.target.value)} >
              <option value="artist">Исполнитель</option>
              <option value="release">Релиз</option>
              <option value="label">Лейбл</option>
              <option value="track">Трек</option>
              <option value="user">Пользователь</option>
            </select>
            <button className="btn btn-success" type="submit">
              Найти
            </button>
          </form>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {role === 'guest' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Регистрация
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Вход
                  </Link>
                </li>
              </>
            )}

            {role === 'user' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Профиль
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn nav-link" style={{ cursor: 'pointer' }} onClick={handleLogout} >
                    Выход
                  </button>
                </li>
              </>
            )}

            {role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    Профиль
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    Админ панель
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn nav-link" style={{ cursor: 'pointer' }} onClick={handleLogout} >
                    Выход
                  </button>
                </li>
              </>
            )}

            <li className="nav-item">
              <button className="btn nav-link" style={{ cursor: 'pointer' }} onClick={toggleTheme} >
                {theme === 'light' ? (
                  <> Светлая <i className="bi bi-sun-fill me-1" /> </>
                ) : (
                  <> Тёмная <i className="bi bi-moon-fill me-1" /> </>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default CustomNavbar;
