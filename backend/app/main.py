"""Punto de entrada y ensamblaje de la aplicacion FastAPI.

main.py NO debe contener logica de negocio. Su unica responsabilidad es
componer la aplicacion: configurar el ciclo de vida (lifespan) y registrar
los routers de la capa de presentacion.
"""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.firebase import initialize_firebase
from app.presentation.controllers.asignaciones import router as asignaciones_router
from app.presentation.controllers.health import router as health_router
from app.presentation.controllers.pedidos import router as pedidos_router
from app.presentation.controllers.vehiculos import router as vehiculos_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Acciones al iniciar y detener la aplicacion.

    Al arrancar se inicializa Firebase con las credenciales configuradas.
    Si faltan credenciales, la inicializacion lanza un error explicito
    (fail-fast): la aplicacion ISOLO arranca con Firestore funcional.
    """
    initialize_firebase()
    yield


app = FastAPI(
    title="EcoRuta Wanka API",
    description="API REST de EcoRuta Wanka para la gestion logistica de WankaLogistica S.A.C.",
    version="0.4.0",
    lifespan=lifespan,
)

# CORS de desarrollo: permite al frontend (Vite) consumir la API real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["health"])
app.include_router(vehiculos_router)
app.include_router(pedidos_router)
app.include_router(asignaciones_router)