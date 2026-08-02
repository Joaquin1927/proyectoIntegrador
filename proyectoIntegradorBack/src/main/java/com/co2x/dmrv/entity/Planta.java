package com.co2x.dmrv.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@Entity
@Table(name = "planta")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String managerEmail;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private String metadata;

    @OneToMany(
            mappedBy = "planta",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Pozo> pozos;

    @Column(name = "pdf_tecnico")
    private String pdfTecnico;
}
