package com.co2x.dmrv.entity;
import jakarta.persistence.*;
import lombok.Data;
import com.co2x.dmrv.entity.Empresa;
import java.util.List;

@Data
@Entity
@Table(name = "Usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "email")
    private String email;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "password")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "Rol")
    private Rol rol;

    @Column(name = "ExternalId")
    private String externalId;   // ← AGREGADO

    @ManyToOne
    @JoinColumn(name = "Empresa")
    private Empresa empresa;

    @OneToMany(mappedBy = "empleado")
    private List<Reporte> reportes;

    @OneToMany(mappedBy = "auditor")
    private List<PaqueteCO2> paquetesVerificados;
}