import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ReleasePage = () => {
  const { api, theme } = useContext(AuthContext);
  const { id } = useParams();

  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCollection, setInCollection] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(true);

  const [userLists, setUserLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);

  const formatDuration = (seconds) => {
    if (seconds == null || isNaN(seconds)) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const paddedSecs = secs < 10 ? `0${secs}` : secs;
    return `${mins}:${paddedSecs}`;
  };

  useEffect(() => {
    setLoading(true);
    api
      .get(`/releases/${id}?with=releaseGroup.artist,label,media.tracks`)
      .then((res) => {
        setRelease(res.data.data);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке релиза:', err);
        setRelease(null);
      })
      .finally(() => setLoading(false));
  }, [api, id]);

  useEffect(() => {
    setMembershipLoading(true);
    Promise.all([
      api.get('/user/collection'),
      api.get('/user/wishlist'),
    ])
      .then(([colRes, wishRes]) => {
        const collection = colRes.data.data || [];
        const wishlist = wishRes.data.data || [];
        setInCollection(collection.some((r) => r.id === Number(id)));
        setInWishlist(wishlist.some((r) => r.id === Number(id)));
      })
      .catch((err) => {
        console.error('Ошибка при проверке membership:', err);
        setInCollection(false);
        setInWishlist(false);
      })
      .finally(() => setMembershipLoading(false));
  }, [api, id]);

  useEffect(() => {
    setListsLoading(true);
    api
      .get('/user/lists')
      .then((res) => {
        setUserLists(res.data.data || []);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке пользовательских списков:', err);
        setUserLists([]);
      })
      .finally(() => setListsLoading(false));
  }, [api]);

  const toggleCollection = async () => {
    if (membershipLoading) return;
    try {
      if (inCollection) {
        await api.delete(`/user/collection/${id}`);
        setInCollection(false);
      } else {
        await api.post('/user/collection', { release_id: id });
        setInCollection(true);
      }
    } catch (err) {
      console.error('Ошибка при изменении коллекции:', err);
      alert('Не удалось обновить коллекцию.');
    }
  };

  const toggleWishlist = async () => {
    if (membershipLoading) return;
    try {
      if (inWishlist) {
        await api.delete(`/user/wishlist/${id}`);
        setInWishlist(false);
      } else {
        await api.post('/user/wishlist', { release_id: id });
        setInWishlist(true);
      }
    } catch (err) {
      console.error('Ошибка при изменении желаемого:', err);
      alert('Не удалось обновить желаемое.');
    }
  };

  const addToUserList = async () => {
    if (listsLoading) return;
    if (!userLists || userLists.length === 0) {
      alert('У вас нет пользовательских списков.');
      return;
    }
    const listOptions = userLists
      .map((lst, idx) => `${idx + 1}. ${lst.name}`)
      .join('\n');
    const input = window.prompt(
      `Выберите номер списка, в который добавить релиз:\n${listOptions}`
    );
    if (!input) return;
    const selectedIndex = parseInt(input, 10) - 1;
    if (
      isNaN(selectedIndex) ||
      selectedIndex < 0 ||
      selectedIndex >= userLists.length
    ) {
      alert('Неверный номер списка.');
      return;
    }
    const listId = userLists[selectedIndex].id;
    try {
      await api.post(`/user/lists/${listId}/items`, { release_id: id });
      alert('Релиз добавлен в список.');
    } catch (err) {
      console.error('Ошибка при добавлении в список:', err);
      alert('Не удалось добавить релиз в список.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (!release) {
    return <p className={theme === 'dark' ? 'text-light' : ''}>Релиз не найден.</p>;
  }

  const tableClass = theme === 'dark' ? 'table table-striped table-dark' : 'table table-striped';
  const durationTextClass = theme === 'dark' ? 'text-light' : 'text-muted';
  const btnCollectionClass = inCollection ? 'btn btn-outline-danger' : 'btn btn-outline-success';
  const btnWishlistClass = inWishlist ? 'btn btn-outline-danger' : 'btn btn-outline-primary';

  return (
    <div>
      <h2 className={theme === 'dark' ? 'text-light mb-3' : 'mb-3'}> Релиз: {release.title} </h2>
      <p className={theme === 'dark' ? 'text-light' : ''}>
        <strong>Дата релиза:</strong> {release.release_date || '-'} <br />
        <strong>Группа релизов:</strong>{' '}
        {release.release_group ? (
          <Link to={`/release-group/${release.release_group.id}`} className={theme === 'dark' ? 'text-info' : ''}> {release.release_group.name} </Link>
        ) : (
          '-'
        )}
        <br />
        <strong>Исполнитель:</strong>{' '}
        {release.release_group && release.release_group.artist ? (
          <Link to={`/artist/${release.release_group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''}> {release.release_group.artist.name} </Link>
        ) : (
          '-'
        )}
        <br />
        <strong>Лейбл:</strong>{' '}
        {release.label ? (
          <Link to={`/label/${release.label.id}`} className={theme === 'dark' ? 'text-info' : ''}> {release.label.name} </Link>
        ) : (
          '-'
        )}
        <br />
        <strong>Код страны:</strong> {release.country || '-'} <br />
        <strong>Каталожный номер:</strong> {release.catalog_number || '-'} <br />
        <strong>Штрихкод:</strong> {release.barcode || '-'}
      </p>

      <div className="mb-4">
        <button className={`${btnCollectionClass} me-2`} onClick={toggleCollection} disabled={membershipLoading}>
          {inCollection ? 'Убрать из коллекции' : 'В коллекцию'}
        </button>
        <button className={`${btnWishlistClass} me-2`} onClick={toggleWishlist} disabled={membershipLoading}>
          {inWishlist ? 'Убрать из желаемого' : 'В желаемое'}
        </button>
        <button className="btn btn-outline-primary" onClick={addToUserList} disabled={membershipLoading || listsLoading}> В список </button>
      </div>

      <hr />

      {release.media && release.media.length > 0 ? (
        release.media.map((m) => {
          const totalSeconds = m.tracks ? m.tracks.reduce((sum, t) => sum + (t.duration || 0), 0) : 0;
          const totalFormatted = formatDuration(totalSeconds);
          return (
            <div key={m.id} className="mb-4">
              <h6 className="mb-3">
                {m.position || '1'} {m.format} —{' '}
                <small className={durationTextClass}>
                  Общая длительность: {totalFormatted}
                </small>
              </h6>

              {m.tracks && m.tracks.length > 0 ? (
                <div className="table-responsive">
                  <table className={tableClass}>
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Название трека</th>
                        <th scope="col">Продолжительность</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.tracks.map((t) => (
                        <tr key={t.id}>
                          <td>{t.position || '-'}</td>
                          <td>{t.title}</td>
                          <td>{formatDuration(t.duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={theme === 'dark' ? 'text-light' : ''}>Нет треков на этом носителе.</p>
              )}
            </div>
          );
        })
      ) : (
        <p className={theme === 'dark' ? 'text-light' : ''}>Нет носителей для этого релиза.</p>
      )}
    </div>
  );
};

export default ReleasePage;
