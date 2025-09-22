# Pronunciation Master - React

A modern React.js language learning application focused on English pronunciation practice. This is a complete refactor of the original vanilla JavaScript project, built with React, Vite, and modern web technologies.

## 🚀 Features

### Core Functionality

- **Interactive Lessons**: Path-based lesson progression with visual avatars
- **Topic Management**: Expandable topics with conversation-based learning
- **Speech Recognition**: Real-time pronunciation practice with Web Speech API
- **Video Integration**: Video lessons with synchronized subtitles
- **Progress Tracking**: Comprehensive progress tracking for lessons, topics, and conversations
- **Mobile Responsive**: Touch-optimized interface for mobile devices
- **Gaming Background**: Animated particle background effects

### Learning Features

- **Pronunciation Practice**: Record and compare your pronunciation
- **Score System**: Real-time scoring based on speech recognition accuracy
- **Bilingual Support**: English and Arabic text with proper RTL support
- **Audio Playback**: Listen to original pronunciation and your recordings
- **Progress Persistence**: Save progress in localStorage

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **CSS Modules** - Scoped styling
- **Web Speech API** - Speech recognition and synthesis
- **Context API** - State management
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── GamingBackground.jsx
│   ├── LessonCard.jsx
│   ├── TopicCard.jsx
│   ├── VideoPlayer.jsx
│   ├── PracticeInterface.jsx
│   └── ProgressBar.jsx
├── pages/              # Main page components
│   ├── HomePage.jsx
│   ├── TopicsPage.jsx
│   └── PracticePage.jsx
├── hooks/              # Custom React hooks
│   └── useSpeechRecognition.js
├── contexts/           # React Context providers
│   └── ProgressContext.jsx
├── data/               # Static data files
│   ├── data.json
│   └── srt-file-mapping.json
├── assets/             # Static assets
├── utils/              # Utility functions
├── App.jsx             # Main App component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pronunce-react
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 Usage

### Navigation Flow

1. **Home Page**: View all available lessons with progress indicators
2. **Topics Page**: Select specific topics within a lesson
3. **Practice Page**: Practice pronunciation with video and speech recognition

### Key Features Usage

#### Speech Recognition

- Click the microphone button to start recording
- Speak the displayed sentence
- Click stop to end recording
- View your pronunciation score and recognized text

#### Progress Tracking

- Progress is automatically saved to localStorage
- Visual indicators show completion status
- Scores are tracked per sentence and conversation

#### Video Player

- Play/pause video lessons
- Toggle subtitles on/off
- Seek through video timeline

## 🎨 Styling

The project uses CSS Modules for component-scoped styling with:

- **CSS Variables**: Consistent color palette and spacing
- **Responsive Design**: Mobile-first approach
- **Modern Effects**: Gradients, shadows, and animations
- **Accessibility**: High contrast and keyboard navigation

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=Pronunciation Master
VITE_API_URL=your-api-url
```

### Customization

- **Colors**: Modify CSS variables in `src/index.css`
- **Fonts**: Update font imports in `index.html`
- **Data**: Edit `src/data/data.json` for lesson content

## 📱 Mobile Support

The application is fully responsive and includes:

- Touch-optimized controls
- Mobile-specific layouts
- Swipe gestures for navigation
- Optimized video player for mobile

## 🔒 Browser Support

- Chrome 66+
- Firefox 60+
- Safari 11.1+
- Edge 79+

**Note**: Speech recognition requires HTTPS in production.

## 🚀 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

### GitHub Pages

```bash
npm run build
# Deploy dist folder to gh-pages branch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original vanilla JavaScript implementation
- Web Speech API for speech recognition
- Font Awesome for icons
- Google Fonts for typography
- React community for excellent documentation

## 📞 Support

For support, email support@pronunciationmaster.com or create an issue in the repository.

---

**Built with ❤️ using React and Vite**

