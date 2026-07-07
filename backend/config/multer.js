import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

const uploadDir=path.join(__dirname,'..','uploads','documents');
// Ensure the upload directory exists
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir,{recursive:true});
}
//configure multer storage
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        console.log("Multer file save karne ki koshish kar raha hai yahan:", uploadDir);
        if (!fs.existsSync(uploadDir)) {
        console.error("FOLDER NAHI MILA! Check path:", uploadDir);
    }
        cb(null,uploadDir);
    },
    filename:(req,file,cb)=>{
        const uniqueSuffix=Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
//Onlye PDF files allowed
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='application/pdf'){
        cb(null,true);
    }else{
        cb(new Error('Only PDF files are allowed'),false);
    }
};
const upload=multer({
    storage,
    fileFilter,
    limits:{
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10*1024*1024 //10MB default
    }
});
export default upload;