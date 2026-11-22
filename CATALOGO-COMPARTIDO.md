# Catálogo compartido entre 956PRINT y Matamoros Imprime

## Qué se coordina

- `catalogo/compartido.json` define los identificadores de producto, las columnas de los submenús y el orden de sus entradas. Es el primer contrato compartido. Los submenús iniciales son Gran formato, Ropa, Para negocios y Para eventos.
- La referencia se mantiene en **956print-web** y se replica en **matamorosimprime**. Ambos archivos deben tener el mismo contenido. Cuando cambie la estructura compartida, prepara los dos cambios con el mismo contrato y enlaza sus PR.
- Reutiliza fichas, estructura visual y fotos autorizadas cuando sirvan en ambas tiendas. Los textos finales, los nombres de menú, las rutas, la marca y las opciones adicionales pueden adaptarse localmente mediante `catalogo/local.json` y los componentes de cada sitio. Mantén estables los identificadores compartidos aunque cambie un título o una URL.
- Los grupos o productos exclusivos de una tienda pueden mantenerse en su propio catálogo. Un nuevo identificador compartido requiere revisar su destino en ambas tiendas. Si una tienda todavía no ofrece ese producto, su adaptación puede llevar a una consulta o quedar fuera del menú público mediante una decisión documentada en el PR y una actualización coordinada del verificador.

## Qué decide cada tienda

- Los precios, moneda, impuestos, promociones, disponibilidad, inventario, plazos y datos de contacto quedan en cada tienda. No los pongas en el archivo compartido ni los traslades de una tienda a la otra.
- En **956PRINT**, las condiciones por producto siguen en sus datos y servicios locales. En **Matamoros Imprime**, las fichas generan una solicitud para confirmar disponibilidad y precio. Antes de incorporar inventario o precios en Matamoros, guárdalos en configuración propia y valida su publicación con la tienda correspondiente.
- Las fichas conservan la identidad y el dominio de su tienda. Enlaces a productos y cotización se resuelven dentro del sitio correspondiente.

## Flujo de cambios

1. Indica en el PR si el cambio es compartido o exclusivo de una tienda. Para un cambio compartido, actualiza primero el contrato de 956PRINT y replica ese archivo en Matamoros. Adapta los destinos y los menús existentes en ambos.
2. Ejecuta `node scripts/verificar-catalogo.mjs` en cada repositorio. Con ambos checkouts disponibles, ejecuta también `node scripts/verificar-catalogo.mjs --par "<ruta-del-otro-repo>"` para comprobar que los contratos coincidan. Los verificadores comparan el catálogo y los submenús reales con el contrato y las equivalencias locales.
3. Prueba las rutas modificadas desde el menú hasta la ficha y desde la ficha hasta el flujo de cotización de cada tienda. Si el cambio solo afecta a una tienda, deja constancia de esa decisión y verifica el contrato local.
4. Vincula los PR de ambos repositorios y respeta sus reglas de integración y publicación. Verifica los dos despliegues después de publicar.
