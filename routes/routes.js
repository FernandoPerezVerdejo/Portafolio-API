import { Router } from "express";
import pool from "../server.js";
const router = Router();
let objusuario = "";


router.get('/api/v1/listarpacientes', async (req, res) => {//listar pacientes mediante un SELECT
	let result = await pool.query('SELECT rut_pacientes,nombre,apellido,fechanac,direccion,telefono1,telefono2,email FROM pacientes ORDER BY pacientes_id ASC');
	res.json(result.rows)
});



router.get('/api/v1/listarusuarios', async (req, res) => {//listar usuarios mediante un SELECT
	let result = await pool.query('SELECT users_id,rut_users,username,password,creado,rol FROM users ORDER BY users_id ASC');
	res.json(result.rows)
});



router.get('/api/v1/login/:username&:password', async (req, res) => { // GET enfocado para iniciar sesión
	let user = req.params.username;
	let pass = req.params.password;
	objusuario = await pool.query(`select * from users where $1=username and $2=password`, [`${user}`, `${pass}`]);
	res.json(objusuario)
});



router.get('/api/v1/buscar/:username', async (req, res) => { //buscar usuario para registro
	try {
		let user = req.params.username;
		objusuario = await pool.query(`select * from users where $1=username`, [`${user}`]);
		res.json(objusuario.rows)
	} catch (error) {
		res.json({ mensaje: "error API" });
	}
});



router.get('/api/v1/buscarRUT/:rut', async (req, res) => { //buscar usuario por rut
	let rut = req.params.rut;
	try {
		objusuario = await pool.query(`SELECT * FROM pacientes WHERE $1=rut_pacientes`, [`${rut}`]);
		//console.log(objusuario);
		res.json(objusuario.rows)
	} catch (error) {
		res.json({ mensaje: "error API" });
	}
});



router.get('/api/v1/buscarRecetaRUT/:rut', async (req, res) => { //buscar receta por rut
	try {
		let rut = req.params.rut;
		let resultadoreceta = await pool.query(`
			SELECT 
			* 
			FROM recetas a 
				INNER JOIN receta_detalle b ON a.recetas_id = b.recetas_id_detalle 
				INNER JOIN lista_medicamento c ON c.id_medicamento = b.id_medicamento_detalle
			WHERE a.rut_paciente_recetas=$1 ORDER BY fechaemision ASC`, [rut]);
		res.json(resultadoreceta)
	} catch (error) {
		res.json({ mensaje: "error API" });
	}
});



router.post('/api/v1/anadirmedicamento', async (req, res) => { //post para añadir medicamentos
	let nombre = req.body.nombre;
	let contenido = req.body.contenido;
	let result = await pool.query('INSERT INTO lista_medicamento (id_nombre_medicamento,id_contenido) VALUES ($1,$2)', [nombre, contenido])
	res.json({});
});



router.post('/api/v1/register?', async (req, res) => { // post para registrar personas o pacientes
	let rut = req.body.rut;
	let nombre = req.body.nombre;
	let apellido = req.body.apellido;
	let fechanac = req.body.fechanac;
	let direccion = req.body.direccion;
	let telefono1 = req.body.telefono1;
	let telefono2 = req.body.telefono2;
	let username = req.body.username;
	let password = req.body.password;
	let email = req.body.email;

	await pool.query(`INSERT INTO pacientes 
		(rut_pacientes,nombre,apellido,fechanac,direccion,telefono1,telefono2,email) 
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		[`${rut}`, `${nombre}`, `${apellido}`, `${fechanac}`, `${direccion}`, `${telefono1}`, `${telefono2}`, `${email}`]);
	await pool.query(`INSERT INTO users (rut_users,username,password,creado,rol) 
			VALUES ($1,$2,$3,$4,$5)`,
		[`${rut}`, `${username}`, `${password}`, `now`, `0`]);
	res.json({});
});



router.post('/api/v1/registromedico', async (req, res) => { //post para registrar médicos
	let rut = req.body.rut;
	let nombre = req.body.nombre;
	let apellido = req.body.apellido;
	let fechanac = req.body.fechanac;
	let direccion = req.body.direccion;
	let telefono1 = req.body.telefono1;
	let telefono2 = req.body.telefono2;
	let username = req.body.username;
	let password = req.body.password;
	let email = req.body.email;

	await pool.query(`INSERT INTO pacientes 
		(rut_pacientes,nombre,apellido,fechanac,direccion,telefono1,telefono2,email) 
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		[`${rut}`, `${nombre}`, `${apellido}`, `${fechanac}`, `${direccion}`, `${telefono1}`, `${telefono2}`, `${email}`]);
	await pool.query(`INSERT INTO users (rut_users,username,password,creado,rol) 
			VALUES ($1,$2,$3,$4,$5)`,
		[`${rut}`, `${username}`, `${password}`, `now`, `1`]);
	res.json();
});



router.get('/api/v1/buscarpaciente', async (req, res) => { //GET de paciente
	let buscarmedicamentos = await pool.query('SELECT id_nombre_medicamento,id_contenido FROM lista_medicamento');
	let medicamentos = buscarmedicamentos.rows;
	res.json(medicamentos);
});



router.get('/api/v1/listarmedicamentos', async (req, res) => { // GET para obtener la lista de medicamentos
	let medicinas0 = await pool.query('SELECT * FROM lista_medicamento');
	let medicinas = medicinas0.rows;
	res.json(medicinas);
});



router.post('/api/v1/insertReceta', async (req, res) => { //post de insertar receta
	let rutpaciente = req.body.rutpaciente;
	let rutmedico = req.body.rutmedico;
	let nommedico = req.body.nommedico;
	let especialidad = req.body.especialidad;

	let result = await pool.query(`INSERT INTO recetas (rut_paciente_recetas,rut_medico,nombre_medico,especialidad_medico,fechaemision,vigente) VALUES ($1,$2,$3,$4,$5,$6) RETURNING recetas_id`, [rutpaciente, rutmedico, nommedico, especialidad, 'now', 'true']);
	res.json(result);
});



router.get('/api/v1/buscarmedicamento/:nombremedicamento', async (req, res) => { //GET de buscar medicamento por nombre y obtener su id
	let medicamento0 = req.params.nombremedicamento;
	//console.log(medicamento0);
	let medicamento = await pool.query(`SELECT id_medicamento FROM lista_medicamento where id_nombre_medicamento=$1`, [medicamento0]);
	//console.log(medicamento);
	res.json(medicamento);
});



router.post('/api/v1/anadirReceta/', async (req, res) => { //post de añadir receta_detalle
	let id_receta = req.body.id_receta;
	let medicamento0 = req.body.medicamento0;
	let id_medicamento = req.body.id_medicamento;
	let prescripcion = req.body.prescripcion
	let result2 = await pool.query('INSERT INTO receta_detalle (recetas_id_detalle,medicamento,id_medicamento_detalle,prescripcion) VALUES ($1,$2,$3,$4)', [id_receta, medicamento0, id_medicamento, prescripcion]);
	res.json();
});



router.put('/api/v1/modificar/', async (req, res) => { //modificar receta_detalle
	let id = req.body.id;
	let prescripcion = req.body.prescripcion;
	let medicamento = req.body.medicamento;
	let id_medicamento = req.body.id_medicamento;
	let result = await pool.query(`UPDATE receta_detalle SET medicamento='${medicamento}',id_medicamento_detalle=$1,prescripcion='${prescripcion}' WHERE recetas_id_detalle=$2`, [id_medicamento, id]);
	res.json(result);
});



router.delete('/api/v1/eliminarRecetaDetalle/:id', async (req, res) => { //eliminar receta_detalle
	let id = req.params.id; //id de receta
	//console.log(id);
	// eliminar receta_detalle
	let result = await pool.query('DELETE FROM receta_detalle WHERE recetas_id_detalle=$1', [id]);
	res.json({});
});



router.delete('/api/v1/eliminarReceta/:id', async (req, res) => { //eliminar receta por id
	let id = req.params.id; //id de receta
	//console.log(id);
	// eliminar recetas
	let result1 = await pool.query('DELETE FROM recetas WHERE recetas_id=$1', [id]);
	res.json({});
});



// router.put('api/v1/modificarusuario', async (req, res) => { no funciona en esta version
// 	let id = req.body.id;
// 	let rutusuario = req.body.rutusuario;
// 	let username = req.body.username;
// 	let password = req.body.password;

// 	let result = await pool.query('UPDATE pacientes SET rut_pacientes = $1 WHERE rut_pacientes = (SELECT rut_users FROM users WHERE users_id = $2)', [rutusuario, id]);
// 	res.json(result);
// });



// router.delete('api/v1/eliminarusuario/:id', async (req, res) => { no funciona en esta version
// 	let id = req.params.id;
// 	let result = await pool.query('DELETE FROM users WHERE users_id=$1', [id]);
// 	res.json(result);
// });

export default router;