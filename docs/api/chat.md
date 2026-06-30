# Chat & Messaging API

Endpoints prefixed with: `/api/v1/chat`

All REST endpoints require JWT Bearer token authentication. Real-time messaging uses WebSocket (Socket.IO) at namespace `/chat`.

---

## REST API

### GET /chat/conversations

Get all conversations for the current user (paginated).

#### Success Response (200)
```json
{
  "success": true,
  "message": "Conversations fetched successfully",
  "data": [
    {
      "id": "uuid",
      "participants": [
        { "uuid": "...", "firstName": "Jane", "lastName": "Doe", "lastActiveAt": "..." }
      ],
      "lastMessage": {
        "content": "Hello!",
        "type": "text",
        "senderId": 42,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "unreadCount": 2,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### POST /chat/conversations

Create a new conversation (start chatting with another user).

#### Request Body
```json
{
  "participantId": 42,
  "initialMessage": "Hi! I saw your profile and would love to connect."
}
```

#### Success Response (201)
```json
{
  "success": true,
  "message": "Conversation created",
  "data": {
    "id": "conv-uuid",
    "participants": [...]
  }
}
```

#### Error Responses
- **409**: Conversation already exists between these users

### GET /chat/conversations/:id

Get conversation details with participant info.

### GET /chat/conversations/:id/messages

Get paginated messages for a conversation.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Messages per page (max: 100) |
| `before` | timestamp | - | Messages before this timestamp |

#### Success Response (200)
```json
{
  "success": true,
  "message": "Messages fetched",
  "data": [
    {
      "id": "msg-uuid",
      "conversationId": "conv-uuid",
      "senderId": 1,
      "content": "Hello!",
      "type": "text",
      "mediaUrl": null,
      "readAt": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "total": 150, "page": 1, "limit": 50, "totalPages": 3 }
}
```

### DELETE /chat/conversations/:id

Soft-delete a conversation (only for the current user).

Success Response: 200 OK

### POST /chat/messages/:id/report

Report a message for policy violation.

#### Request Body
```json
{
  "reason": "Harassment or inappropriate content"
}
```

Success Response: 201 Created

### POST /chat/upload

Upload a file for sharing in chat (multipart/form-data).

| Field | Type | Limits |
|-------|------|--------|
| `file` | file (image, document) | Max 10MB |

#### Success Response (201)
```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "url": "https://media.itconnectmatrimony.com/chat/abc123.jpg",
    "name": "photo.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

---

## WebSocket API

### Connection

```
ws://localhost:4000/chat
wss://api.itconnectmatrimony.com/chat
```

### Authentication

Connect with JWT token via auth parameter, query string, or Authorization header:

```javascript
// Option 1: auth parameter
const socket = io('wss://api.itconnectmatrimony.com/chat', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIs...' }
});

// Option 2: query parameter
const socket = io('wss://api.itconnectmatrimony.com/chat', {
  query: { token: 'eyJhbGciOiJIUzI1NiIs...' }
});

// Option 3: Authorization header (not recommended for WebSocket)
// Set via before connect
```

### Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `{ conversationId: string }` | Join a conversation room |
| `conversation:leave` | `{ conversationId: string }` | Leave a conversation room |
| `message:send` | `{ conversationId, content, type?, mediaUrl? }` | Send a message |
| `message:typing` | `{ conversationId }` | User is typing |
| `message:stop-typing` | `{ conversationId }` | User stopped typing |
| `message:read` | `{ conversationId }` | Mark conversation as read |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ userId: string }` | Connection established |
| `message:new` | `{ message object }` | New message in conversation |
| `message:typing` | `{ conversationId, userId, isTyping }` | Typing status update |
| `message:read` | `{ conversationId, readBy }` | Messages read receipt |
| `error` | `{ message: string }` | Error notification |

### JavaScript Client Example

```javascript
import { io } from 'socket.io-client';

const socket = io('wss://api.itconnectmatrimony.com/chat', {
  auth: { token: accessToken },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to chat');
});

socket.on('connected', (data) => {
  console.log('Authenticated as:', data.userId);
});

// Join a conversation
socket.emit('conversation:join', { conversationId: 'conv-uuid' });

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Send a message
socket.emit('message:send', {
  conversationId: 'conv-uuid',
  content: 'Hello!',
  type: 'text',
});

// Typing indicator
socket.emit('message:typing', { conversationId: 'conv-uuid' });

// Mark as read
socket.emit('message:read', { conversationId: 'conv-uuid' });

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### Message Types

| Type | Description | Content/Media |
|------|-------------|---------------|
| `text` | Plain text message | `content` field |
| `image` | Image message | `mediaUrl` field |
| `file` | File attachment | `mediaUrl` field |
| `system` | System message (match, call, etc.) | `content` with system info |
