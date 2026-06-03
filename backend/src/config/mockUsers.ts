export const MOCK_USERS = [
  {
    id: 'user-alice',
    name: 'Alice (Employee)',
    email: 'alice@example.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    managerId: 'user-charlie',
  },
  {
    id: 'user-bob',
    name: 'Bob (Employee)',
    email: 'bob@example.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    managerId: 'user-charlie',
  },
  {
    id: 'user-charlie',
    name: 'Charlie (Manager L1)',
    email: 'charlie@example.com',
    role: 'MANAGER',
    department: 'Engineering',
    managerId: 'user-diana',
  },
  {
    id: 'user-diana',
    name: 'Diana (Admin)',
    email: 'diana@example.com',
    role: 'ADMIN',
    department: 'HR',
    managerId: null,
  },
];
