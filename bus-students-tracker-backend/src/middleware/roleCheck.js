/**
 * Role-Based Access Control (RBAC) Middleware
 * @param {Array<string>} requiredRoles - List of roles permitted to access the route ('ADMIN', 'BUS_INCHARGE', 'STUDENT')
 */
const roleCheck = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required prior to role verification.'
      });
    }

    const userRole = req.user.role || (req.user.user_metadata && req.user.user_metadata.role);

    if (!userRole || !requiredRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        error: `Access denied. Your role is '${userRole || 'UNKNOWN'}'. Required roles: ${requiredRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = { roleCheck };
