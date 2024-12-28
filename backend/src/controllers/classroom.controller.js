import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Classroom } from "../models/classroom.models.js";
import { Teacher } from "../models/teacher.models.js";
import { uploadOnCloudinary, downloadFromCloudinary } from "../utils/cloudinary.js"
import { v4 as uuidv4 } from "uuid";
import { Student } from "../models/student.models.js";
import path from "path";
import fs from "fs";


const generateClassCode = async () => {
    const uuid = uuidv4()
    const encoder = new TextEncoder();
    const data = encoder.encode(uuid);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray.slice(0, 6).map(x => x.toString(16).padStart(2, '0')).join('');

}

const generateTimetable = asyncHandler(async (req, res, next) => {``
    const { config, subjects,title,classCode} = req.body;

    if (!config || !subjects || subjects.length === 0) {
        return next(new ApiError(400, "Please provide configuration and subjects."));
    }

    const { lectureDuration, practicalDuration, breakDuration, breakTime, dayDuration, includeSaturday, startTime } = config;

    if (
        [lectureDuration, practicalDuration, breakDuration, breakTime, dayDuration, startTime].some(
            (field) => field === undefined || field === null || field === ""
        )
    ) {
        return next(new ApiError(400, "All configuration fields must be provided."));
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (includeSaturday) daysOfWeek.push("Saturday");

    const timetable = {};
    const totalSlots = Math.floor((dayDuration * 60) / lectureDuration);

    daysOfWeek.forEach((day) => {
        timetable[day] = Array(totalSlots).fill(null);
    });

    function assignSubjectToSlot(day, subject, isPractical, slotsAssigned, teacherAvailability) {
        for (let i = 0; i < totalSlots; i++) {
            if (
                timetable[day][i] === null && 
                (i === 0 || timetable[day][i - 1]?.split(" ")[0] !== subject.name) 
            ) {
                timetable[day][i] = isPractical ? `${subject.name} (Practical)` : subject.name;
                if (!teacherAvailability[subject.teacher]) teacherAvailability[subject.teacher] = [];
                teacherAvailability[subject.teacher].push(`${day}-${i}`);
                slotsAssigned++;
                break;
            }
        }
        return slotsAssigned;
    }

    const teacherAvailability = {};
    subjects.forEach((subject) => {
        let remainingLectureHours = subject.lectureHours;
        let remainingPracticalHours = subject.practicalHours;

        for (const day of daysOfWeek) {
            if (remainingLectureHours > 0) {
                remainingLectureHours = assignSubjectToSlot(day, subject, false, remainingLectureHours, teacherAvailability);
            }
            if (remainingPracticalHours > 0) {
                remainingPracticalHours = assignSubjectToSlot(day, subject, true, remainingPracticalHours, teacherAvailability);
            }
        }
    });

    const breakSlotIndex = Math.floor(
        (new Date(`01/01/2022 ${breakTime}`) - new Date(`01/01/2022 ${startTime}`)) /
            (1000 * 60 * lectureDuration)
    );
    daysOfWeek.forEach((day) => {
        if (breakSlotIndex >= 0 && breakSlotIndex < totalSlots) {
            timetable[day][breakSlotIndex] = `Break (${breakTime} - ${breakDuration} mins)`;
        }
    });

    function timetableToCSV({ timetable, daysOfWeek, totalSlots, lectureDuration, startTime }) {
        const slotTimes = [];
        const timetableMatrix = [];

        for (let i = 0; i < totalSlots; i++) {
            const timeSlotStart = new Date(new Date(`01/01/2022 ${startTime}`).getTime() + i * lectureDuration * 60000);
            const timeSlotEnd = new Date(timeSlotStart.getTime() + lectureDuration * 60000);
            slotTimes.push(
                `${timeSlotStart.getHours()}:${timeSlotStart.getMinutes().toString().padStart(2, "0")} - ${timeSlotEnd.getHours()}:${timeSlotEnd.getMinutes().toString().padStart(2, "0")}`
            );
        }

        timetableMatrix.push(["Day", ...slotTimes]);
        daysOfWeek.forEach((day) => {
            const row = [day];
            for (let i = 0; i < totalSlots; i++) {
                row.push(timetable[day][i] || "Free");
            }
            timetableMatrix.push(row);
        });

        let csvContent = "";
        timetableMatrix.forEach((row) => {
            csvContent += row.join(",") + "\n";
        });

        return csvContent;
    }

    const csvContent = timetableToCSV({
        timetable,
        daysOfWeek,
        totalSlots,
        lectureDuration,
        startTime,
    });

    const __dirname = path.resolve();
    const FolderPath = path.join(__dirname, "/public/temp");
    
    const localFilePath = path.join(FolderPath, `${title}.csv`);
    fs.writeFileSync(localFilePath, csvContent);

    const uploaded = await uploadOnCloudinary(localFilePath);

    if (!uploaded) {
        return next(new ApiError(500, "An error occurred while uploading the file. Please try again later."));
    }
    const username=req.user.username;
   
    if(!username){
        return next(new ApiError(400,"User is not authenticated or invalid"))
    }
   
    const classroom = await Classroom.findOneAndUpdate(
        { 
            classCode
        },
        {
            $push: {
                timetable: {
                    title,
                    attachment: uploaded.secure_url,
                    createdAt: new Date(),
                },
            },
        },
        { new: true }
    ).select("-members");


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                classroom
            },
            "Timetable generated and uploaded successfully!"
        )
    );
});

const createClass = asyncHandler(async (req, res, next) => {
    const { classname, subject, section, year } = req.body;

    if (
        [classname, subject, section, year].some((field) =>
            field?.trim() === "")
    ) {
        return next(new ApiError(400, "Please fill out all the required fields before submitting"));
    }

    const existClass = await Classroom.findOne({
        classname,
        owner:req.user.username
    })

    if(existClass){
        return next(new ApiError(400,"Class already exists with same name"))
    }

    const code = await generateClassCode();

    const user = await Teacher.findById(req.user._id);

    const classroom = await Classroom.create({
        classname,
        subject,
        section,
        year,
        owner: user.username,
        classCode: code
    })

    const createdClassroom = await Classroom.findById(classroom._id);

    if (!createdClassroom) {
        return next(new ApiError(500, "An error occurred while creating the class. Please try again later."));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdClassroom, "Classroom created successfully!"));

})

const joinClass = asyncHandler(async (req, res, next) => {
    const { classCode } = req.body;

    if (!classCode) {
        return next(new ApiError("Please provide a class code."))
    }

    const classroom = await Classroom.findOne({ classCode })

    if(!classroom) return next(new ApiError(400,"Class not found"))
    const userId = req.user?._id;

    if (!userId) {
        return next(new ApiError(400, "User is not authenticated or invalid"));
    }

    if (classroom.members.length > 0) {
        const existMember = classroom.members.includes(userId);

        if (existMember) {
            return next(new ApiError(400, "You have already joined this class"));
        }
    }

    const student = await Student.findByIdAndUpdate(
        req.user?._id,
        {
            $push: {
                classId: classroom._id,
                classCode
            }
        }).select('-password -refreshToken');

    await classroom.updateOne({
        $push: {
            members: student._id
        }
    })

    const updatedStudent = await Student.findById(student._id)
    const updatedCLass = await Classroom.findById(classroom._id)

    return res
        .status(200)
        .json(new ApiResponse(200, { student: updatedStudent, classroom: updatedCLass }, "Class Joined Successfully !"))
})

const postAssignment = asyncHandler(async (req, res, next) => {

    const { title, classCode } = req.body;

    if (
        [title].some((field) =>
            field?.trim() === "")
    ) {
        return next(new ApiError(400, "Please fill out all the required fields before submitting"));
    }

    const LocalPath = req.file?.path;

    if (!LocalPath) {
        return next(new ApiError(401, "The file was not uploaded. Please try again."));
    }

    const uploaded = await uploadOnCloudinary(LocalPath);

    if (!uploaded) {
        return next(new ApiError(500, "An error occurred while uploading the file. Please try again later."));
    }

    const classroom = await Classroom.findOneAndUpdate(
        { classCode },
        {
            $push: {
                assignment: {
                    title,
                    attachment: uploaded.secure_url,
                    createdAt: new Date(),
                },
            },
        },
        { new: true }
    ).select("-members");

    if(!classroom){
        return next(new ApiError(400,"Something Went Wrong"))
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, classroom, "File uploaded successfully!!")
        )
});

const download = asyncHandler(async (req, res, next) => {
    const { url } = req.body;

    if (!url) {
        return next(new ApiError(400, "File Not Found"));
    }

    downloadFromCloudinary(url);

    res.status(200).json(new ApiResponse(200, "File Downloaded Successfully!!"));
});

const postNotice = asyncHandler(async (req, res, next) => {

    const { description, classname } = req.body;

    if (
        [description, classname].some((field) =>
            field?.trim() === "")
    ) {
        return next(new ApiError(400, "Please fill out all the required fields before submitting"));
    }

    const LocalPath = req.file?.path;

    if (!LocalPath) {
        return next(new ApiError(401, "The file could not be uploaded. Please try again."));
    }

    const uploaded = await uploadOnCloudinary(LocalPath);

    if (!uploaded) {
        return next(new ApiError(500, "There was an error while uploading the file. Please try again later."));
    }

    const username=req.user?.username;

    if(!username){
        return next(new ApiError(400,"User is not authenticated or invalid"))
    }

    console.log(classname)
    console.log(description)
    console.log(uploaded.secure_url)
    const classroom = await Classroom.findOneAndUpdate(
        { 
            $and: [
                { classname: classname }, 
                { owner: username }
            ] 
        },
        {
            $push: {
                notice: {
                    description,
                    attachment: uploaded.secure_url,
                    createdAt: new Date(),
                },
            },
        },
        { new: true }
    ).select("-members");

    if(!classroom){
        return next(new ApiError(400,"Something Went Wrong"))
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, classroom, "File uploaded successfully!")
        )
})

const postResult = asyncHandler(async (req, res, next) => {

    const { classcode } = req.body;

    if (
        [classcode].some((field) =>
            field?.trim() === "")
    ) {
        return next(new ApiError(400, "Please fill out all the required fields before submitting"));
    }

    const LocalPath = req.file?.path;

    if (!LocalPath) {
        return next(new ApiError(401, "The file could not be uploaded. Please try again."));
    }

    const uploaded = await uploadOnCloudinary(LocalPath);

    if (!uploaded) {
        return next(new ApiError(500, "There was an error while uploading the file. Please try again later."));
    }

    const username=req.user?.username;

    if(!username){
        return next(new ApiError(400,"User is not authenticated or invalid"))
    }

    const classroom = await Classroom.findOneAndUpdate(
        { 
            $and: [
                { classCode: classcode }, 
                { owner: username }
            ] 
        },
        {
            $push: {
                result: {
                    description:uploaded.public_id,
                    attachment: uploaded?.secure_url || "",
                    createdAt: new Date(),
                },
            },
        },
        { new: true }
    ).select("-members");    


    if(!classroom){
        return next(new ApiError(400,"Something Went Wrong"))
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, classroom, "File uploaded successfully!")
        )
})

const getJoinedClasses = asyncHandler(async (req, res) => {

    const stud = await Student.findById(req.user?._id);

    if (!stud) {
        return next(new ApiError(400, "Unauthorized request. Please check your permissions or log in again."));
    }

    var classArr = [];

    var owner;
    for (const element of stud.classId) {
        const classInfo = await Classroom.findById(element);

        if (!classInfo) {
            return next(new ApiError(400, "The classroom does not exist. Please check the details and try again."));
        }

        classArr.push(classInfo);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { classArr }, "Retrived"))


})

const getCreatedClasses = asyncHandler(async (req, res) => {

    const user = await Teacher.findById(req.user._id);

    if (!user) return next(new ApiError(400, "Unauthorized request. Please check your permissions or log in again."));

    const classes = await Classroom.find({ owner: user.username })

    if (!classes) next(new ApiError(400, "Class not found. Please check the details and try again"));

    return res
        .status(200)
        .json(new ApiResponse(200, { classes }, "Retrived"))

})

const getJoinedStudents = asyncHandler(async (req, res) => {
    const { classCode } = req.body
    if (!classCode) {
        return next(new ApiError("Please provide a class code."));
    }

    const classroom = await Classroom.findOne({ classCode })

    if (!classroom) return next(new ApiError(400, "Class not found. Please check the details and try again."))

    const members = classroom.members

    const students = await Promise.all(
        members.map(async (studId) => {
            const studInfo = await Student.findById(studId).select("username profile")
            return studInfo
        })
    )

    return res.status(200)
        .json(new ApiResponse(200, { students }, "Retrived"))

})

export {
    createClass,
    joinClass,
    postAssignment,
    getJoinedClasses,
    getCreatedClasses,
    getJoinedStudents,
    postNotice,
    postResult,
    generateTimetable,
    download
}