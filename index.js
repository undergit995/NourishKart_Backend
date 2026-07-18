require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const ConnectDB = require('./Config/connectDB');
const RegRouter = require("./Routes/Auth/Registration")
const ResetRouter = require("./Routes/Auth/ResetPassword")
const LoginRouter = require("./Routes/Auth/Login")
const adminRouter = require("./Routes/admin/adminCRUD");
const ProductRouter = require("./Routes/Products/ProdutsRouter")
const isAdmin = require('./MiddleWare/adminAuth');
const CartRouter = require('./Routes/Cart/cartRouter');
const bannerRouter = require('./Routes/Banner/bannerRoutes');
const offerRouter = require('./Routes/Offer/offerRouter');
const multer = require('multer');
const conditionalJsonParser = require('./MiddleWare/jsonParserMiddleware');
const { apiLimiter, authLimiter } = require('./MiddleWare/rateLimiter');

const couponRouter = require('./Routes/Coupon/couponRouter');


const customerProfileRouter = require('./Routes/customer/customerProfile');
const isCustomer = require('./MiddleWare/customerAuth');
const upload = require('./Config/multerConfig');
const PaymentRouter = require('./Routes/Payments/razorpayRoutes');
const DeveloperRouter = require('./Routes/DevepolerRoutes/Devepoler');
const reviewRouter = require('./Routes/Review/Review');
const ordersRouter = require('./Routes/Orders/ordersRouter');

const productCategoryRouter = require('./Routes/ProcutsCatoegory/categoryCRUD');
const orderStatusRouter = require('./Routes/OrderStatus/orderStatusUpdating');
const dashboardRouter = require('./Routes/Dashboard/dashboardRoute')
const productfiltering = require('./Routes/ProductfilteringRoutes/Productfiltering');
const AnalyticsRouter = require('./Routes/Analytics/analytics')
const adminToamin = require ("./Routes/AdminToadmin/adminToadminCurd")
let dealsRouter = require('./Routes/Deals/dealsRoute');
const companyRouter = require("./Routes/CompanyDetails/CompanyDetails");
const createInitialAdmin = require('./Utils/initialSetup');




// Connect to the database and then run the initial setup
ConnectDB().then(() => {
    // This will run after the database connection is successful.
    createInitialAdmin();
});

const http = require('http');
const { Server } = require("socket.io");

// app.post("/upload",)
const app = express()
app.use(cors())

// Use cookie-parser middleware to parse cookies from incoming requests
app.use(cookieParser());

// Use the conditional JSON parser middleware.
// IMPORTANT: The webhook route needs the raw body for signature verification
// We apply the raw parser specifically for this route.
app.use('/api/payment/refund-webhook', express.raw({ type: 'application/json' }));

// This is crucial for the Razorpay webhook to work correctly.
app.use(conditionalJsonParser);

const path = require("path");
app.use("/upload", express.static(path.join(__dirname, "upload")))



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

require('./socket').init(io); // Initialize your socket module
io.on('connection', (socket) => {
    console.log('A user connected with socket ID:', socket.id);
});



app.use("/auth", authLimiter, RegRouter, LoginRouter)
app.use("/resetPass", authLimiter, ResetRouter)

// Apply the general API rate limiter to all other routes
app.use(apiLimiter);

// Admin routes CRUD opertions with authentication middleware
app.use("/crudAdmin", isAdmin, adminRouter)
app.use("/cart",isCustomer,CartRouter)
app.use("/products",ProductRouter)
app.use("/banner", bannerRouter)
app.use("/offer",offerRouter)

app.use("/adminToadmin",isAdmin,adminToamin)

app.use("/company", companyRouter);

app.use("/orders",ordersRouter)

app.use("/coupon",couponRouter)
app.use("/category",productCategoryRouter)
app.use("/api/payment",PaymentRouter)
app.use("/deals",isAdmin,dealsRouter)

// Customer profile updating routes with authentication middleware
app.use("/updateCustomerProfile", isCustomer,customerProfileRouter)
app.use("/developer",DeveloperRouter)
app.use("/review",isCustomer,reviewRouter)
app.use("/orderStatus",orderStatusRouter)
app.use("/dashboard",isAdmin,dashboardRouter)
app.use("/filter-products",productfiltering) // Changed path to avoid conflict
app.use("/adminAnalytics",AnalyticsRouter)

// Global error handling middleware to catch Multer errors safely
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ 
            message: `Multer Error: ${err.message}. Make sure your form-data key is named exactly "file".` 
        });
    }
    next(err);
});

const PORT = process.env.PORT || 4500;

server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})
