const mongoose = require('mongoose'); 

const jobseekerSchema = mongoose.Schema({
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
        default: 'jobseeker'
    }, 
    createdAt: {
        type: Date,
        default: Date.now()
    },
    verified: {
        type: Boolean,
        default: false
    }, 
    rid: {
        type: String
    }
})

const Jobseeker = mongoose.model('Jobseeker', jobseekerSchema);
module.exports = Jobseeker; 
