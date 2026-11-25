from fastapi import HTTPException, status

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestión de usuarios para el rol admin (alta y baja lógica con `disabled`)."""

    def __init__(self, uow: UsuarioUnitOfWork | None = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=False, actor_id=None)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, disabled=True, actor_id=actor_id)

    def _cambiar_estado(self, usuario_id: int, disabled: bool, actor_id: int | None) -> UserPublic:
        with self.uow as uow:
            usuario: Usuario | None = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            if disabled and usuario.id == actor_id:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "No podés desactivar tu propia cuenta")
            usuario.disabled = disabled  # idempotente: 200 aunque el estado no cambie
            uow.session.add(usuario)
            uow.session.flush()
            return UserPublic.model_validate(usuario)
