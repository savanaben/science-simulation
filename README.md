# Science Simulation Tool

A flexible, configuration-driven React application for creating interactive science simulations with dynamic inputs, visual animations, and data collection.

## Features

- **Multiple Simulation Support**: Configure and run different types of simulations within the same application
- **Dynamic Input Controls**: Support for dropdowns, sliders, and segmented controllers
- **Rive Animations**: Visual feedback based on input parameters
- **Data Collection**: Record and display simulation trials in a table
- **Fully Configurable**: Add new simulations without changing the core code

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── inputs/
│   │   ├── Dropdown.tsx
│   │   ├── Slider.tsx
│   │   ├── SegmentedController.tsx
│   │   └── InputPanel.tsx
│   ├── visualization/
│   │   └── RiveAnimation.tsx
│   └── trials/
│       └── TrialsTable.tsx
├── config/
│   └── simulationConfig.ts
├── types/
│   └── index.ts
├── utils/
│   └── simulationData.ts
├── App.tsx
└── main.tsx
```

## How It Works

### Configuration-Driven Architecture

The application uses a configuration-driven approach where each simulation is defined in `simulationConfig.ts`. This includes:

- Simulation metadata (name, description)
- Input controls (type, default values, options)
- Output parameters
- Rive animation file and state machine

### Data Mapping

Input-output relationships are defined in `simulationData.ts`, which maps combinations of inputs to specific output values.

### Dynamic Components

- **InputPanel**: Renders input controls based on the simulation configuration
- **RiveAnimation**: Connects to Rive animations and updates based on input values
- **TrialsTable**: Displays simulation results with dynamic columns

## Adding a New Simulation

To add a new simulation:

1. Create a Rive animation file with appropriate state machines and inputs
2. Add a new simulation configuration in `simulationConfig.ts`
3. Add the corresponding data mappings in `simulationData.ts`

No changes to the core components are needed!

## Technologies Used

- React
- TypeScript
- Styled Components
- Rive Animation

## License

MIT

## Deployment

This project is configured for deployment to GitHub Pages. To deploy:

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy the site
3. Alternatively, you can manually deploy using:

```bash
npm run deploy
```

The site will be available at: https://yourusername.github.io/science-simulation/
