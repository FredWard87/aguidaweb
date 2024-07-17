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
      const requiredFields = ['TipoAuditoria', 'FechaInicio', 'FechaFin', 'Duracion', 'Departamento', 'AreasAudi', 'Auditados', 'AuditorLider', 'AuditorLiderEmail', 'Observador'];
      const missingFields = jsonData.filter(item => 
        item.TipoAuditoria && requiredFields.some(field => !item[field])
      );

      if (missingFields.length > 0) {
        console.error('Faltan campos requeridos:', missingFields);
        alert('Por favor completa todos los campos requeridos en los datos del archivo');
        return;
      }

      // Transformar datos del programa
      let currentAudit = {
        TipoAuditoria: jsonData[0].TipoAuditoria,
        FechaInicio: jsonData[0].FechaInicio,
        FechaFin: jsonData[0].FechaFin,
        Duracion: jsonData[0].Duracion,
        Departamento: jsonData[0].Departamento,
        AreasAudi: jsonData[0].AreasAudi,
        Auditados: jsonData[0].Auditados,
        AuditorLider: jsonData[0].AuditorLider,
        AuditorLiderEmail: jsonData[0].AuditorLiderEmail,
        Observador: jsonData[0].Observador,
        NombresObservadores: jsonData[0].NombresObservadores,
        Estado: jsonData[0].Estado,
        PorcentajeTotal: jsonData[0].PorcentajeTotal,
        FechaElaboracion: jsonData[0].FechaElaboracion,
        Comentario: jsonData[0].Comentario,
        Estatus: jsonData[0].Estatus,
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
