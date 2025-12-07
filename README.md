# Coffee Shop Management System UI

## Prerequisites

Before running this project, make sure you have the following installed:
- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js) or **yarn** or **pnpm**

You can check your Node.js version by running:
```bash
node --version
```

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
```bash
cd "Coffee Shop Management System UI"
```

3. Install all dependencies:
```bash
npm install
```

or if you're using yarn:
```bash
yarn install
```

or if you're using pnpm:
```bash
pnpm install
```

## Running the Development Server

To start the development server, run:
```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- The browser should open automatically

The development server uses Vite's hot module replacement (HMR), so any changes you make to the code will be reflected immediately in the browser.

## Building for Production

To create a production build, run:
```bash
npm run build
```

This will create an optimized production build in the `build/` directory. You can then deploy this folder to any static hosting service.

## Project Structure

- `src/` - Source code directory
  - `components/` - React components
  - `pages/` - Page components
  - `contexts/` - React contexts (e.g., AuthContext)
  - `data/` - Static data files
  - `styles/` - Global styles
- `index.html` - Main HTML file
- `vite.config.ts` - Vite configuration
- `package.json` - Project dependencies and scripts

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Recharts** - Chart library
- **Lucide React** - Icon library

## Troubleshooting

If you encounter issues:

1. **Port 3000 already in use**: The server will automatically try the next available port, or you can change it in `vite.config.ts`

2. **Dependencies not installing**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

3. **Build errors**: Make sure all dependencies are installed and your Node.js version is compatible
