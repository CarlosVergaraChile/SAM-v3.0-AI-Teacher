directory/crud.py#!/usr/bin/env python3
"""
Director CRM - CRUD Operations
Operaciones de lectura/escritura para tabla de directores

Issue: #3 - feat(directory): Integrate CRM Director database with SAM-v3.0
Author: SAM-v3.0 AI Framework
Date: 2025-12-17
"""

import sqlite3
from typing import Optional, List, Dict
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Director:
    """Modelo de director"""
    nombre: str
    apellido_1: str
    apellido_2: Optional[str]
    institucion: str
    especialidad: str
    email: Optional[str]
    telefono: Optional[str]
    linkedin: Optional[str]
    region: str
    confianza: float
    estado: str = "pendiente"
    id: Optional[int] = None

    def to_dict(self) -> Dict:
        return self.__dict__


class DirectorCRUD:
    """Operaciones CRUD para tabla de directores"""

    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._init_schema()

    def _init_schema(self):
        """Inicializa schema desde archivo schema.sql"""
        # En producción, carga schema.sql
        # Por ahora, tabla simplificada
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS directores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(255) NOT NULL,
                apellido_1 VARCHAR(255),
                apellido_2 VARCHAR(255),
                institucion VARCHAR(500) NOT NULL,
                especialidad VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                telefono VARCHAR(20),
                linkedin VARCHAR(500),
                region VARCHAR(100),
                confianza FLOAT DEFAULT 0.0 CHECK (confianza >= 0 AND confianza <= 100),
                estado TEXT DEFAULT 'pendiente',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY (nombre, institucion)
            )
        """)
        self.conn.commit()

    def create(self, director: Director) -> int:
        """Crea nuevo director"""
        self.cursor.execute("""
            INSERT INTO directores 
            (nombre, apellido_1, apellido_2, institucion, especialidad, email, telefono, linkedin, region, confianza, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            director.nombre, director.apellido_1, director.apellido_2,
            director.institucion, director.especialidad, director.email,
            director.telefono, director.linkedin, director.region,
            director.confianza, director.estado
        ))
        self.conn.commit()
        return self.cursor.lastrowid

    def read(self, director_id: int) -> Optional[Director]:
        """Lee director por ID"""
        self.cursor.execute("SELECT * FROM directores WHERE id = ?", (director_id,))
        row = self.cursor.fetchone()
        if row:
            return self._row_to_director(row)
        return None

    def read_by_name(self, nombre: str, institucion: str) -> Optional[Director]:
        """Lee director por nombre + institución"""
        self.cursor.execute(
            "SELECT * FROM directores WHERE nombre = ? AND institucion = ?",
            (nombre, institucion)
        )
        row = self.cursor.fetchone()
        if row:
            return self._row_to_director(row)
        return None

    def list_all(self, limit: int = 100) -> List[Director]:
        """Lista todos los directores"""
        self.cursor.execute("SELECT * FROM directores LIMIT ?", (limit,))
        rows = self.cursor.fetchall()
        return [self._row_to_director(row) for row in rows]

    def update(self, director_id: int, updates: Dict) -> bool:
        """Actualiza director"""
        valid_fields = ['especialidad', 'email', 'estado', 'confianza']
        updates = {k: v for k, v in updates.items() if k in valid_fields}
        
        if not updates:
            return False
        
        fields = ', '.join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [director_id]
        
        self.cursor.execute(f"UPDATE directores SET {fields} WHERE id = ?", values)
        self.conn.commit()
        return self.cursor.rowcount > 0

    def delete(self, director_id: int) -> bool:
        """Elimina director"""
        self.cursor.execute("DELETE FROM directores WHERE id = ?", (director_id,))
        self.conn.commit()
        return self.cursor.rowcount > 0

    def _row_to_director(self, row) -> Director:
        """Convierte fila a objeto Director"""
        return Director(
            id=row[0], nombre=row[1], apellido_1=row[2],
            apellido_2=row[3], institucion=row[4], especialidad=row[5],
            email=row[6], telefono=row[7], linkedin=row[8],
            region=row[9], confianza=row[10], estado=row[11]
        )

    def close(self):
        self.conn.close()


def main():
    """Test CRUD"""
    crud = DirectorCRUD()
    
    # Create
    d1 = Director("Carlos", "Vergara", None, "Instituto TI", "Tech", "carlos@edu.cl", "+56 9", None, "Metropolitan", 95.0)
    d1_id = crud.create(d1)
    print(f"Created: {d1_id}")
    
    # Read
    director = crud.read(d1_id)
    if director:
        print(f"Found: {director.nombre}")
    
    # Update
    crud.update(d1_id, {"estado": "verificado"})
    
    # List
    directors = crud.list_all()
    print(f"Total: {len(directors)}")
    
    crud.close()


if __name__ == "__main__":
    main()
