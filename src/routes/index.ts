import { Router } from "express";
import authRoutes from "./auth.routes";
import botaoRoutes from "./botao.routes";
import categoriaRoutes from "./categoria.routes";
import perfilRoutes from "./perfil.routes";
import usuarioRoutes from "./usuario.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/perfis", perfilRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/botoes", botaoRoutes);

export default router;