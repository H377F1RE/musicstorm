import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const Profile = () => {
  const { api, user, theme } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({ login: user.login, email: user.email });

  const [editLogin, setEditLogin] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loginAvailable, setLoginAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loginTimer, setLoginTimer] = useState(null);
  const [emailTimer, setEmailTimer] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [notification, setNotification] = useState(null);

  const [activeTab, setActiveTab] = useState('collection');
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedListReleases, setSelectedListReleases] = useState([]);

  const [collectionPage, setCollectionPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const [userListsPage, setUserListsPage] = useState(1);

  const [selectedListPage, setSelectedListPage] = useState(1);

  const [newListName, setNewListName] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingListItems, setLoadingListItems] = useState(false);

  useEffect(() => {
    setProfileData({ login: user.login, email: user.email });
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/user/collection'),
      api.get('/user/wishlist'),
      api.get('/user/lists'),
    ])
      .then(([colRes, wishRes, listsRes]) => {
        setCollection(colRes.data.data || []);
        setWishlist(wishRes.data.data || []);
        setUserLists(listsRes.data.data || []);
      })
      .catch((err) => console.error('Ошибка при загрузке данных профиля:', err))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    if (!selectedListId) {
      setSelectedListReleases([]);
      return;
    }
    setLoadingListItems(true);
    api.get(`/user/lists/${selectedListId}`)
      .then(res => setSelectedListReleases(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoadingListItems(false));
  }, [api, selectedListId]);

  const deleteCollectionItem = async (itemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент из коллекции?')) return;
    try {
      await api.delete(`/user/collection/${itemId}`);
      setCollection((prev) => prev.filter((item) => item.id !== itemId));
      setNotification({ type: 'success', text: 'Элемент удалён из коллекции' });
    } catch (err) {
      console.error('Ошибка при удалении из коллекции:', err);
      setNotification({ type: 'danger', text: 'Не удалось удалить элемент из коллекции' });
    }
  };

  const deleteWishlistItem = async (itemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент из списка желаемого?')) return;
    try {
      await api.delete(`/user/wishlist/${itemId}`);
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));
      setNotification({ type: 'success', text: 'Элемент удалён из списка желаемого' });
    } catch (err) {
      console.error('Ошибка при удалении из желаемого:', err);
      setNotification({ type: 'danger', text: 'Не удалось удалить элемент из списка желаемого' });
    }
  };

  const deleteUserList = async (listId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот список?')) return;
    try {
      await api.delete(`/user/lists/${listId}`);
      setUserLists((prev) => prev.filter((lst) => lst.id !== listId));
      if (selectedListId === listId) {
        setSelectedListId(null);
      }
      setNotification({ type: 'success', text: 'Список удалён' });
    } catch (err) {
      console.error('Ошибка при удалении списка:', err);
      setNotification({ type: 'danger', text: 'Не удалось удалить список' });
    }
  };

  const deleteSelectedListItem = async (itemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент из списка?')) return;
    try {
      await api.delete(`/user/lists/${selectedListId}/items/${itemId}`);
      setSelectedListReleases((prev) => prev.filter((item) => item.id !== itemId));
      setNotification({ type: 'success', text: 'Элемент удалён из списка' });
    } catch (err) {
      console.error('Ошибка при удалении элемента из списка:', err);
      setNotification({ type: 'danger', text: 'Не удалось удалить элемент из списка' });
    }
  };

  const handleOpenEditModal = () => {
    setEditLogin(profileData.login);
    setEditEmail(profileData.email);
    setLoginAvailable(null);
    setEmailAvailable(null);
    setCheckingLogin(false);
    setCheckingEmail(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    setNotification(null);
    if (loginTimer) clearTimeout(loginTimer);
    if (emailTimer) clearTimeout(emailTimer);
  };

  useEffect(() => {
    if (editLogin === '' || editLogin === profileData.login) {
      setLoginAvailable(null);
      setCheckingLogin(false);
      if (loginTimer) clearTimeout(loginTimer);
      return;
    }
    if (loginTimer) clearTimeout(loginTimer);

    const timer = setTimeout(async () => {
      setCheckingLogin(true);
      try {
        const res = await api.get(`/user/check-login?login=${encodeURIComponent(editLogin)}`);
        setLoginAvailable(res.data.available);
      } catch {
        setLoginAvailable(null);
      } finally {
        setCheckingLogin(false);
      }
    }, 1000);

    setLoginTimer(timer);
    return () => clearTimeout(timer);
  }, [editLogin, profileData.login, api]);

  useEffect(() => {
    if (!editEmail || editEmail === profileData.email) {
      setEmailAvailable(null);
      setCheckingEmail(false);
      if (emailTimer) clearTimeout(emailTimer);
      return;
    }
    if (emailTimer) clearTimeout(emailTimer);

    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await api.get(`/user/check-email?email=${encodeURIComponent(editEmail)}`);
        setEmailAvailable(res.data.available);
      } catch {
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 1000);

    setEmailTimer(timer);
    return () => clearTimeout(timer);
  }, [editEmail, profileData.email, api]);

  const handleSaveLogin = async () => {
    if (checkingLogin) return setNotification({ type: 'warning', text: 'Дождитесь проверки логина' });
    if (loginAvailable === false) return setNotification({ type: 'danger', text: 'Логин занят' });
    try {
      await api.patch('/user', { login: editLogin.trim() });
      setProfileData(prev => ({ ...prev, login: editLogin.trim() }));
      setNotification({ type: 'success', text: 'Логин сохранён' });
    } catch (e) {
      console.error(e);
      setNotification({ type: 'danger', text: 'Ошибка при сохранении логина' });
    }
  };

  const handleSaveEmail = async () => {
    if (checkingEmail) return setNotification({ type: 'warning', text: 'Дождитесь проверки почты' });
    if (emailAvailable === false) return setNotification({ type: 'danger', text: 'Почта занята' });
    try {
      await api.patch('/user', { email: editEmail.trim() });
      setProfileData(prev => ({ ...prev, email: editEmail.trim() }));
      setNotification({ type: 'success', text: 'Почта сохранена' });
    } catch (e) {
      console.error(e);
      setNotification({ type: 'danger', text: 'Ошибка при сохранении почты' });
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword) return setNotification({ type: 'danger', text: 'Введите текущий пароль' });
    if (!newPassword) return setNotification({ type: 'danger', text: 'Введите новый пароль' });
    if (newPassword !== confirmPassword) return setNotification({ type: 'danger', text: 'Пароли не совпадают' });
    try {
      const res = await api.patch('/user/password/', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotification({ type: 'success', text: res.data.message || 'Пароль изменён' });
    } catch (e) {
      console.error(e);
      setNotification({ type: 'danger', text: e.response?.data?.error || 'Ошибка при изменении пароля' });
    }
  };

  useEffect(() => {
    const modalEl = document.getElementById('editProfileModal');
    if (!modalEl) return;
    const handler = e => {
      const dirty = editLogin !== profileData.login || editEmail !== profileData.email || currentPassword || newPassword || confirmPassword;
      if (dirty && !window.confirm('У вас есть несохранённые изменения. Закрыть без сохранения?')) {
        e.preventDefault();
      }
    };

    modalEl.addEventListener('hide.bs.modal', handler);
    return () => {
      modalEl.removeEventListener('hide.bs.modal', handler);
    };
  }, [editLogin, editEmail, currentPassword, newPassword, confirmPassword, profileData]);

  const handleOpenCreateListModal = () => {
    setNewListName('');
    setNotification(null);
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) {
      setNotification({ type: 'danger', text: 'Название списка не может быть пустым' });
      return;
    }
    try {
      const res = await api.post('/user/lists', { name });
      setUserLists((prev) => [...prev, res.data.data]);
      setNotification({ type: 'success', text: 'Список успешно создан' });
      const createModalEl = document.getElementById('createListModal');
      const createBsModal = window.bootstrap.Modal.getInstance(createModalEl);
      createBsModal.hide();
    } catch (err) {
      console.error('Ошибка при создании списка:', err);
      if (err.response && err.response.status === 422 && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey][0];
        setNotification({ type: 'danger', text: firstMsg });
      } else {
        setNotification({ type: 'danger', text: 'Не удалось создать список' });
      }
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

  const textClass = theme === 'dark' ? 'text-light' : '';
  const tableClass = theme === 'dark' ? 'table table-hover table-dark' : 'table table-hover';

  const navLinkClass = (tab) => {
    let cls = 'nav-link';
    if (activeTab === tab) cls += ' active';
    if (theme === 'dark') cls += ' bg-secondary text-light';
    return cls;
  };

  const paginatedCollection = collection.slice(
    (collectionPage - 1) * ITEMS_PER_PAGE,
    collectionPage * ITEMS_PER_PAGE
  );
  const paginatedWishlist = wishlist.slice(
    (wishlistPage - 1) * ITEMS_PER_PAGE,
    wishlistPage * ITEMS_PER_PAGE
  );
  const paginatedUserLists = userLists.slice(
    (userListsPage - 1) * ITEMS_PER_PAGE,
    userListsPage * ITEMS_PER_PAGE
  );
  const paginatedSelectedListReleases = selectedListReleases.slice(
    (selectedListPage - 1) * ITEMS_PER_PAGE,
    selectedListPage * ITEMS_PER_PAGE
  );

  const handleCollectionPageChange = (p) => {
    if (p < 1 || p > Math.ceil(collection.length / ITEMS_PER_PAGE)) return;
    setCollectionPage(p);
  };
  const handleWishlistPageChange = (p) => {
    if (p < 1 || p > Math.ceil(wishlist.length / ITEMS_PER_PAGE)) return;
    setWishlistPage(p);
  };
  const handleUserListsPageChange = (p) => {
    if (p < 1 || p > Math.ceil(userLists.length / ITEMS_PER_PAGE)) return;
    setUserListsPage(p);
  };
  const handleSelectedListPageChange = (p) => {
    if (p < 1 || p > Math.ceil(selectedListReleases.length / ITEMS_PER_PAGE)) return;
    setSelectedListPage(p);
  };

  const toggleListPublic = async (listId, currentPublic) => {
    try {
      await api.patch(`/user/lists/${listId}`, { public: !currentPublic });
      setUserLists((prev) =>
        prev.map((lst) =>
          lst.id === listId ? { ...lst, public: !currentPublic } : lst
        )
      );
      setNotification({ type: 'success', text: 'Статус списка изменён' });
    } catch (err) {
      console.error('Не удалось изменить видимость списка:', err);
      setNotification({ type: 'danger', text: 'Ошибка при обновлении видимости списка' });
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <h2 className={`mb-4 ${textClass}`}>Профиль пользователя</h2>
        <button type="button" className="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editProfileModal" onClick={handleOpenEditModal}>
          Редактировать профиль
        </button>
      </div>

      <p className={textClass}>
        <strong>Логин:</strong> {profileData.login} <br />
        <strong>Почта:</strong> {profileData.email}
      </p>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={navLinkClass('collection')} onClick={() => { setActiveTab('collection'); setSelectedListId(null); }}>
            Коллекция
          </button>
        </li>
        <li className="nav-item">
          <button className={navLinkClass('wishlist')} onClick={() => { setActiveTab('wishlist'); setSelectedListId(null); }}>
            Желаемое
          </button>
        </li>
        <li className="nav-item">
          <button className={navLinkClass('lists')} onClick={() => setActiveTab('lists')}>
            Списки
          </button>
        </li>
      </ul>

      <div className={theme === 'dark' ? 'bg-dark text-light border border-secondary' : 'border'}>
        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'collection' ? 'show active' : ''} p-3`}>
            {collection.length === 0 ? (
              <p className={textClass}>Ваша коллекция пуста.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className={tableClass} style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '45%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Исполнитель</th>
                        <th>Дата релиза</th>
                        <th>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCollection.map((item, idx) => {
                        const artistName = item.release_group && item.release_group.artist ? item.release_group.artist.name : '-';
                        return (
                          <tr key={item.id}>
                            <td>
                              {(collectionPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </td>
                            <td>
                              <Link to={`/release/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.title} </Link>
                            </td>
                            <td>
                              {item.release_group && item.release_group.artist ? (<Link to={`/artist/${item.release_group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''}> {artistName} </Link>) : ('-')}
                            </td>
                            <td className={textClass}>
                              {item.release_date || '-'}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteCollectionItem(item.id)}> Удалить </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mt-3">
                    <li className={`page-item ${collectionPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleCollectionPageChange(collectionPage - 1)}> ← </button>
                    </li>
                    {Array.from(
                      { length: Math.ceil(collection.length / ITEMS_PER_PAGE) },
                      (_, i) => (
                        <li key={i + 1} className={`page-item ${collectionPage === i + 1 ? 'active' : ''} ${theme === 'dark' ? 'bg-dark' : ''}`}>
                          <button className={theme === 'dark' ? 'page-link bg-dark text-light border-secondary' : 'page-link'} onClick={() => handleCollectionPageChange(i + 1)}> {i + 1} </button>
                        </li>
                      )
                    )}
                    <li className={`page-item ${collectionPage === Math.ceil(collection.length / ITEMS_PER_PAGE) ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleCollectionPageChange(collectionPage + 1)}> → </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>

          <div className={`tab-pane fade ${activeTab === 'wishlist' ? 'show active' : ''} p-3`}>
            {wishlist.length === 0 ? (
              <p className={textClass}>Список желаемого пуст.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className={tableClass} style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '45%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Исполнитель</th>
                        <th>Дата релиза</th>
                        <th>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedWishlist.map((item, idx) => {
                        const artistName = item.release_group && item.release_group.artist ? item.release_group.artist.name : '-';
                        return (
                          <tr key={item.id}>
                            <td>
                              {(wishlistPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </td>
                            <td>
                              <Link to={`/release/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.title} </Link>
                            </td>
                            <td>
                              {item.release_group && item.release_group.artist ? (<Link to={`/artist/${item.release_group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''}> {artistName} </Link>) : ('-')}
                            </td>
                            <td className={textClass}>
                              {item.release_date || '-'}
                            </td>
                            <td>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteWishlistItem(item.id)}> Удалить </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mt-3">
                    <li className={`page-item ${wishlistPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleWishlistPageChange(wishlistPage - 1)}> ← </button>
                    </li>
                    {Array.from(
                      { length: Math.ceil(wishlist.length / ITEMS_PER_PAGE) },
                      (_, i) => (
                        <li key={i + 1} className={`page-item ${wishlistPage === i + 1 ? 'active' : ''} ${theme === 'dark' ? 'bg-dark' : ''}`}>
                          <button className={theme === 'dark' ? 'page-link bg-dark text-light border-secondary' : 'page-link'} onClick={() => handleWishlistPageChange(i + 1)}> {i + 1} </button>
                        </li>
                      )
                    )}
                    <li className={`page-item ${wishlistPage === Math.ceil(wishlist.length / ITEMS_PER_PAGE) ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleWishlistPageChange(wishlistPage + 1)}> → </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>

          <div className={`tab-pane fade ${activeTab === 'lists' ? 'show active' : ''} p-3`}>
            <button className="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#createListModal" onClick={handleOpenCreateListModal}> Добавить список </button>
            {userLists.length === 0 ? (
              <p className={textClass}>У вас нет пользовательских списков.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className={tableClass} style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '60%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Имя списка</th>
                        <th>Статус</th>
                        <th>Действие</th>
                        <th>Удалить</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUserLists.map((lst) => (
                        <tr key={lst.id}>
                          <td>
                            <Link to={`/user-list/${lst.id}`} className={theme === 'dark' ? 'text-info' : ''}> {lst.name} </Link>
                          </td>
                          <td className={textClass}>
                            {lst.public ? 'Публичный' : 'Приватный'}
                          </td>
                          <td>
                            <button className={lst.public ? 'btn btn-sm btn-outline-warning' : 'btn btn-sm btn-outline-success'} onClick={() => toggleListPublic(lst.id, lst.public)}>
                              {lst.public ? 'Сделать приватным' : 'Сделать публичным'}
                            </button>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUserList(lst.id)}> Удалить </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mt-3">
                    <li className={`page-item ${userListsPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleUserListsPageChange(userListsPage - 1)}> ← </button>
                    </li>
                    {Array.from(
                      { length: Math.ceil(userLists.length / ITEMS_PER_PAGE) },
                      (_, i) => (
                        <li key={i + 1} className={`page-item ${userListsPage === i + 1 ? 'active' : ''} ${theme === 'dark' ? 'bg-dark' : ''}`}>
                          <button className={theme === 'dark' ? 'page-link bg-dark text-light border-secondary' : 'page-link'} onClick={() => handleUserListsPageChange(i + 1)}> {i + 1} </button>
                        </li>
                      )
                    )}
                    <li className={`page-item ${userListsPage === Math.ceil(userLists.length / ITEMS_PER_PAGE) ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleUserListsPageChange(userListsPage + 1)}> → </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        </div>

        {selectedListId && (
          <div className="mt-4">
            <h5 className={textClass}>Релизы в списке</h5>
            {loadingListItems ? (
              <div className="d-flex justify-content-center my-3">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Загрузка...</span>
                </div>
              </div>
            ) : selectedListReleases.length === 0 ? (
              <p className={textClass}>В этом списке нет релизов.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className={tableClass} style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Название</th>
                        <th>Исполнитель</th>
                        <th>Дата релиза</th>
                        <th>Действие</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSelectedListReleases.map((item, idx) => {
                        const artistName = item.release_group && item.release_group.artist ? item.release_group.artist.name : '-';
                        return (
                          <tr key={item.id}>
                            <td>
                              {(selectedListPage - 1) * ITEMS_PER_PAGE + idx + 1}
                            </td>
                            <td>
                              <Link to={`/release/${item.id}`} className={theme === 'dark' ? 'text-info' : ''}> {item.title} </Link>
                            </td>
                            <td>
                              {item.release_group && item.release_group.artist ? (<Link to={`/artist/${item.release_group.artist.id}`} className={theme === 'dark' ? 'text-info' : ''}> {artistName} </Link>) : ('-')}
                            </td>
                            <td className={textClass}>{item.release_date || '-'}</td>
                            <td>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteSelectedListItem(item.id)}> Удалить </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center mt-3">
                    <li className={`page-item ${selectedListPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleSelectedListPageChange(selectedListPage - 1)}> ← </button>
                    </li>
                    {Array.from(
                      {
                        length: Math.ceil(selectedListReleases.length / ITEMS_PER_PAGE),
                      },
                      (_, i) => (
                        <li key={i + 1} className={`page-item ${selectedListPage === i + 1 ? 'active' : ''} ${theme === 'dark' ? 'bg-dark' : ''}`}>
                          <button className={theme === 'dark' ? 'page-link bg-dark text-light border-secondary' : 'page-link'} onClick={() => handleSelectedListPageChange(i + 1)}> {i + 1} </button>
                        </li>
                      )
                    )}
                    <li className={`page-item ${selectedListPage === Math.ceil(selectedListReleases.length / ITEMS_PER_PAGE) ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handleSelectedListPageChange(selectedListPage + 1)}> → </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        )}
      </div>

      <div className="modal fade" id="editProfileModal" tabIndex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
            <div className="modal-header">
              <h5 className="modal-title" id="editProfileModalLabel">Редактировать профиль</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="editLogin" className="form-label">Логин</label>
                <input type="text" className="form-control" id="editLogin" value={editLogin} onChange={e => setEditLogin(e.target.value)} />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="flex-grow-1">
                    {checkingLogin && <div className="form-text text-muted">Проверяем логин…</div>}
                    {loginAvailable === true && <div className="form-text text-success">Логин свободен</div>}
                    {loginAvailable === false && <div className="form-text text-danger">Логин занят</div>}
                  </div>
                  <button className="btn btn-primary ms-3" onClick={handleSaveLogin} disabled={loginAvailable !== true}> Сохранить логин </button>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="editEmail" className="form-label">Почта</label>
                <input type="email" className="form-control" id="editEmail" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="flex-grow-1">
                    {checkingEmail && <div className="form-text text-muted">Проверяем почту…</div>}
                    {emailAvailable === true && <div className="form-text text-success">Почта свободна</div>}
                    {emailAvailable === false && <div className="form-text text-danger">Почта занята</div>}
                  </div>
                  <button className="btn btn-primary ms-3" onClick={handleSaveEmail} disabled={emailAvailable !== true}> Сохранить почту </button>
                </div>
              </div>
              <hr />
              <h6>Сменить пароль</h6>
              <div className="mb-3 position-relative">
                <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                <div className="input-group">
                  <input type={showCurrentPass ? 'text' : 'password'} className="form-control" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Введите текущий пароль" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCurrentPass(v => !v)} tabIndex={-1}>
                    {showCurrentPass ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                  </button>
                </div>
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="newPassword" className="form-label">Новый пароль</label>
                <div className="input-group">
                  <input type={showNewPass ? 'text' : 'password'} className="form-control" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Введите новый пароль" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNewPass(v => !v)} tabIndex={-1}>
                    {showNewPass ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                  </button>
                </div>
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="confirmPassword" className="form-label">Подтверждение нового пароля</label>
                <div className="input-group">
                  <input type={showNewPass ? 'text' : 'password'} className="form-control" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Повторите новый пароль" />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNewPass(v => !v)} tabIndex={-1}>
                    {showNewPass ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && <div className="form-text text-danger">Пароли не совпадают</div>}
              </div>
              {notification && (
                <div className={`alert alert-${notification.type} alert-dismissible fade show mt-2`} role="alert">
                  {notification.text}
                  <button type="button" className="btn-close" onClick={() => setNotification(null)} />
                </div>
              )}
              <button className="btn btn-primary mt-2" onClick={handleSavePassword} disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}> Сохранить пароль </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="createListModal" tabIndex="-1" aria-labelledby="createListModalLabel" aria-hidden="true" >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <form onSubmit={handleCreateList}>
              <div className="modal-header">
                <h5 className="modal-title" id="createListModalLabel"> Создать новый список </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть" />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="newListName" className="form-label"> Название списка </label>
                  <input type="text" className="form-control" id="newListName" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="Введите название" required />
                </div>
                {notification && (
                  <div className={`alert alert-${notification.type} alert-dismissible fade show mt-2`} role="alert" >
                    {notification.text}
                    <button type="button" className="btn-close" onClick={() => setNotification(null)} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" > Отмена </button>
                <button type="submit" className="btn btn-primary"> Создать </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
