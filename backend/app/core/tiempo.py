from datetime import datetime, timezone


def ahora() -> datetime:
    """Fecha y hora actual en UTC, sin zona (como se guarda en la base)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
