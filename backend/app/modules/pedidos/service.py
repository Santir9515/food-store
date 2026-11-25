from datetime import datetime

from app.core.tiempo import ahora
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

# Máquina de estados (RN-02): estado actual -> estados a los que puede pasar
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork | None = None) -> None:
        self.uow = uow or PedidoUnitOfWork()

    # ------------------------------------------------------------------ RN-01
    def crear(self, usuario: UserPublic, datos: PedidoCreate) -> PedidoRead:
        """Crea el pedido, descuenta el stock y copia nombre y precio, todo en una transacción."""
        ids = [item.producto_id for item in datos.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("No puede haber productos repetidos en el pedido")

        with self.uow as uow:
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega.strip(),
                    notas=datos.notas,
                    estado="PENDIENTE",
                    total=0,
                )
            )
            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"El producto {item.producto_id} no existe o está dado de baja")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto «{producto.nombre}» no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de «{producto.nombre}»: hay {producto.stock} y se pidieron {item.cantidad}"
                    )
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.session.add(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = round(total, 2)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # ------------------------------------------------------------- consultas
    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                pedidos, total = uow.pedidos.list_all(estado, skip, limit)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, usuario: UserPublic, pedido_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_dia = datetime.combine(ahora().date(), datetime.min.time())
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_dia),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )

    # ------------------------------------------------- RN-02, RN-03 y RN-04
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Avance o cancelación por el admin, validados contra el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, usuario: UserPublic, pedido_id: int) -> PedidoRead:
        """Cancelación por el dueño: solo en PENDIENTE."""
        with self.uow as uow:
            pedido = self._existente(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._transicionar(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ---------------------------------------------------------------- helpers
    @staticmethod
    def _existente(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")
        if nuevo_estado == "CANCELADO":
            # RN-03: el stock vuelve en la misma transacción que cambia el estado
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
        pedido.estado = nuevo_estado
        pedido.updated_at = ahora()
        uow.pedidos.add(pedido)
