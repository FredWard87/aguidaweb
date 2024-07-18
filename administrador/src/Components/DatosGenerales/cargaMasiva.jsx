import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const CargaMasiva = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      console.error('No file selected');
      alert('Por favor selecciona un archivo');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Datos extraídos del archivo Excel:', jsonData);

      // Validación de campos requeridos
      const requiredFields = [
        'TipoAuditoria', 'FechaInicio', 'FechaFin', 'Duracion', 'Departamento',
        'AreasAudi', 'Auditados', 'AuditorLider', 'AuditorLiderEmail', 'EquipoAuditor_Nombre', 'EquipoAuditor_Correo', 'Observador'
      ];

      const mainData = jsonData[0];
      const missingFields = requiredFields.filter(field => !mainData[field]);

      if (missingFields.length > 0) {
        console.error('Faltan campos requeridos:', missingFields);
        alert('Por favor completa todos los campos requeridos en los datos del archivo');
        return;
      }

      // Transformar datos del programa
      let currentAudit = {
        TipoAuditoria: mainData.TipoAuditoria,
        FechaInicio: mainData.FechaInicio,
        FechaFin: mainData.FechaFin,
        Duracion: mainData.Duracion,
        Departamento: mainData.Departamento,
        AreasAudi: mainData.AreasAudi,
        Auditados: mainData.Auditados,
        AuditorLider: mainData.AuditorLider,
        AuditorLiderEmail: mainData.AuditorLiderEmail,
        EquipoAuditor: [],
        Observador: mainData.Observador,
        NombresObservadores: mainData.NombresObservadores,
        Estado: mainData.Estado,
        PorcentajeTotal: mainData.PorcentajeTotal,
        FechaElaboracion: mainData.FechaElaboracion,
        Comentario: mainData.Comentario,
        Estatus: mainData.Estatus,
        Programa: []
      };

      let programa = {
        Nombre: "",
        Porcentaje: 0,
        Descripcion: []
      };

      jsonData.forEach(row => {
        if (row.Programa_Nombre) {
          // Añadir el programa anterior si existe
          if (programa.Nombre) {
            currentAudit.Programa.push(programa);
          }
          // Crear un nuevo programa
          programa = {
            Nombre: row.Programa_Nombre,
            Porcentaje: row.Programa_Porcentaje || 0,
            Descripcion: []
          };
        }

        // Añadir descripción al programa actual
        programa.Descripcion.push({
          ID: row.Programa_ID,
          Criterio: row.Programa_Criterio,
          Requisito: row.Programa_Descripcion_Requisito,
          Observacion: row.Programa_Observacion || '', // Valor por defecto
          Hallazgo: row.Programa_Hallazgo || '', // Valor por defecto
        });

        // Procesar EquipoAuditor si está presente
        if (row.EquipoAuditor_Nombre && row.EquipoAuditor_Correo) {
          currentAudit.EquipoAuditor.push({
            Nombre: row.EquipoAuditor_Nombre,
            Correo: row.EquipoAuditor_Correo
          });
        }
      });

      // Añadir el último programa
      if (programa.Nombre) {
        currentAudit.Programa.push(programa);
      }

      const transformedData = [currentAudit];

      console.log('Datos transformados:', transformedData);

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/datos/carga-masiva`, transformedData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Response:', response.data);
        alert('Datos cargados exitosamente');
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2>Carga Masiva de Datos desde Excel</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Cargar Datos</button>
      </form>
    </div>
  );
};

export default CargaMasiva;
