package com.co2x.dmrv.entity;

import com.co2x.dmrv.entity.Usuario;
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


    @OneToMany(mappedBy = "empresa")
    private List<Usuario> usuarios;

    @OneToMany(mappedBy = "empresa")
    private List<Planta> plantas;
}