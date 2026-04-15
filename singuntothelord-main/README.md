# SING UNTO THE LORD

A modern, responsive hymnbook application designed for seamless worship and quick access to timeless hymns of the University of Malawi Church of Christ.

## Features

- **Comprehensive Hymn Database**: Access to a complete collection of UNIMA Church of Christ hymns
- **Advanced Search**: Search hymns by title, author, number, or first line
- **Category Filtering**: Browse hymns by categories (Praise, Worship, Thanksgiving, etc.)
- **Favorites System**: Mark and organize your favorite hymns
- **Recently Viewed**: Quick access to recently accessed hymns
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable reading
- **Font Size Control**: Adjustable font sizes for better readability
- **Auto-scroll**: Automatic scrolling feature for continuous reading
- **Presentation Mode**: Full-screen presentation mode for worship services
- **YouTube Integration**: Direct links to hymn videos where available
- **Offline Support**: Progressive Web App (PWA) with offline capabilities
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Efficient navigation with keyboard controls

## Technologies Used

- **React 18** - Modern JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful icon library
- **FontAwesome** - Additional icon support
- **Service Worker** - Offline functionality and caching

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sing-unto-the-lord
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

## Usage

### Navigation
- Use the search bar to find hymns by title, author, or content
- Filter hymns by category using the category buttons
- Access recently viewed hymns from the home page
- Mark hymns as favorites for quick access

### Reading Hymns
- Click on any hymn card to open the full hymn view
- Use font size controls (A- / A+) to adjust text size
- Enable auto-scroll for continuous reading
- Switch to presentation mode (F11) for full-screen display

### Keyboard Shortcuts
- `Escape` - Exit presentation mode or close modals
- `F11` - Toggle presentation mode
- `Space` - Play/pause (when hymn is selected)
- `Ctrl + F` - Focus search input

## Project Structure

```
src/
├── components/
│   └── EmergencyDispatch/
│       └── SingUntoTheLord.jsx    # Main application component
├── data/
│   ├── hymns.js                   # Hymn database
│   ├── categories.js              # Hymn categories
│   ├── greetings.js               # Time-based greetings
│   └── backgrounds.js             # Background images
├── features/
│   ├── hymns/                     # Hymn-related components and hooks
│   ├── navigation/                # Navigation components
│   └── presentation/              # Presentation mode features
├── shared/
│   ├── components/                # Reusable UI components
│   ├── hooks/                     # Custom React hooks
│   └── utils/                     # Utility functions
└── context/                       # React context providers
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

This app is configured as a Progressive Web App (PWA) and can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the build folder or connect via Git
- **GitHub Pages**: Use GitHub Actions for automated deployment

## License

© 2025 UNIMA Church of Christ. All rights reserved.

## Contact

Developed by Josophat Makawa for the University of Malawi Church of Christ.

- **Developer**: Josophat Makawa
- **Facebook**: [Josophat Chifundo Makawa](https://web.facebook.com/josophat.chifundo.makawa)
- **Instagram**: [@kiziojosh](https://www.instagram.com/kiziojosh/)
- **LinkedIn**: [Josophat Makawa](https://www.linkedin.com/in/josophat-makawa-abaa21366/)
- **GitHub**: [@KizioTech](https://github.com/KizioTech)
- **WhatsApp**: [+265 999 978 828](https://wa.me/265999978828)
- **Telegram**: [@KizioJosh](https://t.me/KizioJosh)

## Version History

- **v1.7.0** - Enhanced background image overlays, improved text contrast, scroll position management
- **v1.6.5** - Previous stable release