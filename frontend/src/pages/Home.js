import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const Home = () => {
  const { api, theme } = useContext(AuthContext);

  const [viewType, setViewType] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/releases?with=releaseGroup.artist')
      .then((res) => {
        setReleases(res.data.data || []);
      })
      .catch((err) => {
        console.error('Ошибка загрузки релизов:', err);
        setReleases([]);
      })
      .finally(() => setLoading(false));
  }, [api]);

  const totalPages = Math.ceil(releases.length / ITEMS_PER_PAGE);

  const currentData = releases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  const tableClass = theme === 'dark' ? 'table table-striped table-dark' : 'table table-striped';
  const textClass = theme === 'dark' ? 'text-light' : '';

  return (
    <div>
      <h2 className="mb-4">Последние релизы</h2>

      <div className="d-flex justify-content-start mb-2">
        <button className={`btn btn-sm me-2 ${viewType === 'table' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('table')}> Таблица </button>
        <button className={`btn btn-sm ${viewType === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('list')}> Список </button>
      </div>

      {viewType === 'table' ? (
        <div className="table-responsive">
          <table className={tableClass} style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
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
              {currentData.map((item) => {
                const artistName = item.release_group && item.release_group.artist ? item.release_group.artist.name : '-';
                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      <Link to={`/release/${item.id}`}>{item.title}</Link>
                    </td>
                    <td>
                      {item.release_group && item.release_group.artist ? (
                        <Link to={`/artist/${item.release_group.artist.id}`}> {artistName} </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{item.release_date || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="list-group">
          {currentData.map((item) => {
            const artistName = item.release_group && item.release_group.artist ? item.release_group.artist.name : '-';
            return (
              <li className={`list-group-item d-flex justify-content-between align-items-center ${theme === 'dark' ? 'bg-dark text-light' : ''}`} key={item.id}>
                <div>
                  <h5 className={`mb-1 ${textClass}`}>
                    <Link to={`/release/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.title} </Link>
                  </h5>
                  <small className={textClass}>
                    {item.release_group && item.release_group.artist ? (
                      <Link to={`/artist/${item.release_group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''}> {artistName} </Link>
                    ) : (
                      '-'
                    )}
                  </small>
                </div>
                <small className={textClass}>{item.release_date || '-'}</small>
              </li>
            );
          })}
        </ul>
      )}
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center mt-3">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}> ← </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}> → </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;