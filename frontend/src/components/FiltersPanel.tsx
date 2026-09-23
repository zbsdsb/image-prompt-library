import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { ClusterRecord, TagRecord } from '../types';
import type { Translator } from '../utils/i18n';
import { prefersNonKeyboardFocus, restoreFocusAfterMotion } from '../hooks/useModalFocus';

export default function FiltersPanel({
  open,
  t,
  clusters,
  tags,
  models,
  total,
  selected,
  selectedTag,
  selectedModel,
  favoriteOnly,
  onSelect,
  onTag,
  onModel,
  onFavorite,
  onClear,
  onClose,
}: {
  open: boolean;
  t: Translator;
  clusters: ClusterRecord[];
  tags: TagRecord[];
  models: string[];
  total?: number;
  selected?: string;
  selectedTag?: string;
  selectedModel?: string;
  favoriteOnly: boolean;
  onSelect: (c: ClusterRecord) => void;
  onTag: (value?: string) => void;
  onModel: (value?: string) => void;
  onFavorite: (value: boolean) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [collectionQuery, setCollectionQuery] = useState('');
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const closeMotionCleanupRef = useRef<(() => void) | undefined>(undefined);
  const referenceTotal = total ?? clusters.reduce((sum, cluster) => sum + cluster.count, 0);
  const normalizedQuery = collectionQuery.trim().toLowerCase();
  const filteredClusters = useMemo(
    () => normalizedQuery
      ? clusters.filter(cluster => cluster.name.toLowerCase().includes(normalizedQuery))
      : clusters,
    [clusters, normalizedQuery],
  );

  const focusableSelector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        closeMotionCleanupRef.current?.();
        const fallbacks = Array.from(document.querySelectorAll<HTMLElement>('.filter-button, .toolbar-search input'));
        closeMotionCleanupRef.current = restoreFocusAfterMotion(drawerRef.current, [openerRef.current, ...fallbacks]);
      }
      return;
    }
    wasOpenRef.current = true;
    closeMotionCleanupRef.current?.();
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && !drawerRef.current?.contains(activeElement)) {
      openerRef.current = activeElement;
    }

    const focusTarget = prefersNonKeyboardFocus() ? closeButtonRef.current : (searchInputRef.current || closeButtonRef.current);
    const frame = window.requestAnimationFrame(() => {
      focusTarget?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => () => closeMotionCleanupRef.current?.(), []);

  const closePanel = () => {
    onClose();
  };

  const selectCluster = (cluster: ClusterRecord) => {
    closePanel();
    onSelect(cluster);
  };

  const clearSelection = () => {
    closePanel();
    onClear();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== 'Tab' || !drawerRef.current) return;
    const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector))
      .filter(element => element.getClientRects().length > 0 || element === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  return (
    <>
      {open && <div className="drawer-scrim" aria-hidden="true" onClick={closePanel} />}
      <aside
      ref={drawerRef}
      id="filters-drawer"
      className={`drawer filter-drawer ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('filters')}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={handleKeyDown}
    >
      <div className="drawer-head filter-drawer-head">
        <div>
          <p className="drawer-eyebrow"><SlidersHorizontal size={15} /> {t('filters')}</p>
          <h2>{t('filters')}</h2>
        </div>
        <button
          ref={closeButtonRef}
          className="panel-close"
          onClick={closePanel}
          aria-label={t('closeFilters')}
          tabIndex={open ? 0 : -1}
        >
          <X size={20} strokeWidth={2.25} />
        </button>
      </div>

      <h3 className="filter-section-title">{t('collections')}</h3>
      <label className="filter-search">
        <Search size={17} />
        <input
          ref={searchInputRef}
          value={collectionQuery}
          onChange={event => setCollectionQuery(event.currentTarget.value)}
          placeholder={t('searchCollections')}
          aria-label={t('searchCollections')}
          tabIndex={open ? 0 : -1}
        />
      </label>

      <div className="filter-pill-grid" aria-label={t('collectionFilters')}>
        <button
          className={!selected && !selectedTag && !selectedModel && !favoriteOnly ? 'selected' : ''}
          onClick={clearSelection}
          tabIndex={open ? 0 : -1}
        >
          <span>{t('allReferences')}</span>
          <b>{referenceTotal}</b>
        </button>
        {filteredClusters.map(cluster => (
          <button
            key={cluster.id}
            className={selected === cluster.id ? 'selected' : ''}
            onClick={() => selectCluster(cluster)}
            tabIndex={open ? 0 : -1}
          >
            <span>{cluster.name}</span>
            <b>{cluster.count}</b>
          </button>
        ))}
      </div>
      {filteredClusters.length === 0 && (
        <div className="filter-empty">{t('noCollectionsFound')}</div>
      )}
      <div className="filter-extra-fields">
        <label><span>{t('tags')}</span><select value={selectedTag || ''} onChange={event => onTag(event.target.value || undefined)}><option value="">{t('allTags')}</option>{tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name} ({tag.count})</option>)}</select></label>
        <label><span>{t('libraryModelLabel')}</span><select value={selectedModel || ''} onChange={event => onModel(event.target.value || undefined)}><option value="">{t('allModels')}</option>{models.map(model => <option key={model} value={model}>{model}</option>)}</select></label>
        <label className="filter-favorite-toggle"><input type="checkbox" checked={favoriteOnly} onChange={event => onFavorite(event.target.checked)} /><span>{t('favoritesOnly')}</span></label>
      </div>
      </aside>
    </>
  );
}
