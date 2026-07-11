-- PostgreSQL no actualiza automáticamente un CHECK existente cuando se agrega
-- un valor al enum Java. Ejecutar una vez sobre la base de datos desplegada.
ALTER TABLE record
    ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(66);

ALTER TABLE paqueteco2
    DROP CONSTRAINT IF EXISTS paqueteco2_estado_check;

ALTER TABLE paqueteco2
    ADD CONSTRAINT paqueteco2_estado_check
    CHECK (estado IN (
        'PENDIENTE',
        'EN_REVISION',
        'EN_REVISION_CORREGIDO',
        'APROBADO',
        'RECHAZADO',
        'MINTEADO'
    ));
