import { useState, useMemo } from 'react';
import AdminBulkActions from '@/components/AdminBulkActions';
import AdminRoleFilter from '@/components/AdminRoleFilter';
import AdminUserTable, { User } from '@/components/AdminUserTable';
import { Input } from '@/components/ui/input';

const allUsers: User[] = [
  { id: 1, username: 'kushal.kasliwal', name: 'Kushal Kasliwal', email: '124.kushal@gmail.com', role: 'Administrator', posts: 12 },
  { id: 2, username: 'jane.doe', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Subscriber', posts: 2 },
  { id: 3, username: 'sam.wilson', name: 'Sam Wilson', email: 'sam.wilson@example.com', role: 'ARMember', posts: 5 },
  { id: 4, username: 'alice.johnson', name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'Customer', posts: 0 },
  { id: 5, username: 'mike.brown', name: 'Mike Brown', email: 'mike.brown@example.com', role: 'HR', posts: 0 },
  { id: 6, username: 'emily.white', name: 'Emily White', email: 'emily.white@example.com', role: 'Shop Manager', posts: 8 },
  { id: 7, username: 'chris.green', name: 'Chris Green', email: 'chris.green@example.com', role: 'SEO Editor', posts: 25 },
  { id: 8, username: 'linda.black', name: 'Linda Black', email: 'linda.black@example.com', role: 'SEO Manager', posts: 40 },
  { id: 9, username: 'kevin.hill', name: 'Kevin Hill', email: 'kevin.hill@example.com', role: 'Contributor', posts: 1 },
  { id: 10, username: 'sandra.clark', name: 'Sandra Clark', email: 'sandra.clark@example.com', role: 'Author', posts: 15 },
  { id: 11, username: 'paul.lewis', name: 'Paul Lewis', email: 'paul.lewis@example.com', role: 'Editor', posts: 7 },
  { id: 12, username: 'nancy.hall', name: 'Nancy Hall', email: 'nancy.hall@example.com', role: 'Employer', posts: 0 },
  { id: 13, username: 'gary.king', name: 'Gary King', email: 'gary.king@example.com', role: 'No role for this site', posts: 0 },
  // Add more users to test pagination
  ...Array.from({ length: 20 }, (_, i) => ({
    id: 14 + i,
    username: `user${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: 'Subscriber',
    posts: i % 5,
  })),
];

const USERS_PER_PAGE = 10;

const AdminUsers = () => {
  const [activeRole, setActiveRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Set<number>());
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    return allUsers
      .filter(user => activeRole === 'All' || user.role === activeRole)
      .filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [activeRole, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    const end = start + USERS_PER_PAGE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const handleSelectUser = (id: number) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAllUsers = (select: boolean) => {
    if (select) {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="w-64">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <AdminRoleFilter activeRole={activeRole} onRoleChange={setActiveRole} />
      </div>
      <div className="flex justify-between items-center mb-4">
        <AdminBulkActions />
      </div>
      <AdminUserTable
        users={paginatedUsers}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAllUsers={handleSelectAllUsers}
      />
    </div>
  );
};

export default AdminUsers;
