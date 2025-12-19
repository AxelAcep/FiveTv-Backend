# FiveTV Backend

This is the backend for the FiveTV application, built with Node.js, Express, Prisma, and Supabase. It provides a RESTful API for managing content, users, and website configuration.

## Table of Contents

- [FiveTV Backend](#fivetv-backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Running the Server](#running-the-server)
  - [API Endpoints](#api-endpoints)
    - [Admin Routes](#admin-routes)
    - [User Routes](#user-routes)
  - [Authentication](#authentication)
  - [Project Structure](#project-structure)

## Features

- User and Admin authentication using JWT.
- CRUD operations for content (articles, programs).
- Management of "Pengurus" (administrators/staff).
- Website configuration management.
- Monthly view generation for analytics.
- Search functionality for content.

## Technologies

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **Supabase**: Used for data storage.
- **Passport.js**: Authentication middleware for Node.js.
- **JWT (JSON Web Tokens)**: For securing API endpoints.
- **dotenv**: For managing environment variables.
- **cors**: For enabling Cross-Origin Resource Sharing.
- **node-cron**: For scheduling tasks.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A running PostgreSQL database (or any other database compatible with Prisma)
- Supabase account for storage and database.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd FiveTv-Backend
    ```

2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Initialize Prisma:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### Configuration

1.  Create a `.env` file in the root of the project and add the following environment variables:

    ```env
    # Server Configuration
    PORT=5500

    # Database URL (from your database provider)
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

    # Supabase Credentials
    SUPABASE_URL="YOUR_SUPABASE_URL"
    SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

    # JWT and Session Secrets
    JWT_SECRET="your_jwt_secret"
    SESSION_SECRET="your_session_secret"
    ```

2.  Replace the placeholder values with your actual credentials.

### Running the Server

- To run the server in development mode:
  ```bash
  npm run dev
  ```

- To start the server in production:
  ```bash
  npm start
  ```

The server will be running at `http://localhost:5500`.

## API Endpoints

All endpoints are prefixed with `/api`.

### Admin Routes

All admin routes are prefixed with `/api/admin` and require JWT authentication.

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| POST   | `/login`                    | Login as an admin                 |
| POST   | `/register`                 | Register a new admin              |
| GET    | `/dashboard`                | Get dashboard statistics          |
| GET    | `/konten`                   | Get all content                   |
| POST   | `/konten`                   | Create new content                |
| GET    | `/konten/:kodeKonten`       | Get content by code               |
| PUT    | `/konten/:kodeKonten`       | Update content                    |
| DELETE | `/konten/:kodeKonten`       | Delete content                    |
| GET    | `/search`                   | Search for content                |
| GET    | `/jenis`                    | Get all content types             |
| POST   | `/jenis`                    | Add a new content type            |
| GET    | `/anggota`                  | Get all "pengurus"                |
| POST   | `/anggota`                  | Add a new "pengurus"              |
| GET    | `/anggota/:nim`             | Get "pengurus" by ID (nim)        |
| PUT    | `/anggota/:nim`             | Update "pengurus"                 |
| DELETE | `/anggota/:nim`             | Delete "pengurus"                 |
| GET    | `/config`                   | Get website configuration         |
| PUT    | `/config`                   | Update website configuration      |

### User Routes

All user routes are prefixed with `/api/user`.

| Method | Endpoint                | Description                                |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | `/dashboard`            | Get dashboard data for the homepage      |
| GET    | `/program`              | Get all program data                       |
| GET    | `/artikel`              | Get all article data                       |
| GET    | `/profile`              | Get profile information                    |
| GET    | `/konten/:kodeKonten`   | Get content detail by code                 |
| GET    | `/search`               | Search all content                         |
| GET    | `/search/artikel`       | Search articles                            |
| GET    | `/search/program`       | Search programs                            |
| GET    | `/rekomen`              | Get recommended content                    |
| POST   | `/monthly-view/generate`| Manually generate monthly view statistics  |

## Authentication

Authentication is handled using Passport.js with a local strategy for email and password authentication. Upon successful login, a JSON Web Token (JWT) is generated and must be included in the `Authorization` header of subsequent requests to protected routes.

**Example:** `Authorization: Bearer <your_jwt_token>`

## Project Structure

```
src/
├── controllers/    # Request handlers
├── errors/         # Custom error classes
├── middlewares/    # Express middlewares
├── routers/        # Route definitions
├── dataStorage.js  # Supabase client setup
├── index.js        # Main application entry point
├── passport.js     # Passport.js authentication configuration
```
