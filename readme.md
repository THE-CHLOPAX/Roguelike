# Three.js Game Development Framework

A game development framework built with Electron and React.

## Project Structure

### `/src/main`

Electron main process code for native window rendering and system interactions. Handles window management, receiving IPC events, and native OS features.

### `/src/renderer`

React-based application frontend. Contains all UI views and user interactions. All project-specific app code should be put in this folder.
It should also contain all project-specific 3D code.

### `/src/lib`

Shared library components:

- **internal-3d**: 3D engine components (Scene, GameObject, PhysicsManager, Emitter)
- **internal-ui**: Reusable React UI components built with Radix primitives
- **internal-store**: Zustand stores for managing app state (graphics, sound, assets, gamepad, views)
- **internal-input**: Input handling (keyboard, mouse, gamepad)
- **internal-game-components**: Game object components (RigidBody, PositionalAudioPlayer, and more to come)

Import reusable library components using the `@tgdf` alias.

### `/release`

Built application packages and distribution files for macOS and other platforms.

## Development

```bash
npm run dev
```
