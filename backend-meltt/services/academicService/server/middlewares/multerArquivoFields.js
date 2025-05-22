import multer from 'multer';
import path from 'path';

// const storage = multer.diskStorage({
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

const upload = multer({ storage: multer.memoryStorage() });

const uploadFields = upload.fields([
  { name: 'pdf' },
  { name: 'id_turma' },
  { name: 'id_aluno' },
]);

export default uploadFields;
