# Accordion Solitaire

## Project Overview

"Accordion Solitaire" is a full-stack web application that brings the classic solitaire card game "Accordion" to life. The project aims to provide an engaging and visually distinctive gaming experience for players, complete with user accounts and game state persistence.

## Features

### Core Game Play
* **Accordion Solitaire Rules:** Implement accurate game mechanics where a card can be stacked on its immediate left neighbor or the card three positions to its left if they match in suit or rank.
* **Win/Loss Conditions:** Clearly define and implement conditions for winning (all cards stacked into one pile) and losing (no valid moves remaining).
* **Interactive Cards:** Cards are represented by styled `div` elements with `p` children for suit/rank. They will subtly raise on hover and are movable via intuitive **click-and-drag functionality**.
* **Visual Feedback:**
    * **Invalid Moves:** A 2-second temporary red overlay highlights cards involved in an invalid move attempt.
    * **Hint System:** A "HINT" button reveals valid moves by applying a 2-second temporary green overlay to the relevant cards.
* **Game State Persistence:** The current game's progress is saved and loaded using Firebase Firestore for authenticated users, allowing players to resume unfinished games across devices.

### User Management
* **User Authentication:** Secure user registration, login, and logout functionalities powered by Firebase Authentication.
* **Account Editing:** Registered users can update their username and email. Password change functionality is also provided.

### Dynamic Screens & UI
* **Load Screen:** An initial thematic overlay with the "Accordion" logo, animating away to reveal the game.
* **Game Screen:**
    * Responsive layout for cards, initially in a horizontally wrapping row that adapts gracefully.
    * **Mobile Optimization:** On mobile devices, cards dynamically stack into shorter vertical rows for optimal playability.
    * Themed "Accordion" logo in the upper-left.
    * Upper-right navigation icons linking to User and Rules screens.
* **User Screen:** A slide-over screen for user account creation and management.
* **Rules Screen:** A slide-over screen displaying comprehensive game rules.
* **Smooth Transitions:** All screen changes feature elegant sliding animations.
* **Error Feedback:** User-friendly modal feedback for form validation errors and API failures.

### Visual Design
* **SVG Assets:** All logos, icons, and thematic elements are crafted as scalable vector graphics (SVGs) for crisp, high-quality visuals across all device sizes.

## Technical Stack

This project is built using a modern full-stack architecture:

* **Frontend:**
    * **React:** A declarative, component-based JavaScript library for building user interfaces.
    * **TypeScript:** A superset of JavaScript that adds static typing, improving code quality and maintainability.
    * **Vite:** A fast and opinionated build tool for modern web projects.
    * **PostCSS & Autoprefixer:** For processing CSS and ensuring compatibility across different browsers.
    * **TailwindCSS:** (Pre-installed via scaffold) A utility-first CSS framework for rapidly building custom designs.
* **Backend:**
    * **Node.js:** A JavaScript runtime environment for server-side logic.
    * **Express:** A fast, unopinionated, minimalist web framework for Node.js.
    * **TypeScript:** Used for type-safe backend development.
    * **Nodemon:** A utility that monitors for any changes in your source and automatically restarts your server, perfect for development.
* **Database:**
    * **Firebase:** Utilized for:
        * **Firebase Authentication:** For secure user registration, login, and management.
        * **Firestore:** A flexible, scalable NoSQL cloud database for storing user profiles and game statistics.
* **Deployment:**
    * The project is designed for deployment on **Netlify**, with potential use of **Netlify Functions** for sensitive backend operations or API key protection.

## Project Structure

The project is organized into distinct `client` (frontend) and `server` (backend) directories, along with public assets and configuration files for a clear separation of concerns.

accordion-solitaire-firebase/
├── .env                 # Environment variables
├── .gitignore           # Git ignore rules
├── LICENSE              # Project license (MIT)
├── README.md            # Project documentation (this file)
├── server/              # Backend (Node.js/Express/TypeScript)
│   ├── dist/            # Compiled TypeScript output (will be generated)
│   ├── node_modules/    # Backend dependencies
│   ├── package.json     # Backend dependencies and scripts
│   ├── tsconfig.json    # TypeScript configuration for backend
│   └── server.ts        # Main backend entry point
├── client/              # Frontend (React/TypeScript/Vite)
│   ├── public/          # Static assets for the frontend
│   ├── src/             # React source code (components, logic, etc.)
│   ├── index.html       # Frontend entry HTML
│   ├── package.json     # Frontend dependencies and scripts
│   ├── postcss.config.js # PostCSS configuration
│   ├── tsconfig.json    # TypeScript configuration for frontend
│   ├── vite.config.ts   # Vite build configuration
│   └── ...              # Other frontend files
└── package.json         # (Optional, might be a root-level one or just in client/ and server/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js** (v18+ recommended)
* **npm** (v9+ recommended)
* A code editor (e.g., VS Code)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd accordion-solitaire-firebase
    ```

2.  **Install dependencies for both client and server:**
    ```sh
    cd client
    npm install
    cd ../server
    npm install
    cd ..
    ```

### Running the Project

Open two terminal windows/tabs:

**Terminal 1: Start the backend**
```sh
cd server
npm run dev
```

**Terminal 2: Start the frontend**
```sh
cd client
npm run dev
```

- The frontend will typically be available at [http://localhost:5173](http://localhost:5173) (or as indicated in your terminal).
- The backend will run on [http://localhost:3000](http://localhost:3000) (or as configured).

### Environment Variables

Create or update the `.env` file in the project's root directory (`accordion-solitaire-firebase/.env`). This file will hold your Firebase configuration and other sensitive environment variables.

```env
# Example .env content - You will fill these in with your actual Firebase project credentials
# VITE_FIREBASE_API_KEY=your_firebase_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
# VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
# VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
# VITE_FIREBASE_APP_ID=your_firebase_app_id

# Backend specific environment variables (if any, e.g., for Netlify Functions)
# SERVER_VAR_EXAMPLE=some_secret_value