const { supabaseAdmin } = require('../services/supabase.service');

const roleCheck = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // If role is already attached to token, check first or query DB
      let userRole = req.user.role;

      if (!userRole) {
        // Get user's role from database
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('role')
          .eq('id', req.user.id)
          .single();

        if (error || !data) {
          return res.status(403).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        userRole = data.role;
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}` 
        });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Role verification failed' 
      });
    }
  };
};

module.exports = { roleCheck };
