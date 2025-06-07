import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicProfilePage = () => {
  const { api, theme } = useContext(AuthContext);
  const { id } = useParams();

  const [userInfo, setUserInfo] = useState({ id: null, login: '' });
  const [lists, setLists] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await api.get(`/users/${id}`);
        const data = res.data.data || {};
        setUserInfo({ id: data.id, login: data.login, });
      } catch (err) {
        console.error('Ошибка при загрузке пользователя:', err);
        setUserInfo({ id: null, login: '' });
      } finally {
        setLoadingUser(false);
      }
    };

    const fetchLists = async () => {
      setLoadingLists(true);
      try {
        const res = await api.get(`/users/${id}/lists`);
        setLists(res.data.data || []);
      } catch (err) {
        console.error('Ошибка при загрузке публичных списков:', err);
        setLists([]);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchUser();
    fetchLists();
  }, [api, id]);

  if (loadingUser) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  if (!userInfo.id) {
    return (
      <p className={theme === 'dark' ? 'text-light' : ''}> Пользователь не найден. </p>
    );
  }

  return (
    <div>
      <h2 className={theme === 'dark' ? 'text-light mb-3' : 'mb-3'}> Профиль пользователя: {userInfo.login} </h2>
      {loadingLists ? (
        <div className="d-flex justify-content-center my-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка списков...</span>
          </div>
        </div>
      ) : lists.length === 0 ? (
        <p className={theme === 'dark' ? 'text-light' : 'text-muted'}> У этого пользователя нет публичных списков. </p>
      ) : (
        <div className="table-responsive">
          <table className={theme === 'dark' ? 'table table-hover table-dark' : 'table table-hover'} style={{ width: '100%' }}>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Название списка</th>
                <th>Создан</th>
                <th>Просмотр</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((lst, idx) => (
                <tr key={lst.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <Link to={`/user-list/${lst.id}`} className={theme === 'dark' ? 'text-info' : ''}> {lst.name} </Link>
                  </td>
                  <td className={theme === 'dark' ? 'text-light' : ''}>
                    {new Date(lst.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/user-list/${lst.id}`} className="btn btn-sm btn-outline-primary" > Открыть </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
