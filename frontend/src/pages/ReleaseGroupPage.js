import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ReleaseGroupPage = () => {
  const { api, theme } = useContext(AuthContext);
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/release-groups/${id}?with=artist.releases`)
      .then((res) => {
        setGroup(res.data.data);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке группы релизов:', err);
        setGroup(null);
      })
      .finally(() => setLoading(false));
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

  if (!group) { return <p className={theme === 'dark' ? 'text-light' : ''}>Группа релизов не найдена.</p>; }

  const listItemClass = theme === 'dark' ? 'list-group-item bg-dark text-light' : 'list-group-item';
  const headingClass = theme === 'dark' ? 'text-light' : '';

  return (
    <div>
      <h2 className={`mb-3 ${headingClass}`}>Группа релизов: {group.name}</h2>
      <p className={headingClass}>
        <strong>Исполнитель: </strong>
        <Link to={`/artist/${group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''}> {group.artist.name} </Link>
      </p>
      <p className={headingClass}>
        <strong>Тип:</strong> {group.type} <br />
        <strong>Первая дата релиза:</strong> {group.first_release_date || '-'}
      </p>

      <hr className={theme === 'dark' ? 'border-light' : ''} />

      <h5 className={headingClass}>Релизы в группе:</h5>
      {group.releases && group.releases.length > 0 ? (
        <ul className="list-group">
          {group.releases.map((r) => (
            <li key={r.id} className={listItemClass}>
              <Link to={`/release/${r.id}`} className={theme === 'dark' ? 'text-info' : ''}> {r.title} </Link>{' '}
              — {r.release_date || '-'}
            </li>
          ))}
        </ul>
      ) : (
        <p className={headingClass}>Нет релизов в этой группе.</p>
      )}
    </div>
  );
};

export default ReleaseGroupPage;
