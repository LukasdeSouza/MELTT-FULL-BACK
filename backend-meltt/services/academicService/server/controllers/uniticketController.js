import axios from 'axios';

class UniticketController {
  async getBuyers(req, res) {
    try {
      const { access_token } = req.query;
      console.log('access_token', access_token);
      const response = await axios.get(
        `https://public-api.uniticket.com.br/buyers`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json(response.data);
    } catch (error) {
      console.error(
        "Erro ao comunicar com UNITICKET:",
        error.response?.data || error.message
      );
      return res.status(500).json({ error: error.response?.data || error.message });
    }
  }

  async getCheckins(req, res) {
    try {
      const { access_token } = req.query;
      const response = await axios.get(
        `https://public-api.uniticket.com.br/checkins`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json(response.data);
    } catch (error) {
      console.error(
        "Erro ao comunicar com UNITICKET:",
        error.response?.data || error.message
      );
      return res.status(500).json({ error: error.response?.data || error.message });
    }
  }

  async getTickets(req, res) {
    try {
      const { access_token } = req.query;
      const response = await axios.get(
        `https://public-api.uniticket.com.br/tickets`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json(response.data);
    } catch (error) {
      console.error(
        "Erro ao comunicar com UNITICKET:",
        error.response?.data || error.message
      );
      return res.status(500).json({ error: error.response?.data || error.message });
    }
  }

  async getParticipants(req, res) {
    try {
      const { access_token } = req.query;
      const response = await axios.get(
        `https://public-api.uniticket.com.br/participants`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json(response.data);
    } catch (error) {
      console.error(
        "Erro ao comunicar com UNITICKET:",
        error.response?.data || error.message
      );
      return res.status(500).json({ error: error.response?.data || error.message });
    }
  }
}

export default new UniticketController();