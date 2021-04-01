const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
       trim: true
    },
    email: {
        type: String,
        trim: true,
        unique:true,
        required: [true, "User email address is required"],
        validate(email) {
            if (!validator.isEmail(email)) {
                throw new Error("Email is invalid. Provide a correct email address")
            }
        }
        
    },
    password: {
        type: String,
        required: [true, "User phone number is required"],
        minlength: 6,
        trim: true,
        validate(password) {
            if (password.toLowerCase().includes('password')) {
                throw new Error(`password cannot contain "password"`)
            }
        }
    },
    phoneNumber: {
        type: String,
        required: [true, "User phone number is required"],
        validate(phone){
            if (!validator.isMobilePhone(phone)) {
                throw new Error("Invalide phone number!")
            }
        }
    },

    tokens: [{
        token: {
            type: String,
            required:true
        }
    }],
    avatar: {
        type:Buffer
    }
},
    {
    timestamps:true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField:'author'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userData = user.toObject()
    delete userData.password
    delete userData.tokens
    delete userData.avatar

    return userData
}

//generate token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}
    
    
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })
    if (!user) {
        throw new Error('Unable to log in')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login at this time')
    }
    return user
}

//hash plaintext password before storing
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//delete user tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = next

    await Task.deleteMany({ author: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
