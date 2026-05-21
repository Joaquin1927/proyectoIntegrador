package com.co2x.dmrv.model;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "\"Usuario\"")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"Email\"")
    private String email;

    @Column(name = "\"Nombre\"")
    private String nombre;

    @Column(name = "\"Password\"")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "\"Rol\"")
    private Rol rol;


    @ManyToOne
    @JoinColumn(name = "\"Empresa\"")
    private Empresa empresa;

    @OneToMany(mappedBy = "empleado")
    private List<Reporte> reportes;

    @OneToMany(mappedBy = "auditor")
    private List<PaqueteCO2> paquetesVerificados;
}