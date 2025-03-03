[русская версия](./README.md)

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Status of Technical Task Completion and Implementation Comments](#status-of-technical-task-completion-and-implementation-comments)
  - [TT - Create a simple HTML5 slot game using Phaser3/Pixi.js](#tt---create-a-simple-html5-slot-game-using-phaser3pixijs)
    - [Game must include those screens:](#game-must-include-those-screens)
    - [Game play:](#game-play)
    - [Other game features:](#other-game-features)
    - [Project requirements:](#project-requirements)
- [Timings](#timings)
- [A Bit About the Game Architecture and Its Implementation Features](#a-bit-about-the-game-architecture-and-its-implementation-features)
- [A little about what was not in the specification](#a-little-about-what-was-not-in-the-specification)
- [Project Folder Structure (Omitting the Obvious)](#project-folder-structure-omitting-the-obvious)
- [A Few Shortcomings](#a-few-shortcomings)
- [Local Project Setup](#local-project-setup)
- [A Bit About Assets](#a-bit-about-assets)
    - [Animated Component Data Format (Draft)](#animated-component-data-format-draft)
    - [Concept](#concept)
    - [Proposed Elements (Draft)](#proposed-elements-draft)
    - [Requirements](#requirements)
    - [Demo](#demo)

## Status of Technical Task Completion and Implementation Comments

### TT - Create a simple HTML5 slot game using Phaser3/Pixi.js

#### Game must include those screens:
- [x] Preload screen
- [x] Assets loading screen with progress bar
- [x] Main game scene screen
- [x] Background image
- [x] Reels frame
- [x] Reels symbols
- [x] Spin button
- [x] Spine animated object

#### Game play:
- [x] Slot has 3 reels and 1 row, example (https://t.ly/fU5eR):
- [x] Slot has 3 different symbols
- [x] After spin button clicked reels start spinning 
- [x] Mock request/response from server with spin results, randomize result response
- [x] If result has all 3 same symbols - its a win, play win sound and animation
- [x] Include some Spine animation in the main game scene, make game events like win/lose trigger different states of Spine animation (there can be used any Spine animation you will find, for example this goblin from Phaser examples - https://github.com/yandeu/phaser3-spine-example/tree/master)

#### Other game features:
- [x] Play in loop some background sound
- [x] Add control to turn on/off all sounds

#### Project requirements:
- [x] Setup this game project on GitHub (or other GIT service).
- [x] Use TypeScript as programming language for the project
- [ ] Use Webpack to bundle modules, assets and serve game for local development. **(used Vite instead - can switch to Webpack if required)**
- [x] Include readme with instructions on how to run the game locally
- [x] Use npm package.json for package dependencies and configuration
- [x] include GSAP for animation
- [ ] Include Docker file for game containerization (optional, only if you have experience with it)
- [x] Send us back url to the project to review with any comments and time you spent on the task


## Timings
- Total project (4.5 work days - 36 hours)
  - Core architecture (8 hours)
  - Reel spin mechanics with 2 modes (16 hours)
  - Remaining tasks (12 hours)

## A Bit About the Game Architecture and Its Implementation Features
- Stack: `vite`, `typescript`, `pixi 8`, `gsap`
- I decided to experiment a little with the architecture by fully implementing the state management process using `async`/`await`. I think the experiment turned out successful—the logic for scheduling and launching asynchronous components, as well as managing their state transitions, has been significantly simplified (subjectively speaking).
- As the main system timer (ticker), I chose the `gsap` timer. Everything is tied to it, from animation control to managing the internal timings of game components. I did this to have a single control point for all timings.
- I used my own development—assets (ZIP archives containing media files and `json` data describing layer structures, their sprite content, and animation sets), a Pixi plugin for loading these assets, and a component for rendering these assets and their animations.

## A little about what was not in the specification  
- Added mechanics for adaptive resizing of the game to fit the screen during resizes  
- Added mechanics for pausing the game when the game tab is inactive  
- Added a button to enter and exit fullscreen mode  
- Added a button to change the bet  
- Reel spinning is implemented in two stages *(this is done to ensure the timely start of reel spinning when pressing the spin button, even in case of significant network delays)*:  
  - Idle infinite spinning while waiting for the server response with the spin result  
  - Spinning to the result after receiving the server response with the spin result  

## Project Folder Structure (Omitting the Obvious)
- `./public` - Static files folder (game assets), took approximately 6 hours in total
- `./public/style.css`
- `./public/assets`
- `./public/assets/pack.sh` - Script for packaging data into assets
- `./public/assets/preloader` - Source files for `preloader.asset`
- `./public/assets/logo` - Source files for `logo.asset`
- `./public/assets/top_buttons` - Source files for `top_buttons.asset`
- `./public/assets/logo.asset` - Loadable asset for the intro screen (sprites, layers, animations)
- `./public/assets/preloader.asset` - Loadable asset for the preloader (sprites, sounds, layers, animations)
- `./public/assets/top_buttons.asset` - Loadable asset for system buttons (sprites, layers)
- `./public/assets/progress` - Loadable resources for the progress bar
- `./public/assets/slot` -
- `./public/assets/slot/pack.sh` - Script for packaging data into assets
- `./public/assets/slot/reels` - Source files for the reel frame asset `reels.asset`
- `./public/assets/slot/reel` - Source files for the slot symbols asset `reel.asset`
- `./public/assets/slot/slot` - Source files for the game interface asset `slot.asset`
- `./public/assets/slot/reel.asset` - Loadable asset with slot symbols (sprites, sounds)
- `./public/assets/slot/reels.asset` - Loadable asset with the reel frame (sprites, layers)
- `./public/assets/slot/slot.asset` - Loadable asset with the rest of the slot graphics (sprites, sounds, layers, animations)
- `./src` 
- `./src/core` - General game core (not specific to the slot, but any game)
- `./src/core/utils` 
- `./src/core/utils/deepClone.ts` 
- `./src/core/utils/unzip.ts` - Utility for extracting `zip` archives
- `./src/core/utils/parsePath.ts` - Utility for parsing folder structures of loaded asset archives
- `./src/core/utils/sleep.ts` - A simple set of asynchronous utilities working with the `gsap` timer
- `./src/core/components` 
- `./src/core/components/Component.ts` - Component responsible for rendering assets (creating layer structures, sprite textures, sounds, running animations)
- `./src/core/components/ComponentResources.ts` - Class storing resources of a loaded asset
- `./src/core/components/TweenDeferred.ts` - Helper class for storing and managing asset animations
- `./src/core/parsers` - Pixi loader plugin extending it for asset loading
- `./src/core/parsers/gsapTypes.ts` 
- `./src/core/parsers/loadAssetTypes.ts` 
- `./src/core/parsers/loadAssets.ts` 
- `./src/core/commons` 
- `./src/core/commons/BaseController.ts` - Base class defining required methods for all controllers in the game architecture
- `./src/core/BaseGame.ts` - Base class initializing `pixi` and `gsap`, embedding the Pixi application into the page, implementing game resize mechanics, pausing the game when leaving the tab, and other similar functions
- `./src/core/sounds` 
- `./src/core/sounds/Sounds.ts` - Static class implementing centralized sound management
- `./src/index.ts` - Entry point
- `./src/game` 
- `./src/game/components` 
- `./src/game/components/preloader` 
- `./src/game/components/preloader/Preloader.ts` - Preloader controller, using a `Component` with `preloader.asset` as the view
- `./src/game/components/logo` 
- `./src/game/components/logo/Logo.ts` - Intro screen controller, using a `Component` with `logo.asset` as the view
- `./src/game/components/progress_bar` 
- `./src/game/components/progress_bar/ProgressBar.ts` - Progress bar component (lazily implemented; both controller and view are in the same class)
- `./src/game/components/slot` 
- `./src/game/components/slot/BaseSlotReel.ts` - Base component for a single reel, implementing spin visualization in two modes:  
  1. Infinite spinning while waiting for the server response.  
  2. Stopping the spin and displaying the server-sent symbols.  
  This component took the most time (16 hours).
- `./src/game/components/slot/BaseSlotReels.ts` - Base component for the reels, handling initialization and management of individual reels
- `./src/game/components/slot/BaseSlotGame.ts` - Base component for the slot game, handling initialization and management of the reels and interface
- `./src/game/components/slot/SlotReel.ts` - Implementation of a single reel for this slot
- `./src/game/components/slot/SlotReels.ts` - Implementation of the reels for this slot
- `./src/game/components/slot/SlotGame.ts` - Implementation of this slot
- `./src/game/components/spine` 
- `./src/game/components/spine/SpineBoy.ts` - Controller for a Spine character
- `./src/game/Game.ts` - Inherits from `BaseGame`, implementing the process of launching this slot
- `./src/game/network` 
- `./src/game/network/MockServer.ts` - Mock server implementation
- `./src/game/network/GameProxy.ts` - Proxy for game-server interaction
- `./src/game/common` 
- `./src/game/common/SystemButtons.ts` - Component for system buttons (fullscreen toggle and sound on/off)
- `./index.html` 

## A Few Shortcomings
- The components `BaseSlotReel`, `BaseSlotReels`, `BaseSlotGame`, and their inheritors `SlotReel`, `SlotReels`, `SlotGame` could be separated into controller and view layers. However, I haven’t done this yet to avoid delaying the deadline for the technical specification.
- The current implementation uses `vite` instead of `webpack`. In the past few years, I’ve primarily worked with `vite`, and even then, only in personal projects, so I’ve somewhat forgotten `webpack`. If this is a critical issue, I can reconfigure it.


## Local Project Setup

Clone repository:
```bash
git clone https://github.com/lastuniverse/test-task-selesa.git
```

Install dependencies:
```bash
cd test-task-selesa
npm install
```

Start dev server:
```bash
npm run dev
```

Game will open at http://localhost:8081/

---

## A Bit About Assets

#### Animated Component Data Format (Draft)  
> Draft - essentially, this is just an idea/mockup that can and should be thoughtfully refined.

#### Concept  
The goal is to create a data format that simplifies the development and use of standalone UI components, their views, and their animation sets.

#### Proposed Elements (Draft)  
- **Media Data** (shared across all views)  
  - Sprite images  
  - JSON atlases and sprite sheet images  
  - Sounds/music (available in two formats: packed into the component asset or loaded via a URL)  
  - Videos (not packed into the asset, only loaded via a URL)  
  - Other animated components (not packed into the asset, only loaded via a URL)  

- **Data**  
  - **Sprites**: JSON data linking image names and other media data to a named set of parameters. These are used to populate layers.  
  - **Layers**: JSON data defining the structure and spatial arrangement of layers, sprites (including frames from sprite sheets), and external elements (such as videos and other components).  
  - **Groups**: Named lists of sprite and layer names. These facilitate applying filters/animations to a group at once.  
    - *Example:* In the demo, clouds are split across two layers—one behind a mountain, one in front. Both layers require a blur filter and transparency. Instead of setting these manually for each layer, we group them and apply the filters to the group. (*This is not yet implemented in the demo.*)  
  - **Animations**: Named sets of `gsap` animation parameters and the objects (layers, groups, sprites, external components, videos) they apply to.  
  - **Views**: Named folders, each containing its own JSON set of sprites, layers, groups, and animations. (*Not implemented in the demo.*)  
  - **Activation Logic**: It's unclear whether activation should belong to views or animations. We need to gather usage scenarios and decide accordingly.  

#### Requirements  
- A single loadable file containing media data, layout variants for different views, and their animation sets.  
- Support for multiple views with the ability to switch between them.  
- Each view should have its own structure of layers, sprites, groups, etc.  
- Each view should be able to run its own animations or animation sets via `gsap` and control their playback (similar to Spine components).  

#### Demo  

[View Demo](https://game.ragame.ru/ohae/)  
[Asset File for Demo Scene Component](https://game.ragame.ru/ohae/assets/logo/logo.asset) (ZIP archive)  

**Current demo implementation includes:**  
- `meta.json` - version and asset type metadata.  
- `images` - folder containing sprites (in the future, also sprite sheets).  
- `sounds` - folder containing sound files.  
- `data` - folder with JSON files for sprites, layers, and animations:  
  - `layers.json` - layer data.  
  - `sprites.json` - sprite data.  
  - `intro.gsap.json` - `gsap` animation sets and their target objects.  
    - *(The current implementation already supports multiple animation sets.)*  

**Current programmatic implementation:**  
- A component class inheriting from `PIXI.Container`.  
- An additional `PIXI.Loader` that loads this asset file, unpacks it, and forms a data set for initializing the component class.  
