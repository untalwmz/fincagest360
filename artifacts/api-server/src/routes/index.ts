import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import fincasRouter from "./fincas";
import lotesRouter from "./lotes";
import empleadosRouter from "./empleados";
import produccionRouter from "./produccion";
import finanzasRouter from "./finanzas";
import nominaRouter from "./nomina";
import insumosRouter from "./insumos";
import jornadasRouter from "./jornadas";
import cosechaRouter from "./cosecha";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(fincasRouter);
router.use(lotesRouter);
router.use(empleadosRouter);
router.use(produccionRouter);
router.use(finanzasRouter);
router.use(nominaRouter);
router.use(insumosRouter);
router.use(jornadasRouter);
router.use(cosechaRouter);

export default router;
