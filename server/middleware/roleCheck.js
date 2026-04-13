// Middleware to restrict access to owners only
export const ownerOnly = (req, res, next) => {
    if (req.user && req.user.role === "owner") {
        return next();
    }
    return res.json({ success: false, message: "Access denied. Owner only." });
};

// Middleware to restrict access to regular users only
export const userOnly = (req, res, next) => {
    if (req.user && req.user.role === "user") {
        return next();
    }
    return res.json({ success: false, message: "Access denied. Customers only." });
};

// Middleware to allow both customers and owners for booking actions
export const customerOrOwner = (req, res, next) => {
    if (req.user && (req.user.role === "user" || req.user.role === "owner")) {
        return next();
    }
    return res.json({ success: false, message: "Access denied. Customers or owners only." });
};


// Middleware to restrict access to single admin owner account
export const adminOnly = (req, res, next) => {
    const adminEmail = (process.env.ADMIN_EMAIL || "dnyaneshwarkhune723@gmail.com").trim().toLowerCase();
    const requestEmail = req.user?.email?.toLowerCase();

    if (req.user && req.user.role === "owner" && requestEmail === adminEmail) {
        return next();
    }

    return res.json({ success: false, message: "Access denied. Admin only." });
};
