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
import { prefcturepgnImp } from "../place";

@Entity("prefecturepgn", { schema: "public" })
export class prefecturepgn extends prefcturepgnImp {
    @PrimaryGeneratedColumn({
        type: "integer",
        name: "gid"
    })
    gid: number;

    @Column("character varying", {
        nullable: true,
        length: 254,
        name: "name_py"
    })
    name_py: string | null;

    @Column("character varying", {
        nullable: true,
        length: 30,
        name: "name_ch"
    })
    name_ch: string | null;

    @Column("character varying", {
        nullable: true,
        length: 30,
        name: "name_ft"
    })
    name_ft: string | null;

    @Column("double precision", {
        nullable: true,
        precision: 53,
        name: "x_coor"
    })
    x_coor: number | null;

    @Column("double precision", {
        nullable: true,
        precision: 53,
        name: "y_coor"
    })
    y_coor: number | null;

    @Column("character varying", {
        nullable: true,
        length: 40,
        name: "pers_loc"
    })
    pers_loc: string | null;

    @Column("character varying", {
        nullable: true,
        length: 15,
        name: "type_py"
    })
    type_py: string | null;

    @Column("character varying", {
        nullable: true,
        length: 15,
        name: "type_ch"
    })
    type_ch: string | null;

    @Column("character varying", {
        nullable: true,
        length: 1,
        name: "lev_rank"
    })
    lev_rank: string | null;

    @Column("bigint", {
        nullable: true,
        name: "beg_yr"
    })
    beg_yr: number | null;

    @Column("character varying", {
        nullable: true,
        length: 1,
        name: "beg_rule"
    })
    beg_rule: string | null;

    @Column("bigint", {
        nullable: true,
        name: "end_yr"
    })
    end_yr: number | null;

    @Column("character varying", {
        nullable: true,
        length: 1,
        name: "end_rule"
    })
    end_rule: string | null;

    @Column("bigint", {
        nullable: true,
        name: "note_id"
    })
    note_id: string | null;

    @Column("character varying", {
        nullable: true,
        length: 7,
        name: "obj_type"
    })
    obj_type: string | null;

    @Column("bigint", {
        nullable: true,
        name: "sys_id"
    })
    sys_id: string | null;

    @Column("character varying", {
        nullable: true,
        length: 10,
        name: "geo_src"
    })
    geo_src: string | null;

    @Column("character varying", {
        nullable: true,
        length: 15,
        name: "compiler"
    })
    compiler: string | null;

    @Column("character varying", {
        nullable: true,
        length: 15,
        name: "gecomplr"
    })
    gecomplr: string | null;

    @Column("character varying", {
        nullable: true,
        length: 10,
        name: "checker"
    })
    checker: string | null;

    @Column("character varying", {
        nullable: true,
        length: 10,
        name: "ent_date"
    })
    ent_date: string | null;

    @Column("character varying", {
        nullable: true,
        length: 27,
        name: "beg_chg_ty"
    })
    beg_chg_ty: string | null;

    @Column("character varying", {
        nullable: true,
        length: 27,
        name: "end_chg_ty"
    })
    end_chg_ty: string | null;

    @Column("geometry", {
        nullable: true,
        name: "geom"
    })
    geom: string | null;
}
