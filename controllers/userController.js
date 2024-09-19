const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require("../models/userModel");
const createError = require("../middleware/error");
const createSuccess = require("../middleware/success");
const bcrypt = require("bcrypt");
const validator = require('validator');
const path = require('path');
const XLSX = require('xlsx');
const { createNotification } = require('../services/notificationService');
const {notification}=require('../controllers/notification')

//to Create user
const register = async (req, res, next) => {
  try {
    const { email, password, userName, mobileNumber, age, gender, profileImage, deviceToken } = req.body;

    if (userName.length <= 1 || userName.length >= 25) {
      return next(createError(400, "Username must be between 2 to 25 characters long"));
    }

    if (age && (age < 0 || age > 120)) {
      return next(createError(400, "Invalid age"));
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { userName: userName }]
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        status: 409,
        message: "User with this email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      mobileNumber,
      age,
      gender,
      profileImage,
      role: "user",
      deviceToken,
    });

    await newUser.save();
    const title = 'Welcome to this App';
    const body = `Congratulations, ${userName}! Your registration is complete. We’re excited to have you on board.`;
    const userId='';
    await notification(userId,title,body,deviceToken)
    await createNotification('new_user', `${newUser.userName} has signed up.`);

    return res.status(201).json({
      success: true,
      status: 201,
      message: "User SignUp Successful!",
      data: newUser,
    });
  } catch (error) {
    return next(createError(500, "Something went wrong"));
  }
};



//get users
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .exec();

    res.json({
      totalUsers,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

//update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await User.findByIdAndUpdate(id, req.body);
    if (!users) {
      return next(createError(404, "User Not Found"));
    }
    return next(createSuccess(200, "User Details Updated", users));
  } catch (error) {
    return next(createError(500, "Internal Server Error!"));
  }
};

// Function to edit user details
const editUser = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from the request parameters
    const { name, email, password, mobileNumber, profileImage } = req.body;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the fields that are provided in the request body
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(8);
      user.password = await bcrypt.hash(password, salt);
    }
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (profileImage) user.profileImage = profileImage;

    // Save the updated user
    const updatedUser = await user.save();

    // Exclude the password field from the response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// getting user by id
const getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and select specific fields
    const user = await User.findById(userId).select('name email mobileNumber profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get all the users
// const getAllUsers = async (req, res) => {
//   try {
//     // Find all users and select specific fields
//     const users = await User.find().select('name email mobileNumber');

//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   getUser,
//   getAllUsers
// };



//delete user
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return next(createError(404, "User Not Found"));
    }
    return res.status(200).json({
      success: true,
      status: 200,
      message: "User Deleted Successfully!"
    });
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// forget password
const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const ResetPasswordLink = "https://en.wikipedia.org/wiki/Facebook"
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(resetToken);
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      // subject: 'Password Reset',
      // text: `
      //   You requested a password reset. Click the following link to reset your password:
      //   http://${req.headers.host}/reset-password/${resetToken}
      //   If you did not request this, please ignore this email.
      // `,
      subject: "Password Reset",
      html: `<p>valid for 15 minutes.</p>
      <p><a href="${ResetPasswordLink}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a></p>`

    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).send('Error sending email');
      }
      res.status(200).send('Password reset email sent');
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
};

const resetPasswordUser = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) return res.status(400).send('Invalid or expired token');

    user.password = await bcrypt.hash(newPassword, 12); // Hash the new password
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).send('Password reset successful');
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Server error');
  }
};

// Add an outfitter to user's favorites
const addFavorite = async (req, res, next) => {
  try {
    const outfitterId = req.params.outfitterId;
    const userId = req.user.id; // Extracted from decoded token

    // Check if the outfitter exists
    const outfitter = await Outfitter.findById(outfitterId);
    if (!outfitter) {
      return next(createError(404, 'Outfitter not found'));
    }

    // Construct the favorite object
    const favorite = {
      outfitterId: outfitter._id,
      outfitterName: outfitter.name
    };

    // Find the user by ID and update their favorites
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: favorite } }, // $addToSet prevents duplicates
      { new: true }
    );

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.status(200).json({
      status: 200,
      message: 'Outfitter added to favorites successfully',
      data: user.favorites
    });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};


// Get user's favorites
const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id; // Extracted from decoded token

    // Find the user by ID and populate the favorites field
    const user = await User.findById(userId).populate('favorites');

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // console.log('User favorites:', user.favorites); // Debugging line

    res.status(200).json({
      status: 200,
      message: 'Favorites retrieved successfully',
      data: user.favorites
    });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};

// Function to delete all users
const deleteAllUsers = async (req, res, next) => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({
      status: 200,
      message: 'All users deleted successfully',
      data: result,
    });
  } catch (error) {
    return next(createError(500, 'Internal Server Error'));
  }
};

// update-profile
const updateProfile = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;
    const userId = req.params.userId; // Extract user ID from token

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user details
    if (mobileNumber) user.mobileNumber = mobileNumber;

    if (req.file) user.profileImage = req.file.path; // Update the profile image path

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        userName: user.userName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    return next(createError(500, "Something went wrong!"));
  }
};

// change the password
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return next(createError(400, "Old password and new password are required"));
    }

    // Get the user from the request
    const id = req.user.id;
    const user = await User.findById(id);

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(createError(400, "Old password is incorrect"));
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Respond with success message
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    // Handle errors
    console.error('Error changing password:', error);
    return next(createError(500, "Something went wrong"));
  }
};


// Block a user
const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'User not found'
      });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      success: true,
      status: 200,
      message: 'User blocked successfully!',
      data: user
    });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};

// Unblock a user
const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ success: true, message: 'User unblocked successfully', data: user });
  } catch (error) {
    next(createError(500, 'Something went wrong'));
  }
};

// Export Users to Excel
const exportUsersToExcel = async (req, res, next) => {
  try {
    const users = await User.find().lean();
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const filePath = path.join(__dirname, '../exports/users.xlsx');
    XLSX.writeFile(workbook, filePath);

    res.download(filePath);
  } catch (error) {
    console.error("Error exporting users:", error);
    return next(createError(500, "Error exporting users"));
  }
};




module.exports = {
  register,
  getUser,
  getAllUsers,
  updateUser,
  editUser,
  forgetPassword,
  deleteUser,
  resetPasswordUser,
  addFavorite,
  getFavorites,
  deleteAllUsers,
  updateProfile,
  changePassword,
  blockUser,
  unblockUser,
  exportUsersToExcel
};
