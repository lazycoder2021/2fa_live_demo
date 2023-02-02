const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

const recruiterSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'recruiter'
    },
    rid: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    verified: {
        type: Boolean,
        default: false
    },
    MFAEnabled:{
        type: Boolean, 
        default: false
    }, 
    secret: {
        type: String, 
        default: 'test'
    }
})


recruiterSchema.pre('save', async function (next) {
    let user = this;
    if (user.isModified("password") || user.isNew) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } else {
        return next()
    }

})

recruiterSchema.methods.comparePassword = async function (incomingpassword) {
    //incomingpassword = bcrypt.hash(incomingpassword, 10);
    console.log(typeof (existingpassword))
    const isMatch = await bcrypt.compareSync(incomingpassword, this.password, function (err, res) {
        if (err) {
            console.log('testing...')
            console.log(err)
        } else {
            console.log('test123')
            console.log(res)
        }
    })
    //console.log(incomingpassword, existingpassword)
    //console.log(isMatch)
    return isMatch;
}






const Recruiter = mongoose.model('Recruiter', recruiterSchema);
module.exports = Recruiter; 
