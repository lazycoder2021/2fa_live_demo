const mongoose = require('mongoose'); 

const jobSchema = mongoose.Schema({
    designation: {
        type: String, 
        required: true
    }, 
    postedBy: {
        type: String,
        required: true
    }, 
    department: {
        type: String, 
        required: true
    },
    location: {
        type: String,
        required: true
    }, 
    employmentType: {
        type: String,
        required: true
    },
    exp_required: {
        type: Number, 
        required: true
    }, 
    no_of_vacanies: {
        type: Number, 
        required: true
    }, 
    status: {
        type: String, 
        default: 'Hiring'
    }, 
    job_desc: {
        type:String
    }, 
    company_info: {
        type:String
    }
})

const Job = mongoose.model('Job', jobSchema); 

module.exports = Job; 