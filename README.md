# Bloggr

**A simple, community-driven blogging platform.**

Bloggr is a full-stack web application where users can share their ideas, publish articles, interact through comments and votes, and discover content from other writers. It also includes an administrative interface for managing reports and users.

## Features

- **User Authentication** — Secure registration, login, and logout.
- **Blog Management** — Create, edit, delete, save drafts, and publish posts.
- **Explore Posts** — Browse, search, filter by tags, and navigate paginated results.
- **Community Interaction** — Upvote, downvote, comment, and reply to posts.
- **User Profiles** — View published posts and manage profile information.
- **Content Moderation** — Report inappropriate content and review reports through the admin panel.
- **Admin Management** — Dedicated administrator access for moderation and user management.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework and API |
| MongoDB | Database |
| Mongoose | Database modeling |
| HTML, CSS, JavaScript | Frontend |
| Express Session | Session-based authentication |
| bcrypt | Password hashing |

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Nivedck/Blogger.git
   cd Blogger
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/bloggr
   SESSION_SECRET=your_random_secret
   ```

   Replace the MongoDB URI and session secret with the appropriate values for your environment.

4. Start the application:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:5000](http://localhost:5000) in your browser.

### Administrator Setup

Create the administrator account using the provided seed script:

```bash
node scripts/seedAdmin.js
```

Follow the prompts to configure the account. Public registration creates regular user accounts only.

## Project Structure

```text
Blogger/
├── public/             # Frontend pages and styles
│   └── js/
│       ├── components/ # Reusable UI renderers
│       ├── core/       # API, auth, DOM, and formatting modules
│       └── pages/      # One ES module entry point per page
├── scripts/            # Administrative setup scripts
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Authentication and other middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── services/       # Application business logic
├── .env                # Environment configuration
├── .gitignore
├── package.json
├── package-lock.json
├── server.js           # Application entry point
└── README.md
```

## Security

- Passwords are hashed using bcrypt.
- Session-based authentication protects restricted operations.
- Role-based authorization separates administrator privileges from regular users.
- Environment variables are used for sensitive configuration.
- Server-side validation and access checks help protect application data.

## Team

Developed by Nived C K , Nandakishor Ramadas , P Yadhun Rajesh , Sarath K

## License

This project was developed for educational purposes.
