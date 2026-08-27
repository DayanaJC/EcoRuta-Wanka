# Base de datos — Firebase Firestore

## Contexto

EcoRuta Wanka utiliza **Firebase Firestore**, una base de datos NoSQL administrada en la nube. Se eligió por:

- ser un servicio administrado (sin infraestructura que configurar);
- permitir almacenar documentos de forma flexible;
- ser accesible y gratuito para un proyecto académico.

## Modelo de datos

Aunque Firestore es NoSQL, el backend mantiene una estructura organizada y consistente de los documentos.

Colección inicial: **`pedidos`**

Estructura prevista para cada pedido (se implementará en una versión posterior):

```
pedidos/
    {id}
        cliente_id      (string)
        direccion       (string)
        latitud         (float)
        longitud        (float)
        peso            (float)
        volumen         (float)
        hora_inicio     (datetime)
        hora_fin        (datetime)
        prioridad       (string: EXPRESS | ESTANDAR | ECONOMICO)
        tipo_producto   (string: PERECEDERO | NO_PERECEDERO)
        estado          (string: PENDIENTE | ASIGNADO | EN_RUTA | ENTREGADO | CANCELADO)
```

## Seguridad

- Las credenciales de acceso (service account) se manejan mediante variables de entorno.
- No se suben credenciales reales al repositorio (ver `.gitignore`).

## Estado actual

- **`v0.1.0`**: se documenta el modelo de datos. La implementación de la colección y el CRUD de pedidos corresponde a una versión posterior.