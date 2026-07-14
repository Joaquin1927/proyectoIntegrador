package com.co2x.dmrv.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "planta")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String empresa;

    @Column(nullable = false)
    private String direccion;

    private Double latitud;
    private Double longitud;

    @Column(nullable = false)
    private String managerEmail;

    // ✔ Atributos flexibles en JSON
    @Column(columnDefinition = "json")
    private String metadata;

    // ✔ Relación con pozos
    @OneToMany(mappedBy = "planta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pozo> pozos;

    @Column(name = "pdf_tecnico")
    private String pdfTecnico; // ruta del archivo

}
