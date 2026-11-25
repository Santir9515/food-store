from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.config import COOKIE_NAME
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(
    access_token: Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None,
) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly. 401 si falta, es inválido o venció."""
    credenciales_invalidas = HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    if not access_token:
        raise credenciales_invalidas
    sub = decode_access_token(access_token)
    if sub is None or not sub.isdigit():
        raise credenciales_invalidas
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(int(sub))
        if usuario is None:
            raise credenciales_invalidas
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    """400 si la cuenta está desactivada."""
    if user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    """Dependencia que exige uno de los roles indicados (403 si no)."""

    def verificar(user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para esta acción")
        return user

    return verificar


UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]
SoloAdmin = Annotated[UserPublic, Depends(require_role(["admin"]))]
