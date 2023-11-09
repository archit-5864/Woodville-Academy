let pool = require("../db/conn")
const path = require("path")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailMamanger = require("./helpers/sendMails");
var dotenv = require("dotenv");
dotenv.config();

const SECRET = process.env.SECRET;

module.exports = {

    // -----------------------------------------------Create Teacher Section---------------------------------------

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

            const hashedPassword = await bcrypt.hash(password, 10);

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
                        return res.status(500).send("Error in uploading image");
                    }
                });
            }

            const authToken = jwt.sign({ email }, SECRET, {
                expiresIn: "1h",
            });

            const otpValue = await emailMamanger.sendOTP(
                email,
                "Account verify OTP"
            );

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
                deviceToken || null,
                otpValue,
                authToken || null,
            ];
            pool.execute(
                "INSERT INTO teacher (name, email, phoneNo, password, role, image, isEmailVeryfied, isPhoneVeryfied, accountStatus, deviceType, deviceToken, otp, authToken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                dbData,
                // async (err, result) => {
                // if (err) {
                //     console.error(err);
                //     return res
                //         .status(500)
                //         .send("Error in inserting data into the database");
                // }
                // console.log("Data successfully inserted into the database.");
                res.json({
                    message: "Success",
                    status: 200,
                    body: {
                        name: req.body.name,
                        token: authToken,
                    }
                })
                // }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },

    // -----------------------------------------------Teacher Login Section----------------------------------------

    loginTeacher: async (req, res) => {
        try {
            const { email, password } = req.body
            const [rows] = await pool.execute('SELECT * FROM teacher WHERE email = ?', [email]);
            if (rows.length === 0) {
                return res.status(401).json({ message: 'User not found' });
            }
            const user = rows[0];

            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const authToken = jwt.sign({ email }, SECRET, {
                    expiresIn: '1h',
                });
                await pool.execute('UPDATE teacher SET authToken = ? WHERE email = ?', [authToken, email]);
                res.json({
                    message: 'Login successful',
                    token: authToken,
                });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    },

    // -----------------------------------------------Update Teacher Basic Details---------------------------------

    updateTeacherBasicDetails: async (req, res) => {
        try {
            const {
                gender,
                dateOfBirth,
                about
            } = req.body;
            const teacherId = req.params.id;
            pool.execute(
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

    // -----------------------------------------------Update Teacher Education Details--------------------------------

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
            pool.execute(
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

    // -----------------------------------------------Update Teacher Experience Details-------------------------------

    updateTeacherExperienceDetails: async (req, res) => {
        try {
            const {
                experience,
                description,
                skills
            } = req.body;
            const teacherId = req.params.id;
            pool.execute(
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

    // -----------------------------------------------Update Teacher ID Proof Details----------------------------------

    updateTeacherIdProofDetails: async (req, res) => {
        try {
            const { address, idProof } = req.body;
            const teacherId = req.params.id;

            let idProofDocument = "";
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
            pool.execute(
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

    // -----------------------------------------------Insert Subject------------------------------------------------------

    insertSubject: async (req, res) => {
        try {
            const {
                sbujectName,
            } = req.body;
            if (
                !sbujectName
            ) {
                return res
                    .status(400)
                    .json({ message: "Please fill subject fields" });
            }
            const dbData = [
                sbujectName
            ];
            pool.execute(
                "INSERT INTO subject (sbujectName) VALUES (?)",
                dbData,
                res.json({
                    message: "Success",
                    status: 200,
                    body: {
                        name: req.body
                    }
                })
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },

    // -----------------------------------------------Insert Categories------------------------------------------------------

    insertCategories: async (req, res) => {
        try {
            const {
                categoryName,
            } = req.body;
            if (
                !categoryName
            ) {
                return res
                    .status(400)
                    .json({ message: "Please fill category fields" });
            }
            const dbData = [
                categoryName
            ];
            pool.execute(
                "INSERT INTO categories (categoryName) VALUES (?)",
                dbData,
                res.json({
                    message: "Success",
                    status: 200,
                    body: {
                        name: req.body
                    }
                })
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },

    // -----------------------------------------------Insert Sub Categories------------------------------------------------------

    insertSubCategories: async (req, res) => {
        try {
            const {
                categoryId,
                subCategoryName,
            } = req.body;
            console.log(req.body, "cnadbcheqbchqbc")
            if (
                !categoryId,
                !subCategoryName
            ) {
                return res
                    .status(400)
                    .json({ message: "Please fill sub category fields" });
            }
            const dbData = [
                categoryId,
                subCategoryName,
            ];
            pool.execute(
                "INSERT INTO subCategories (categoryId, subCategoryName) VALUES (?, ?)",
                dbData,
                res.json({
                    message: "Success",
                    status: 200,
                    body: {
                        name: req.body
                    }
                })
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    },

    // -----------------------------------------------Insert Sub Categories------------------------------------------------------

    addContent: async (req, res) => {
        try {
            const {
                contentType,
                subjectId,
                categoryId,
                subCategoryId,
                title,
                description,
            } = req.body;
    
            if (
                !contentType ||
                !subjectId ||
                !categoryId ||
                !subCategoryId ||
                !title ||
                !description
            ) {
                return res
                    .status(400)
                    .json({ message: "Please fill all required fields" });
            }
    
            let contentFile = "";

            const audioFile = req.files.file;
            const mime = audioFile.mimetype.split("/")[0]
            
            if (contentType === "audio" && mime=="audio") {
                const audioFile = req.files.file;
                contentFile = audioFile.name;
                const uploadDir = path.join(
                    __dirname,
                    "../public/content/audio",
                    contentFile
                );
                audioFile.mv(uploadDir, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error in uploading audio file");
                    }
                });
            } else if (contentType === "video" && mime=="video") {
                const videoFile = req.files.file;
                contentFile = videoFile.name;
                const uploadDir = path.join(
                    __dirname,
                    "../public/content/video",
                    contentFile
                );
                videoFile.mv(uploadDir, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error in uploading video file");
                    }
                });
            } else if (contentType === "document" && mime=="application") {
                const documentFile = req.files.file;
                contentFile = documentFile.name;
                const uploadDir = path.join(
                    __dirname,
                    "../public/content/documents",
                    contentFile
                );
                documentFile.mv(uploadDir, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send("Error in uploading document file");
                    }
                });
            } else {
                return res.status(400).json({ message: "Invalid content type or missing file." });
            }
    
            const dbData = [
                contentType,
                subjectId,
                categoryId,
                subCategoryId,
                title,
                description,
                contentFile,
            ];
    
            pool.execute(
                "INSERT INTO content (contentType, subjectId, categoryId, subCategoryId, title, description, contentFile) VALUES (?, ?, ?, ?, ?, ?, ?)",
                dbData,
                // (err, result) => {
                //     if (err) {
                //         console.error(err);
                //         return res.status(500).send("Error in inserting data into the database");
                //     }
                //     console.log("Data successfully inserted into the database.");
                    res.json({
                        message: "Success",
                        status: 200,
                        body: {
                            Data: req.body,
                            file: contentFile,
                        },
                    })
                // }
            );
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    }
    

}