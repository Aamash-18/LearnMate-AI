import fs from "fs/promises";
import {PDFParse} from 'pdf-parse';

/**
 * Extracts text from a PDF file
 * @param {string} filePath - path to pdf file
 * @return {Promise<string>} extracted text from pdf
 */

export const extractTextFromPDF=async(filePath)=>{
    try {
        const dataBuffer=await fs.readFile(filePath);
        //pdf-parse expects a Uint8Array, so we convert the Buffer to Uint8Array
        const parser= new PDFParse(new Uint8Array(dataBuffer));
        const data=await parser.getText();
        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    }catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};
