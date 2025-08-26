# AI Studio Project Information

## Summary

A React TypeScript application that simulates a simplified version of an AI studio. The app allows users to upload images, add prompts and styles, and generate AI-enhanced images through a mock API.

## Structure

- `/ai-studio` - Main project directory
  - `/src` - Source code files
  - `/public` - Static assets

## Language & Runtime

**Language**: TypeScript, JavaScript
**Version**: TypeScript 5.8.3
**Build System**: Vite 7.1.3
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- React 19.1.1
- React DOM 19.1.1
- TailwindCSS

**Development Dependencies**:

- TypeScript 5.8.3
- ESLint 9.34.0
- Prettier
- Vitest 3.2.4
- Testing Library (React, Jest DOM, User Event)
- JSDOM 26.1.0

## Build & Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Testing

**Framework**: Vitest with React Testing Library
**Test Location**: `/src/__tests__`
**Configuration**: `vitest.config.ts`
**Run Command**:

```bash
npm run test
```
## Features

- Image upload with preview and client-side downscaling
- Text prompt input with style selection
- Mock API integration with error handling and retry logic
- Local storage for generation history
- Keyboard navigation and accessibility features---
  description: Repository Information Overview
  alwaysApply: true
## Feature: Upload & Preview
This branch implements the image upload and preview functionality.
# Awesome Project
This is my awesome repo 🚀
(Added in PR #2)
