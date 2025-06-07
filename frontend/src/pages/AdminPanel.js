import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ResultModal = ({ show, onClose, title, message }) => (
  <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ background: show ? 'rgba(0,0,0,0.4)' : 'none' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header"> <h5 className="modal-title">{title}</h5> </div>
        <div className="modal-body"> <p>{message}</p> </div>
        <div className="modal-footer"> <button type="button" className="btn btn-primary" onClick={onClose}> Ок </button> </div>
      </div>
    </div>
  </div>
);

const AdminPanel = () => {
  const { api, theme } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('labels');

  const [artists, setArtists] = useState([]);
  const [releaseGroups, setReleaseGroups] = useState([]);
  const [labels, setLabels] = useState([]);
  const [releases, setReleases] = useState([]);
  const [mediaList, setMediaList] = useState([]);

  const [labelName, setLabelName] = useState('');
  const [labelCountry, setLabelCountry] = useState('');

  const [artistName, setArtistName] = useState('');
  const [artistCountry, setArtistCountry] = useState('');
  const [artistType, setArtistType] = useState('group');
  const [artistCreated, setArtistCreated] = useState('');
  const [artistEnded, setArtistEnded] = useState('');

  const [groupArtistName, setGroupArtistName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState('album');
  const [groupFirstDate, setGroupFirstDate] = useState('');

  const [releaseGroupName, setReleaseGroupName] = useState('');
  const [labelSelectName, setLabelSelectName] = useState('');
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseCover, setReleaseCover] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [releaseCountry, setReleaseCountry] = useState('');
  const [releaseCatalog, setReleaseCatalog] = useState('');
  const [releaseBarcode, setReleaseBarcode] = useState('');

  const [mediaReleaseTitle, setMediaReleaseTitle] = useState('');
  const [mediaFormat, setMediaFormat] = useState('CD');
  const [mediaPosition, setMediaPosition] = useState('');
  const [mediaTrackCount, setMediaTrackCount] = useState('');

  const [trackMediaDisplay, setTrackMediaDisplay] = useState('');
  const [trackPosition, setTrackPosition] = useState('');
  const [trackISRC, setTrackISRC] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [trackDuration, setTrackDuration] = useState('');

  const handleTabClick = (tab) => setActiveTab(tab);

  const [modal, setModal] = useState({ show: false, title: '', message: '' });

  const showModal = (title, message) => setModal({ show: true, title, message });
  const closeModal = () => setModal({ ...modal, show: false });

  useEffect(() => {
    if (activeTab === 'releaseGroups') {
      api
        .get('/artists')
        .then((response) => {
          setArtists(response.data.data || []);
        })
        .catch(() => setArtists([]));
    }
  }, [activeTab, api]);

  useEffect(() => {
    if (activeTab === 'releases') {
      api.get('/release-groups')
        .then((res) => setReleaseGroups(res.data.data || []))
        .catch(() => setReleaseGroups([]));

      api.get('/labels')
        .then((res) => setLabels(res.data.data || []))
        .catch(() => setLabels([]));
    }
  }, [activeTab, api]);

  useEffect(() => {
    if (activeTab === 'media') {
      api.get('/releases')
        .then((res) => setReleases(res.data.data || []))
        .catch(() => setReleases([]));
    }
  }, [activeTab, api]);

  useEffect(() => {
    if (activeTab === 'tracks') {
      api.get('/media?with=release.releaseGroup')
        .then((res) => setMediaList(res.data.data || []))
        .catch(() => setMediaList([]));
    }
  }, [activeTab, api]);

  const labelClass = theme === 'dark' ? 'text-light' : '';
  const inputClass = theme === 'dark' ? 'bg-dark text-light border-light' : '';
  const selectClass = theme === 'dark' ? 'bg-dark text-light border-light' : '';

  const handleLabelSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/labels', {
        name: labelName,
        country: labelCountry || null,
      });
      showModal('Успех', 'Лейбл успешно добавлен');
      setLabelName('');
      setLabelCountry('');
    } catch (err) {
      console.error(err);
      showModal('Ошибка', 'Ошибка при добавлении лейбла: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/artists', {
        name: artistName,
        country: artistCountry || null,
        type: artistType,
        created_at_real: artistCreated || null,
        ended_at: artistEnded || null,
      });
      showModal('Успех', 'Исполнитель успешно добавлен');
      setArtistName('');
      setArtistCountry('');
      setArtistType('group');
      setArtistCreated('');
      setArtistEnded('');
    } catch (err) {
      console.error(err);
      showModal('Ошибка', 'Ошибка при добавлении исполнителя: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    const matchedArtist = artists.find((a) => a.name === groupArtistName);
    if (!matchedArtist) {
      showModal('Ошибка', 'Пожалуйста, выберите исполнителя из списка.');
      return;
    }
    try {
      await api.post('/release-groups', {
        artist_id: matchedArtist.id,
        name: groupName,
        type: groupType,
        first_release_date: groupFirstDate || null,
      });
      showModal('Успех', 'Группа релизов успешно добавлена');
      setGroupArtistName('');
      setGroupName('');
      setGroupType('album');
      setGroupFirstDate('');
    } catch (err) {
      console.error(err);
      showModal('Ошибка', 'Ошибка при добавлении группы релизов: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    const matchedGroup = releaseGroups.find((g) => g.name === releaseGroupName);
    if (!matchedGroup) {
      showModal('Ошибка', 'Пожалуйста, выберите группу релизов из списка.');
      return;
    }
    let matchedLabel = null;
    if (labelSelectName.trim() !== '') {
      matchedLabel = labels.find((l) => l.name === labelSelectName);
      if (!matchedLabel) {
        showModal('Ошибка', 'Пожалуйста, выберите лейбл из списка или оставьте пустым.');
        return;
      }
    }
    try {
      await api.post('/releases', {
        release_group_id: matchedGroup.id,
        label_id: matchedLabel ? matchedLabel.id : null,
        title: releaseTitle,
        cover: releaseCover || null,
        release_date: releaseDate || null,
        country: releaseCountry || null,
        catalog_number: releaseCatalog || null,
        barcode: releaseBarcode || null,
      });
      showModal('Успех', 'Релиз успешно добавлен');
      setReleaseGroupName('');
      setLabelSelectName('');
      setReleaseTitle('');
      setReleaseCover('');
      setReleaseDate('');
      setReleaseCountry('');
      setReleaseCatalog('');
      setReleaseBarcode('');
    } catch (err) {
      console.error(err);
      showModal('Ошибка', 'Ошибка при добавлении релиза: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    const matchedRelease = releases.find((r) => r.title === mediaReleaseTitle);
    if (!matchedRelease) {
      showModal('Ошибка', 'Пожалуйста, выберите релиз из списка.');
      return;
    }
    try {
      await api.post('/media', {
        release_id: matchedRelease.id,
        format: mediaFormat,
        position: mediaPosition ? Number(mediaPosition) : null,
        track_count: mediaTrackCount ? Number(mediaTrackCount) : null,
      });
      showModal('Успех', 'Носитель успешно добавлен');
      setMediaReleaseTitle('');
      setMediaFormat('CD');
      setMediaPosition('');
      setMediaTrackCount('');
    } catch (err) {
      console.error(err);
      showModal('Ошибка', 'Ошибка при добавлении носителя: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const matchedMedia = mediaList.find((m) => {
      if (!m.release || !m.release.release_group) return null;
      const groupName = m.release.release_group.name;
      const cn = m.release.catalog_number;
      const display = `${groupName} | ${cn} | ${m.format} | CD${m.position} | ${m.track_count} track(s)`;
      return display === trackMediaDisplay;
    });
    if (!matchedMedia) {
      showModal('Ошибка', 'Пожалуйста, выберите носитель из списка.');
      return;
    }
    try {
      await api.post('/tracks', {
        media_id: matchedMedia.id,
        position: trackPosition ? Number(trackPosition) : null,
        isrc: trackISRC || null,
        title: trackTitle,
        duration: trackDuration ? Number(trackDuration) : null,
      });
      showModal('Успех', 'Трек успешно добавлен');
      setTrackMediaDisplay('');
      setTrackPosition('');
      setTrackISRC('');
      setTrackTitle('');
      setTrackDuration('');
    } catch (err) {
      console.error(err);
      showModal('Ошибка', 'Ошибка при добавлении трека: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <><div className="container my-4">
      <ResultModal show={modal.show} onClose={closeModal} title={modal.title} message={modal.message} />
      <h2 className={theme === 'dark' ? 'text-light' : ''}>Административная панель</h2>

      <ul className="nav nav-tabs">
        {[
          { key: 'labels', label: 'Лейблы' },
          { key: 'artists', label: 'Исполнители' },
          { key: 'releaseGroups', label: 'Группы релизов' },
          { key: 'releases', label: 'Релизы' },
          { key: 'media', label: 'Носители' },
          { key: 'tracks', label: 'Треки' },
        ].map(({ key, label }) => (
          <li className="nav-item" key={key}>
            <button className={`nav-link ${activeTab === key ? 'active' : ''} ${theme === 'dark' ? 'bg-secondary text-light' : ''}`} onClick={() => handleTabClick(key)} > {label} </button>
          </li>
        ))}
      </ul>

      <div className={`tab-content border-left border-right border-bottom p-3 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
        {activeTab === 'labels' && (
          <div className="tab-pane active">
            <form onSubmit={handleLabelSubmit}>
              <div className="mb-3">
                <label htmlFor="labelName" className={`form-label ${labelClass}`}> Название </label>
                <input type="text" className={`form-control ${inputClass}`} id="labelName" value={labelName} onChange={(e) => setLabelName(e.target.value)} maxLength={128} placeholder="Введите название лейбла" required />
              </div>
              <div className="mb-3">
                <label htmlFor="labelCountry" className={`form-label ${labelClass}`}> Код страны </label>
                <input type="text" className={`form-control ${inputClass}`} id="labelCountry" value={labelCountry} onChange={(e) => setLabelCountry(e.target.value)} maxLength={2} placeholder="2 символа" />
              </div>
              <button type="submit" className="btn btn-primary"> Сохранить лейбл </button>
            </form>
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="tab-pane active">
            <form onSubmit={handleArtistSubmit}>
              <div className="mb-3">
                <label htmlFor="artistName" className={`form-label ${labelClass}`}> Имя исполнителя </label>
                <input type="text" className={`form-control ${inputClass}`} id="artistName" value={artistName} onChange={(e) => setArtistName(e.target.value)} maxLength={128} placeholder="Введите имя исполнителя" required />
              </div>
              <div className="mb-3">
                <label htmlFor="artistCountry" className={`form-label ${labelClass}`}> Код страны (2 символа) </label>
                <input type="text" className={`form-control ${inputClass}`} id="artistCountry" value={artistCountry} onChange={(e) => setArtistCountry(e.target.value)} maxLength={2} placeholder="Например: US, RU" />
              </div>
              <div className="mb-3">
                <label htmlFor="artistType" className={`form-label ${labelClass}`}> Тип </label>
                <select className={`form-select ${selectClass}`} id="artistType" value={artistType} onChange={(e) => setArtistType(e.target.value)} >
                  <option value="solo">Соло</option>
                  <option value="group">Группа</option>
                  <option value="orchestra">Оркестр</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="artistCreated" className={`form-label ${labelClass}`}> Дата начала деятельности </label>
                <input type="date" className={`form-control ${inputClass}`} id="artistCreated" value={artistCreated} onChange={(e) => setArtistCreated(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="artistEnded" className={`form-label ${labelClass}`}> Дата окончания деятельности </label>
                <input type="date" className={`form-control ${inputClass}`} id="artistEnded" value={artistEnded} onChange={(e) => setArtistEnded(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary"> Сохранить исполнителя </button>
            </form>
          </div>
        )}

        {activeTab === 'releaseGroups' && (
          <div className="tab-pane active">
            <form onSubmit={handleGroupSubmit}>
              <div className="mb-3">
                <label htmlFor="groupArtistName" className={`form-label ${labelClass}`}> Исполнитель </label>
                <input list="datalistArtists" className={`form-control ${inputClass}`} id="groupArtistName" value={groupArtistName} onChange={(e) => setGroupArtistName(e.target.value)} placeholder="Начните вводить имя исполнителя..." required />
                <datalist id="datalistArtists">
                  {artists.map((artist) => ( <option key={artist.id} value={artist.name} /> ))}
                </datalist>
              </div>
              <div className="mb-3">
                <label htmlFor="groupName" className={`form-label ${labelClass}`}> Название группы релизов </label>
                <input type="text" className={`form-control ${inputClass}`} id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} maxLength={128} placeholder="Введите название группы релизов" required />
              </div>
              <div className="mb-3">
                <label htmlFor="groupType" className={`form-label ${labelClass}`}> Тип </label>
                <select className={`form-select ${selectClass}`} id="groupType" value={groupType} onChange={(e) => setGroupType(e.target.value)} >
                  <option value="album">Альбом</option>
                  <option value="single">Сингл</option>
                  <option value="ep">EP</option>
                  <option value="compilation">Компиляция</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="groupFirstDate" className={`form-label ${labelClass}`}> Первая дата релиза </label>
                <input type="date" className={`form-control ${inputClass}`} id="groupFirstDate" value={groupFirstDate} onChange={(e) => setGroupFirstDate(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary"> Сохранить группу релизов </button>
            </form>
          </div>
        )}

        {activeTab === 'releases' && (
          <div className="tab-pane active">
            <form onSubmit={handleReleaseSubmit}>
              <div className="mb-3">
                <label htmlFor="releaseGroupName" className={`form-label ${labelClass}`}> Группа релизов </label>
                <input list="datalistReleaseGroups" className={`form-control ${inputClass}`} id="releaseGroupName" value={releaseGroupName} onChange={(e) => setReleaseGroupName(e.target.value)} placeholder="Начните вводить название группы..." required />
                <datalist id="datalistReleaseGroups">
                  {releaseGroups.map((grp) => ( <option key={grp.id} value={grp.name} /> ))}
                </datalist>
              </div>
              <div className="mb-3">
                <label htmlFor="labelSelectName" className={`form-label ${labelClass}`}> Лейбл (необязательно) </label>
                <input list="datalistLabels" className={`form-control ${inputClass}`} id="labelSelectName" value={labelSelectName} onChange={(e) => setLabelSelectName(e.target.value)} placeholder="Начните вводить название лейбла..." />
                <datalist id="datalistLabels">
                  {labels.map((lbl) => ( <option key={lbl.id} value={lbl.name} /> ))}
                </datalist>
              </div>
              <div className="mb-3">
                <label htmlFor="releaseTitle" className={`form-label ${labelClass}`}> Название релиза </label>
                <input type="text" className={`form-control ${inputClass}`} id="releaseTitle" value={releaseTitle} onChange={(e) => setReleaseTitle(e.target.value)} maxLength={128} placeholder="Введите название релиза" required />
              </div>
              <div className="mb-3">
                <label htmlFor="releaseCover" className={`form-label ${labelClass}`}> URL обложки (необязательно) </label>
                <input type="text" className={`form-control ${inputClass}`} id="releaseCover" value={releaseCover} onChange={(e) => setReleaseCover(e.target.value)} placeholder="Ссылка на изображение" />
              </div>
              <div className="mb-3">
                <label htmlFor="releaseDate" className={`form-label ${labelClass}`}> Дата релиза </label>
                <input type="date" className={`form-control ${inputClass}`} id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="releaseCountry" className={`form-label ${labelClass}`}> Код страны </label>
                <input type="text" className={`form-control ${inputClass}`} id="releaseCountry" value={releaseCountry} onChange={(e) => setReleaseCountry(e.target.value)} maxLength={2} placeholder="2 символа, необязательно" />
              </div>
              <div className="mb-3">
                <label htmlFor="releaseCatalog" className={`form-label ${labelClass}`}>
                  Номер в каталоге (до 64 символов, необязательно)
                </label>
                <input type="text" className={`form-control ${inputClass}`} id="releaseCatalog" value={releaseCatalog} onChange={(e) => setReleaseCatalog(e.target.value)} maxLength={64} placeholder="Введите номер в каталоге" />
              </div>
              <div className="mb-3">
                <label htmlFor="releaseBarcode" className={`form-label ${labelClass}`}> Штрихкод (до 32 символов, необязательно) </label>
                <input type="text" className={`form-control ${inputClass}`} id="releaseBarcode" value={releaseBarcode} onChange={(e) => setReleaseBarcode(e.target.value)} maxLength={32} placeholder="Введите штрихкод" />
              </div>
              <button type="submit" className="btn btn-primary">
                Сохранить релиз
              </button>
            </form>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="tab-pane active">
            <form onSubmit={handleMediaSubmit}>
              <div className="mb-3">
                <label htmlFor="mediaReleaseTitle" className={`form-label ${labelClass}`}> Релиз </label>
                <input list="datalistReleases" className={`form-control ${inputClass}`} id="mediaReleaseTitle" value={mediaReleaseTitle} onChange={(e) => setMediaReleaseTitle(e.target.value)} placeholder="Начните вводить название релиза..." required />
                <datalist id="datalistReleases">
                  {releases.map((rel) => ( <option key={rel.id} value={rel.title} /> ))}
                </datalist>
              </div>
              <div className="mb-3">
                <label htmlFor="mediaFormat" className={`form-label ${labelClass}`}> Формат </label>
                <select className={`form-select ${selectClass}`} id="mediaFormat" value={mediaFormat} onChange={(e) => setMediaFormat(e.target.value)} >
                  <option value="CD">CD</option>
                  <option value="vinyl">Винил</option>
                  <option value="cassette">Кассета</option>
                  <option value="digital">Цифровой</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="mediaPosition" className={`form-label ${labelClass}`}> Номер носителя в релизе </label>
                <input type="number" className={`form-control ${inputClass}`} id="mediaPosition" value={mediaPosition} onChange={(e) => setMediaPosition(e.target.value)} placeholder="Значение по умолчанию: 1" />
              </div>
              <div className="mb-3">
                <label htmlFor="mediaTrackCount" className={`form-label ${labelClass}`}> Количество треков </label>
                <input type="number" className={`form-control ${inputClass}`} id="mediaTrackCount" value={mediaTrackCount} onChange={(e) => setMediaTrackCount(e.target.value)} placeholder="Введите число треков" />
              </div>
              <button type="submit" className="btn btn-primary"> Сохранить носитель </button>
            </form>
          </div>
        )}

        {activeTab === 'tracks' && (
          <div className="tab-pane active">
            <form onSubmit={handleTrackSubmit}>
              <div className="mb-3">
                <label htmlFor="trackMediaDisplay" className={`form-label ${labelClass}`}> Носитель </label>
                <input list="datalistMediaForTracks" className={`form-control ${inputClass}`} id="trackMediaDisplay" value={trackMediaDisplay} onChange={(e) => setTrackMediaDisplay(e.target.value)} placeholder="Начните вводить носитель..." required />
                <datalist id="datalistMediaForTracks">
                  {mediaList.map((m) => { if (!m.release || !m.release.release_group) return null; const groupName = m.release.release_group.name; const cn = m.release.catalog_number; const display = `${groupName} | ${cn} | ${m.format} | CD${m.position} | ${m.track_count} track(s)`; return <option key={m.id} value={display} />; })}
                </datalist>
              </div>
              <div className="mb-3">
                <label htmlFor="trackPosition" className={`form-label ${labelClass}`}> Позиция трека на носителе </label>
                <input type="number" className={`form-control ${inputClass}`} id="trackPosition" value={trackPosition} onChange={(e) => setTrackPosition(e.target.value)} placeholder="Позиция трека" />
              </div>
              <div className="mb-3">
                <label htmlFor="trackISRC" className={`form-label ${labelClass}`}> ISRC </label>
                <input type="text" className={`form-control ${inputClass}`} id="trackISRC" value={trackISRC} onChange={(e) => setTrackISRC(e.target.value)} maxLength={12} placeholder="12 символов" />
              </div>
              <div className="mb-3">
                <label htmlFor="trackTitle" className={`form-label ${labelClass}`}> Название трека </label>
                <input type="text" className={`form-control ${inputClass}`} id="trackTitle" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} maxLength={128} placeholder="Введите название трека" required />
              </div>
              <div className="mb-3">
                <label htmlFor="trackDuration" className={`form-label ${labelClass}`}> Длительность </label>
                <input type="number" className={`form-control ${inputClass}`} id="trackDuration" value={trackDuration} onChange={(e) => setTrackDuration(e.target.value)} placeholder="Введите длительность в секундах" />
              </div>
              <button type="submit" className="btn btn-primary"> Сохранить трек </button>
            </form>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AdminPanel;
