
import { Info } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Grid, Moon, Sun, ArrowLeft, ChevronDown, ChevronUp, Music, Clock, Star, Book, Cross, Gift, Sunrise, Shield, Flame } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faGithub,
  faTelegram,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import { hymnsDatabase } from '../../data/hymns';
import { categories } from '../../data/categories';
import { greetingsByTime } from '../../data/greetings';
import { backgroundImages } from '../../data/backgrounds';

const SacredHymnsApp = () => {
  const [showAppInfoModal, setShowAppInfoModal] = useState(false);
  const [showHymnModal, setShowHymnModal] = useState(false);
  const [showNumberGridModal, setShowNumberGridModal] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedHymn, setSelectedHymn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoScroll, setAutoScroll] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [setShowPlaylistModal] = useState(false);
  const [showYoutubePlayer, setShowYoutubePlayer] = useState(false);
  const [showHymnInfo] = useState(false);
  const playerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [welcomeVerse, setWelcomeVerse] = useState('');
  const randomBg = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];


  useEffect(() => {
    const hour = new Date().getHours();
    let timePeriod = 'morning';

    if (hour >= 12 && hour < 18) timePeriod = 'afternoon';
    else if (hour >= 18 || hour < 5) timePeriod = 'evening';

    const messages = greetingsByTime[timePeriod];
    const randomIndex = Math.floor(Math.random() * messages.length);
    const { message, verse } = messages[randomIndex];

    setWelcomeMessage(message);
    setWelcomeVerse(verse);
  }, []);

  useEffect(() => {
    console.log("Background images:", backgroundImages);
    console.log("Selected background:", randomBg);
  }, [randomBg]);

  // Initialize component
  useEffect(() => {
    // Check for stored favorites
    const savedFavorites = JSON.parse(localStorage.getItem('hymnFavorites') || '[]');
    const savedRecent = JSON.parse(localStorage.getItem('hymnRecent') || '[]');
    const savedTheme = localStorage.getItem('hymnTheme') || 'light';
    const savedFontSize = parseInt(localStorage.getItem('hymnFontSize') || '16');
    const savedPlaylists = JSON.parse(localStorage.getItem('hymnPlaylists') || '[]');

    setFavorites(new Set(savedFavorites));
    setRecentlyViewed(savedRecent);
    setDarkMode(savedTheme === 'dark');
    setFontSize(savedFontSize);
    setPlaylists(savedPlaylists);

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('hymnFavorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('hymnRecent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('hymnTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('hymnFontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('hymnPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  const togglePlay = React.useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPresentationMode(false);
        setShowPlaylistModal(false);
      } else if (e.key === 'F11') {
        e.preventDefault();
        setPresentationMode(!presentationMode);
      } else if (e.key === ' ' && selectedHymn) {
        e.preventDefault();
        togglePlay();
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHymn, isPlaying, presentationMode, setShowPlaylistModal, togglePlay]);

  const filteredHymns = hymnsDatabase.filter(hymn => {
    const matchesSearch = searchTerm === '' ||
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hymn.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hymn.firstLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hymn.id.toString() === searchTerm;

    const matchesCategory = selectedCategory === '' || hymn.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToRecentlyViewed = (hymn) => {
    const newRecent = [hymn, ...recentlyViewed.filter(h => h.id !== hymn.id)].slice(0, 5);
    setRecentlyViewed(newRecent);
  };

  const toggleFavorite = (hymnId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(hymnId)) {
      newFavorites.delete(hymnId);
    } else {
      newFavorites.add(hymnId);
    }
    setFavorites(newFavorites);
  };

  const openHymn = (hymn) => {
    scrollPositionRef.current = window.scrollY;
    setSelectedHymn(hymn);
    setCurrentView('hymn');
    addToRecentlyViewed(hymn);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowYoutubePlayer(false);
    window.scrollTo(0, 0);
  };

  const startAutoScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy(0, 1);
    }, 100);
  };

  const stopAutoScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const toggleAutoScroll = () => {
    if (autoScroll) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
    setAutoScroll(!autoScroll);
  };

  const NavigationHeader = () => (
    <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {currentView !== 'home' && (
              <button
                onClick={() => {
                  setCurrentView('home');
                  setTimeout(() => {
                    window.scrollTo(0, scrollPositionRef.current);
                  }, 0);
                }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNumberGridModal(true)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition duration-300 ease-in-out transform hover:scale-105 ${darkMode ? 'bg-gray-700 text-white hover:bg-gold-700' : 'bg-gold-100 text-gold-800 hover:bg-gold-200'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <h1
                className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gold-800'}`}
              >
                SING UNTO THE LORD
              </h1>
              <button
                onClick={() => setShowAppInfoModal(true)}
                className={`p-3 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <Info className="h-6 w-6" />
              </button>

            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isOnline && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Offline
              </span>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const SearchBar = () => (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          id="search-input"
          type="text"
          placeholder="Search hymns by title, author, number, or first line..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode
            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
        />
      </div>
    </div>
  );

  const CategoryFilter = () => (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      <button
        onClick={() => setSelectedCategory('')}
        className={`px-4 py-2 rounded-full transition-colors ${selectedCategory === ''
          ? 'bg-gold-600 text-white'
          : darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        All
      </button>
      {Object.entries(categories).map(([category, { icon: Icon, color }]) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded-full transition-colors flex items-center space-x-2 ${selectedCategory === category
            ? 'bg-gold-600 text-white'
            : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <Icon className="h-4 w-4" />
          <span>{category}</span>
        </button>
      ))}
    </div>
  );

  const HymnCard = ({ hymn }) => {
    const CategoryIcon = categories[hymn.category]?.icon || Music;

    return (
      <div
        onClick={() => openHymn(hymn)}
        className={`p-6 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${darkMode
          ? 'bg-gray-800 border-gray-600 hover:border-blue-500'
          : 'bg-white border-gray-200 hover:border-blue-500'
          }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-gold-800 bg-gold-100 px-3 py-1 rounded-lg">
              {hymn.id}
            </div>
            <div className="flex items-center space-x-2">
              <CategoryIcon className={`h-5 w-5 ${categories[hymn.category]?.color || 'text-gray-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {hymn.category}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(hymn.id);
            }}
            className={`p-2 rounded-full transition-colors ${favorites.has(hymn.id)
              ? 'text-red-500 hover:bg-red-50'
              : darkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gray-400 hover:bg-gray-100'
              }`}
          >
            <Heart className={`h-5 w-5 ${favorites.has(hymn.id) ? 'fill-current' : ''}`} />
          </button>
        </div>

        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {hymn.title}
        </h3>
        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          by {hymn.author}
        </p>
        <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          "{hymn.firstLine}"
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline && hymn.youtubeId && (
              <div className="flex items-center space-x-1 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 16.5l6-4.5-6-4.5v9zm12-4.5c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10zm-2 0c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
                </svg>
                <span className="text-xs">Video Available</span>
              </div>
            )}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {hymn.verses.length} verse{hymn.verses.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  };

  const HymnView = () => {

    const hymn = selectedHymn;
    if (!hymn) return null;

    const renderVerseContent = (verseText) => {
      const parts = verseText.split(/\n \n/);
      if (parts.length > 1) {
        const verse = parts[0];
        const chorus = parts.slice(1).join('\n \n');
        return (
          <>
            <div className="whitespace-pre-line">{verse}</div>
            <div className="bg-blue-100/10 dark:bg-blue-900/10 p-4 rounded-lg mt-4 italic font-bold text-center border-l-4 border-blue-500 whitespace-pre-line">
              {chorus}
            </div>
          </>
        );
      }
      return <div className="whitespace-pre-line">{verseText}</div>;
    };

    return (
      <div className={`${presentationMode ? 'fixed inset-0 z-50 flex items-center justify-center' : ''} ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {!presentationMode && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">

                <div className="text-3xl font-bold text-gold-800 bg-gold-100 px-4 py-2 rounded-lg">
                  {hymn.id}
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {hymn.title}
                  </h1>
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    by {hymn.author}
                  </p>
                  {showHymnInfo && (
                    <div className={`mt-4 p-4 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-blue-50 text-gray-900'}`}>
                      <h3 className="text-xl font-bold mb-2">About This Hymn</h3>
                      <p><strong>Title:</strong> {hymn.title}</p>
                      <p><strong>Author:</strong> {hymn.author}</p>
                      <p><strong>Category:</strong> {hymn.category}</p>
                      <p><strong>First Line:</strong> {hymn.firstLine}</p>
                      {/* Optionally more info */}
                    </div>
                  )}

                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFavorite(hymn.id)}
                  className={`p-3 rounded-full transition-colors ${favorites.has(hymn.id)
                    ? 'text-red-500 hover:bg-red-50'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  <Heart className={`h-6 w-6 ${favorites.has(hymn.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setShowHymnModal(true)}
                  className={`p-3 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <Info className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  A-
                </button>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Font Size
                </span>
                <button
                  onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  A+
                </button>
              </div>

              <button
                onClick={toggleAutoScroll}
                className={`px-4 py-2 rounded-lg transition-colors ${autoScroll
                  ? 'bg-gold-600 text-white'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
              >
                {autoScroll ? 'Stop Auto-scroll' : 'Auto-scroll'}
              </button>
            </div>

            {/* YouTube Toggle Button */}
            {isOnline && hymn.youtubeId && (
              <div className="mb-8">
                {!showYoutubePlayer ? (
                  <button
                    onClick={() => setShowYoutubePlayer(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    ▶ Show Video
                  </button>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <iframe
                      ref={playerRef}
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${hymn.youtubeId}?autoplay=1`}
                      title={hymn.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    />
                    <button
                      onClick={() => setShowYoutubePlayer(false)}
                      className="mt-2 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Hide Video
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* Hymn Verses */}
            <div className="space-y-8 pb-16">
              {hymn.verses.map((verse, index) => (
                <div key={index} className="verse">
                  <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Verse {index + 1}
                  </div>
                  <div
                    className={`text-lg leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {renderVerseContent(verse)}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Presentation Mode */}
        {presentationMode && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <button
              onClick={() => setPresentationMode(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>

            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-4">{hymn.title}</h1>
              <p className="text-2xl text-gray-300">by {hymn.author}</p>
            </div>

            <div className="space-y-12 max-w-4xl">
              {hymn.verses.map((verse, index) => (
                <div key={index} className="verse">
                  <div className="text-lg font-semibold mb-4 text-gray-400">
                    Verse {index + 1}
                  </div>
                  <div className="text-3xl leading-relaxed text-white">
                    {renderVerseContent(verse)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const RecentlyViewedView = () => {
    if (recentlyViewed.length === 0) {
      return (
        <div className="text-center p-8">
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No recently viewed hymns.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => {
              setCurrentView('home');
              setTimeout(() => {
                window.scrollTo(0, scrollPositionRef.current);
              }, 0);
            }}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
          >
            Back to Home
          </button>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recently Viewed Hymns
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyViewed.map(hymn => (
            <HymnCard key={`recent-${hymn.id}`} hymn={hymn} />
          ))}
        </div>
      </div>
    );
  };

  const FavoriteHymnsView = () => {
    const favoriteHymns = hymnsDatabase.filter(hymn => favorites.has(hymn.id));

    if (favoriteHymns.length === 0) {
      return (
        <div className="text-center p-8">
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            You haven't added any favorites yet.
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setCurrentView('home')}
            className="text-yellow-500 hover:underline"
          >
            ← Back to Home
          </button>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Favorite Hymns
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteHymns.map(hymn => (
            <HymnCard key={`favorite-${hymn.id}`} hymn={hymn} />
          ))}
        </div>
      </div>
    );
  };

  const FavoriteHymns = () => {
    const favoriteHymns = hymnsDatabase.filter(hymn => favorites.has(hymn.id));
    const [isExpanded, setIsExpanded] = useState(true);

    if (favoriteHymns.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Favorite Hymns ({favoriteHymns.length})
            </h2>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            aria-label={isExpanded ? 'Collapse favorites' : 'Expand favorites'}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ease-in-out">
            {favoriteHymns.map(hymn => (
              <HymnCard key={`favorite-${hymn.id}`} hymn={hymn} />
            ))}
          </div>
        )}
      </div>
    );
  };


  const HomeView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center mb-8">
        <div className="text-center mt-6 px-4">
          <h2 className="text-xl font-bold text-white">
            {welcomeMessage}
          </h2>
          <p className="text-sm italic text-blue-200">
            {welcomeVerse}
          </p>
        </div>
      </div>

      <SearchBar />
      <CategoryFilter />

      <div className="mb-8">
        <button
          onClick={() => setCurrentView('recent')}
          className={`flex items-center space-x-2 text-blue-600 hover:underline`}
        >
          <Clock className="h-5 w-5" />
          <span>Recently Viewed Hymns</span>
        </button>
      </div>
      <FavoriteHymns />

      <div className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          All Hymns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHymns.map(hymn => (
            <HymnCard key={hymn.id} hymn={hymn} />
          ))}
        </div>

        {filteredHymns.length === 0 && (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No hymns found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Back button behavior
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      if (currentView === 'hymn' || currentView === 'recent' || currentView === 'favorites') {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  // Main render
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}${randomBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background Overlay */}
      <div className={`absolute inset-0 ${darkMode ? 'bg-black/60' : 'bg-black/50'} z-0`}></div>

      {/* Foreground App Content */}
      <div className="relative z-10 min-h-screen">

        <NavigationHeader />

        {currentView === 'home' && <HomeView />}
        {currentView === 'hymn' && <HymnView />}
        {currentView === 'recent' && <RecentlyViewedView />}
        {currentView === 'favorites' && <FavoriteHymnsView />}

        {showHymnModal && selectedHymn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg mx-auto p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out scale-100 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">About "{selectedHymn.title}"</h2>
                <button onClick={() => setShowHymnModal(false)} className={`p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-110 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>

              <p><strong>Author:</strong> {selectedHymn.author}</p>
              <p><strong>Category:</strong> {selectedHymn.category}</p>
              <p><strong>First Line:</strong> {selectedHymn.firstLine}</p>

              {selectedHymn.bio && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-1">Composer Biography</h3>
                  <p className="text-sm leading-relaxed">{selectedHymn.bio}</p>
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  onClick={() => setShowHymnModal(false)}
                  className={`p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-110 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <footer
          className={`fixed bottom-0 inset-x-0 z-50 text-center text-xs font-bold py-2 border-t
    ${darkMode
              ? 'bg-gray-900 text-gold-300 border-gray-700'
              : 'bg-white text-gold-800 border-gray-200'}`}
        >
          © 2025 UNIMA Church of Christ. All rights reserved.
        </footer>

        {showNumberGridModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-xl transform transition duration-300 ease-in-out scale-100 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>

              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quick Access Hymns</h2>
                <button
                  onClick={() => setShowNumberGridModal(false)}
                  className="text-2xl font-bold px-2 hover:text-red-500"
                >
                  ✕
                </button>
              </div>


              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {hymnsDatabase.map(hymn => (
                  <button
                    key={hymn.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowNumberGridModal(false); // Close modal first
                      setTimeout(() => {
                        openHymn(hymn);
                      }, 100); // Small delay to ensure modal closes before navigation
                    }}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${darkMode
                      ? 'bg-gray-800 border-gray-600 hover:border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-500'
                      }`}
                  >
                    <div className="text-lg font-bold text-blue-600">{hymn.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showAppInfoModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className={`w-full max-w-lg mx-auto h-[90vh] p-6 rounded-lg shadow-xl overflow-y-auto transform transition duration-300 ease-in-out scale-100 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>

              {/* Close Button */}
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit z-10">
                <h2 className="text-2xl font-bold">About This App</h2>
                <button
                  onClick={() => setShowAppInfoModal(false)}
                  className="text-2xl font-bold px-2 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <img
                  src="logo192.png"
                  alt="App Icon"
                  className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md object-cover"
                />
              </div>

              {/* Info */}
              <div className="space-y-4 text-base leading-relaxed text-center">
                <p>
                  <strong>SING UNTO THE LORD</strong> is a modern hymnbook app designed for seamless worship and quick access to timeless hymns.
                </p>
                <p>
                  Developed by <strong>Josophat Makawa</strong> for the <strong>University of Malawi Church of Christ</strong> and Christian worshipers worldwide.
                </p>
                <p>
                  <strong>Version:</strong> 1.7.0<br />
                  <strong>Built With:</strong> React + TailwindCSS
                </p>
                <p className="font-semibold">For Feedback, Suggestions and Support, contact the developer:</p>

                {/* Social Links with Icons */}
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-blue-500">
                  <a href="https://web.facebook.com/josophat.chifundo.makawa" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                    <FontAwesomeIcon icon={faFacebook} />

                  </a>
                  <a href="https://www.instagram.com/kiziojosh/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                    <FontAwesomeIcon icon={faInstagram} />

                  </a>
                  <a href="https://www.linkedin.com/in/josophat-makawa-abaa21366/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                    <FontAwesomeIcon icon={faLinkedin} />

                  </a>
                  <a href="https://github.com/KizioTech" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                    <FontAwesomeIcon icon={faGithub} />

                  </a>
                  <a
                    href="https://wa.me/265999978828"  // Replace with your actual WhatsApp number
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </a>

                  <a href="https://t.me/KizioJosh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                    <FontAwesomeIcon icon={faTelegram} />

                  </a>
                </div>

              </div>

              {/* Close */}
              <div className="mt-6 text-right">
                <button
                  onClick={() => setShowAppInfoModal(false)}
                  className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Service Worker Registration */}
        {typeof window !== 'undefined' && (
          <script dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  })
                  .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
              });
            }
          `
          }} />
        )}

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SING UNTO THE LORD" />
        <meta name="description" content="A Collection of UNIMA Church of Christ Hymns." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </div>
    </div>
  );
};

export default SacredHymnsApp;