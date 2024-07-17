const express = require('express');
const router = express.Router();
const Datos = require('../models/datosSchema'); // Importa el modelo de datos
const datosController = require('../controllers/datosController');
const upload = require('../upload'); // Middleware de upload (si es necesario)

// Ruta para el registro de nueva auditoria
router.post('/', datosController.nuevoAuditoria);

// Ruta para obtener todos los datos
router.get('/', datosController.obtenerTodosDatos);

// Ruta para carga masiva
router.post('/carga-masiva', async (req, res) => {
    try {
        let jsonData = req.body; // Asegúrate de que los datos estén en el cuerpo de la solicitud
        
        // Validación de que los datos sean un arreglo
        if (!Array.isArray(jsonData)) {
            return res.status(400).json({ error: 'Los datos proporcionados no son válidos. Se esperaba un arreglo de objetos.' });
        }

        // Asegúrate de que 'Programa' sea un array de objetos
        jsonData = jsonData.map(item => {
            if (typeof item.Programa === 'string') {
                item.Programa = JSON.parse(item.Programa);
            }
            return item;
        });

        // Validación de campos requeridos
        const requiredFields = ['TipoAuditoria', 'FechaInicio', 'FechaFin', 'Duracion', 'Departamento', 'AreasAudi', 'Auditados', 'AuditorLider', 'AuditorLiderEmail', 'Observador'];
        const missingFields = jsonData.filter(item => requiredFields.some(field => !item[field]));

        if (missingFields.length > 0) {
            console.error('Faltan campos requeridos:', missingFields);
            return res.status(400).json({ error: 'Por favor completa todos los campos requeridos en los datos del archivo' });
        }

        // Guardar los datos en la base de datos
        const savedData = await Datos.create(jsonData);
        console.log('Datos guardados en la base de datos:', savedData);

        res.status(200).json({ success: true, data: savedData });
    } catch (error) {
        console.error('Error al procesar la carga masiva:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ruta para actualizar datos por ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { programIdx, observaciones, percentage, PorcentajeTotal, Estado } = req.body;
    try {
        const datos = await Datos.findById(id);
        if (!datos) {
            return res.status(404).json({ error: 'Datos no encontrados' });
        }

        if (PorcentajeTotal !== undefined) {
            datos.PorcentajeTotal = PorcentajeTotal;
            datos.Estado = Estado;

            if (PorcentajeTotal === 100) {
                datos.Estatus = 'Bueno';
            } else if (PorcentajeTotal >= 90) {
                datos.Estatus = 'Bueno';
            } else if (PorcentajeTotal >= 80) {
                datos.Estatus = 'Aceptable';
            } else if (PorcentajeTotal >= 60) {
                datos.Estatus = 'No Aceptable';
            } else if (PorcentajeTotal < 60) {
                datos.Estatus = 'Crítico';
            }

            datos.FechaElaboracion = new Date().toISOString();
        } else {
            const programa = datos.Programa[programIdx];
            if (!programa) {
                return res.status(404).json({ error: 'Programa no encontrado' });
            }

            observaciones.forEach((obs) => {
                const descripcion = programa.Descripcion.find((desc) => desc.ID === obs.ID);
                if (descripcion) {
                    descripcion.Criterio = obs.Criterio;
                    descripcion.Observacion = obs.Observacion;
                    descripcion.Hallazgo = obs.Hallazgo;
                }
            });

            programa.Porcentaje = percentage.toFixed(2);

            const totalPorcentaje = datos.Programa.reduce((acc, prog) => acc + parseFloat(prog.Porcentaje), 0);
            datos.PorcentajeTotal = (totalPorcentaje / datos.Programa.length).toFixed(2);
        }

        await datos.save();
        res.status(200).json({ message: 'Datos actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los datos:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Ruta para actualizar estado por ID
router.put('/estado/:id', async (req, res) => {
    const { id } = req.params;
    const { Estado, Comentario, PorcentajeCump } = req.body;
    try {
        const datos = await Datos.findById(id);
        if (!datos) {
            return res.status(404).json({ error: 'Datos no encontrados' });
        }

        datos.Estado = Estado;
        if (Comentario) {
            datos.Comentario = Comentario;
        }
        if (PorcentajeCump) {
            datos.PorcentajeCump = PorcentajeCump;
        }

        await datos.save();
        res.status(200).json({ message: 'Datos guardados correctamente' });
    } catch (error) {
        console.error('Error al guardar los datos:', error);
        res.status(500).json({ message: 'Error al guardar los datos' });
    }
});

module.exports = router;
