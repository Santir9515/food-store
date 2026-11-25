from datetime import datetime

from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _pagina(
        self, condiciones: list, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        consulta = (
            select(Pedido).where(*condiciones).order_by(Pedido.created_at.desc(), Pedido.id.desc())  # type: ignore[attr-defined]
            .offset(skip).limit(limit)
        )
        return list(self.session.exec(consulta).all()), total

    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        condiciones = [Pedido.usuario_id == usuario_id]
        if estado:
            condiciones.append(Pedido.estado == estado)
        return self._pagina(condiciones, skip, limit)

    def list_all(self, estado: str | None, skip: int, limit: int) -> tuple[list[Pedido], int]:
        condiciones = [Pedido.estado == estado] if estado else []
        return self._pagina(condiciones, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        ).one()
        return float(suma)
