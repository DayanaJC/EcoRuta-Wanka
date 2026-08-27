"""Punto de entrada y ensamblaje de la aplicacion FastAPI.

main.py NO debe contener logica de negocio. Su unica responsabilidad es
componer la aplicacion: configurar el ciclo de vida (lifespan) y registrar
los routers de la capa de presentacion.
"""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from app.config.firebase import initialize_firebase
from app.presentation.controllers.health import router as health_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Acciones al iniciar y detener la aplicacion.

    Al arrancar se intenta inicializar Firebase. La inicializacion es
    tolerante: si no hay credenciales, la aplicacion arranca igualmente
    y el endpoint /health lo reporta.
    """
    initialize_firebase()
    yield


app = FastAPI(
    title="EcoRuta Wanka API",
    description="API REST de EcoRuta Wanka para la gestion logistica de WankaLogistica S.A.C.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(health_router, tags=["health"])