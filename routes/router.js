const express = require('express'); 
const router = express();
const { v4: uuidv4 } = require('uuid'); 
const Recruiter = require('../models/Recruiter');
const Jobseeker = require('../models/Jobseeker'); 
const sendMail = require('../sendMail'); 
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const auth = require('../auth');
const Job = require('../models/Job'); 
const { authenticator } = require('otplib')
const QRCode = require('qrcode')


require('dotenv').config({}); 


router.post('/test', async function (req, res) {
    try {

        const recruiterEmail = await Recruiter.findOne({ email: req.body.email });
        console.log("for 2nd time", recruiterEmail); 

        recruiterEmail.secret = authenticator.generateSecret()

        await recruiterEmail.save();

        QRCode.toDataURL(authenticator.keyuri(recruiterEmail, 'Job Portal App', recruiterEmail.secret), (err, url) => {
            if (err) {
                throw err
            }

            req.session.qr = url
            req.session.email = recruiterEmail
            console.log(req.session.qr, req.session.email)
            res.render('abc.ejs', {qr: req.session.qr})
        })



        
    } catch (e) {
        console.log(e)
    }
})

router.get('/qrcode', function (req, res) {
    try {
        res.render('qrcode.ejs')
    } catch (e) {
        console.log(e)
    }
})




router.get('/test', auth, async function (req, res) {
    console.log('user id is available in the session', req.session.userId)
    const enable2fa = await Recruiter.findOne({ _id: req.session.userId });
    enable2fa.MFAEnabled = true; 
    await enable2fa.save();
    console.log(enable2fa)

    res.render('test.ejs')
})




router.get('/', function (req, res) {
    try {
        res.render('index.ejs')
    } catch (e) {
        console.log(e)
    }
})

router.get('/jobseeker', function (req, res) {
    try {
        res.render('register-1.ejs')
    } catch (e) {
        console.log(e)
    }
})

router.get('/recruiter', async function (req, res) {
    try {
        res.render('register-2.ejs')
    } catch (e) {
        console.log(e)
    }
})

router.post('/recruiter', body('email').isEmail(), body('password').isLength({min:5}) ,async function (req, res) {
    try {
        console.log(req.body)

        if (!req.body.email || !req.body.password) {
            res.send('body related error')
        } else {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                
                return res.status(400).json({ errors: errors.array() });
            }

            const recruiter = new Recruiter({
                email: req.body.email,
                password: req.body.password, 
                rid: uuidv4() 
            });

            const options = {
                email: recruiter.email,
                uid: recruiter.rid,
                subject: 'Job Portal'
            }

            await recruiter.save();

            sendMail(options)

          
            res.render('verify-account.ejs', { email: options.email })
        }
        

        
    } catch (e) {
        console.log(e)
    }
})

router.post('/recruiter_account_verification', async function (req, res) {
    try {
        const recruiter = await Recruiter.findOne({ rid: req.body.code });
        if (recruiter) {
            console.log(recruiter._id.toString())
            //console.log(req.session.userId.toString())
            //user.verify = true; // should use this flag in the auth system or somewhere maybe? otherwise it's a waste of a flag
            await recruiter.save();
            res.render('registration-success.ejs')
            //res.json({ "msg": "verification successful, you can now access the site" })
        } else {
            //res.json({ "msg": "verification unsuccessful, please check your verifiction code" })
            res.render('registration-failure.ejs')
        }
    } catch (e) {
        console.log(e)
    }
})

router.get('/login', function (req, res) {
    try {
        res.render('login.ejs')
    } catch (e) {
        console.log(e)
    }
})

router.post('/recruiter-login', async function (req, res) {
    try {
        console.log(req.body); 

        const userExists = await Recruiter.findOne({ email: req.body.email });
        //console.log(req.body.password)
        const incomingpassword = req.body.password;
        console.log(userExists)
        if (!userExists) {
            return res.status(404).json({ "msg": "recruiter account does not exist" })
        }

        await bcrypt.compare(req.body.password, userExists.password)
            .then((result) => {
                console.log(typeof (req.body.password), typeof (userExists.password))
                console.log(req.body.password, userExists.password)
                console.log(result)
                if (!result) {
                    res.render('error.ejs')
                } else {
                    req.session.userId = userExists._id.toString();
                    //req.body.userId = userExists._id.toString(); 
                    console.log(req.session.userId)
                    if (userExists.MFAEnabled) {
                        //res.send('2fa enabled user, so show him the pr code damn it!')
                        res.redirect('/test')
                    } else {
                        res.render('2fa_reminder.ejs')
                    }

                    
                }
            })
        

        
    } catch (e) {
        console.log(e)
    }
})

router.post('/jobseeker-login', async function (req, res) {
    try {
        console.log(req.body);
        res.send('jobseeker route works')
    } catch (e) {
        console.log(e)
    }
})

router.post('/job', async function (req, res) {
    try {
        const job = new Job(req.body); 
        await job.save(); 
        res.send(job)
    } catch (e) {
        console.log(e)
    }
})

router.get('/job', async function (req, res) {
    try {
        const jobs = await Job.find({});

        
        res.render('jobs.ejs', {jobs:jobs})
    } catch (e) {
        console.log(e)
    }
}) 

router.get('/job/:id', async function (req, res) {
    try {
        const ijob = await Job.find({ _id: req.params.id })
        res.send(ijob)
    } catch (e) {
        console.log(e)
    }
})

router.get('/job-detail', async function (req, res) {
    try {
        res.render('job-detail.ejs')
    } catch (e) {
        console.log(e)
    }
})



router.post('/verify-two-factor-code', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/')
    }

    const userId = req.session.userId,
        code = req.body.code
    console.log(userId, code)

    return verifyLogin(userId, code, req, res )
})


async function verifyLogin(userId, code, req, res) {
    //load user by email

    const recruiter = await Recruiter.findOne({ _id: userId });
    console.log(recruiter)
    console.log(recruiter.secret)
    if (recruiter) {
        if (authenticator.check(code, recruiter.secret)) {

            req.session.qr = null
            //req.session.email = null

            return res.redirect('/home') // should create home route!!!!!!!!!!!

        } else {
            return res.render('error.ejs')

        }

    } else {
        return res.redirect('/')
    }

}



router.get('/home', function (req, res) {
    try {
        res.render('home.ejs')
    } catch (e) {
        console.log(e)
    }
})

router.get('/logout', async function (req, res) {
    try {
        await req.session.destroy(); 
        res.redirect('/');
    } catch (e) {
        console.log(e)
    }
})






module.exports = router; 
