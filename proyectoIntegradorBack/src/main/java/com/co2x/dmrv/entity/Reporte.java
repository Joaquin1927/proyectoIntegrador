    package com.co2x.dmrv.entity;

    import jakarta.persistence.*;
    import lombok.Data;

    import java.time.LocalDate;
    import java.util.List;

    @Data
    @Entity
    @Table(name = "Reporte")
    public class Reporte {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "Id")
        private Integer id;

        @Column(name = "fechaReporte")
        private LocalDate fechaReporte;

        @Column(name = "toneladasCO2")
        private Double toneladasCO2;

        @Column(name = "ubicacion")
        private String ubicacion;

        @Column(name = "tipoCaptura")
        private String tipoCaptura;

        @Column(name = "metodologia")
        private String metodologia;

        @Column(name = "estado")
        private String estado;

        @Column(name = "observaciones")
        private String observaciones;

        @Column(name = "usuarioResponsable")
        private String usuarioResponsable;

        @ManyToOne
        @JoinColumn(name = "empleado_Id")
        private Usuario empleado;

        @ManyToOne
        @JoinColumn(name = "planta_Id")
        private Planta planta;

        //@OneToMany(mappedBy = "reporte")
        //private List<PaqueteCO2> paquetes;
    }
