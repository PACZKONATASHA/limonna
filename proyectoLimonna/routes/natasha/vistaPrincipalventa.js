
const express = require('express');
const router = express.Router();

app. get ( '/ventas' , (req, res) => { 
  res.render( '../public/vistaPrincipalventa.html' ); // Suponiendo que tienes un archivo "index.ejs" en el directorio "views"
 }); 


module.exports = router;
