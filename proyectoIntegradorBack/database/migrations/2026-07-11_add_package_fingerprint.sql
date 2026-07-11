ALTER TABLE paqueteco2
    ADD COLUMN IF NOT EXISTS data_fingerprint VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS uq_paqueteco2_data_fingerprint
    ON paqueteco2 (data_fingerprint)
    WHERE data_fingerprint IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_paqueteco2_cert_id
    ON paqueteco2 (cert_id)
    WHERE cert_id IS NOT NULL;
