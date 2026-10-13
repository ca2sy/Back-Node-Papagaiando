import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import * as usuarioController from "../controllers/usuario.controller";
import { requireAuth } from "../middleware/jwtAuth.middleware";

const router = Router();

router.post("/login", authController.login); 
router.post("/verificar-senha", requireAuth, authController.verificarSenha);

router.post("/esqueci-senha", usuarioController.esqueciSenha); 
router.post("/redefinir-senha", usuarioController.redefinirSenha); 

export default router;