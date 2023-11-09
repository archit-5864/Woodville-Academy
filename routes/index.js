var express = require('express');
var router = express.Router();
var teacherController = require("../controller/controller")

router.post("/createTeacher", teacherController.createTeacher)
router.put("/updateTeacherBasicDetails/:id", teacherController.updateTeacherBasicDetails)
router.put("/updateTeacherEducationDetails/:id", teacherController.updateTeacherEducationDetails)
router.put("/updateTeacherExperienceDetails/:id", teacherController.updateTeacherExperienceDetails)
router.put("/updateTeacherIdProofDetails/:id", teacherController.updateTeacherIdProofDetails)
router.post("/loginTeacher", teacherController.loginTeacher)

module.exports = router;