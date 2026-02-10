# Room Booking Platform

A scalable and fault-tolerant room booking platform with real-time updates, role-based access control, and race condition prevention.

## Features

### User Features
- **Registration & Authentication**: JWT-based authentication with refresh tokens
- **Room Search**: (Pagination) Filter by location, capacity, price, and amenities
- **Booking Management**: Create bookings with automatic conflict detection
- **Real-time Updates**: WebSocket integration for live availability updates
- **Booking History**: View and cancel bookings

### Admin Features
- **User Approval**: Approve/reject ROOM_OWNER registrations
- **Permission Management**: Grant special permissions (multi-room booking, extended duration)
- **Room Management**: CRUD operations for rooms and time slots

### Technical Features
- **Race Condition Prevention**: Serializable transaction isolation for bookings
- **Caching Layer**: Redis caching for permissions, room details, and availability
- **Rate Limiting**: Nginx-based global and endpoint-specific rate limiting
- **Real-time Updates**: Socket.IO for live booking notifications
- **Fault Tolerance**: Connection pooling, retry logic, and error handling

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- PostgreSQL 15 with Prisma ORM
- Redis 7 for caching
- Socket.IO for WebSocket
- JWT authentication

### Frontend
- React 18 + TypeScript + Vite
- Redux Toolkit for state management
- React Router for routing
- Tailwind CSS for styling
- Socket.IO client

### Infrastructure
- Docker + Docker Compose
- Nginx for reverse proxy 
- PostgreSQL for database
- Redis for caching

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL 15+ (for local development without Docker)
- Redis 7+ (for local development without Docker)

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   cd CheckPoint-FULLSTACK\ Task
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - WebSocket: http://localhost/socket.io

### Local Development

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local PostgreSQL and Redis credentials
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER" | "ROOM_OWNER"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Room Endpoints

#### Search Rooms
```http
GET /api/rooms/search?location=NYC&minCapacity=5&maxPrice=100
Authorization: Bearer <token>
```

#### Get Room Details
```http
GET /api/rooms/:id
Authorization: Bearer <token>
```

#### Create Room (ROOM_OWNER/ADMIN)
```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Conference Room A",
  "description": "Large meeting room",
  "location": "NYC",
  "capacity": 20,
  "pricePerHour": 50,
  "amenities": ["Projector", "Whiteboard"]
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "slotId": "slot-uuid",
  "startTime": "2024-01-20T10:00:00Z",
  "endTime": "2024-01-20T12:00:00Z"
}
```

#### Get User Bookings
```http
GET /api/bookings/my-bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
DELETE /api/bookings/:id
Authorization: Bearer <token>
```

### Permission Endpoints

#### Request Special Permission
```http
POST /api/permissions/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionType": "MULTIPLE_ROOMS" | "EXTENDED_DURATION",
  "reason": "Need to book multiple rooms for conference"
}
```

#### Approve Permission (ADMIN)
```http
POST /api/permissions/:id/approve
Authorization: Bearer <token>
```

### User Endpoints (ADMIN)

#### Approve User Registration
```http
POST /api/users/:id/approve
Authorization: Bearer <token>
```

#### List Pending Users
```http
GET /api/users/pending
Authorization: Bearer <token>
```

## WebSocket Events

### Client → Server

#### Subscribe to Room Updates
```javascript
socket.emit('subscribe:room', { roomId: 'room-uuid' });
```

#### Subscribe to Date Updates
```javascript
socket.emit('subscribe:date', { roomId: 'room-uuid', date: '2024-01-20' });
```

### Server → Client

#### Slot Booked
```javascript
socket.on('slot:booked', (data) => {
  // { slotId, roomId, startTime, endTime }
});
```

#### Slot Cancelled
```javascript
socket.on('slot:cancelled', (data) => {
  // { slotId, roomId }
});
```

## Database Schema

### User
- `id`: UUID
- `email`: Unique email
- `password`: Hashed password
- `name`: User name
- `role`: USER | ROOM_OWNER | ADMIN
- `registrationStatus`: PENDING | APPROVED | REJECTED
- `canBookMultipleRooms`: Boolean
- `maxBookingDuration`: Integer (hours)

### Room
- `id`: UUID
- `name`: Room name
- `description`: Room description
- `location`: Room location
- `capacity`: Maximum capacity
- `pricePerHour`: Hourly rate
- `amenities`: Array of amenities
- `ownerId`: Owner user ID

### Slot
- `id`: UUID
- `roomId`: Room ID
- `date`: Booking date
- `startTime`: Start time
- `endTime`: End time
- `isAvailable`: Availability status
- `version`: Optimistic locking version

### Booking
- `id`: UUID
- `userId`: User ID
- `slotId`: Slot ID
- `startTime`: Booking start
- `endTime`: Booking end
- `status`: CONFIRMED | CANCELLED

## Architecture

### Scalability
- **Modular Monolith**: Easy to split into microservices
- **Connection Pooling**: PgBouncer for database connections
- **Caching Layer**: Redis with TTL-based strategies
- **Rate Limiting**: Multi-tier rate limiting (global, per-endpoint, per-user)

### Fault Tolerance
- **Transaction Isolation**: Serializable isolation for bookings
- **Retry Logic**: Automatic retry for transient failures
- **Circuit Breaker**: Fail-fast for external dependencies
- **Health Checks**: Docker health checks for all services

### Security
- **JWT Authentication**: Access + refresh token pattern
- **Password Hashing**: Bcrypt with salt rounds
- **RBAC**: Role-based access control middleware
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Protection against abuse

## Caching Strategy

- **User Permissions**: 1 hour TTL
- **Room Details**: 1 hour TTL
- **Slot Availability**: 5 minutes TTL
- **Search Results**: 10 minutes TTL

## Rate Limits

- **Global**: 100 requests/minute per IP
- **Auth Endpoints**: 5 requests/minute per IP
- **Booking Endpoints**: 10 requests/minute per IP

## User Roles

### USER
- Auto-approved on registration
- Can book one room at a time
- Default booking duration: 2 hours

### ROOM_OWNER
- Requires admin approval
- Can create and manage rooms
- Can book multiple rooms (with permission)

### ADMIN
- Full system access
- Approve/reject users
- Manage permissions
- Manage all rooms

## Testing

### Backend Tests
```bash
cd backend
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

### Production Environment Variables

Update the following in production:

**Backend (.env)**
```env
JWT_SECRET=<strong-random-secret>
REFRESH_TOKEN_SECRET=<strong-random-secret>
DATABASE_URL=<production-db-url>
REDIS_HOST=<production-redis-host>
NODE_ENV=production
```

**Frontend (.env)**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Docker Compose Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks
- Backend: `GET /api/health`
- Database: Docker health check
- Redis: Docker health check

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Redis Connection Issues
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### WebSocket Issues
- Ensure Nginx is configured for WebSocket upgrade
- Check CORS settings in backend
- Verify JWT token in socket.handshake.auth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
└── docker-compose.yml
```

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## License

MIT
