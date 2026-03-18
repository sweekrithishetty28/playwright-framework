module.exports = {
  admin: {
    username: 'Admin',
    password: 'admin123'
  },

    invalidAdmin: {
    wrongUsername: 'wronguser',
    wrongPassword: 'wrongpass',
  },

  employee: {
    firstName: 'Bhoomi',
    lastName: 'Bhat',
    employeeId: '284',
    nationality: 'Indian',
    maritalStatus: 'Single',
    dateOfBirth: '2004-08-28',
    gender: 'Female',
    updatedFirstName: 'BhoomiUpdated',
  },
  invalidEmployee: {
    nonExistentName: 'XYZNONEXISTENT999',
    duplicateId: '284',
  },

  
  // ── API test data ──────────────────────────
  pet: {
    id: Date.now(),           // unique ID every run
    name: 'Buddy',
    status: 'available',      // available / pending / sold
    category: {
      id: 1,
      name: 'Dogs'
    },
    photoUrls: ['https://example.com/buddy.jpg'],
    tags: [{ id: 1, name: 'friendly' }]
  },

  updatedPet: {
    name: 'BuddyUpdated',
    status: 'sold'
  },

  order: {
    id: Date.now(),
    quantity: 1,
    status: 'placed',
    complete: true
  },

  // Invalid data for negative tests
  invalidApi: {
    nonExistentId: 999999999,
    invalidId: 'abc'
  }

};