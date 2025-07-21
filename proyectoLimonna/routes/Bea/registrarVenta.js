const express= require('express')
const router = express.Router();
const path = require('path');


const { registrarVenta } = require('../../controllers/Bea/ventaController');

const { comprobarTurnoActivo } = require('../../controllers/Bea/turnoController');

router.get('/registrar', async (req, res) => {
  const DNI = req.session?.usuario?.DNI;
if (!DNI) return res.redirect('/login');


  const hayTurno = await comprobarTurnoActivo(DNI);
  if (!hayTurno) {
    return res.redirect('/turnos');
  }

  res.sendFile(path.join(__dirname, '../../public/registrarVenta.html'));
});


 router.post('/registrarVenta', registrarVenta);



module.exports = router;