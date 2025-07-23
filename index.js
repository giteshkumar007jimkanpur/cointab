require('dotenv').config();
require('./config/mongoose');

const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const User = require('./models/users');

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './assets')));

// Home Route
app.get('/', (_req, res) => res.render('home'));

// Login Route
app.post('/login', async (req, res) => {
    try {
        const query = { email: req.body.email.toString() }
        const user = await User.findOne(query);

        if (!user) throw new Error('User does not exist');

        const timeoutPeriod = 120000; // 2 minutes
        if (user.timeout && (user.timeout + timeoutPeriod > Date.now())) {
            return res.redirect('/blockuser');
        }

        if (user.password === req.body.password) {
            user.attempt = 0;
            user.timeout = 0;
            await user.save();
            res.cookie('user_id', user.id);
            return res.redirect('/userpage');
        }

        user.attempt++;
        if (user.attempt >= 5) {
            user.timeout = Date.now();
            await user.save();
            return res.redirect('/blockuser');
        }

        await user.save();
        return res.redirect(req.get('referer'));
    } catch (error) {
        console.error(error.message || error);
        return res.redirect(req.get('referer'));
    }
});

// User Page Route
app.get('/userpage', async (req, res) => {
    try {
        const { user_id } = req.cookies;
        if (!user_id) return res.redirect(req.get('referer'));

        const user = await User.findById(user_id);
        if (!user) return res.redirect(req.get('referer'));

        let users = [];
        if (user.email === process.env.ADMIN_EMAIL) {
            users = await User.find({});
        } else {
            users.push(user);
        }

        return res.render('userpage', { users });
    } catch (error) {
        console.error(error.message || error);
        return res.redirect(req.get('referer'));
    }
});

// Logout Route
app.get('/logout', (_req, res) => {
    res.clearCookie('user_id');
    return res.redirect('/');
});

// Signup Page
app.get('/signup', (_req, res) => res.render('signup'));

// Register New User
app.post('/adduser', async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body;

        if (password !== confirm_password) throw new Error('Passwords do not match');

        const query = { email: req.body.email.toString() }
        const existingUser = await User.findOne(query);
        if (existingUser) throw new Error('User already exists');

        const newUserObj = { name: name.toString(), email: email.toString(), password: password.toString() }
        const newUser = await User.create(newUserObj);

        if (!newUser) throw new Error('User creation failed');

        console.log('New User:', newUser);
        return res.redirect('/');
    } catch (error) {
        console.error(error.message || error);
        return res.redirect(req.get('referer'));
    }
});

// Blocked User Page
app.get('/blockuser', (_req, res) => res.render('blockuser'));

// Start Server
app.listen(PORT, (error) => {
    if (error) return console.error('Server error:', error);
    console.log(`Server started on PORT :: ${PORT}`);
});
