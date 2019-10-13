import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";

@Entity("spatial_ref_sys", { schema: "public" })
export class spatial_ref_sys {
    @Column("integer", {
        nullable: false,
        primary: true,
        name: "srid"
    })
    srid: number;

    @Column("character varying", {
        nullable: true,
        length: 256,
        name: "auth_name"
    })
    auth_name: string | null;

    @Column("integer", {
        nullable: true,
        name: "auth_srid"
    })
    auth_srid: number | null;

    @Column("character varying", {
        nullable: true,
        length: 2048,
        name: "srtext"
    })
    srtext: string | null;

    @Column("character varying", {
        nullable: true,
        length: 2048,
        name: "proj4text"
    })
    proj4text: string | null;
}
