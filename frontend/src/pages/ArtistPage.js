import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ArtistPage = () => {
  const { api, theme } = useContext(AuthContext);
  const { id } = useParams();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/artists/${id}?with=releaseGroups.releases`)
      .then((res) => {
        setArtist(res.data.data);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке исполнителя:', err);
        setArtist(null);
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

  if (!artist) {
    return <p className={theme === 'dark' ? 'text-light' : ''}>Исполнитель не найден.</p>;
  }

  const groupedByType = artist.release_groups.reduce((acc, grp) => {
    const type = grp.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(grp);
    return acc;
  }, {});

  const headingClass = theme === 'dark' ? 'text-light' : '';
  const tableClass = theme === 'dark' ? 'table table-hover table-dark' : 'table table-hover';
  const sectionHeaderClass = theme === 'dark' ? 'text-light mt-4' : 'mt-4';

  return (
    <div>
      <h2 className={`mb-3 ${headingClass}`}>Исполнитель: {artist.name}</h2>
      <p className={headingClass}>
        <strong>Страна:</strong> {artist.country || '-'} <br />
        <strong>Тип:</strong> {artist.type} <br />
        <strong>Начало деятельности:</strong> {artist.created_at_real || '-'} <br />
        <strong>Окончание:</strong> {artist.ended_at || '-'}
      </p>

      <hr className={theme === 'dark' ? 'border-light' : ''} />

      <h5 className={headingClass}>Дискография</h5>
      {!artist.release_groups || artist.release_groups.length === 0 ? (
        <p className={headingClass}>У этого исполнителя нет групп релизов.</p>
      ) : (
        Object.keys(groupedByType).map((type) => {
          const groups = groupedByType[type].sort((a, b) => {
            const yearA = a.first_release_date ? new Date(a.first_release_date).getFullYear() : 0;
            const yearB = b.first_release_date ? new Date(b.first_release_date).getFullYear() : 0;
            return yearA - yearB;
          });

          const typeLabel = { album: 'Альбомы', ep: 'EP', single: 'Синглы', compilation: 'Компиляции', }[type] || type;

          return (
            <div key={type} className="mb-4">
              <h6 className={sectionHeaderClass}>{typeLabel}</h6>
              <div className="table-responsive">
                <table className={tableClass} style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '60%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Год</th>
                      <th>Название</th>
                      <th>Релизы</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((grp) => {
                      const year = grp.first_release_date ? new Date(grp.first_release_date).getFullYear() : '-';
                      const count = grp.releases ? grp.releases.length : 0;
                      return (
                        <tr key={grp.id}>
                          <td className={theme === 'dark' ? 'text-light' : ''}>
                            {year}
                          </td>
                          <td>
                            <Link to={`/release-group/${grp.id}`} className={theme === 'dark' ? 'text-info' : ''}> {grp.name} </Link>
                          </td>
                          <td className={theme === 'dark' ? 'text-light' : ''}>
                            {count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ArtistPage;
