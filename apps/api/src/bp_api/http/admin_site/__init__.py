from fastapi import APIRouter

from .routes import router as context_router
from .derived_routes import router as derived_router

router = APIRouter()
router.include_router(context_router)
router.include_router(derived_router)

__all__ = ["router"]
