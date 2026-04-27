# Integrasi Backend Laravel dengan Frontend Next.js

## Setup Selesai ✅

Backend Laravel Anda sudah terhubung dengan Next.js frontend menggunakan **Laravel Sanctum** untuk autentikasi.

---

## File-file yang Dibuat

### 1. **`.env.local`**
   - Konfigurasi URL backend
   - Environment variable: `NEXT_PUBLIC_API_URL`

### 2. **`lib/api-client.ts`**
   - Konfigurasi axios instance
   - Interceptor untuk menambahkan token ke setiap request
   - Handling error 401 (unauthorized)

### 3. **`lib/api-services.ts`**
   - Service untuk Authentication (login, register, logout)
   - Service untuk User management
   - Service untuk Course/Materi
   - Service untuk Assessment
   - *Anda bisa menambahkan lebih banyak services sesuai kebutuhan*

### 4. **`hooks/use-auth.ts`**
   - Custom hook untuk authentication
   - State management untuk user, loading, error
   - Methods: login, logout, register

---

## Cara Menggunakan

### Login Example

```tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect atau update UI
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Fetch User Data Example

```tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/lib/api-services';
import { useEffect, useState } from 'react';

export default function UserPage() {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data.data || data);
      } catch (err) {
        console.error('Fetch users failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Fetch Courses Example

```tsx
import { courseService } from '@/lib/api-services';
import { useEffect, useState } from 'react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data.data || data);
      } catch (err) {
        console.error('Fetch courses failed:', err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <h1>Courses</h1>
      {courses.map((course: any) => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}
```

---

## Backend Laravel Setup (Checklist)

Pastikan Laravel backend Anda memiliki:

- [ ] Laravel Sanctum sudah install dan konfigurasi
- [ ] Routes API di `/routes/api.php`:
  - `POST /login` - Login user
  - `POST /register` - Register user
  - `POST /logout` - Logout user (authenticated)
  - `GET /user` - Get current user (authenticated)
  - `GET /users` - Get all users
  - `GET /users/{id}` - Get user by ID
  - `PUT /users/{id}` - Update user
  - `DELETE /users/{id}` - Delete user
  - `GET /courses` - Get all courses
  - `GET /assessments` - Get all assessments
  - `POST /assessments/{id}/submit` - Submit assessment

- [ ] Model dan Controller sudah dibuat
- [ ] CORS configuration di `config/cors.php` sudah allow origin dari Next.js:
  ```php
  'allowed_origins' => ['http://localhost:3000'],
  ```

- [ ] Middleware Authentication sudah proper setup

---

## Penambahan Services

Jika Anda butuh services tambahan (misal: Assessment, PBL, Materi), edit file `lib/api-services.ts` dan tambahkan:

```typescript
export const pblService = {
  async getAllPBL() {
    const response = await apiClient.get('/api/pbl');
    return response.data;
  },

  async getPBLById(id: number | string) {
    const response = await apiClient.get(`/api/pbl/${id}`);
    return response.data;
  },
};
```

Kemudian gunakan di component:

```typescript
import { pblService } from '@/lib/api-services';

const data = await pblService.getAllPBL();
```

---

## CORS Error Troubleshooting

Jika dapat error CORS, pastikan di Laravel backend:

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Penting untuk Sanctum!
];
```

---

## Next Steps

1. ✅ Setup axios dan env variables
2. ✅ Create API client dan services
3. ✅ Create auth hook
4. ⏭️ Integrate ke login page
5. ⏭️ Test dengan Postman atau backend API
6. ⏭️ Tambahkan protected routes jika diperlukan
