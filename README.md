#  Real-Time Chat API

A production-grade real-time chat API built with **ASP.NET Core 9**, **SignalR**, **Entity Framework Core**, and **SQL Server**. Supports room-based messaging, offline delivery, typing indicators, message delivery status, and cursor-based pagination — all secured with JWT authentication over WebSocket connections.

---

## Features

- **JWT Authentication** — secure registration and login
- **Real-Time Messaging** — bidirectional communication via SignalR WebSockets
- **Offline Message Delivery** — missed messages pushed on reconnect
- **Room Management** — create rooms, manage members, owner permissions
- **Cursor-Based Pagination** — efficient message history retrieval
- **Typing Indicators** — real-time typing state broadcast
- **Message Delivery Status** — Sent → Delivered → Read tracking
- **Global Exception Handling** — consistent RFC 9457 Problem Details responses
- **Soft Delete** — rooms are never hard-deleted, data integrity preserved

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | ASP.NET Core 9 |
| Real-Time | SignalR (built-in) |
| Database | SQL Server (LocalDB for dev) |
| ORM | Entity Framework Core 9 |
| Authentication | JWT Bearer |
| Password Hashing | BCrypt.Net |
| Object Mapping | AutoMapper |
| API Docs | Swagger / OpenAPI |

---

## 🚀 Getting Started

### Prerequisites

- .NET 9 SDK
- SQL Server or LocalDB
- Visual Studio 2022 / VS Code

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/Abdallah-Shadad/ChatApp.git
cd ChatAPI/Backend/ChatAPI
```

**2. Configure user secrets**
```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\\MSSQLLocalDB;Database=ChatAppDB;Trusted_Connection=True;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "your-super-secret-key-minimum-32-characters-long"
dotnet user-secrets set "Jwt:Issuer" "ChatAPI"
dotnet user-secrets set "Jwt:Audience" "ChatAPIUsers"
```

**3. Apply migrations**
```bash
dotnet ef database update
```

**4. Run**
```bash
dotnet run
```

**5. Open Swagger**
```
https://localhost:7063/swagger
```

---

## 📡 API Reference

### Authentication (HTTP)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login, receive JWT | ❌ |

**Register Request:**
```json
{
  "name": "Ahmed Mohamed",
  "username": "ahmed123",
  "email": "ahmed@example.com",
  "password": "secret123"
}
```

**Auth Response:**
```json
{
  "token": "eyJhbGci...",
  "userId": 1,
  "username": "ahmed123",
  "email": "ahmed@example.com"
}
```

---

### Rooms (HTTP)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms` | Get all rooms I belong to | ✅ |
| POST | `/api/rooms` | Create a new room | ✅ |
| DELETE | `/api/rooms/{id}` | Soft-delete room (Owner only) | ✅ |

---

### Members (HTTP)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rooms/{roomId}/members` | Add member (Owner only) | ✅ |
| DELETE | `/api/rooms/{roomId}/members/{userId}` | Remove member (Owner or Self) | ✅ |

---

### Messages (HTTP)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/messages/{roomId}?cursor={id}&limit={n}` | Paginated message history | ✅ |

**Pagination:** Pass the `Id` of the oldest message you have as `cursor`. Server returns the next `limit` messages (default 20) before that cursor, ordered newest first.

---

### SignalR Hub — `/chatHub`

**Connection:**
```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/chatHub?access_token=YOUR_JWT_TOKEN")
  .build();
```

**Client → Server (invoke):**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `SendMessage` | `roomId, content` | Send message to room |
| `MarkAsRead` | `roomId` | Mark all messages in room as read |
| `StartTyping` | `roomId, isTyping` | Broadcast typing started |
| `StopTyping` | `roomId` | Broadcast typing stopped |

**Server → Client (listen):**

| Event | Payload | Description |
|-------|---------|-------------|
| `ReceiveMessage` | `MessageDto` | New message in room |
| `ReceiveUndeliveredMessages` | `MessageDto[]` | Offline messages on reconnect |
| `MessagesRead` | `{ roomId, messageIds, userId }` | Read receipt broadcast |
| `UserTyping` | `{ roomId, username, isTyping }` | Typing indicator |

---

## 🗄️ Database Schema

```
USER
├── Id (int, PK)
├── Name (string, max 150)
├── Username (string, UNIQUE)
├── Email (string, UNIQUE)
├── PasswordHash (string)
└── CreatedAt (DateTime)

ROOM
├── Id (int, PK)
├── Name (string, max 150)
├── CreatedAt (DateTime)
├── CreatedByUserId (FK → User, RESTRICT)
└── IsDeleted (bool, default false)

ROOMMEMBER  [composite PK: UserId + RoomId]
├── UserId (FK → User)
├── RoomId (FK → Room, CASCADE)
├── Role (string: "Owner" | "Member")
└── JoinedAt (DateTime)

MESSAGE
├── Id (int, PK)  ← pagination cursor
├── Content (string, max 4096)
├── SenderId (FK → User, RESTRICT)
├── RoomId (FK → Room, CASCADE)
└── SentAt (DateTime)

MESSAGESTATUS  [composite PK: MessageId + UserId]
├── MessageId (FK → Message, CASCADE)
├── UserId (FK → User)
├── Status (string: "Sent" | "Delivered" | "Read")
├── DeliveredAt (DateTime, nullable)
└── ReadAt (DateTime, nullable)
```

---

## 🏗️ Project Structure

```
ChatAPI/
├── Controllers/
│   ├── BaseController.cs          # GetUserId() from JWT claims
│   ├── AuthController.cs          # Register + Login
│   ├── RoomsController.cs         # Room CRUD
│   ├── MembersController.cs       # Room membership
│   └── MessagesController.cs      # Paginated history
├── Hubs/
│   └── ChatHub.cs                 # SignalR Hub — real-time logic
├── Data/
│   └── AppDbContext.cs            # EF Core + Fluent API config
├── DTOs/                          # Request/Response shapes
├── Enums/
│   ├── UserRole.cs                # Owner, Member
│   └── MessageStatusEnum.cs      # Sent, Delivered, Read
├── Exceptions/
│   └── Exceptions.cs             # Typed domain exceptions
├── Middleware/
│   └── GlobalExceptionHandler.cs # IExceptionHandler → ProblemDetails
├── Mappings/
│   └── MappingProfile.cs         # AutoMapper profiles
├── Models/                        # EF Core entities
├── Services/                      # Business logic layer
└── Program.cs                     # DI + middleware pipeline
```

---

## 🔐 Security

- Passwords hashed with **BCrypt** — never stored in plain text
- JWT tokens signed with **HMAC-SHA256**, expire after 24 hours
- **IDOR protection** — all queries filter by authenticated userId
- **WebSocket JWT** — token passed via query string, extracted in `OnMessageReceived` event (browsers cannot set Authorization headers on WebSocket connections)
- **CORS** — strict origin whitelist with `AllowCredentials()` (W3C prohibits wildcard origins with credentials)
- **Secrets** stored in `dotnet user-secrets` locally, environment variables in production

---

## Key Engineering Decisions

**Why WebSockets over HTTP polling?**
HTTP is request-response — the server cannot push data without a client request. Polling wastes bandwidth and adds latency. WebSockets provide a persistent, bidirectional channel after a single HTTP upgrade handshake.

**Why TCP not UDP?**
Chat messages must arrive complete and in order. UDP provides no delivery guarantees — "Hello Ahmed" could arrive as "Hlo Ahd". TCP ensures reliability.

**Why soft delete on rooms?**
Hard deletes cascade through messages and statuses, destroying chat history. Soft delete (`IsDeleted = true`) with a global query filter preserves data integrity while hiding deleted rooms transparently.

**Why composite PKs on RoomMember and MessageStatus?**
Enforces uniqueness at the database level — one membership per user per room, one status per user per message. No application-level duplicate checking needed.

**Why enums stored as strings?**
Integer enum values corrupt silently when enum order changes. Storing `"Delivered"` instead of `1` makes data self-describing and immune to refactoring bugs.

---

##  Future Enhancements

- [ ] **Add minimal frontend** — basic UI to interact with the Chat API
- [ ] **Idempotency keys** on `SendMessage` — prevent duplicate messages on network retry
- [ ] **Multiple device support** — deliver to all active connections per user
- [ ] **Read receipts per user** — show who specifically has read a message
- [ ] **Room roles** — Moderator tier between Owner and Member
- [ ] **Push notifications** — notify offline users via FCM/APNs
- [ ] **Message reactions** — emoji reactions on messages
- [ ] **File/image uploads** — Azure Blob Storage integration
- [ ] **Rate limiting** — prevent message spam per user
- [ ] **End-to-end encryption** — client-side key exchange

---

## License

MIT
