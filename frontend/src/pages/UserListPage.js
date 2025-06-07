import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserListPage = () => {
  const { api, theme } = useContext(AuthContext);
  const { id } = useParams();

  const [listName, setListName] = useState('');
  const [owner, setOwner] = useState({ id: null, login: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .get(`/user/lists/${id}`)
      .then((res) => {
        const payload = res.data.data || {};
        setListName(payload.list_name || '');
        setOwner({
          id: payload.owner?.id || null,
          login: payload.owner?.login || '',
        });
        setItems(Array.isArray(payload.releases) ? payload.releases : []);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке списка:', err);
        setListName('');
        setOwner({ id: null, login: '' });
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api, id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className={theme === 'dark' ? 'text-light mb-1' : 'mb-1'}>
        {listName || 'Безымянный список'}
      </h1>

      {owner.id ? (
        <p className={ theme === 'dark' ? 'text-light mb-4 small' : 'text-muted mb-4 small' } >
          Владелец:{' '}
          <Link to={`/users/${owner.id}`} className={theme === 'dark' ? 'text-info' : ''} > {owner.login} </Link>
        </p>
      ) : (
        <p className={theme === 'dark' ? 'text-light mb-4 small' : 'text-muted mb-4 small'}> Владелец: {owner.login || 'Неизвестен'} </p>
      )}

      {items.length === 0 ? (
        <p className={theme === 'dark' ? 'text-light' : 'text-muted'}> Список пуст. </p>
      ) : (
        <div className="table-responsive">
          <table className={theme === 'dark' ? 'table table-hover table-dark' : 'table table-hover'} style={{ width: '100%' }} >
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '45%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Название</th>
                <th>Исполнитель</th>
                <th>Дата релиза</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const artistName = item.release_group && item.release_group.artist ? item.release_group.artist.name : '-';
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Link to={`/release/${item.id}`} className={theme === 'dark' ? 'text-info' : ''} > {item.title} </Link>
                    </td>
                    <td>
                      {item.release_group && item.release_group.artist ? (
                        <Link to={`/artist/${item.release_group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''} > {artistName} </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={theme === 'dark' ? 'text-light' : ''}> {item.release_date || '-'} </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
