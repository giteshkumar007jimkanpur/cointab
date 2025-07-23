require('dotenv').config();
require('./config/mongoose');
const PORT = process.env.PORT;
const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
const path = require('path');
const User = require('./models/users');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, './assets')))

app.get('/', async (_req, res) => {
    return res.render('home');
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            console.log('User does not exist')
            throw new Error('User does not exist');
        } else if (parseInt(user.timestamp) + parseInt(120000) > Date.now()) {
            return res.redirect('/blockuser')
        } else {
            if (user.password === req.body.password) {
                user.attempt = 0;
                user.timeout = 0;
                user.save();
                res.cookie('user_id', user.id);
                return res.redirect('/userpage')
            } else {
                user.attempt++;
                if (user.attempt >= '5' ) {
                    user.timeout = Date.now();
                    user.save();
                    return res.redirect('/blockuser')
                }
                user.save();
                return res.redirect(req.get('referer'));
            }
        }
    } catch (error) {
        console.log({ error })
        return res.redirect(req.get('referer'));
    }
})

app.get('/userpage', async (req, res) => {
    try {

        if (req.cookies.user_id) {
            let users = [];
            const user = await User.findOne({ _id: req.cookies.user_id });
            if (user.email === process.env.ADMIN_EMAIL) {
                users = await User.find({});
            } else {
                users.push(user);
            }
            return res.render('userpage', { users });
        }
        return res.redirect(req.get('referer'));

    } catch (error) {
        console.log({ error })
        return res.redirect(req.get('referer'));
    }
})

app.get('/logout', async (req, res) => {
    res.clearCookie('user_id');
    return res.redirect('/')
})

app.get('/signup', async (req, res) => {
    return res.render('signup');
})

app.post('/adduser', async (req, res) => {
    try {
        if(req.body.password != req.body.confirm_password) {
            throw new Error('Password does not match')
        }
        else {
            const isExistingUser = await User.findOne({email: req.body.email});
            if(isExistingUser) {
                throw new Error('User already exist');
            }
            else {
                const newUser  = await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                });
                if(newUser) {
                    console.log({'New User': newUser})
                    return res.redirect('/')
                } else {
                    throw new Error('New user could not be registred');
                }
            }
        }
    } catch (error) {
        console.log({ error })
        return res.redirect(req.get('referer'));
    }
})

app.get('/blockuser',async (req,res)=> {
    return res.render('blockuser')
})

app.listen(PORT, (error) => {
    if (error) console.log({ error })
    console.log(`Server started listening on PORT :: ${PORT}`)
});