const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'bus_tracker_super_secret_jwt_key_2026';

/**
 * Login user (either via Supabase Auth or direct email/password fallback)
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Default admin mock credential helper for Phase 1 testing
    if (email === 'admin@college.edu' && password === 'InitialPassword123!') {
      const token = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000001', email, role: 'ADMIN' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'Admin logged in successfully',
        token,
        user: { id: '00000000-0000-0000-0000-000000000001', email, role: 'ADMIN' }
      });
    }

    // Attempt Supabase Auth login if configured
    if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'TestPassword123!'
      });

      if (!authError && authData?.session) {
        // Fetch role from users table
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        const userRole = profile?.role || role || 'STUDENT';
        const token = jwt.sign(
          { id: authData.user.id, email, role: userRole },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          token,
          user: { id: authData.user.id, email, role: userRole }
        });
      }
    }

    // Fallback simulation for local development / testing
    const assignedRole = role || (email.includes('admin') ? 'ADMIN' : email.includes('incharge') ? 'BUS_INCHARGE' : 'STUDENT');
    const token = jwt.sign(
      { id: '11111111-1111-1111-1111-111111111111', email, role: assignedRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully (Dev Mode)',
      token,
      user: { id: '11111111-1111-1111-1111-111111111111', email, role: assignedRole }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get currently authenticated user profile
 */
const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  login,
  getProfile
};
