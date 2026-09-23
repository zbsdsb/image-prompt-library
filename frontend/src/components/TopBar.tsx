import { Filter, Search, Settings, X } from 'lucide-react';
import headerLogo from '../assets/header-logo.png';
import type { ViewMode } from '../types';
import type { Translator } from '../utils/i18n';
import ViewToggle from './ViewToggle';

interface Props {
  q: string;
  t: Translator;
  queryFilterChips: string[];
  facetChips: { id: string; label: string }[];
  onRemoveFacet: (id: string) => void;
  updateBadgeLabel?: string;
  onQ: (v: string) => void;
  onRemoveFilter: (chip: string) => void;
  favoriteOnly: boolean;
  onFavorite: () => void;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  onFilters: () => void;
  onConfig: () => void;
  filtersOpen?: boolean;
  configOpen?: boolean;
  hasActiveFilter?: boolean;
  modalOpen?: boolean;
}

export default function TopBar({
  q,
  t,
  queryFilterChips,
  facetChips,
  onRemoveFacet,
  updateBadgeLabel,
  onQ,
  onRemoveFilter,
  favoriteOnly,
  onFavorite,
  view,
  onView,
  onFilters,
  onConfig,
  filtersOpen = false,
  configOpen = false,
  hasActiveFilter = false,
  modalOpen = false,
}: Props) {
  return (
    <header className="chrome" inert={modalOpen} aria-hidden={modalOpen || undefined}>
      <nav className="nav-row" aria-label={t('primaryNavigation')}>
        <div className="logo mobile-brand" aria-label={t('appHome')}>
          <img className="logo-mark" src={headerLogo} alt="" aria-hidden="true" />
          <b className="logo-wordmark" lang="en">Image Prompt Library</b>
        </div>

        <button
          className={`vista-button filter-button${hasActiveFilter ? ' active' : ''}`}
          onClick={onFilters}
          aria-label={t('filters')}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          aria-controls="filters-drawer"
        >
          <Filter size={18} />
          <span className="filter-label">{t('filters')}</span>
        </button>

        <div className="search toolbar-search">
          <Search size={20} />
          <input
            aria-label={t('searchAria')}
            value={q}
            onChange={event => onQ(event.target.value)}
            placeholder={t('searchPlaceholder')}
          />
          {q && <button type="button" className="search-clear" onClick={() => onQ('')} aria-label={t('clearSearch')}><X size={17} /></button>}
        </div>

        <div className="view-dock">
          <ViewToggle t={t} view={view} onView={onView} />
        </div>

        <button className="iconbtn config-button" onClick={onConfig} aria-label={t('config')} aria-haspopup="dialog" aria-expanded={configOpen} aria-controls="config-drawer">
          <Settings size={19} />
          {updateBadgeLabel && <span className="update-available-badge">{updateBadgeLabel}</span>}
        </button>
      </nav>

      <div className="status-row mobile-status-view-row">
          <div className="active-filter-strip" aria-label={t('currentFilters')}>
            <button type="button" className={`chip query-filter-chip${favoriteOnly ? ' selected' : ''}`} onClick={onFavorite} aria-pressed={favoriteOnly}>{t('favoritesOnly')}</button>
            {facetChips.map(chip => <button type="button" key={chip.id} className="chip query-filter-chip" onClick={() => onRemoveFacet(chip.id)} aria-label={`${t('removeFilter')}: ${chip.label}`}>{chip.label} <X size={13} /></button>)}
            {queryFilterChips.map((chip, index) => <button type="button" key={`${chip}-${index}`} className="chip query-filter-chip" onClick={() => onRemoveFilter(chip)} aria-label={`${t('removeFilter')}: ${chip}`}>{chip} <X size={13} /></button>)}
          </div>
        </div>
    </header>
  );
}
