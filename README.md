# Science Simulation Tool

A configuration-driven application for creating science simulations. Leverages Rive as the underlying animation engine. 



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
science-simulation/
├── dist/                    # Production build output
├── public/                  # Static assets served as-is
│   ├── animations/          # Rive animation files
│   ├── img/                 # Static images
│   ├── 404.html             # Custom 404 page
│   ├── CNAME                # Domain configuration for GitHub Pages
│   └── vite.svg             # Vite logo
├── src/                     # Source code
│   ├── assets/              # Asset files bundled with the app
│   │   ├── animations/      # Animation assets
│   │   ├── img/             # Image assets
│   │   └── react.svg        # React logo
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components
│   │   │   ├── Modal.tsx    # Reusable modal dialog
│   │   │   └── ThemeToggle.tsx # Theme switcher component
│   │   ├── inputs/          # Input control components
│   │   │   ├── Dropdown.tsx
│   │   │   ├── InputPanel.tsx
│   │   │   ├── SegmentedController.tsx
│   │   │   └── Slider.tsx
│   │   ├── trials/          # Trial data components
│   │   │   └── TrialsTable.tsx # Data table with sticky columns & animations
│   │   └── visualization/   # Visualization components
│   │       └── RiveAnimation.tsx # Rive animation integration
│   ├── config/              # Application configuration
│   │   └── simulationConfig.ts # Simulation definitions
│   ├── theme/               # Theming system
│   │   ├── theme.ts         # Theme tokens and values
│   │   └── ThemeContext.tsx # Theme context provider
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared type definitions
│   ├── utils/               # Utility functions
│   │   ├── simulationData.ts # Input-output mappings
│   │   └── screenReaderUtils.ts # Accessibility utilities for screen readers
│   ├── App.tsx              # Main application component
│   ├── App.css              # Global styles
│   ├── main.tsx             # Application entry point
│   ├── styled.d.ts          # Styled-components type definitions
│   ├── index.css            # Global CSS
│   ├── notes.txt            # Development notes
│   └── vite-env.d.ts        # Vite environment type definitions
├── .github/                 # GitHub configuration files
├── index.html               # Application entry HTML
├── package.json             # Dependencies and scripts
├── package-lock.json        # Dependency lock file
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TypeScript settings
├── tsconfig.node.json       # Node-specific TypeScript settings
├── eslint.config.js         # ESLint configuration
├── vite.config.ts           # Vite build configuration
└── .gitignore               # Git ignore rules
```

## Component Documentation







### Input Controls

#### Dropdown
`components/inputs/Dropdown.tsx`
Use benchmark `Dropdown`.

#### Slider
`components/inputs/Slider.tsx`
The slider will be a new component in benchmark, and should likley be developed there. 

You can see the slider in the Weather Simulation example of the prototype. This slider is wrapped in a `SliderContainer` that includes a max/min width for Science simulation tool specific constraints. For benchmark, you likley would not include this slider container. 

The slider is primarily driven by `label`, `min`, `max`, and `step`. min and max drive the min and max values, while the step value creates slider steps evenly across the min-to-max range. 

The slider also hooks into the `simulationConfig.ts`  `defaultValue`, which is routed through the `InputPanel.tsx`. 

Beige theming to come...

#### SegmentedController
`components/inputs/SegmentedController.tsx`

The segmented controller will be a new component in benchmark, and should likely be developed there. This component exists in the NAEP Style Guide and the Line & Point IIC. 

The component supports both horizontal and vertical orientations through the `orientation` prop. It's primarily driven by `label`, `options` array (for the selectable choices), and the current `value`. This component includes keyboard navigation support with proper focus management, and uses a hidden radio button method. The segmented controller hooks into `simulationConfig.ts` through its `defaultValue` and `options` properties, which are routed through `InputPanel.tsx`. For Rive animations, `simulationConfig.ts` includes a `valueMapping` property that converts string selections to numeric values the animation engine can use.

Beige theme to come...

TO DO - in the dark theme the selected state is not contrast compliant to the unselected states. To be discussed with design team. 

### Common UI Components

#### Modal
`components/common/Modal.tsx`

Fire the benchmark default modal `dialog` component when students attempt to run a simulation after reaching the maximum number of configured trials (the modal in this prototype is for demonstration only and does not reflect benchmark styles/functionality).

#### ThemeToggle
`components/common/ThemeToggle.tsx`

A prototype-specific component that won't be needed in the final implementation. drives the theme toggle logic. 

### Dynamic/Logic Components
Note that these components incorporate more logic and may not be ideally designed or broken apart in this prototype. 

#### InputPanel
Renders input controls based on the simulation configuration. This also drives the responsiveness of the tool. I used a container query to drive the stacked breakpoint. 

#### RiveAnimation
`components/visualization/RiveAnimation.tsx`

Manages integration with Rive animations through a forwardRef component that:
- Loads Rive animations from configured file paths
- Maps input values to Rive state machine inputs using the valueMapping configuration (see `simulationConfig.ts`)
- Implements three core methods exposed via ref: resetAnimation, playAnimation, and resetAndPlayAnimation
- Uses a cover image technique with opacity transitions to mask animation reset states
- When a new animation is played, the Rive canvas is recreated.It is likley ideal to explore direct Rive API methods for reset if available. The canvas recreation approach works but I assume it is not ideal (more overhead to destroy/recreate?) compared to some rive-supported method of state machine reset.
- Maintains responsive canvas sizing using ResizeObserver and Rive's resizeDrawingSurfaceToCanvas method
- Communicates with App.tsx through the ref interface, where App calls resetAndPlayAnimation, then uses setTimeout to wait for animation completion before updating trial data.See the `app.tsx` `totalDelay`. Note that there is a potential deficiency here where I am manually defining the `animationDuration` in the `simulationConfig.ts`file. Ideally rive has some API driven method to know the duration of an animation so we do not have to define this.  

#### TrialsTable
`components/trials/TrialsTable.tsx`
A dynamic table component that displays simulation trial data with the following features:
- Responsive columns based on simulation configuration
- Sticky last column with theme-aware shadow effects
- Animated row deletion with smooth transitions
- Highlight effects for newly added rows
- Accessibility support with ARIA attributes

**Integration Notes:** When adapting to a design system, preserve the animation logic and sticky column behavior. Theme tokens for colors, shadows, and borders can be mapped to the target design system's equivalents.


### Theming System

The application implements a comprehensive theming system that supports both light and dark modes:

#### Theme Definition
`theme/theme.ts`

Contains theme tokens including:
- Color palettes for both themes
- Typography settings
- Spacing and border values
- Shadow definitions

#### Theme Context
`theme/ThemeContext.tsx`

Provides theme context throughout the application:
- Theme switching functionality
- Theme persistence using localStorage
- Theme-aware styled-components integration

### Utility Functions

#### Screen Reader
`utils/screenReaderUtils.ts`

Provides accessibility support for screen readers:
- Creates an accessible live region for announcements
- Generates descriptive text for simulation inputs and results
- Announces simulation events and state changes to screen readers

**Integration Notes:** These utilities are essential for maintaining accessibility. When integrating with a design system, ensure these announcements are preserved and updated to match any changes in UI behavior.

#### simulation Data
maybe this should be in the config folder?

## Design System Integration Guide

### Theme Mapping Strategy

When integrating with an existing design system:

1. **Map Theme Tokens:** Match the tokens in `theme.ts` to equivalent tokens in the target design system
2. **Preserve Component Behavior:** Maintain the functional behavior of components while adapting their styling
3. **Retain Animation Logic:** Keep the animation and interaction logic, especially in the `TrialsTable` component
4. **Adapt Responsive Patterns:** Preserve the responsive design patterns using the target design system's approach



### Accessibility Considerations

The application includes several accessibility features that should be maintained:
- ARIA attributes on interactive elements
- Keyboard navigation support
- Focus management in modals
- Screen reader announcements that sync with the animation.

## How It Works

### Configuration-Driven Architecture

The application uses a configuration-driven approach where each simulation is defined in `simulationConfig.ts`. This includes:

- Simulation metadata (name, description)
- Input controls (type, default values, options)
- Output parameters
- Rive animation file and state machine

### Data Mapping

Input-output relationships are defined in `simulationData.ts`, which maps combinations of inputs to specific output values.


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

## Backlog
- beige theme
- process data(?)
- max trials allowed
- discuss gray color token half steps
- segmented controller contrast issue
- wide table handling/responsive 