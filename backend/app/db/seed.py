"""Carga inicial idempotente: usuario admin, categorías y productos.

Ejecución: python -m app.db.seed
"""

from sqlmodel import func, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = {
    "Hamburguesas": "Hamburguesas de carne con distintos acompañamientos",
    "Pizzas": "Pizzas artesanales a la piedra",
    "Bebidas": "Gaseosas, aguas y cervezas",
    "Postres": "Dulces para cerrar la comida",
}

# Las imágenes son archivos del frontend (frontend/public/productos), referenciados por URL
IMAGENES = {
    "Hamburguesa clásica": "/productos/hamburguesa-clasica.svg",
    "Hamburguesa doble": "/productos/hamburguesa-doble.svg",
    "Hamburguesa vegetal": "/productos/hamburguesa-vegetal.svg",
    "Pizza muzzarella": "/productos/pizza-muzzarella.svg",
    "Pizza napolitana": "/productos/pizza-napolitana.svg",
    "Gaseosa cola 500 ml": "/productos/gaseosa-cola.svg",
    "Agua mineral 500 ml": "/productos/agua-mineral.svg",
    "Flan casero": "/productos/flan-casero.svg",
    "Brownie con helado": "/productos/brownie-helado.svg",
}

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y cheddar", 6500, 25),
    ("Hamburguesas", "Hamburguesa doble", "Doble carne, panceta y salsa especial", 8200, 20),
    ("Hamburguesas", "Hamburguesa vegetal", "Medallón de legumbres y vegetales grillados", 6900, 15),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 7800, 18),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate fresco y ajo", 8500, 12),
    ("Bebidas", "Gaseosa cola 500 ml", "Botella individual bien fría", 1800, 60),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1200, 80),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3200, 14),
    ("Postres", "Brownie con helado", "Brownie tibio con bola de vainilla", 4100, 10),
]


def seed() -> None:
    create_all_tables()
    with session_factory() as session:
        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            print(f"Usuario admin creado: {ADMIN['username']} / {ADMIN['password']}")
        else:
            print("El usuario admin ya existe")

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS.items():
            categoria = session.exec(
                select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
            ).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria

        for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[nombre_categoria].id,  # type: ignore[arg-type]
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        imagen_url=IMAGENES.get(nombre),
                    )
                )
            elif existe.imagen_url is None:
                existe.imagen_url = IMAGENES.get(nombre)  # completa productos cargados antes
                session.add(existe)
        session.commit()
        print(
            "Seed completo:",
            session.exec(select(func.count()).select_from(Categoria)).one(), "categorías,",
            session.exec(select(func.count()).select_from(Producto)).one(), "productos",
        )


if __name__ == "__main__":
    seed()
