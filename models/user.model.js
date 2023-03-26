import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    uuid: {
      type: String,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
    },
    liveStreamId: {
      type: String,
    },
    authToken: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

userSchema.pre('save', async function(next) {
    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      // Hash the password with the salt
      const passwordHash = await bcrypt.hash(this.password, salt);
      // Replace the plaintext password with the hashed password
      this.password = passwordHash;
      next();
    } catch (error) {
      next(error);
    }
  });
  
  userSchema.methods.isValidPassword = async function(newPassword) {
    try {
      // Compare the provided password with the hashed password
      return await bcrypt.compare(newPassword, this.password);
    } catch (error) {
      throw new Error(error);
    }
  }

var User = mongoose.model("User", userSchema);

export default User;