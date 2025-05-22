import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk'
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

class S3Service {
  constructor() {
    if (!S3Service.instance) {
      this.s3Client = new AWS.S3({
        region: process.env.AWS_S3_REGION,
        accessKeyId: process.env.AWS_ACCESSKEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
        signatureVersion: "v4",
        // credentials: {
        //   accessKeyId: process.env.AWS_ACCESSKEY,
        //   secretAccessKey: process.env.AWS_SECRET_ACCESSKEY,
        // },
      });
      S3Service.instance = this;
    }
    return S3Service.instance;
  }

  async uploadFile(bucketName, filePath, file) {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
      Bucket: bucketName,
      Key: filePath,
      Body: fileStream,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(uploadParams);
    try {
      await this.s3Client.send(command);
      return `https://${bucketName}.s3.amazonaws.com/${filePath}`;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async listFiles(bucketName, bucketRegion, prefix) {
    const listParams = { Bucket: bucketName, Prefix: prefix || "" };
    try {
      const data = await this.s3Client.listObjectsV2(listParams).promise();
      return data.Contents?.map((item) => ({
        Key: item.Key,
        Url: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${item.Key}`,
        Name: item.Key.split("/").pop(),
        LastModified: item.LastModified,
      })) || [];
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

const s3Service = new S3Service();

class s3Controller {

  async getAllContratosTurma(req, res) {
    try {
      const files = await s3Service.listFiles(process.env.AWS_BUCKET_TURMAS, process.env.AWS_S3_REGION, req.params.prefix);
      res.status(200).json({ message: "Lista de contratos recuperados com sucesso", files });
    } catch (error) {
      res.status(500).json({ error: `Erro ao listar arquivos: ${error.message}` });
    }
  }

  async getContratosByTurma(req, res) {
    try {
      const files = await s3Service.listFiles(process.env.AWS_BUCKET_TURMAS, process.env.AWS_S3_REGION, `turmas/${req.query.turma_id}`);
      res.status(200).json({ message: "Lista de Contratos recuperados com sucesso", files });
    } catch (error) {
      res.status(500).json({ error: `Erro ao listar os contratos: ${error.message}` });
    }
  }

  async getUploadTurmaContractUrl(req, res) {
    try {
      const { fileName, fileType, turmaId } = req.query;

      if (!fileName || !fileType || !turmaId) {
        return res.status(400).json({ error: "fileName, fileType e turmaId são obrigatórios" });
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(fileType)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado" });
      }
      const filePath = `turmas/${turmaId}`;

      const signedUrl = await s3Service.s3Client.getSignedUrl("putObject", {
        Bucket: process.env.AWS_BUCKET_TURMAS,
        Key: filePath,
        ContentType: fileType,
        Expires: 3600,
        Metadata: {
          turmaId: turmaId.toString()
        }
      });

      return res.json({ url: signedUrl, path: filePath });
    } catch (error) {
      console.error("Erro ao gerar presigned URL:", error);
      return res.status(500).json({ error: "Erro ao gerar URL de upload" });
    }
  }

  async getUploadMelttContractUrl(req, res) {
    try {
      const { fileName, fileType, turmaId } = req.query;

      if (!fileName || !fileType || !turmaId) {
        return res.status(400).json({ error: "fileName, fileType e turmaId são obrigatórios" });
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(fileType)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado" });
      }
      const filePath = `turmas/contrato-meltt/${turmaId}`;

      const signedUrl = await s3Service.s3Client.getSignedUrl("putObject", {
        Bucket: process.env.AWS_BUCKET_TURMAS,
        Key: filePath,
        ContentType: fileType,
        Expires: 3600,
        Metadata: {
          turmaId: turmaId.toString()
        }
      });

      return res.json({ url: signedUrl, path: filePath });
    } catch (error) {
      console.error("Erro ao gerar presigned URL:", error);
      return res.status(500).json({ error: "Erro ao gerar URL de upload" });
    }
  }

  async getUploadAtaTurma(req, res) {
    try {
      const { fileName, fileType, turmaId } = req.query;

      if (!fileName || !fileType || !turmaId) {
        return res.status(400).json({ error: "fileName, fileType e turmaId são obrigatórios" });
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(fileType)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado" });
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitizedFileName = fileName.replace(/\s+/g, '_');
      const filePath = `turmas/atas/${turmaId}/${uniqueSuffix}_${sanitizedFileName}`;

      const signedUrl = await s3Service.s3Client.getSignedUrl("putObject", {
        Bucket: process.env.AWS_BUCKET_TURMAS,
        Key: filePath,
        ContentType: fileType,
        Expires: 3600,
        Metadata: {
          turmaId: turmaId.toString(),
        }
      });

      return res.json({ url: signedUrl, path: filePath });
    } catch (error) {
      console.error("Erro ao gerar presigned URL:", error);
      return res.status(500).json({ error: "Erro ao gerar URL de upload" });
    }
  }

  async getUploadInformativoTurma(req, res) {
    try {
      const { fileName, fileType, turmaId } = req.query;

      if (!fileName || !fileType || !turmaId) {
        return res.status(400).json({ error: "fileName, fileType e turmaId são obrigatórios" });
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(fileType)) {
        return res.status(400).json({ error: "Tipo de arquivo não suportado" });
      }
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitizedFileName = fileName.replace(/\s+/g, '_');
      const filePath = `turmas/informativos/${turmaId}/${uniqueSuffix}_${sanitizedFileName}`;

      const signedUrl = await s3Service.s3Client.getSignedUrl("putObject", {
        Bucket: process.env.AWS_BUCKET_TURMAS,
        Key: filePath,
        ContentType: fileType,
        Expires: 3600,
        Metadata: {
          turmaId: turmaId.toString()
        }
      });

      return res.json({ url: signedUrl, path: filePath });
    } catch (error) {
      console.error("Erro ao gerar presigned URL:", error);
      return res.status(500).json({ error: "Erro ao gerar URL de upload" });
    }
  }

}

export default new s3Controller();

