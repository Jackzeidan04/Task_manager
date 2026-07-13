# Task Manager

A full-stack task management app with JWT authentication and role-based access control, built as a learning project with .NET, React, and MongoDB.

## Features

- 🔐 JWT authentication with hashed passwords (BCrypt)
- 👥 Role-based access control (Admin / User)
- 📝 Personal task lists — each user only sees their own tasks
- ✅ Task status (Incomplete / Completed), priority levels, and due dates
- 🔍 Search and filter for both tasks and users
- 🛡️ Admin-only user management (edit roles, delete users)
- 🎨 Custom dark-themed UI

## Tech Stack

**Backend:** ASP.NET Core Web API, MongoDB.Driver, JWT Bearer Authentication, BCrypt.Net
**Frontend:** React, Axios, Vite
**Database:** MongoDB

## Screenshots

<!-- Add screenshots here, e.g.: -->
<!-- ![Login page](screenshots/login.png) -->
<!-- ![Task dashboard](screenshots/tasks.png) -->

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js (v18+)
- MongoDB (running locally or a connection string to MongoDB Atlas)

### Backend Setup

```bash
cd backend-folder
dotnet restore
```

Create an `appsettings.Development.json` (this file is gitignored) with your own values:

```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "TaskManagerDb"
  },
  "Jwt": {
    "Secret": "REPLACE_WITH_A_LONG_RANDOM_SECRET",
    "Issuer": "YourAppName",
    "Audience": "YourAppUsers",
    "ExpirationMinutes": 60
  }
}
```

Run the API:

```bash
dotnet run
```

The API will be available at `https://localhost:7008`. Swagger docs at `/swagger`.

### Frontend Setup

```bash
cd frontend-folder
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Admin Access

Registering as an admin requires an access code. **Note:** in the current version this is checked client-side only (see Known Limitations) — before deploying anywhere public, this should be moved to server-side validation.

## API Endpoints

| Method | Endpoint              | Description                    | Auth Required |
| ------ | --------------------- | ------------------------------ | ------------- |
| POST   | `/api/users/register` | Register a new user            | No            |
| POST   | `/api/users/login`    | Login                          | No            |
| GET    | `/api/users`          | List/search users              | Yes           |
| PUT    | `/api/users/{id}`     | Update user (role: admin only) | Yes           |
| DELETE | `/api/users/{id}`     | Delete user (admin only)       | Yes           |
| GET    | `/api/tasks`          | Get current user's tasks       | Yes           |
| POST   | `/api/tasks`          | Create a task                  | Yes           |
| PUT    | `/api/tasks/{id}`     | Update a task                  | Yes           |
| DELETE | `/api/tasks/{id}`     | Delete a task                  | Yes           |

## Known Limitations

This is a learning project and isn't hardened for production use. Notably:

- Admin registration code is validated client-side, not server-side
- No rate limiting on auth endpoints
- No refresh token flow (users are logged out when the JWT expires)
- No automated tests
- No pagination on list endpoints

## License

MIT
