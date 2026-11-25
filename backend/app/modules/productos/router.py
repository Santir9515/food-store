from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import SoloAdmin
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


ServicioProductos = Annotated[ProductoService, Depends(get_producto_service)]

NO_PRODUCTO = "Producto no encontrado"
NO_CATEGORIA = "La categoría no existe o está dada de baja"


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServicioProductos,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServicioProductos) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_PRODUCTO)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoCreate, _: SoloAdmin, service: ServicioProductos) -> ProductoRead:
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_CATEGORIA)


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int, datos: ProductoUpdate, _: SoloAdmin, service: ServicioProductos
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_PRODUCTO)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_CATEGORIA)


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, datos: ProductoStockUpdate, _: SoloAdmin, service: ServicioProductos
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_PRODUCTO)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, _: SoloAdmin, service: ServicioProductos) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, NO_PRODUCTO)
