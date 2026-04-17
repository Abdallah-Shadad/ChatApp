const BASE = '/api'

const getToken = () => localStorage.getItem('nexchat_token')

const headers = (auth = true) => ({
  'Content-Type': 'application/json',
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
})

const handle = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || err.message || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  auth: {
    register: (data) =>
      fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(false), body: JSON.stringify(data) }).then(handle),
    login: (data) =>
      fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(false), body: JSON.stringify(data) }).then(handle),
  },
  rooms: {
    getAll: () =>
      fetch(`${BASE}/rooms`, { headers: headers() }).then(handle),
    create: (data) =>
      fetch(`${BASE}/rooms`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handle),
    delete: (id) =>
      fetch(`${BASE}/rooms/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
  },
  members: {
    add: (roomId, username) => 
      fetch(`${BASE}/rooms/${roomId}/members`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ username }) 
      }).then(handle),
    remove: (roomId, userId) =>
      fetch(`${BASE}/rooms/${roomId}/members/${userId}`, { method: 'DELETE', headers: headers() }).then(handle),
  },
  messages: {
    getHistory: (roomId, cursor, limit = 30) => {
      const params = new URLSearchParams({ limit })
      if (cursor) params.append('cursor', cursor)
      return fetch(`${BASE}/messages/${roomId}?${params}`, { headers: headers() }).then(handle)
    },
  },
}
