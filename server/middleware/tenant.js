export const enforceTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  // Super Admin has global platform scope
  if (req.user.role === 'superadmin') {
    // If superadmin supplied a collegeId filter, use it; otherwise null means all
    req.tenantCollegeId = req.query.collegeId || req.body.collegeId || req.params.collegeId || null;
    return next();
  }

  // For Teachers and Students, tenant collegeId is ALWAYS strictly derived from their verified User record
  if (!req.user.collegeId) {
    return res.status(403).json({
      success: false,
      error: 'Tenant isolation violation: User is not associated with any active college tenant.'
    });
  }

  const userCollegeId = req.user.collegeId.toString();

  // If the request attempted to provide a collegeId, verify it does NOT violate tenant boundaries
  const requestedCollegeId = req.params.collegeId || req.body.collegeId || req.query.collegeId;
  if (requestedCollegeId && requestedCollegeId.toString() !== userCollegeId) {
    return res.status(403).json({
      success: false,
      error: 'Security alert: Cross-tenant data access violation detected and blocked.'
    });
  }

  // Force tenantCollegeId to user's authorized college
  req.tenantCollegeId = userCollegeId;
  next();
};

/**
 * Helper to generate a MongoDB query filter enforcing tenant boundaries
 */
export const getTenantQuery = (req, baseQuery = {}) => {
  if (req.user && req.user.role === 'superadmin') {
    // If superadmin filtered by a specific collegeId
    const collegeFilter = req.query.collegeId || req.tenantCollegeId;
    if (collegeFilter && collegeFilter !== 'ALL') {
      return { ...baseQuery, collegeId: collegeFilter };
    }
    return { ...baseQuery };
  }

  // For non-superadmin, tenant isolation is mandatory
  return {
    ...baseQuery,
    collegeId: req.user.collegeId
  };
};

