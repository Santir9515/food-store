from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando la fila hasta el fin de la transacción (evita vender el mismo stock dos veces)."""
        return self.session.exec(
            select(Producto).where(Producto.id == producto_id).with_for_update()
        ).first()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados; devuelve la página y el total sin paginar."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if nombre:
            condiciones.append(func.lower(Producto.nombre).contains(nombre.strip().lower()))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        consulta = (
            select(Producto).where(*condiciones).order_by(Producto.nombre, Producto.id).offset(skip).limit(limit)
        )
        return list(self.session.exec(consulta).all()), total
