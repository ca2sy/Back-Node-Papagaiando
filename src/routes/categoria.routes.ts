import { Router } from "express";
import * as categoriaController from "../controllers/categoria.controller";
import { requireAuth } from "../middleware/jwtAuth.middleware";

const router = Router();

router.use(requireAuth); 

router.post("/", categoriaController.criarCategoria);
router.get("/padrao", categoriaController.listarCategoriasPadrao); // antes de "/:id"
router.get("/perfil/:perfilId", categoriaController.listarCategoriasPerfil);
router.get(
  "/perfil/:perfilId/buscar",
  categoriaController.buscarPorNomePerfil,
);
router.get(
  "/:categoriaId/botoes-padrao",
  categoriaController.getBotoesPadraoDaCategoria,
);
router.get("/:id", categoriaController.buscarPorId);
router.put("/:id", categoriaController.atualizarCategoria);
router.post("/:id/restaurar", categoriaController.restaurarCategoria);
router.delete("/:id", categoriaController.deletarCategoria);

export default router;