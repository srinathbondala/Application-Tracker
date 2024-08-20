const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const Routes = require('./routes/accountRoutes');
const authRouter = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jwtMiddleware = require('./middleware/jwtMiddleware');

app.use(express.json());
app.use(express.static('public'));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/accounts', jwtMiddleware.isUser, Routes);
app.use('/admin/api/', jwtMiddleware.isAdmin, adminRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port} localhost:${port}`);
});