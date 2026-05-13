# PBL (Problem-Based Learning) CRUD API Documentation

This document describes all the API endpoints for managing PBL Cases, Sections, and Section Items.

## Base URL
```
http://localhost:8000/api
```

## API Endpoints Overview

### PBL Cases
- `GET /api/pbl-cases` - Get all cases (paginated)
- `POST /api/pbl-cases` - Create a new case
- `GET /api/pbl-cases/:id` - Get a specific case
- `PUT /api/pbl-cases/:id` - Update a case
- `DELETE /api/pbl-cases/:id` - Delete a case

### PBL Sections
- `GET /api/pbl-cases/:caseId/sections` - Get sections by case
- `POST /api/pbl-cases/:caseId/sections` - Create a new section
- `GET /api/pbl-sections/:id` - Get a specific section
- `PUT /api/pbl-sections/:id` - Update a section
- `DELETE /api/pbl-sections/:id` - Delete a section

### PBL Section Items
- `POST /api/pbl-sections/:sectionId/items` - Create a new item
- `GET /api/pbl-items/:id` - Get a specific item
- `PUT /api/pbl-items/:id` - Update an item
- `DELETE /api/pbl-items/:id` - Delete an item

---

## Detailed Endpoints

### 1. PBL Cases

#### GET /api/pbl-cases
Retrieve all PBL cases with pagination support.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)
- `search` (optional): Search by title or description

**Response (200 OK):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "slug": "system-login-bermasalah-ymEGQTTF",
      "case_number": 1,
      "title": "System Login Bermasalah",
      "pbl_level_id": 1,
      "description": "Anda diminta untuk menyelesaikan...",
      "image_url": null,
      "time_limit": 120,
      "start_date": "2026-05-07T20:28:13.000000Z",
      "deadline": "2026-06-07T02:28:13.000000Z",
      "pbl_level": {
        "id": 1,
        "name": "Beginner",
        "created_at": "2026-05-06T12:03:19.000000Z",
        "updated_at": "2026-05-06T12:03:19.000000Z"
      },
      "status": "in-progress",
      "created_at": "2026-05-06T12:03:19.000000Z",
      "updated_at": "2026-05-06T12:03:19.000000Z"
    }
  ],
  "first_page_url": "http://localhost:8000/api/pbl-cases?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "http://localhost:8000/api/pbl-cases?page=1",
  "links": [
    {
      "url": null,
      "label": "&laquo; Previous",
      "active": false
    },
    {
      "url": "http://localhost:8000/api/pbl-cases?page=1",
      "label": "1",
      "active": true
    },
    {
      "url": null,
      "label": "Next &raquo;",
      "active": false
    }
  ],
  "next_page_url": null,
  "path": "http://localhost:8000/api/pbl-cases",
  "per_page": 15,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

#### POST /api/pbl-cases
Create a new PBL case.

**Request Body:**
```json
{
  "case_number": 1,
  "title": "System Login Bermasalah",
  "pbl_level_id": 1,
  "description": "Anda diminta untuk menyelesaikan...",
  "image_url": null,
  "time_limit": 120,
  "start_date": "2026-05-07T20:28:13.000000Z",
  "deadline": "2026-06-07T02:28:13.000000Z",
  "status": "in-progress"
}
```

**Response (201 Created):**
```json
{
  "message": "PBL case created successfully",
  "data": {
    "id": 1,
    "slug": "system-login-bermasalah-ymEGQTTF",
    "case_number": 1,
    "title": "System Login Bermasalah",
    "pbl_level_id": 1,
    "description": "Anda diminta untuk menyelesaikan...",
    "image_url": null,
    "time_limit": 120,
    "start_date": "2026-05-07T20:28:13.000000Z",
    "deadline": "2026-06-07T02:28:13.000000Z",
    "pbl_level": {
      "id": 1,
      "name": "Beginner",
      "created_at": "2026-05-06T12:03:19.000000Z",
      "updated_at": "2026-05-06T12:03:19.000000Z"
    },
    "status": "in-progress",
    "created_at": "2026-05-06T12:03:19.000000Z",
    "updated_at": "2026-05-06T12:03:19.000000Z"
  }
}
```

#### GET /api/pbl-cases/:id
Get a specific PBL case by ID.

**Response (200 OK):**
```json
{
  "message": "PBL case retrieved successfully",
  "data": {
    "id": 1,
    "slug": "system-login-bermasalah-ymEGQTTF",
    "case_number": 1,
    "title": "System Login Bermasalah",
    "pbl_level_id": 1,
    "description": "Anda diminta untuk menyelesaikan...",
    "image_url": null,
    "time_limit": 120,
    "start_date": "2026-05-07T20:28:13.000000Z",
    "deadline": "2026-06-07T02:28:13.000000Z",
    "pbl_level": {
      "id": 1,
      "name": "Beginner",
      "created_at": "2026-05-06T12:03:19.000000Z",
      "updated_at": "2026-05-06T12:03:19.000000Z"
    },
    "status": "in-progress",
    "created_at": "2026-05-06T12:03:19.000000Z",
    "updated_at": "2026-05-06T12:03:19.000000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "PBL case not found"
}
```

#### PUT /api/pbl-cases/:id
Update a PBL case.

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "message": "PBL case updated successfully",
  "data": {
    "id": 1,
    "slug": "system-login-bermasalah-ymEGQTTF",
    "case_number": 1,
    "title": "Updated Title",
    "pbl_level_id": 1,
    "description": "Anda diminta untuk menyelesaikan...",
    "image_url": null,
    "time_limit": 120,
    "start_date": "2026-05-07T20:28:13.000000Z",
    "deadline": "2026-06-07T02:28:13.000000Z",
    "pbl_level": {
      "id": 1,
      "name": "Beginner",
      "created_at": "2026-05-06T12:03:19.000000Z",
      "updated_at": "2026-05-06T12:03:19.000000Z"
    },
    "status": "completed",
    "created_at": "2026-05-06T12:03:19.000000Z",
    "updated_at": "2026-05-06T12:03:19.000000Z"
  }
}
```

#### DELETE /api/pbl-cases/:id
Delete a PBL case.

**Response (200 OK):**
```json
{
  "message": "PBL case deleted successfully",
  "data": {
    "id": 1,
    "slug": "system-login-bermasalah-ymEGQTTF",
    "case_number": 1,
    "title": "System Login Bermasalah",
    "pbl_level_id": 1,
    "description": "Anda diminta untuk menyelesaikan...",
    "image_url": null,
    "time_limit": 120,
    "start_date": "2026-05-07T20:28:13.000000Z",
    "deadline": "2026-06-07T02:28:13.000000Z",
    "pbl_level": {
      "id": 1,
      "name": "Beginner",
      "created_at": "2026-05-06T12:03:19.000000Z",
      "updated_at": "2026-05-06T12:03:19.000000Z"
    },
    "status": "in-progress",
    "created_at": "2026-05-06T12:03:19.000000Z",
    "updated_at": "2026-05-06T12:03:19.000000Z"
  }
}
```

---

### 2. PBL Sections

#### GET /api/pbl-cases/:caseId/sections
Get all sections for a specific case.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Tes Endpoint",
    "order": 1,
    "items": [
      {
        "id": 1,
        "type": "text",
        "content": "abcdefghijklmnopqrstuvwxyz",
        "image_url": null,
        "order": 1
      }
    ]
  }
]
```

#### POST /api/pbl-cases/:caseId/sections
Create a new section in a case.

**Request Body:**
```json
{
  "title": "New Section",
  "order": 1
}
```

**Response (201 Created):**
```json
{
  "message": "Section created successfully",
  "data": {
    "id": 2,
    "title": "New Section",
    "order": 1,
    "items": []
  }
}
```

#### GET /api/pbl-sections/:id
Get a specific section.

**Response (200 OK):**
```json
{
  "message": "Section retrieved successfully",
  "data": {
    "id": 1,
    "title": "Tes Endpoint",
    "order": 1,
    "items": [
      {
        "id": 1,
        "type": "text",
        "content": "abcdefghijklmnopqrstuvwxyz",
        "image_url": null,
        "order": 1
      }
    ]
  }
}
```

#### PUT /api/pbl-sections/:id
Update a section.

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "order": 2
}
```

**Response (200 OK):**
```json
{
  "message": "Section updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Section Title",
    "order": 2,
    "items": [
      {
        "id": 1,
        "type": "text",
        "content": "abcdefghijklmnopqrstuvwxyz",
        "image_url": null,
        "order": 1
      }
    ]
  }
}
```

#### DELETE /api/pbl-sections/:id
Delete a section (also deletes associated items).

**Response (200 OK):**
```json
{
  "message": "Section deleted successfully",
  "data": {
    "id": 1,
    "pbl_case_id": 1,
    "title": "Tes Endpoint",
    "order": 1,
    "created_at": "2026-05-06T12:03:19.000000Z",
    "updated_at": "2026-05-06T12:03:19.000000Z"
  }
}
```

---

### 3. PBL Section Items

#### POST /api/pbl-sections/:sectionId/items
Create a new item in a section.

**Request Body:**
```json
{
  "type": "text",
  "content": "Your text content here",
  "order": 1
}
```

**Response (201 Created):**
```json
{
  "message": "Section item created successfully",
  "data": {
    "id": 1,
    "type": "text",
    "content": "Your text content here",
    "image_url": null,
    "order": 1
  }
}
```

#### GET /api/pbl-items/:id
Get a specific item.

**Response (200 OK):**
```json
{
  "message": "Item retrieved successfully",
  "data": {
    "id": 1,
    "type": "text",
    "content": "abcdefghijklmnopqrstuvwxyz",
    "image_url": null,
    "order": 1
  }
}
```

#### PUT /api/pbl-items/:id
Update an item.

**Request Body:**
```json
{
  "content": "Updated content",
  "order": 2
}
```

**Response (200 OK):**
```json
{
  "message": "Item updated successfully",
  "data": {
    "id": 1,
    "type": "text",
    "content": "Updated content",
    "image_url": null,
    "order": 2
  }
}
```

#### DELETE /api/pbl-items/:id
Delete an item.

**Response (200 OK):**
```json
{
  "message": "Item deleted successfully",
  "data": {
    "id": 1,
    "pbl_section_id": 1,
    "type": "text",
    "content": "abcdefghijklmnopqrstuvwxyz",
    "image_url": null,
    "order": 1,
    "created_at": "2026-05-06T12:03:19.000000Z",
    "updated_at": "2026-05-06T12:03:19.000000Z"
  }
}
```

---

## Item Types

Supported item types:
- `text` - Text content
- `image` - Image content
- `video` - Video content
- `file` - File content

---

## Status Values

Case statuses:
- `not-started` - Case hasn't been started
- `in-progress` - Case is currently being worked on
- `completed` - Case has been completed

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields"
}
```

### 404 Not Found
```json
{
  "message": "PBL case not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error retrieving PBL case",
  "error": "Error message details"
}
```

---

## Usage Examples

### Example 1: Get all PBL cases
```bash
curl -X GET "http://localhost:8000/api/pbl-cases?page=1&per_page=10"
```

### Example 2: Create a new PBL case
```bash
curl -X POST "http://localhost:8000/api/pbl-cases" \
  -H "Content-Type: application/json" \
  -d '{
    "case_number": 2,
    "title": "New Case",
    "pbl_level_id": 1,
    "description": "Case description",
    "time_limit": 120,
    "start_date": "2026-05-07T20:28:13.000000Z",
    "deadline": "2026-06-07T02:28:13.000000Z",
    "status": "in-progress"
  }'
```

### Example 3: Get sections for a case
```bash
curl -X GET "http://localhost:8000/api/pbl-cases/1/sections"
```

### Example 4: Create a section item
```bash
curl -X POST "http://localhost:8000/api/pbl-sections/1/items" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Item content",
    "order": 1
  }'
```

---

## Service Integration

The project includes service files that wrap these API endpoints:
- `services/pbl-case.service.js` - PBL Case operations
- `services/pbl-section.service.js` - PBL Section operations
- `services/pbl-section-item.service.js` - PBL Section Item operations

### Usage in Components:
```typescript
import PBLCaseService from '@/services/pbl-case.service';
import { apiClient } from '@/lib/api-client';

const caseService = PBLCaseService(apiClient);

// Get all cases
const response = await caseService.retrieve({ page: 1, per_page: 15 });
const { data, total, current_page } = response.data;
```
