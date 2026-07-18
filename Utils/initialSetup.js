const userModel = require("../Model/userModel");
const bcrypt = require("bcrypt");

/**
 * Checks for and creates an initial admin user from environment variables
 * if one does not already exist. This should be run on server startup.
 */
const createInitialAdmin = async () => {
    try {
        // Check if an admin user already exists
        const adminExists = await userModel.findOne({ role: "admin" });

        if (adminExists) {
            console.log("Admin user already exists. Skipping creation.");
            return;
        }

        // Check for required environment variables
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;
        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PHONE) {
            console.warn("Missing initial admin environment variables (ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE). Skipping admin creation.");
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create the new admin user
        await userModel.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            phone: ADMIN_PHONE,
            role: "admin",
            isVerified: true, // Admins should be verified by default
        });

        console.log("Initial admin user created successfully.");
    } catch (error) {
        console.error("Error during initial admin user setup:", error.message);
    }
};

module.exports = createInitialAdmin;