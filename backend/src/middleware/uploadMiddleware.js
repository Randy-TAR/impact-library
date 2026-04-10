const multer = require('multer');
const path = require('path');

// this is whrere and how the files will be stored
const storage = multer.diskStorage({

    // saving to the uploads folder
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },

    // giving each file a unique name with the format: timestamp-originalfilename.PDF
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);

    }
});

// allowing only PDFs to be uploaded for now 
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'application/pdf'){
        cb(null, true); // acccept the pdf file

    } else {
        cb(new Error('Only PDF files are allowed for now'), false); //rejects none pdf files

    }
};

// limiting the file sizes for each pdf
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50*1024*1024 // 50MB bytes
    }
});

module.exports = upload;