import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ITEMS_PER_PAGE = 10;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Search = () => {
  const { api, theme } = useContext(AuthContext);
  const query = useQuery();
  const type = query.get('type') || '';
  const q = query.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [type, q]);

  useEffect(() => {
    let endpoint = null;
    switch (type) {
      case 'artist':
        endpoint =
          q.trim() === '' ? '/artists' : `/artists?search=${encodeURIComponent(q)}`;
        break;
      case 'release':
        endpoint =
          q.trim() === '' ? '/releases' : `/releases?search=${encodeURIComponent(q)}`;
        break;
      case 'label':
        endpoint =
          q.trim() === '' ? '/labels' : `/labels?search=${encodeURIComponent(q)}`;
        break;
      case 'track':
        endpoint =
          q.trim() === '' ? '/tracks' : `/tracks?search=${encodeURIComponent(q)}`;
        break;
      case 'user':
        endpoint =
          q.trim() === '' ? '/users' : `/users?search=${encodeURIComponent(q)}`;
        break;
      default:
        endpoint = null;
    }

    if (!endpoint) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        setResults(res.data.data || []);
      })
      .catch((err) => {
        console.error('Ошибка при поиске:', err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [type, q, api]);

  const sortedResults = useMemo(() => {
    if (!sortField) return results;

    return [...results].sort((a, b) => {
      if (sortField === 'alpha') {
        let aVal = '';
        let bVal = '';
        if (type === 'artist') {
          aVal = a.name || '';
          bVal = b.name || '';
        } else if (type === 'release') {
          aVal = a.title || '';
          bVal = b.title || '';
        } else if (type === 'label') {
          aVal = a.name || '';
          bVal = b.name || '';
        } else if (type === 'track') {
          aVal = a.title || '';
          bVal = b.title || '';
        } else if (type === 'user') {
          aVal = a.login || '';
          bVal = b.login || '';
        }

        const comparison = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (sortField === 'date' && type === 'release') {
        const aDate = a.release_date || '';
        const bDate = b.release_date || '';
        if (!aDate && !bDate) return 0;
        if (!aDate) return sortOrder === 'asc' ? 1 : -1;
        if (!bDate) return sortOrder === 'asc' ? -1 : 1;
        const comparison = aDate.localeCompare(bDate);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }, [results, sortField, sortOrder, type]);

  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const currentData = sortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (!type) { return <p className={theme === 'dark' ? 'text-light' : ''}>Неверный тип поиска.</p>; }

  const tableClass =
    theme === 'dark' ? 'table table-hover table-dark' : 'table table-hover';
  const headingClass = theme === 'dark' ? 'text-light' : '';

  const renderSortButtons = () => (
    <div className="d-flex flex-wrap justify-content-end mb-2">
      <button className={`btn btn-sm btn-outline-primary mx-1 ${sortField === 'alpha' && sortOrder === 'asc' ? 'active' : ''}`} onClick={() => { setSortField('alpha'); setSortOrder('asc'); }} title="По алфавиту ↑" >
        <i className="bi bi-sort-alpha-down"></i>
      </button>

      <button className={`btn btn-sm btn-outline-primary mx-1 ${sortField === 'alpha' && sortOrder === 'desc' ? 'active' : ''}`} onClick={() => { setSortField('alpha'); setSortOrder('desc'); }} title="По алфавиту ↓" >
        <i className="bi bi-sort-alpha-up"></i>
      </button>

      {type === 'release' && (
        <>
          <button className={`btn btn-sm btn-outline-primary mx-1 ${sortField === 'date' && sortOrder === 'asc' ? 'active' : ''}`} onClick={() => { setSortField('date'); setSortOrder('asc'); }} title="По дате ↑" >
            <i className="bi bi-sort-numeric-down"></i>
          </button>
          <button className={`btn btn-sm btn-outline-primary mx-1 ${sortField === 'date' && sortOrder === 'desc' ? 'active' : ''}`} onClick={() => { setSortField('date'); setSortOrder('desc'); }} title="По дате ↓" >
            <i className="bi bi-sort-numeric-up"></i>
          </button>
        </>
      )}
    </div>
  );
  const typeLabels = { artist: 'Исполнители', release: 'Релизы', label: 'Лейблы', track: 'Треки', user: 'Пользователи', };

  const categoryName = typeLabels[type] || typeLabels.user;
  const trimmedQuery = q.trim();
  const headingText = trimmedQuery ? `Поиск по “${trimmedQuery}” в категории “${categoryName}”` : `Поиск по всем в категории “${categoryName}”`;

  return (
    <div className="container my-4">
      <h3 className={`mb-3 ${headingClass}`}> {headingText} </h3>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : results.length === 0 ? (
        <p className={headingClass}>Ничего не найдено.</p>
      ) : (
        <>
          {renderSortButtons()}
          {type === 'artist' && (
            <div className="table-responsive">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Страна</th>
                    <th>Тип</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/artist/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.name} </Link>
                      </td>
                      <td className={theme === 'dark' ? 'text-light' : ''}>
                        {item.country || '-'}
                      </td>
                      <td className={theme === 'dark' ? 'text-light' : ''}>
                        {item.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {type === 'release' && (
            <div className="table-responsive">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Группа релизов</th>
                    <th>Дата релиза</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => {
                    const groupName = item.release_group ? item.release_group.name : '-';
                    return (
                      <tr key={item.id}>
                        <td>
                          <Link to={`/release/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.title} </Link>
                        </td>
                        <td>
                          {item.release_group ? (
                            <Link to={`/release-group/${item.release_group.id}`} className={theme === 'dark' ? 'text-info' : ''}> {groupName} </Link>
                          ) : (
                            <span className={theme === 'dark' ? 'text-light' : ''}> - </span>
                          )}
                        </td>
                        <td className={theme === 'dark' ? 'text-light' : ''}>
                          {item.release_date || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {type === 'label' && (
            <div className="table-responsive">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Код страны</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/label/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.name} </Link>
                      </td>
                      <td className={theme === 'dark' ? 'text-light' : ''}>
                        {item.country || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {type === 'track' && (
            <div className="table-responsive">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>ISRC</th>
                    <th>Длительность, с</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id}>
                      <td className={theme === 'dark' ? 'text-light' : ''}>
                        {item.title}
                      </td>
                      <td className={theme === 'dark' ? 'text-light' : ''}>
                        {item.isrc || '-'}
                      </td>
                      <td className={theme === 'dark' ? 'text-light' : ''}>
                        {item.duration || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {type === 'user' && (
            <div className="table-responsive">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Логин</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/users/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.login} </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center mt-3">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}> ← </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(i + 1)}> {i + 1} </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}> → </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
