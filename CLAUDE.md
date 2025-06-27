# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Victorian Gothic themed Accordion Solitaire game built with React/TypeScript frontend and Express/TypeScript backend, using Firebase for authentication and data persistence.

## Development Commands

### Frontend (client/)
- `npm run dev` - Start development server (typically runs on localhost:5173)
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Backend (server/)
- `npm run dev` - Start development server with hot reload using nodemon
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm run start` - Run compiled JavaScript server from dist/

### Running the Full Application
Start both servers simultaneously:
1. Terminal 1: `cd client && npm run dev`
2. Terminal 2: `cd server && npm run dev`

## Architecture Overview

### Frontend Architecture
- **React 19** with TypeScript for type safety
- **Vite** as build tool and development server
- **TailwindCSS** for styling with Victorian Gothic theme
- **Firebase SDK** for authentication and Firestore database
- **React DnD** for drag-and-drop card interactions
- **Framer Motion** and **GSAP** for animations
- **Three.js** with React Three Fiber for 3D effects

### Backend Architecture
- **Express.js** with TypeScript
- Currently minimal - main logic handled in frontend
- Prepared for potential API endpoints and server-side operations

### Firebase Integration
- **Authentication**: User registration, login, profile management
- **Firestore**: Game state persistence and user profiles
- **Configuration**: Uses Vite environment variables (VITE_FIREBASE_*)

### Game Logic
- **Accordion Solitaire Rules**: Cards can move 1 or 3 positions left if they match suit or rank
- **Game State**: Managed with React state, persisted to Firestore for authenticated users
- **Win Condition**: All cards stacked into one pile
- **Loss Condition**: No valid moves remaining

## Key File Locations

### Game Logic
- `client/src/utils/gameLogic.ts` - Core game rules and validation
- `client/src/utils/deckUtils.ts` - Deck initialization and card utilities
- `client/src/types/card.ts` - Card and game state type definitions

### Firebase Integration
- `client/src/firebase.ts` - Firebase initialization and exports
- `client/src/services/firebaseService.ts` - Game persistence and user profile operations
- `client/src/contexts/AuthContext.tsx` - Authentication state management

### Components
- `client/src/components/Game.tsx` - Main game component with board logic
- `client/src/components/Card.tsx` - Individual card component with drag/drop
- `client/src/components/Auth.tsx` - Authentication forms and user management

## Environment Setup

Create `.env` file in project root with Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Code Quality

Always run linting before committing:
```bash
cd client && npm run lint
```

The project uses ESLint with React and TypeScript configurations for code quality enforcement.