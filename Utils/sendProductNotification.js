const nodemailer = require("nodemailer");
const UserModel = require("../Model/userModel");
const path = require("path");
const transporter = require("../config/emailConfig");

/**
 * Sends an email notification to all registered customers when a new product is added.
 * @param {Object} product - The product data object.
 * @param {Object} [companyData] - Optional custom company details for branding.
 */
async function sendProductNotification(product, companyData = {}) {
    try {
        // 1. Fetch all customer emails from the database
        const customers = await UserModel.find(
            { role: "customer" },
            { email: 1, _id: 0 }
        );
      
    
        const customerEmails = customers.map(user => user.email);

        // Guard clause: If there are no customers, stop execution early
        if (customerEmails.length === 0) {
            console.log("Notification skipped: No customers found in the database.");
            return;
        }

        // 2. Default company details if not passed dynamically
        const company = {
            companyName: companyData.companyName || "Our Store",
            companyImage: companyData.companyImage || "https://via.placeholder.com/90",
            companyDescription: companyData.companyDescription || "Your favorite marketplace for fresh arrivals.",
            ...companyData
        };

        let attachments = [];
        let imageTag = "";

        // 3. Handle inline product image attachment (CID)
        if (product.image && product.image.length > 0) {
            const imageName = product.image[0].split("/").pop();
            const imagePath = path.join(process.cwd(), "upload", imageName);

            attachments.push({
                filename: imageName,
                path: imagePath,
                cid: "productImage",
            });

            imageTag = `
                <img
                    src="cid:productImage"
                    alt="${product.name}"
                    width="250"
                    style="border-radius:10px; border:1px solid #ddd; margin-bottom:15px; display:block;"
                />
            `;
        }

        // 4. Construct the complete, clean HTML Email Body
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>New Product Launch</title>
        </head>
        <body style="margin:0; padding:0; background-color:#eef2f7; font-family:Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="650" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
                            
                            <tr>
                                <td align="center" style="background:#0f172a; padding:35px;">
                                    <img src="${company.companyImage}" width="90" style="border-radius:12px;" alt="Logo" />
                                    <h1 style="color:#ffffff; margin:15px 0 5px 0; font-size:28px;">
                                        ${company.companyName}
                                    </h1>
                                    <p style="color:#cbd5e1; font-size:14px; margin:0;">
                                        ${company.companyDescription}
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding:40px 30px; color:#333333;">
                                    <h2 style="color:#16a34a; margin-top:0; margin-bottom:20px;">
                                        🎉 New Product Launch
                                    </h2>
                                    
                                    ${imageTag}

                                    <h3 style="font-size:22px; margin:10px 0;">${product.name}</h3>
                                    <p style="font-size:16px; margin:5px 0;"><strong>Price:</strong> ₹${product.price}</p>
                                    <p style="font-size:14px; color:#666; margin:5px 0;"><strong>Stock:</strong> ${product.stock} units left</p>
                                    
                                    <p style="max-width:500px; line-height:1.6; color:#4b5563; margin-top:15px; font-size:14px;">
                                        ${product.description || "No description provided for this item."}
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        // 5. Send mail configuration options
        const mailOptions = {
            from: process.env.EMAIL,
            bcc: customerEmails, // Keeps customer emails hidden from one another
            subject: `🛍️ New Product Added - ${product.name}`,
            html,
            attachments,
        };

        // 6. Send the compiled email dispatch
        const info = await transporter.sendMail(mailOptions);
        console.log("Product notification email sent successfully! Message ID:", info.messageId);

    } catch (err) {
        console.error("Email Notification Error Details:", err);
    }
}

module.exports = sendProductNotification;