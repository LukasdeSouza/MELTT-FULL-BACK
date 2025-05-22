import pool from "../db.js";

class NotificacoesController {
  async getAllNotificacoes(req, res) {
    const { id } = req.query;
    const query =
      "SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY criada_em DESC";
    try {
      const [result] = await pool.query(query, [id]);
      console.log(result);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateNotificacao(req, res) {
    const { id } = req.query;
    const query = "UPDATE notificacoes SET lida = TRUE WHERE id = ?";
    try {
      await pool.query(query, [id]);
      res.status(200).json({ message: "Notificação marcada como lida" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new NotificacoesController();