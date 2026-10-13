import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { requireAuth } from "../middleware/jwtAuth.middleware";

const router = Router();

router.post("/", usuarioController.criarUsuario); 
router.post("/esqueci-senha", usuarioController.esqueciSenha); 
router.post("/redefinir-senha", usuarioController.redefinirSenha); 

router.get("/me", requireAuth, usuarioController.buscarMeuPerfil);
router.put("/me", requireAuth, usuarioController.atualizarMeuPerfil);
router.delete("/me", requireAuth, usuarioController.deletarMinhaConta);

export default router;