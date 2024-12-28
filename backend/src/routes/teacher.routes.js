import { Router } from 'express';
import {
    changeCurrentPassword,
    getCurrentUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    registerUser,
    setProfilePhoto,
    updateAccountDetails
} from "../controllers/teacher.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(verifyJWT, logOutUser);

router.route('/refresh-token').post(refreshAccessToken);

router.route('/current-user').get(verifyJWT, getCurrentUser);

router.route('/update-account').patch(verifyJWT, upload.single("profile"), updateAccountDetails);

router.route('/profile').patch(verifyJWT, upload.single("profile"), setProfilePhoto);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;



