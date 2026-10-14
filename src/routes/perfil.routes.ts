import { Router } from "express";
import * as perfilController from "../controllers/perfil.controller";
import { requireAuth } from "../middleware/jwtAuth.middleware";

const router = Router();

router.use(requireAuth); 

router.post("/", perfilController.criarPerfil);
router.get("/me", perfilController.listarMeusPerfis); 
router.get("/:id", perfilController.buscarPorId);
router.put("/:id", perfilController.atualizarPerfil);
router.delete("/:id", perfilController.deletarPerfil);

export default router;