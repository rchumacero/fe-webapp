# KPLIAN FE Webapp

A modern monorepo for the KPLIAN ecosystem, built with **Next.js**, **React Native**, and **Turborepo**.

## 🏗 Project Structure

This monorepo uses [Turborepo](https://turbo.build/repo) to manage shared packages and multiple applications.

```text
.
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native / mobile application
├── packages/
│   ├── core/         # Business logic, entities, and services
│   ├── infrastructure/ # API clients and security utilities
│   ├── ui/           # Shared React components library
│   ├── store/        # State management (Zustand/Redux)
│   └── i18n/         # Internationalization config and dictionaries
├── docker-compose.yml # Local development infrastructure
└── turbo.json        # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or highter
- **npm** or **Yarn**
- **Docker**: For running backend services (optional)

### Installation

```bash
# Install dependencies at the root
npm install
```

### Development

Run all applications in development mode using Turbo:

```bash
npm run dev
```

To run a specific application:

```bash
# Run web app only
npx turbo run dev --filter=web

# Run mobile app only
npx turbo run dev --filter=mobile
```

### Build

```bash
# Build all apps and packages
npm run build
```

## 🛠 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS / Tailwind (as requested)
- **State Management**: React Context / Zustand
- **Monorepo Tooling**: [Turborepo](https://turbo.build/)
- **Infrastructure**: Docker & Docker Compose
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🌐 API Integration

The project uses a custom API client layer located in `packages/infrastructure`.
Backend routes are configured to communicate with microservices via an API Gateway.

## 📄 License

Copyright © 2024 KPLIAN. All rights reserved.
