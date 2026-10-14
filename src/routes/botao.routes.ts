import { Router } from "express";
import * as botaoController from "../controllers/botao.controller";
import { requireAuth } from "../middleware/jwtAuth.middleware";

const router = Router();

router.use(requireAuth); 

router.post("/personalizados", botaoController.criarBotaoPersonalizado);
router.get("/categoria/:categoriaId", botaoController.listarPorCategoria);
router.get(
  "/categoria/:categoriaId/padrao",
  botaoController.listarBotoesPadrao,
);
router.get(
  "/categoria/:categoriaId/personalizados",
  botaoController.listarBotoesPersonalizados,
);
router.get("/:id", botaoController.buscarPorId);
router.put("/:id", botaoController.atualizarBotao);
router.post("/:id/restaurar", botaoController.restaurarBotao);
router.delete("/:id", botaoController.deletarBotao);

export default router;