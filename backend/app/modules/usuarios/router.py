from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import SoloAdmin
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


ServicioUsuarios = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: SoloAdmin, service: ServicioUsuarios) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _: SoloAdmin, service: ServicioUsuarios) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: SoloAdmin, service: ServicioUsuarios) -> UserPublic:
    return service.desactivar(usuario_id, actor_id=admin.id)
