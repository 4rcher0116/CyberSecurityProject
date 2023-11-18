
//Required Dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); //import SQLite3 Module

//Dependencies for File upload
const multer = require('multer');
const fs = require('fs');
const fileInfo = require('./controllers/fileInfo');
const allowedExt = require('./controllers/checkAllowedExts');

//Configure Server
const app = express();
const PORT = process.env.PORT || 3000;

//Establish Connection to SQLite Database
const db = new sqlite3.Database('../filemanage.db');

//Multer configuration to handle file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	//Create directory for user if it does not exist
		const userId = req.params.userId;
		const userDirectory = `../userfiles/${userId}`;
		if(!fs.existsSync(userDirectory)) {
			fs.mkdirSync(userDirectory, { recursive: true });
		}
		cb(null, userDirectory);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	}

});

const upload = multer({ storage: storage });

//Route for handling file upload
// app.post('/upload/:userId', upload.single('file'), (req, res) => {
// 	const userId = req.params.userId;
// 	const filePath = req.file.path;

// 	//Insert file path inot the database
// 	db.run('INSERT INTO files (user_id, filename, file_path) VALUES (?, ?, ?)', [userId, req.file.originalname, filePath], (err) => {
// 		if (err){
// 			res.status(500).json({ error: err.message });
// 			return;
// 		}
// 		res.status(200).send('File uploaded and path was stored in Database');
// 	});
// });

//Route for retreiving files list of user
app.get('../userfiles/:userId', (req, res) => {
	const userId = req.params.userId;

	//query files associated with user from database
	db.all('SELECT * FROM files WHERE user_id = ?', [userId], (err, rows) => {
		if(err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json(rows)
	});

});


//Post request for uploading files to server
app.post('/upload/:userId', 
    fileUpload({ createParentPath: true }),
    fileInfo,
    allowedExt(['.png', '.jpg', '.jpeg', '.txt', '.pdf', '.docx', '.mp3', '.mp4']),
    (req,res) => {
		const userId = req.params.userId;
		// const filePath = req.file.path;	
        const files = req.files
        console.log(files);
        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, 'files', files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: "error", message: err})
            })
			db.run('INSERT INTO files (user_id, filename, file_path) VALUES (?, ?, ?)', [userId, files[key].name, filepath], (err) => {
				if (err){
					res.status(500).json({ error: err.message });
					return;
				}
				res.status(200).send('File uploaded and path was stored in Database');
			});
        })
        return res.json({ status: 'success', message: Object.keys(files).toString()})
    }
);

//Route for deleting a file 






//Start up the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
