const Mark = require('../models/marks')
const User = require('../models/users')
const Helper = require('../middleware/helper')
const { stringObject } = require('../utils/commonUtils')

const fromTime = "T00:00:00"
const toTime = "T23:59:59"


exports.saveMarks = async (req, res, next) => {
    const marks = []

    if (req.header('X-App-Version')) {
        // console.log("APP VERSION", req.get('X-App-Version'))
    }

    const subject = req.body.subject
    const examDate = req.body.examDate
    const examId = req.body.examId
    const schoolId = req.school.schoolId
    const classId = req.body.classId
    const userId = req.school.userId
    const createdOn = new Date().getTime()
    const roiId = req.body.roiId
    const attendance_date = req.body.attendance_date


    // console.log(req.body);
    req.body.studentsMarkInfo.forEach(studentsData => {
        const marksData = new Mark({
            ...studentsData,
            schoolId,
            examDate,
            subject,
            classId,
            createdOn,
            roiId,
            examId,
            userId,
            attendance_date
        })
        marks.push(marksData)
    });
    console.log("markssssssssssss: ", marks)
    try {
        const subjectToFind = 'attendance';
        const foundItem = marks.find(item => item.subject === subjectToFind);
        console.log("##############################",foundItem);
        if (foundItem) {
            let a = 0;
            for (let data of marks) {
                a++;
                if (!data.examDate && data.examDate == undefined) {
                    data.examDate = new Date().toLocaleDateString()
                }

                let splited_date_first_10_days = parseInt(data.examDate.split("/")[0])
                data.marksInfo.length = splited_date_first_10_days
                if (splited_date_first_10_days < 11) {
                    data.set = "A"
                }
                else if (splited_date_first_10_days >= 11 && splited_date_first_10_days < 21) {
                    data.set = "B"
                }
                else if (splited_date_first_10_days >= 21 && splited_date_first_10_days < 31) {
                    data.set = "C"
                }
                data.attendance_date = data.examDate

                let studentMarksExist = await Mark.findOne({ schoolId: data.schoolId, studentId: data.studentId, classId: data.classId, subject: data.subject, roiId: data.roiId, set: data.set })
                if (!studentMarksExist) {
                    let splited_day = null
                    if (data.set == "A") {
                        splited_day = parseInt(data.examDate.split("/")[0])
                    }
                    if (data.set == "B" || data.set == "C") { 
                        let splited_date_after_10_days = String(splited_date_first_10_days).split("")[1]
                        splited_day = splited_date_after_10_days
                        if (splited_date_first_10_days == 20 || splited_date_first_10_days == 30){
                            splited_day = 10
                        }
                    }
                        
                    // console.log(marks[0]);
                    // data.marksInfo.length = (splited_day)
                    // console.log(data.marksInfo[4]);
                    let temp = data.marksInfo[splited_day-1]
                    data.marksInfo = []
                    temp.attendance_date = data.attendance_date
                    data.marksInfo.push(temp)
                    // console.log(data);
                    // console.log("thissssssssssssssssssssssssssssss",data.marksInfo);
                    // data.marksInfo[data.marksInfo.length - 1].attendance_date = data.attendance_date
                    // data.marksInfo[0].attendance_date = data.examDate
                    // console.log(data); 
                    // console.log("new data####################");
                    await Mark.create(data) 
                } else {
                    if (data.subject == "attendance") {
                        console.log("insideeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
                        if (data.schoolId == studentMarksExist.schoolId && data.studentId == studentMarksExist.studentId && data.classId == studentMarksExist.classId && data.subject == studentMarksExist.subject && data.set == studentMarksExist.set) {

                            let lookup = {
                                studentId: data.studentId,
                                subject: data.subject,
                                set: data.set
                            }
                            // console.log("spliteddddddddddddddddddddddddddddd",data.attendance_date.split("/")[0]);
                            let splited_date_first_10_days = parseInt(data.examDate.split("/")[0])
                            console.log("hereeeeeeeeeeeeeeeeeeeeeeeeeeeee", splited_date_first_10_days);
                            if (splited_date_first_10_days < 11) {
                                console.log("students exist##############",studentMarksExist);
                                studentMarksExist.marksInfo.push(data.marksInfo[splited_date_first_10_days - 1])
                                console.log(studentMarksExist);
                                studentMarksExist.marksInfo[studentMarksExist.marksInfo.length- 1].attendance_date = data.attendance_date
                                let update = { $set: { datastudentIdTrainingData: data.studentIdTrainingData, predictedStudentId: data.predictedStudentId, studentAvailability: data.studentAvailability, marksInfo: studentMarksExist.marksInfo, maxMarksTrainingData: data.maxMarksTrainingData, maxMarksPredicted: data.maxMarksPredicted, securedMarks: data.securedMarks, totalMarks: data.totalMarks, obtainedMarksTrainingData: data.obtainedMarksTrainingData, obtainedMarksPredicted: data.obtainedMarksPredicted, set: data.set, userId: data.userId} }
                                await Mark.updateOne(lookup, update)
                            }
                            else if (splited_date_first_10_days >= 11 && splited_date_first_10_days < 20) {
                                let splited_date_after_10_days = String(splited_date_first_10_days).split("")[1]
                                studentMarksExist.marksInfo.push(data.marksInfo[splited_date_after_10_days - 1])
                                // console.log(db_data)
                                studentMarksExist.marksInfo[studentMarksExist.marksInfo.length - 1].attendance_date = data.attendance_date
                                // console.log(db_data)
                                let update = { $set: { studentIdTrainingData: data.studentIdTrainingData, predictedStudentId: data.predictedStudentId, studentAvailability: data.studentAvailability, marksInfo: studentMarksExist.marksInfo, maxMarksTrainingData: data.maxMarksTrainingData, maxMarksPredicted: data.maxMarksPredicted, securedMarks: data.securedMarks, totalMarks: data.totalMarks, obtainedMarksTrainingData: data.obtainedMarksTrainingData, obtainedMarksPredicted: data.obtainedMarksPredicted, set: data.set, userId: data.userId} }
                                await Mark.updateMany(lookup, update)
                            }
                            else if (splited_date_first_10_days >= 21 && splited_date_first_10_days < 30) {
                                console.log(data.examDate, data.attendance_date);
                                let splited_date_after_20_days = String(splited_date_first_10_days).split("")[1]
                                studentMarksExist.marksInfo.push(data.marksInfo[splited_date_after_20_days - 1])
                                // data.marksInfo.length = splited_date_after_20_days[1]
                                // data.marksInfo[data.marksInfo.length - 1].attendance_date = data.attendance_date
                                studentMarksExist.marksInfo[studentMarksExist.marksInfo.length - 1].attendance_date = data.attendance_date
                                let update = { $set: { studentIdTrainingData: data.studentIdTrainingData, predictedStudentId: data.predictedStudentId, studentAvailability: data.studentAvailability, marksInfo: studentMarksExist.marksInfo, maxMarksTrainingData: data.maxMarksTrainingData, maxMarksPredicted: data.maxMarksPredicted, securedMarks: data.securedMarks, totalMarks: data.totalMarks, obtainedMarksTrainingData: data.obtainedMarksTrainingData, obtainedMarksPredicted: data.obtainedMarksPredicted, set: data.set, userId: data.userId} }
                                await Mark.updateOne(lookup, update)
                            }
                            else if (splited_date_first_10_days == 20 || splited_date_first_10_days == 30) {
                                console.log(studentMarksExist.marksInfo);
                                studentMarksExist.marksInfo.push(data.marksInfo[9])
                                console.log("1st##########################",studentMarksExist);
                                studentMarksExist.marksInfo[studentMarksExist.marksInfo.length - 1].attendance_date = data.attendance_date
                                console.log("2nd##################",studentMarksExist);
                                let update = { $set: { studentIdTrainingData: data.studentIdTrainingData, predictedStudentId: data.predictedStudentId, studentAvailability: data.studentAvailability, marksInfo: studentMarksExist.marksInfo, maxMarksTrainingData: data.maxMarksTrainingData, maxMarksPredicted: data.maxMarksPredicted, securedMarks: data.securedMarks, totalMarks: data.totalMarks, obtainedMarksTrainingData: data.obtainedMarksTrainingData, obtainedMarksPredicted: data.obtainedMarksPredicted, set: data.set, userId: data.userId} }
                                await Mark.updateOne(lookup, update)
                            }
                            // else if (splited_date_first_10_days == 31) {
                            //     let update = { $set: { studentIdTrainingData: data.studentIdTrainingData, predictedStudentId: data.predictedStudentId, studentAvailability: data.studentAvailability, marksInfo: data.marksInfo[0], maxMarksTrainingData: data.maxMarksTrainingData, maxMarksPredicted: data.maxMarksPredicted, securedMarks: data.securedMarks, totalMarks: data.totalMarks, obtainedMarksTrainingData: data.obtainedMarksTrainingData, obtainedMarksPredicted: data.obtainedMarksPredicted, set: data.set, userId: data.userId } }
                            //         await Mark.update(lookup, update)}

                        }
                    }
                }
            }
            
            let match = {
                schoolId: marks[0].schoolId,
                classId: marks[0].classId,
                section: marks[0].section,
                subject: marks[0].subject,
                set: marks[0].set
            }

            let marksData = await Mark.find(match, { _id: 0, __v: 0 })
            console.log("marksdataaa##################################", marksData);
            res.status(200).json({ data: marksData })
        }

        else {
            for (let data of marks) {
                if (!data.examDate && data.examDate == undefined) {
                    data.examDate = new Date().toLocaleDateString()
                }
    
                let studentMarksExist = await Mark.findOne({ schoolId: data.schoolId, studentId: data.studentId, classId: data.classId, subject: data.subject, examDate: data.examDate, roiId: data.roiId })
    
                if (!studentMarksExist) {
                    await Mark.create(data)
                } else {
                    if (data.schoolId == studentMarksExist.schoolId && data.studentId == studentMarksExist.studentId && data.classId == studentMarksExist.classId && data.subject == studentMarksExist.subject && data.examDate == studentMarksExist.examDate) {
    
                        let lookup = {
                            studentId: data.studentId,
                            subject: data.subject,
                            examDate: data.examDate
                        }
                        let update = { $set: { studentIdTrainingData: data.studentIdTrainingData, predictedStudentId: data.predictedStudentId, studentAvailability: data.studentAvailability, marksInfo: data.marksInfo, maxMarksTrainingData: data.maxMarksTrainingData, maxMarksPredicted: data.maxMarksPredicted, securedMarks: data.securedMarks, totalMarks: data.totalMarks, obtainedMarksTrainingData: data.obtainedMarksTrainingData, obtainedMarksPredicted: data.obtainedMarksPredicted, set: data.set, userId: data.userId } }
                        await Mark.update(lookup, update)
                    }
                }
            }
            let match = {
                schoolId: marks[0].schoolId,
                classId: marks[0].classId,
                section: marks[0].section,
                examDate: marks[0].examDate,
                // attendance_date: marks[0].attendance_date,
                subject: marks[0].subject,
                // set: marks[0].set
            }
    
            let marksData = await Mark.find(match, { _id: 0, __v: 0 })
            console.log("marksdataaa##################################", marksData);
            res.status(200).json({ data: marksData })
        }
        
    }

    catch (e) {
        if (e && e.message == stringObject().lockScreen) {
            res.status(500).json({ error: e.message })
        }
        else {
            console.log(e);
            res.status(400).json({ e })
        }
    }
}

exports.getSaveScan = async (req, res, next) => {
    try {
        if (req.body.schoolId) {
            req.body.schoolId = req.body.schoolId.toLowerCase()
        }

        const match = {}

        if (req.body.userId && !req.body.schoolId) {
            req.body.userId = req.body.userId.toLowerCase()
            const userData = await User.findOne({ userId: req.body.userId })
            match.schoolId = userData.schoolId
        }


        const { schoolId, classId, section, subject, fromDate, roiId } = req.body

        if (schoolId) {
            match.schoolId = schoolId
        }

        if (fromDate) {
            match.examDate = fromDate
        }

        if (classId) {
            match.classId = classId
        }

        if (section && section != "0") {
            match.section = section
        }
        if (roiId) {
            match.roiId = roiId
        }

        if (subject && subject != 'Subject') {
            match.subject = new RegExp(`^${subject}$`, 'i')
        }

        if (req.body.page) {
            req.body.limit = 10;
            req.body.page = 1;
        } else {
            req.body.limit = 0;
            req.body.page = 1;
        }

        const savedScan = await Mark.find(match, { _id: 0, __v: 0 })
            .limit(parseInt(req.body.limit) * 1)
            .skip((parseInt(parseInt(req.body.page)) - 1) * parseInt(parseInt(req.body.limit)))


        res.status(200).json({ data: savedScan })
    } catch (e) {
        res.status(400).json({ "error": true, e })
    }
}