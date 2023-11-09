var express = require('express');
var router = express.Router();
var teacherController = require("../controller/controller")

router.post("/createTeacher", teacherController.createTeacher)
router.post("/loginTeacher", teacherController.loginTeacher)
router.put("/updateTeacherBasicDetails/:id", teacherController.updateTeacherBasicDetails)
router.put("/updateTeacherEducationDetails/:id", teacherController.updateTeacherEducationDetails)
router.put("/updateTeacherExperienceDetails/:id", teacherController.updateTeacherExperienceDetails)
router.put("/updateTeacherIdProofDetails/:id", teacherController.updateTeacherIdProofDetails)
router.post("/insertSubject", teacherController.insertSubject)
router.post("/insertCategories", teacherController.insertCategories)
router.post("/insertSubCategories", teacherController.insertSubCategories)
router.post("/addContent", teacherController.addContent)

module.exports = router;