-- =======================================================
-- Bus Students Tracker - Database Schema (PostgreSQL / Supabase)
-- Phase 1 Foundation & Infrastructure
-- =======================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users / Profiles Table (Mapped to Supabase Auth or Local DB)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'BUS_INCHARGE', 'STUDENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Buses Table (Created before references)
CREATE TABLE IF NOT EXISTS buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'WORKING' CHECK (status IN ('WORKING', 'NOT_WORKING')),
  driver_id UUID,
  bus_incharge_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  license_number VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bus In-Charges Table
CREATE TABLE IF NOT EXISTS bus_incharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  assigned_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  register_number VARCHAR(100) NOT NULL UNIQUE,
  gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  assigned_bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT')),
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_bus_daily_attendance UNIQUE (student_id, bus_id, attendance_date)
);

-- 7. Bus Locations Table
CREATE TABLE IF NOT EXISTS bus_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Bus Stops Table
CREATE TABLE IF NOT EXISTS bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  stop_name VARCHAR(255) NOT NULL,
  stop_latitude DECIMAL(10, 8) NOT NULL,
  stop_longitude DECIMAL(11, 8) NOT NULL,
  stop_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bus Alerts Table
CREATE TABLE IF NOT EXISTS bus_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  problem_type VARCHAR(100) NOT NULL,
  description TEXT,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key Constraints for Bus Driver & In-Charge (Circular references safely resolved)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_buses_driver') THEN
    ALTER TABLE buses ADD CONSTRAINT fk_buses_driver 
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_buses_incharge') THEN
    ALTER TABLE buses ADD CONSTRAINT fk_buses_incharge 
      FOREIGN KEY (bus_incharge_id) REFERENCES bus_incharges(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_students_bus ON students(assigned_bus_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_bus_locations_bus ON bus_locations(bus_id);
CREATE INDEX IF NOT EXISTS idx_bus_stops_bus_order ON bus_stops(bus_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_bus_alerts_status ON bus_alerts(status);
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);

-- Optional Seed for Default Administrator profile
-- Once you add admin@college.edu in Supabase Auth (or local auth), insert user profile:
-- INSERT INTO users (email, role) VALUES ('admin@college.edu', 'ADMIN') ON CONFLICT (email) DO NOTHING;
