# Sing Unto the Lord - Comprehensive Improvement Plan

## Executive Summary

This document provides a detailed, actionable improvement plan for the "Sing Unto the Lord" hymn app. Based on analysis of the current codebase and modern React best practices for 2025, this plan addresses architecture, accessibility, UX, performance, and maintainability.

**Current State**: 971-line monolithic component with solid features but opportunities for improvement
**Target State**: Modular, accessible, performant, and maintainable application

---

## Priority 1: Component Architecture (Weeks 1-2)

### 1.1 Break Down Monolithic Component

**Current Issue**: Single 971-line component makes maintenance difficult

**Action Plan**:

#### Create Feature-Based Folder Structure
```
src/
├── features/
│   ├── hymns/
│   │   ├── components/
│   │   │   ├── HymnCard.jsx
│   │   │   ├── HymnView.jsx
│   │   │   ├── HymnModal.jsx
│   │   │   └── QuickAccessGrid.jsx
│   │   ├── hooks/
│   │   │   ├── useHymnSearch.js
│   │   │   ├── useAutoScroll.js
│   │   │   └── useFavorites.js
│   │   └── HymnPage.jsx
│   ├── navigation/
│   │   ├── NavigationHeader.jsx
│   │   ├── SearchBar.jsx
│   │   └── CategoryFilter.jsx
│   ├── presentation/
│   │   └── PresentationMode.jsx
│   └── welcome/
│       └── WelcomeMessage.jsx
├── shared/
│   ├── components/
│   │   ├── Modal.jsx
│   │   └── Button.jsx
│   ├── hooks/
│   │   └── useLocalStorage.js
│   └── utils/
│       └── helpers.js
├── context/
│   ├── ThemeContext.jsx
│   └── HymnContext.jsx
└── data/
    ├── hymns.js
    ├── categories.js
    └── greetings.js
```

#### Extract Custom Hooks

**useLocalStorage Hook**:
```javascript
// shared/hooks/useLocalStorage.js
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};
```

**useHymnSearch Hook**:
```javascript
// features/hymns/hooks/useHymnSearch.js
export const useHymnSearch = (hymns, searchTerm, category) => {
  return useMemo(() => {
    return hymns.filter(hymn => {
      const matchesSearch = !searchTerm ||
        hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.firstLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.id.toString() === searchTerm;

      const matchesCategory = !category || hymn.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [hymns, searchTerm, category]);
};
```

**useAutoScroll Hook**:
```javascript
// features/hymns/hooks/useAutoScroll.js
export const useAutoScroll = (enabled = false, speed = 100) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        window.scrollBy(0, 1);
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, speed]);

  return intervalRef;
};
```

### 1.2 Implement Context API for Global State

**Create Theme Context**:
```javascript
// context/ThemeContext.jsx
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useLocalStorage('hymnTheme', false);
  const [fontSize, setFontSize] = useLocalStorage('hymnFontSize', 16);

  const value = {
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

**Create Hymn Context**:
```javascript
// context/HymnContext.jsx
export const HymnContext = createContext();

export const HymnProvider = ({ children }) => {
  const [favorites, setFavorites] = useLocalStorage('hymnFavorites', []);
  const [recent, setRecent] = useLocalStorage('hymnRecent', []);
  const [playlists, setPlaylists] = useLocalStorage('hymnPlaylists', []);

  const toggleFavorite = useCallback((hymnId) => {
    setFavorites(prev =>
      prev.includes(hymnId)
        ? prev.filter(id => id !== hymnId)
        : [...prev, hymnId]
    );
  }, [setFavorites]);

  const addToRecent = useCallback((hymn) => {
    setRecent(prev =>
      [hymn, ...prev.filter(h => h.id !== hymn.id)].slice(0, 5)
    );
  }, [setRecent]);

  const value = {
    favorites,
    toggleFavorite,
    recent,
    addToRecent,
    playlists,
    setPlaylists,
  };

  return (
    <HymnContext.Provider value={value}>
      {children}
    </HymnContext.Provider>
  );
};
```

---

## Priority 2: Accessibility Improvements (Weeks 2-3)

### 2.1 Add ARIA Labels and Roles

**NavigationHeader Component**:
```javascript
<header
  role="banner"
  aria-label="Main navigation"
  className={`sticky top-0 z-50...`}
>
  <nav aria-label="Primary navigation">
    <button
      onClick={() => setCurrentView('home')}
      aria-label="Go back to home"
      className="p-2 rounded-lg..."
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
    </button>

    <button
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={darkMode}
      className="p-2 rounded-lg..."
    >
      {darkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  </nav>
</header>
```

**SearchBar Component**:
```javascript
<div role="search" aria-label="Search hymns">
  <label htmlFor="search-input" className="sr-only">
    Search hymns by title, author, number, or first line
  </label>
  <input
    id="search-input"
    type="search"
    placeholder="Search hymns..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    aria-label="Search hymns"
    aria-describedby="search-description"
    className="w-full pl-10..."
  />
  <span id="search-description" className="sr-only">
    Enter keywords to search through {hymnsDatabase.length} hymns
  </span>
</div>
```

**HymnCard Component**:
```javascript
<article
  role="article"
  aria-labelledby={`hymn-title-${hymn.id}`}
  className="p-6 rounded-lg..."
>
  <h3
    id={`hymn-title-${hymn.id}`}
    className="text-xl font-bold..."
  >
    {hymn.title}
  </h3>

  <button
    onClick={(e) => {
      e.stopPropagation();
      toggleFavorite(hymn.id);
    }}
    aria-label={
      favorites.has(hymn.id)
        ? `Remove ${hymn.title} from favorites`
        : `Add ${hymn.title} to favorites`
    }
    aria-pressed={favorites.has(hymn.id)}
    className="p-2 rounded-full..."
  >
    <Heart
      className={`h-5 w-5 ${favorites.has(hymn.id) ? 'fill-current' : ''}`}
      aria-hidden="true"
    />
  </button>
</article>
```

### 2.2 Implement Focus Management

**Modal Component with Focus Trap**:
```javascript
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;

      // Focus modal
      modalRef.current?.focus();

      // Trap focus
      const handleTab = (e) => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      // Restore focus when modal closes
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50..."
      onClick={onClose}
    >
      <div
        className="modal-content..."
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-2xl font-bold">
          {title}
        </h2>
        {children}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="close-button..."
        >
          Close
        </button>
      </div>
    </div>
  );
};
```

### 2.3 Add Screen Reader Support

**Live Regions for Dynamic Content**:
```javascript
const SearchResults = ({ results, searchTerm }) => {
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {searchTerm && (
          `Found ${results.length} hymn${results.length !== 1 ? 's' : ''}
           matching "${searchTerm}"`
        )}
      </div>

      <div role="region" aria-label="Search results">
        {results.map(hymn => (
          <HymnCard key={hymn.id} hymn={hymn} />
        ))}
      </div>
    </>
  );
};
```

**Add Skip Link**:
```javascript
// Add at the top of the app
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white"
>
  Skip to main content
</a>

<main id="main-content" role="main">
  {/* Main content */}
</main>
```

### 2.4 Improve Color Contrast

**Add Overlay to Background Images**:
```css
/* Improve readability with background overlay */
.app-container {
  position: relative;
}

.app-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4); /* Dark overlay */
  z-index: 1;
}

.app-content {
  position: relative;
  z-index: 10;
}

/* For light mode */
.light-mode .app-container::before {
  background: rgba(255, 255, 255, 0.85);
}
```

---

## Priority 3: User Experience Enhancements (Week 3-4)

### 3.1 Add Loading States

**Skeleton Loader Component**:
```javascript
const HymnCardSkeleton = () => (
  <div className="p-6 rounded-lg border-2 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-8 w-16 bg-gray-300 rounded"></div>
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
    </div>
    <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-300 rounded mb-3"></div>
    <div className="h-4 w-full bg-gray-300 rounded"></div>
  </div>
);

const HymnList = ({ hymns, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <HymnCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hymns.map(hymn => (
        <HymnCard key={hymn.id} hymn={hymn} />
      ))}
    </div>
  );
};
```

### 3.2 Implement Toast Notifications

**Toast Component**:
```javascript
// shared/components/Toast.jsx
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-green-500' :
          type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
        text-white`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xl">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

// Usage
const [toast, setToast] = useState(null);

const toggleFavorite = (hymnId) => {
  // ... toggle logic
  setToast({
    message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
    type: 'success'
  });
};

{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
```

### 3.3 Debounced Search

```javascript
// shared/hooks/useDebounce.js
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage in SearchBar
const SearchBar = () => {
  const [inputValue, setInputValue] = useState('');
  const debouncedSearch = useDebounce(inputValue, 300);

  useEffect(() => {
    // Perform search with debouncedSearch
  }, [debouncedSearch]);

  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Search hymns..."
    />
  );
};
```

### 3.4 Empty States

```javascript
const EmptyState = ({ icon: Icon, message, action }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Icon className="h-16 w-16 text-gray-400 mb-4" />
    <p className="text-lg text-gray-600 mb-4">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {action.label}
      </button>
    )}
  </div>
);

// Usage
{filteredHymns.length === 0 && (
  <EmptyState
    icon={Music}
    message={`No hymns found matching "${searchTerm}"`}
    action={{
      label: 'Clear search',
      onClick: () => setSearchTerm('')
    }}
  />
)}
```

---

## Priority 4: Mobile Responsiveness (Week 4)

### 4.1 Touch-Friendly Interactions

**Ensure Minimum Touch Targets (44x44px)**:
```css
/* All interactive elements should be at least 44x44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 4.2 Swipe Gestures for Hymn View

```javascript
// features/hymns/hooks/useSwipe.js
export const useSwipe = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// Usage in HymnView
const HymnView = ({ hymn, onNext, onPrevious }) => {
  const swipeHandlers = useSwipe(onNext, onPrevious);

  return (
    <div {...swipeHandlers}>
      {/* Hymn content */}
    </div>
  );
};
```

### 4.3 Responsive Typography

```css
/* Use clamp for fluid typography */
.hymn-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.hymn-verse {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
}

/* Mobile-first breakpoints */
@media (min-width: 640px) {
  /* sm */
}

@media (min-width: 768px) {
  /* md */
}

@media (min-width: 1024px) {
  /* lg */
}
```

---

## Priority 5: Performance Optimizations (Week 5)

### 5.1 React.memo for Components

```javascript
// Memoize HymnCard to prevent unnecessary re-renders
export const HymnCard = React.memo(({ hymn, onSelect, isFavorite, onToggleFavorite }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.hymn.id === nextProps.hymn.id &&
         prevProps.isFavorite === nextProps.isFavorite;
});
```

### 5.2 Virtualization for Long Lists

```javascript
// Install react-window: npm install react-window
import { FixedSizeGrid } from 'react-window';

const VirtualizedHymnGrid = ({ hymns, itemHeight = 300 }) => {
  const columnCount = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const rowCount = Math.ceil(hymns.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const hymn = hymns[index];

    if (!hymn) return null;

    return (
      <div style={style}>
        <HymnCard hymn={hymn} />
      </div>
    );
  };

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={300}
      height={600}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width="100%"
    >
      {Cell}
    </FixedSizeGrid>
  );
};
```

### 5.3 Code Splitting

```javascript
// Lazy load components
import { lazy, Suspense } from 'react';

const HymnView = lazy(() => import('./features/hymns/components/HymnView'));
const PresentationMode = lazy(() => import('./features/presentation/PresentationMode'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/hymn/:id" element={<HymnView />} />
        <Route path="/presentation" element={<PresentationMode />} />
      </Routes>
    </Suspense>
  );
};
```

### 5.4 Image Optimization

```javascript
// Optimize background images
const optimizedBackgrounds = backgroundImages.map(bg => ({
  ...bg,
  webp: bg.src.replace(/\.(jpg|png)$/, '.webp'),
}));

// Use modern image formats with fallback
<picture>
  <source srcSet={bg.webp} type="image/webp" />
  <img
    src={bg.src}
    alt={bg.alt}
    loading="lazy"
    decoding="async"
  />
</picture>
```

---

## Priority 6: Testing Strategy (Week 6)

### 6.1 Unit Tests

```javascript
// __tests__/hooks/useHymnSearch.test.js
import { renderHook } from '@testing-library/react-hooks';
import { useHymnSearch } from '../features/hymns/hooks/useHymnSearch';

describe('useHymnSearch', () => {
  const mockHymns = [
    { id: 1, title: 'Amazing Grace', author: 'John Newton', category: 'Praise' },
    { id: 2, title: 'How Great Thou Art', author: 'Carl Boberg', category: 'Worship' },
  ];

  it('filters hymns by search term', () => {
    const { result } = renderHook(() =>
      useHymnSearch(mockHymns, 'grace', '')
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].title).toBe('Amazing Grace');
  });

  it('filters hymns by category', () => {
    const { result } = renderHook(() =>
      useHymnSearch(mockHymns, '', 'Praise')
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].category).toBe('Praise');
  });
});
```

### 6.2 Accessibility Tests

```javascript
// __tests__/components/HymnCard.a11y.test.js
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HymnCard } from '../features/hymns/components/HymnCard';

expect.extend(toHaveNoViolations);

describe('HymnCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const mockHymn = {
      id: 1,
      title: 'Amazing Grace',
      author: 'John Newton',
      category: 'Praise',
      firstLine: 'Amazing grace, how sweet the sound',
      verses: []
    };

    const { container } = render(<HymnCard hymn={mockHymn} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

### 6.3 Integration Tests

```javascript
// __tests__/features/search.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Hymn Search Feature', () => {
  it('searches and displays hymns', async () => {
    render(<App />);

    const searchInput = screen.getByRole('searchbox');
    await userEvent.type(searchInput, 'grace');

    // Should display filtered results
    expect(screen.getByText(/Amazing Grace/i)).toBeInTheDocument();

    // Should announce results to screen readers
    expect(screen.getByRole('status')).toHaveTextContent(/found.*hymn/i);
  });
});
```

---

## Priority 7: Additional Features (Weeks 7-8)

### 7.1 Share Functionality

```javascript
const ShareButton = ({ hymn }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hymn.title,
          text: `${hymn.title} by ${hymn.author}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label={`Share ${hymn.title}`}
      className="p-2 rounded-lg hover:bg-gray-100"
    >
      <Share2 className="h-5 w-5" />
    </button>
  );
};
```

### 7.2 Offline Support with Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'hymn-app-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/data/hymns.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 7.3 Enhanced Playlist Management

```javascript
const PlaylistManager = () => {
  const { playlists, setPlaylists } = useHymnContext();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      id: Date.now(),
      name: newPlaylistName,
      hymns: [],
      createdAt: new Date().toISOString()
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
  };

  const addToPlaylist = (playlistId, hymn) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          hymns: [...playlist.hymns, hymn]
        };
      }
      return playlist;
    }));
  };

  return (
    <div className="playlist-manager">
      <h2>My Playlists</h2>
      <div className="create-playlist">
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="New playlist name"
          aria-label="New playlist name"
        />
        <button onClick={createPlaylist}>Create</button>
      </div>
      {playlists.map(playlist => (
        <PlaylistItem key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
};
```

---

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Set up folder structure
- [ ] Extract components
- [ ] Create custom hooks
- [ ] Implement Context API

### Week 2