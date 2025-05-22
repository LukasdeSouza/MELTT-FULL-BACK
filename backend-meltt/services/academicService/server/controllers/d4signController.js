import axios from 'axios';


class D4SignController {
  async createSignatureList(req, res) {
    const { uuid_document, signers } = req.body;
    console.log('signers', signers)
    if (!uuid_document) {
      res.status(404).json({ error: "BAD REQUEST, é preciso enviar o campo uuid_document no Body" })
    }

    try {
      const response = await axios.post(
        `https://secure.d4sign.com.br/api/v1/documents/${uuid_document}/createlist`,
        {signers},
        {
          params: {
            tokenAPI: process.env.D4SIGN_TOKEN_API,
            cryptKey: process.env.D4SIGN_CRYPTKEY,
          }
        }
      );
      res.json({ uuid: response.data.uuid });

    } catch (error) {
      console.error("Erro no upload:", error.response?.data || error.message);
      res.status(500).json({ error: "Falha ao criar lista de assinatura D4Sign" });
    }
  }

  async sendDocumentToSigner(req, res) {
    const { uuid_document } = req.body;

    try {
      const response = await axios.post(
        `https://secure.d4sign.com.br/api/v1/documents/${uuid_document}/sendtosigner`,
        req.body,
        {
          params: {
            tokenAPI: process.env.D4SIGN_TOKEN_API,
            cryptKey: process.env.D4SIGN_CRYPTKEY,
          }
        }
      );
      res.json({ uuid: response.data.uuid });

    } catch (error) {
      console.error("Erro ao enviar para assinatura:", error.response?.data || error.message);
      res.status(500).json({ error: "Falha ao Enviar documento para Assinante" });
    }
  }

  async documentDownload(req, res) {
    const {uuid_document} = req.body
    try {
      const response = await axios.post(
        `https://secure.d4sign.com.br/api/v1/documents/${uuid_document}/download`,
        {},
        {
          params: {
            tokenAPI: process.env.D4SIGN_TOKEN_API,
            cryptKey: process.env.D4SIGN_CRYPTKEY,
          }
        }
      );
      res.json({ uuid: response.data.uuid });

    } catch (error) {
      console.error("Erro no upload:", error.response?.data || error.message);
      res.status(500).json({ error: "Erro ao baixar domcumento do D4Sign" });
    }
  }


}


export default new D4SignController();
