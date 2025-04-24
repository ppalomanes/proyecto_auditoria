const db = require('./config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const defaultPassword = 'Teco2025!';
const users = [
  { name: 'administrador', email: 'admin@example.com', role: 'admin' },
  { name: 'Pablo Palomanes', email: 'pjpalomanes@teco.com.ar', role: 'auditor_general' },
  { name: 'Jaime Ocampo', email: 'jaocampo@teco.com.ar', role: 'auditor_interno' },
  { name: 'Guillermo Jacob', email: 'gjjacob@teco.com.ar', role: 'auditor_interno' },
  { name: "Diego J D'Agostino", email: 'djdagostino@teco.com.ar', role: 'auditor_interno' },
  { name: 'Gustavo Lozua', email: 'sglozua@teco.com.ar', role: 'auditor_interno' },
  { name: 'Federico Borda', email: 'federico.borda@apexamerica.com', role: 'jefe_proveedor' },
  { name: 'Andres Frumento', email: 'andres.frumento@grupokonecta.com', role: 'jefe_proveedor' },
  { name: 'Paulo Jose De Simone', email: 'pdesimone@cat-technologies.com', role: 'jefe_proveedor' },
  { name: 'José Luís Vaca', email: 'JoseLuis.Vaca@teleperformance.com', role: 'tecnico_proveedor' },
  { name: 'Luis Horosuck', email: 'lhoroszczuk@activocc.com', role: 'jefe_proveedor' },
  { name: 'Eber Cuello', email: 'ecuello@activocc.com', role: 'tecnico_proveedor' },
  { name: 'Hernan Covarrubias', email: 'hernanj.covarrubias@apexamerica.com', role: 'tecnico_proveedor' },
  { name: 'Gustavo Paniagua', email: 'gustavogerman.paniagua@apexamerica.com', role: 'tecnico_proveedor' },
  { name: 'Mauro Galarza', email: 'Mauro.Galarza@apexamerica.com', role: 'tecnico_proveedor' },
  { name: 'Nahuel Monguzzi', email: 'nmonguzzi@cat-technologies.com', role: 'tecnico_proveedor' },
  { name: 'Marcos Bisio', email: 'marcos.bisio@konecta-group.com', role: 'tecnico_proveedor' },
  { name: 'Ariel Poniatyszyn', email: 'ariel.poniatyszyn@konecta-group.com', role: 'tecnico_proveedor' },
  { name: 'Hector Villalba', email: 'hector.villalba@teleperformance.com', role: 'tecnico_proveedor' },
  { name: 'Sergio Lepez', email: 'sergio.lepez@teleperformance.com.ar', role: 'tecnico_proveedor' },
  { name: 'Veronica Luna', email: 'Veronica.Lauraluna@teleperformance.com', role: 'jefe_proveedor' },
  { name: 'Dario Panico', email: 'dpanico@teco.com.ar', role: 'auditor_general' },
  { name: 'Julieta Cerdera', email: 'JCerdera@teco.com.ar', role: 'decisor' },
  { name: 'Agustina Varela', email: 'mavarela@teco.com.ar', role: 'decisor' },
  { name: 'Mariela Gialdi', email: 'MAGialdi@teco.com.ar', role: 'decisor' },
  { name: 'Victor Ojeda', email: 'VOjeda@teco.com.ar', role: 'decisor' },
  { name: 'Federico Martinez Lalis', email: 'fmlalis@teco.com.ar', role: 'decisor' },
  { name: 'Gabriel Falcioni', email: 'gfalcioni@teco.com.ar', role: 'decisor' },
  { name: 'Luciana Jalil', email: 'ljalil@teco.com.ar', role: 'decisor' },
  { name: 'Pablo S Laje', email: 'PSLaje@teco.com.ar', role: 'decisor' },
  { name: 'Natalia Morales', email: 'NAMoralesInvernizzi@teco.com.ar', role: 'decisor' },
  { name: 'Mariana Brandan', email: 'MBrandan@teco.com.ar', role: 'decisor' },
  { name: 'Carina Correa', email: 'CPGarciaCorrea@teco.com.ar', role: 'decisor' },
  { name: 'Paula Micheluzzi', email: 'PAMicheluzzi@teco.com.ar', role: 'decisor' },
  { name: 'Mariano J Torre', email: 'MJTorre@teco.com.ar', role: 'decisor' },
  { name: 'Sergio Alonso', email: 'salonso@teco.com.ar', role: 'decisor' }
];

(async () => {
  const hashed = await bcrypt.hash(defaultPassword, 10);

  for (let user of users) {
    const token = crypto.randomBytes(32).toString("hex");
    try {
      await db.query(
        "INSERT INTO users (name, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?)",
        [user.name, user.email, hashed, user.role, token]
      );
      console.log(`✅ Usuario insertado: ${user.email}`);
    } catch (err) {
      console.error(`❌ Error al insertar ${user.email}:`, err.message);
    }
  }

  process.exit();
})();
