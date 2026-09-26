const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder-key';
const supabaseAnonKey = process.env.SUPABASE_KEY || supabaseServiceKey;

const isPlaceholder = !supabaseUrl || 
  supabaseUrl.includes('your-project-id') || 
  supabaseUrl.includes('placeholder') || 
  supabaseServiceKey.includes('your_supabase');

// Standard Supabase clients
const realSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const realSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// --- In-Memory Mock Store for Seamless Local Testing When Supabase is Not Yet Connected ---
const mockStore = {
  users: [
    { id: '11111111-1111-1111-1111-111111111111', email: 'admin@college.edu', role: 'ADMIN', status: 'ACTIVE', created_at: new Date().toISOString() },
    { id: '22222222-2222-2222-2222-222222222222', email: 'incharge@college.edu', role: 'BUS_INCHARGE', status: 'ACTIVE', created_at: new Date().toISOString() },
    { id: '33333333-3333-3333-3333-333333333333', email: 'student@college.edu', role: 'STUDENT', status: 'ACTIVE', created_at: new Date().toISOString() }
  ],
  buses: [
    { id: 'bbbbbbbb-1111-1111-1111-111111111111', bus_number: 'BUS-01', status: 'WORKING', driver_id: null, bus_incharge_id: 'iiiiiiii-1111-1111-1111-111111111111', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'bbbbbbbb-2222-2222-2222-222222222222', bus_number: 'BUS-02', status: 'WORKING', driver_id: null, bus_incharge_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  drivers: [
    { id: 'dddddddd-1111-1111-1111-111111111111', user_id: '11111111-1111-1111-1111-111111111111', name: 'Raju Kumar', phone_number: '9876543210', license_number: 'DL-TN-01-2018001', created_at: new Date().toISOString() }
  ],
  bus_incharges: [
    { id: 'iiiiiiii-1111-1111-1111-111111111111', user_id: '22222222-2222-2222-2222-222222222222', name: 'Prof. Suresh V', phone_number: '9845012345', assigned_bus_id: 'bbbbbbbb-1111-1111-1111-111111111111', created_at: new Date().toISOString() }
  ],
  students: [
    { id: 'ssssssss-1111-1111-1111-111111111111', user_id: '33333333-3333-3333-3333-333333333333', name: 'Anitha Sharma', register_number: 'REG2026001', gender: 'FEMALE', assigned_bus_id: 'bbbbbbbb-1111-1111-1111-111111111111', status: 'ACTIVE', created_at: new Date().toISOString() },
    { id: 'ssssssss-2222-2222-2222-222222222222', user_id: '33333333-3333-3333-3333-333333333333', name: 'Karthik Raja', register_number: 'REG2026002', gender: 'MALE', assigned_bus_id: 'bbbbbbbb-1111-1111-1111-111111111111', status: 'ACTIVE', created_at: new Date().toISOString() }
  ],
  attendance: [],
  bus_locations: [
    { id: 'llllllll-1111-1111-1111-111111111111', bus_id: 'bbbbbbbb-1111-1111-1111-111111111111', latitude: 13.0827, longitude: 80.2707, speed: 38.5, updated_at: new Date().toISOString() }
  ],
  bus_alerts: []
};

// Builder to simulate Supabase Query Chain if in placeholder/mock mode
function createMockQueryBuilder(table) {
  let records = mockStore[table] ? [...mockStore[table]] : [];
  let isSingle = false;
  let lastAction = 'select';

  const builder = {
    select(columns = '*') {
      lastAction = 'select';
      return builder;
    },
    eq(field, val) {
      records = records.filter(r => String(r[field]) === String(val));
      return builder;
    },
    order(field, { ascending = true } = {}) {
      records.sort((a, b) => {
        if (a[field] < b[field]) return ascending ? -1 : 1;
        if (a[field] > b[field]) return ascending ? 1 : -1;
        return 0;
      });
      return builder;
    },
    limit(count) {
      records = records.slice(0, count);
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    insert(payload) {
      lastAction = 'insert';
      const items = Array.isArray(payload) ? payload : [payload];
      const inserted = items.map(item => {
        const row = {
          id: item.id || `mock-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        };
        if (!mockStore[table]) mockStore[table] = [];
        mockStore[table].push(row);
        return row;
      });
      records = inserted;
      return builder;
    },
    update(payload) {
      lastAction = 'update';
      const updated = records.map(r => {
        const target = mockStore[table].find(item => item.id === r.id);
        if (target) {
          Object.assign(target, payload, { updated_at: new Date().toISOString() });
          return { ...target };
        }
        return r;
      });
      records = updated;
      return builder;
    },
    upsert(payload, options = {}) {
      lastAction = 'upsert';
      const conflictField = options.onConflict || 'bus_id';
      let existing = mockStore[table]?.find(item => item[conflictField] === payload[conflictField]);
      if (existing) {
        Object.assign(existing, payload, { updated_at: new Date().toISOString() });
        records = [existing];
      } else {
        const newRow = {
          id: payload.id || `mock-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...payload
        };
        if (!mockStore[table]) mockStore[table] = [];
        mockStore[table].push(newRow);
        records = [newRow];
      }
      return builder;
    },
    delete() {
      lastAction = 'delete';
      if (mockStore[table]) {
        const idsToDelete = new Set(records.map(r => r.id));
        mockStore[table] = mockStore[table].filter(r => !idsToDelete.has(r.id));
      }
      return builder;
    },
    then(resolve) {
      // Resolve enriched joins if needed for buses/students
      let output = records;
      if (table === 'buses') {
        output = records.map(b => ({
          ...b,
          drivers: mockStore.drivers.find(d => d.id === b.driver_id) || null,
          bus_incharges: mockStore.bus_incharges.find(i => i.id === b.bus_incharge_id) || null,
          students: mockStore.students.filter(s => s.assigned_bus_id === b.id)
        }));
      } else if (table === 'students') {
        output = records.map(s => ({
          ...s,
          buses: mockStore.buses.find(b => b.id === s.assigned_bus_id) || null
        }));
      } else if (table === 'bus_incharges') {
        output = records.map(i => ({
          ...i,
          buses: mockStore.buses.find(b => b.id === i.assigned_bus_id) || null
        }));
      } else if (table === 'attendance') {
        output = records.map(a => ({
          ...a,
          students: mockStore.students.find(s => s.id === a.student_id) || null
        }));
      } else if (table === 'bus_alerts') {
        output = records.map(al => ({
          ...al,
          buses: mockStore.buses.find(b => b.id === al.bus_id) || null,
          users: mockStore.users.find(u => u.id === al.reporter_id) || null
        }));
      }

      if (isSingle) {
        if (output.length === 0) {
          return resolve({ data: null, error: { message: 'Row not found' } });
        }
        return resolve({ data: output[0], error: null });
      }
      return resolve({ data: output, error: null });
    }
  };

  return builder;
}

// Wrapper for mock authentication
const mockAuth = {
  admin: {
    async createUser({ email, password }) {
      const newUser = {
        id: `usr-${Date.now()}`,
        email,
        created_at: new Date().toISOString()
      };
      return { data: { user: newUser }, error: null };
    },
    async deleteUser(id) {
      mockStore.users = mockStore.users.filter(u => u.id !== id);
      return { data: null, error: null };
    }
  },
  async signInWithPassword({ email, password }) {
    const user = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return {
        data: {
          session: {
            access_token: `mock-jwt-token-for-${user.id}`,
            refresh_token: `mock-refresh-token-for-${user.id}`
          },
          user: { id: user.id, email: user.email }
        },
        error: null
      };
    }
    return { data: { session: null }, error: { message: 'Invalid email or password' } };
  },
  async getUser(token) {
    if (token && token.startsWith('mock-jwt-token-for-')) {
      const userId = token.replace('mock-jwt-token-for-', '');
      const user = mockStore.users.find(u => u.id === userId);
      if (user) return { data: { user }, error: null };
    }
    return { data: { user: null }, error: { message: 'Invalid token' } };
  },
  async refreshSession({ refresh_token }) {
    if (refresh_token && refresh_token.startsWith('mock-refresh-token-for-')) {
      const userId = refresh_token.replace('mock-refresh-token-for-', '');
      return {
        data: {
          session: {
            access_token: `mock-jwt-token-for-${userId}`,
            refresh_token: `mock-refresh-token-for-${userId}`
          }
        },
        error: null
      };
    }
    return { data: { session: null }, error: { message: 'Invalid refresh token' } };
  }
};

// Proxied supabase client that delegates to real Supabase, or falls back to mock if in placeholder mode
const supabaseAdmin = isPlaceholder
  ? {
      auth: mockAuth,
      from: createMockQueryBuilder
    }
  : realSupabaseAdmin;

const supabaseClient = isPlaceholder
  ? {
      auth: mockAuth,
      from: createMockQueryBuilder
    }
  : realSupabaseClient;

module.exports = {
  supabaseAdmin,
  supabaseClient,
  isPlaceholder,
  mockStore
};
