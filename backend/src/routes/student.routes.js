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
} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { stud_verifyJWT } from '../middlewares/auth_stud.middleware.js';


const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "photo",
            maxCont: 6
        }
    ]),
    registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(stud_verifyJWT, logOutUser);

router.route('/refresh-token').post(refreshAccessToken);

router.route('/current-user').get(stud_verifyJWT, getCurrentUser);

router.route('/update-account').patch(stud_verifyJWT, 
    upload.single('profile'),
    updateAccountDetails);

router.route('/profile').patch(stud_verifyJWT, upload.single("profile"), setProfilePhoto);

router.route("/change-password").post(stud_verifyJWT, changeCurrentPassword);

export default router;



