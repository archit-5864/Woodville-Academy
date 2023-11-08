let conn = require("../db/conn")
const path = require("path")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailMamanger = require("./helpers/sendMails");
var dotenv = require("dotenv");
dotenv.config();

const SECRET = process.env.SECRET;

module.exports = {

    // -----------------------------------------------Create Teacher Section Start---------------------------------------

    createTeacher: async (req, res) => {
        try {
            const {
                name,
                email,
                phoneNo,
                password,
                role,
                image,
                isEmailVeryfied,
                isPhoneVeryfied,
                accountStatus,
                deviceType,
                deviceToken,
                otp,
            } = req.body;

            if (
                !name ||
                !email ||
                !phoneNo ||
                !password ||
                !role ||
                !accountStatus ||
                !deviceType
            ) {
                return res
                    .status(400)
                    .json({ message: "Please fill all required fields" });
            }

            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            const phoneRegex = /^[0-9]{8,14}$/;
            if (!phoneRegex.test(phoneNo)) {
                return res.status(400).json({ message: "Invalid phone number format" });
            }

            const hashedPassword = await bcrypt
                .hash(password, 10)
                .then(hash => {
                    return hash
                })
                .catch(err => console.error(err.message))

            let imageName = "";
            if (req.files && req.files.image) {
                const imageFile = req.files.image;
                imageName = imageFile.name;
                const uploadDir = path.join(
                    __dirname,
                    "../public/images/userImages",
                    imageName
                );
                imageFile.mv(uploadDir, (err) => {
                    if (err) {
                        console.error(err);
                        // return res.status(500).send("Error in uploading image");
                    }
                });
            }
            const dbData = [
                name,
                email,
                phoneNo,
                hashedPassword,
                role,
                imageName,
                isEmailVeryfied,
                isPhoneVeryfied,
                accountStatus,
                deviceType,
                deviceToken,
                otp,
            ];
            conn.query(
                "INSERT INTO teacher (name, email, phoneNo, password, role, image, isEmailVeryfied, isPhoneVeryfied, accountStatus, deviceType, deviceToken, otp) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                dbData,
                async (err, result) => {
                    if (err) {
                        console.error(err);
                        return res
                            .status(500)
                            .send("Error in inserting data into database");
                    }
                    const authToken = jwt.sign({ email }, SECRET, {
                        expiresIn: "1h",
                    });
                    conn.query(
                        `Update teacher set authToken = '${authToken}' where email = '${email}'`,
                        [authToken]
                    );
                    res.json({
                        message: "Success",
                        status: 200,
                        body: {
                            name: req.body.name,
                            token: authToken,
                        }
                    })

                    const otp = await emailMamanger.sendOTP(
                        email,
                        "Account verify OTP"
                    );
                    conn.query(
                        `update teacher set otp = '${otp}'  where email = '${email}' `
                    );
                }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },

    // -----------------------------------------------Update Teacher Basic Details Start-----------------------------------

    updateTeacherBasicDetails: async (req, res) => {
        try {
            const {
                gender,
                dateOfBirth,
                about
            } = req.body;
            const teacherId = req.params.id;
            conn.query(
                `UPDATE teacher SET gender = ?, dateOfBirth = ?, about = ? WHERE id = ?`,
                [
                    gender,
                    dateOfBirth,
                    about,
                    teacherId
                ]
            );
            res.json({
                message: "Success",
                status: 200,
                body: {
                    Data: req.body,
                }
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    // -----------------------------------------------Update Teacher Education Details Start--------------------------------

    updateTeacherEducationDetails: async (req, res) => {
        try {
            const {
                educaton,
                stream,
                workType,
            } = req.body;

            let documentImage = "";
            if (req.files && req.files.image) {
                const imageFile = req.files.image;
                documentImage = imageFile.name;
                const uploadDir = path.join(
                    __dirname,
                    "../public/images/documentImages",
                    documentImage
                );
                imageFile.mv(uploadDir, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error in uploading image");
                    }
                });
            }
            const teacherId = req.params.id;
            conn.query(
                `UPDATE teacher SET educaton = ?, stream = ?, workType = ?, documentImage = ? WHERE id = ?`,
                [
                    educaton,
                    stream,
                    workType,
                    documentImage,
                    teacherId
                ]
            );
            res.json({
                message: "Success",
                status: 200,
                body: {
                     ...req.body,
                    Image: documentImage,
                }
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    // -----------------------------------------------Update Teacher Experience Details Start-------------------------------

    updateTeacherExperienceDetails: async (req, res) => {
        try {
            const {
                experience,
                description,
                skills
            } = req.body;
            const teacherId = req.params.id;
            conn.query(
                `UPDATE teacher SET experience = ?, description = ?, skills = ? WHERE id = ?`,
                [
                    experience,
                    description,
                    skills,
                    teacherId
                ]
            );
            res.json({
                message: "Success",
                status: 200,
                body: {
                    Data: req.body,
                }
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    // -----------------------------------------------Update Teacher ID Proof Details Start----------------------------------

    updateTeacherIdProofDetails: async (req, res) => {
        try {
            const { address, idProof } = req.body;
            const teacherId = req.params.id;

            let idProofDocument = "";
console.log(req.files)
            if (req.files && req.files.document) {
                const documentFile = req.files.document;
                idProofDocument = documentFile.name;

                const uploadDir = path.join(
                    __dirname,
                    "../public/images/idProofDocImg",
                    idProofDocument
                );

                documentFile.mv(uploadDir, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error in uploading document");
                    }
                });
            }
            conn.query(
                `UPDATE teacher SET address = ?, idProof = ?, idProofDocument = ? WHERE id = ?`,
                [address, idProof, idProofDocument, teacherId]
            );
            res.json({
                message: "Success",
                status: 200,
                body: {
                    Data: req.body,
                }
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

}