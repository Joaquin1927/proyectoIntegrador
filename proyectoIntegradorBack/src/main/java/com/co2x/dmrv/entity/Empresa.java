package com.co2x.dmrv.entity;

import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.entity.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "Empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Integer id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "numero_corporacion", nullable = false)
    private String numeroCorporacion;

    @Column(name = "numero_empresa", nullable = false)
    private String numeroEmpresa;

    @Column(name = "direccion", nullable = false)
    private String direccion;

    @Column(name = "directores", nullable = false)
    private String directores; // CSV o texto libre

    @Column(name = "contacto", nullable = false)
    private String contacto;

    @OneToMany(mappedBy = "empresa")
    private List<Usuario> empleados;

    @OneToMany(mappedBy = "empresa")
    @JsonIgnore
    private List<Planta> plantas;
}
