from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Una transacción por bloque `with`: commit al salir bien, rollback si hubo excepción."""

    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        self._open_repositories()
        return self

    def _open_repositories(self) -> None:
        """Las subclases crean aquí sus repositorios sobre la misma sesión."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
