# Kard

A desktop application for spaced repetition learning using the SM-2 algorithm. Kard helps students efficiently study and retain information by optimizing review schedules based on performance.

## Features

- **Spaced Repetition**: Uses the SM-2 algorithm to automatically calculate optimal review intervals
- **Dashboard**: View cards due for review today and rate your confidence on each
- **Add Cards**: Create flashcards with topics and subjects
- **Library View**: Organize and manage your complete card collection
- **Customizable Theme**: Personalize your study experience with theme settings
- **Persistent Storage**: All data is saved locally on your device
- **Desktop App**: Full-featured Electron desktop application with native window controls

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the repository:

```bash
git clone <repository-url>
cd study-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

### Building

To package the application for distribution:

```bash
# Package the application
npm run package

# Create an installer
npm run make
```

## Project Structure

```
├── main.js          # Electron main process and IPC handlers
├── preload.js       # Preload script for secure IPC communication
├── renderer.js      # Frontend rendering and UI logic
├── logic.js         # Spaced repetition algorithm implementation
├── index.html       # Main HTML template
├── styles.css       # Application styling
├── package.json     # Project metadata and dependencies
└── README.md        # This file
```

## How It Works

### Spaced Repetition Algorithm (SM-2)

Kard implements the SM-2 algorithm to optimize your study schedule:

1. **Ease Factor**: A difficulty multiplier that adjusts based on your performance
   - Starts at 2.5
   - Increases when you rate cards highly
   - Decreases when you struggle (minimum 1.3 to prevent "review hell")

2. **Intervals**: Days until the next review
   - First review: 1 day
   - Reviews after that: Interval × Ease Factor
   - Failed reviews: Reset to 1 day

3. **Confidence Rating**: Rate each card 1-5 after answering
   - 1-2: Failed (reset interval)
   - 3: Moderate recall
   - 4-5: Strong recall (increase interval)

### Workflow

1. **Dashboard**: Review cards due today
2. **Rate Cards**: Provide confidence ratings for each card
3. **Add New**: Create study cards with topics and subjects
4. **Library**: View and manage all cards
5. **Settings**: Customize your theme and preferences

## Usage

### Creating a Card

1. Click the "➕ Add New" button
2. Enter the topic (question/concept)
3. Select or create a subject category
4. Save the card

### Studying

1. Go to the **Dashboard** to see cards due today
2. For each card, rate your confidence from 1-5
3. The algorithm automatically schedules the next review

### Managing Your Library

1. Access the **Library** to see all your cards
2. View card statistics including review history
3. Delete or edit cards as needed

### Customizing Settings

1. Go to **Settings**
2. Choose your preferred theme color
3. Settings are automatically saved

## Built With

- **Electron** - Cross-platform desktop application framework
- **Electron Forge** - CLI tool for bundling and distributing Electron apps
- **electron-store** - Simple data persistence
- **UUID** - Unique card identification

## Author

Vansh (Vanrobo) Rishi

## License

ISC

## Tips for Effective Learning

- **Consistency**: Study every day for best results
- **Honest Ratings**: Rate yourself fairly for accurate scheduling
- **Balanced Load**: Add cards gradually rather than overwhelming yourself
- **Daily Habit**: Spend 15-30 minutes daily on due cards
- **Active Recall**: Try to remember before checking answers

## Troubleshooting

**App won't start?**

- Ensure Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again

**Data not saving?**

- Check that you have write permissions in the application directory
- Data is stored locally, so moving the app directory may reset your data

**Performance issues?**

- With large card collections (1000+), you may notice slowdowns
- Consider archiving old or completed subjects

## Future Enhancements

- [ ] Cloud synchronization
- [ ] Export/import functionality
- [ ] Spaced repetition statistics
- [ ] Card templates
- [ ] Multi-device sync
