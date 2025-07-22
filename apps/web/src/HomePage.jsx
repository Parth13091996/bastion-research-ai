import { useState, useEffect } from 'react';
import { supabase } from './supabase';

function HomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      fetchUsers();
      setName('');
      setEmail('');
    } catch (error) {
      setError(error.message);
    }
  };

  const updateUser = async (id) => {
    try {
      await fetch(`http://localhost:3001/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      fetchUsers();
      setEditing(null);
      setName('');
      setEmail('');
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`http://localhost:3001/users/${id}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <button onClick={handleLogout}>Logout</button>
      <h1>Users</h1>
      <form onSubmit={createUser}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {editing === user.id ? (
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={() => updateUser(user.id)}>Save</button>
              </div>
            ) : (
              <div>
                {user.name} ({user.email})
                <button
                  onClick={() => {
                    setEditing(user.id);
                    setName(user.name);
                    setEmail(user.email);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => deleteUser(user.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
