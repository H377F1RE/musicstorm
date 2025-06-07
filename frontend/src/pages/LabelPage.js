import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LabelPage = () => {
  const { api, theme } = useContext(AuthContext);
  const { id } = useParams();

  const [label, setLabel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/labels/${id}?with=releases`)
      .then((res) => {
        setLabel(res.data.data);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке лейбла:', err);
        setLabel(null);
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

  if (!label) { return <p className={theme === 'dark' ? 'text-light' : ''}>Лейбл не найден.</p>; }

  const headingClass = theme === 'dark' ? 'text-light' : '';
  const listItemClass = theme === 'dark' ? 'list-group-item bg-dark text-light' : 'list-group-item';
  const linkClass = theme === 'dark' ? 'text-info' : '';

  return (
    <div>
      <h2 className={`mb-3 ${headingClass}`}>Лейбл: {label.name}</h2>
      <p className={headingClass}> <strong>Код страны:</strong> {label.country || '-'} </p>

      <hr className={theme === 'dark' ? 'border-light' : ''} />

      <h5 className={headingClass}>Релизы этого лейбла:</h5>
      <ul className="list-group">
        {label.releases && label.releases.length > 0 ? (
          label.releases.map((rel) => (
            <li key={rel.id} className={listItemClass}>
              <Link to={`/release/${rel.id}`} className={linkClass}> {rel.title} </Link>{' '}
              — <span className={theme === 'dark' ? 'text-light' : ''}>{rel.release_date}</span>
            </li>
          ))
        ) : (
          <li className={listItemClass}>Нет релизов.</li>
        )}
      </ul>
    </div>
  );
};

export default LabelPage;
