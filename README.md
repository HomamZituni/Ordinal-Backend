# Ordinal Backend API 

**AI-Forward Rewards Management Platform**  
A Netflix-style personalized credit card rewards dashboard that dynamically ranks redemptions based on spending behavior

## Features

- **JWT Authentication** - Secure user registration/login
- **Multi-Card Portfolio** - Manage multiple credit cards with points tracking
- **Transaction Management** - Full CRUD operations for spending data
- **Personalized Recommendations** - Deterministic and weighted-scoring scoring engine for reward suggestions
- **AI Toggle** - Switch between ranked recommendations and simple lists
- **Gamification** - Notification at the top for 
- **Full CRUD** - Cards, Transactions, User Profiles

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 18+ | Server runtime |
| **Framework** | Express.js | 4.x | Web framework |
| **Database** | MongoDB | 6.x | NoSQL database |
| **ODM** | Mongoose | Latest | MongoDB modeling |
| **Auth** | JWT + bcrypt | Latest | User authentication |
| **Dev** | Nodemon | Latest | Auto-restart dev server |
| **Env** | dotenv | Latest | Environment variables |
| **Validation** | Custom + Mongoose | - | Request validation |

### package.json Dependencies



## Project Structure
ordinal-backend/
├── controllers/ # API logic
├── models/ # Mongoose schemas
├── routes/ # Express routes
├── middleware/ # Auth middleware
├── seeds/ # Database seed scripts
├── utils/ # Helper functions
├── server.js # Entry point
├── package.json
└── .env # Environment variables

NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/ordinal
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

## API Endpoints 
| Method | Endpoint                                   | Description               | 
| ------ | ------------------------------------------ | ------------------------- | 
| POST   | /api/auth/register                         | Create user account       |     
| POST   | /api/auth/login                            | User login                |     
| GET    | /api/users/me                              | Get user profile          |     
| PATCH  | /api/users/me                              | Update profile            |    
| PATCH  | /api/users/me/ai-toggle                    | Toggle AI recommendations |     
| POST   | /api/cards                                 | Create card               |     
| GET    | /api/cards                                 | Get all cards             |    
| GET    | /api/cards/:id                             | Get single card           |     
| PATCH  | /api/cards/:id                             | Update card               |     
| DELETE | /api/cards/:id                             | Delete card               |     
| POST   | /api/cards/:cardId/transactions            | Create transaction        |     
| GET    | /api/cards/:cardId/transactions            | Get card transactions     |     
| PATCH  | /api/cards/:cardId/transactions/:id        | Update transaction        |     
| DELETE | /api/cards/:cardId/transactions/:id        | Delete transaction        |     
| GET    | /api/cards/:cardId/rewards                 | Get available rewards     |     
| GET    | /api/cards/:cardId/recommendations         | Get NBA recommendations   |     
| POST   | /api/cards/:cardId/recommendations/refresh | Refresh recommendations   | 
| GET    | /api/cards/gamification                    | Get gamification insights | 

