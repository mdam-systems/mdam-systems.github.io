/* ==========================================================
   MDAM Systems - Embudo de adquisicion de suscriptores
   ----------------------------------------------------------
   PROTOTIPO. Todo dato es simulado y toda llamada a la API
   esta marcada con [INTEGRACION]. Al conectar el backend,
   reemplaza el cuerpo de las funciones de MdamApi por
   llamadas reales; el resto del archivo no cambia.
   ========================================================== */
(function (window) {
  'use strict';

  /* ==========================================================
     1. CATALOGO DE PLANES  --  EDITAR AQUI
     ----------------------------------------------------------
     Espejo de la tabla MAE_PLAN. Los limites corresponden a
     MAX_EMPRESAS, MAX_SUCURSALES, MAX_USUARIOS, MAX_PERSONAL
     y MAX_SOCIOS. Cambia nombres, precios y limites sin tocar
     el HTML.

     [INTEGRACION] Sustituir por GET /api/planes
     ========================================================== */
  var PLANES = [
    {
      cod: 'ESE',
      nombre: 'Esencial',
      precio: 149,
      moneda: 'S/',
      periodicidad: 'mes',
      resumen: 'Para una sola sede que empieza a ordenar su control.',
      destacado: false,
      limites: {
        empresas: 1,
        sucursales: 1,
        usuarios: 3,
        personal: 50,
        socios: 150
      },
      incluye: [
        'Una vertical a elegir',
        'Marcación por QR y app móvil',
        'Reportes básicos exportables',
        'Soporte por correo'
      ],
      noIncluye: [
        'Integración con planillas',
        'API de integración'
      ]
    },
    {
      cod: 'PRO',
      nombre: 'Profesional',
      precio: 349,
      moneda: 'S/',
      periodicidad: 'mes',
      resumen: 'Para operaciones con varias sedes y turnos complejos.',
      destacado: true,
      limites: {
        empresas: 3,
        sucursales: 8,
        usuarios: 15,
        personal: 300,
        socios: 1000
      },
      incluye: [
        'Hasta dos verticales',
        'Marcación biométrica y tarjeta',
        'Reportes avanzados y tableros',
        'Integración con planillas',
        'Soporte prioritario'
      ],
      noIncluye: [
        'API de integración'
      ]
    },
    {
      cod: 'COR',
      nombre: 'Corporativo',
      precio: null,              // null = "A cotizar"
      moneda: 'S/',
      periodicidad: 'mes',
      resumen: 'Para grupos empresariales con requerimientos propios.',
      destacado: false,
      limites: {
        empresas: null,          // null = "Ilimitado"
        sucursales: null,
        usuarios: null,
        personal: null,
        socios: null
      },
      incluye: [
        'Todas las verticales',
        'API de integración',
        'Despliegue en servidor propio',
        'Desarrollos a medida',
        'Soporte dedicado'
      ],
      noIncluye: []
    }
  ];

  /* Verticales disponibles. Espejo de los modulos contratables.
     PENDIENTE DE ESQUEMA: hoy no existe tabla de modulos por
     suscriptor (ver IND_FIT en MAE_EMPRESAS). */
  var VERTICALES = [
    { cod: 'ATT', nombre: 'MDAM Attend', desc: 'Asistencia y tareo de personal', unidad: 'trabajadores', limite: 'personal' },
    { cod: 'LIV', nombre: 'MDAM Living', desc: 'Administración de condominios',  unidad: 'unidades',     limite: 'personal' },
    { cod: 'FIT', nombre: 'MDAM Fit',    desc: 'Gimnasios y centros deportivos', unidad: 'socios',       limite: 'socios'  }
  ];

  var PERIODOS = { mensual: 1, anual: 0.8 };   // anual = 20% de descuento
  var DIAS_PRUEBA = 15;

  /* ==========================================================
     2. CAPA DE API  --  REEMPLAZAR AL CONECTAR EL BACKEND
     ========================================================== */
  var MdamApi = {

    /* [INTEGRACION] GET /api/planes */
    listarPlanes: function () {
      return Promise.resolve(PLANES);
    },

    /* [INTEGRACION] GET /api/suscriptores/validar-ruc?ruc=...
       Debe verificar que el RUC no tenga ya un suscriptor activo. */
    validarRuc: function (ruc) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          var limpio = String(ruc || '').replace(/\D/g, '');
          if (limpio.length !== 11) {
            resolve({ valido: false, motivo: 'El RUC debe tener 11 dígitos.' });
          } else if (limpio === '20000000001') {
            resolve({ valido: false, motivo: 'Este RUC ya tiene una suscripción activa.' });
          } else {
            resolve({ valido: true, razonSocial: '' });
          }
        }, 400);
      });
    },

    /* [INTEGRACION] POST /api/suscriptores
       Aprovisionamiento real. En el backend esta llamada debe,
       dentro de una sola transaccion:
         1. INSERT MAE_SUSCRIPTOR  (COD_CLIENTE, COD_PLAN,
            FEC_INICIO, FEC_VENCIMIENTO)
         2. INSERT MAE_EMPRESAS    (empresa del RUC declarado)
         3. INSERT MAE_SUCURSAL    (sucursal principal)
         4. INSERT MAE_USUARIO     (admin + clave temporal)
         5. Registrar modulos contratados
         6. Enviar correo con las credenciales
       Devuelve el codigo de cliente generado. */
    registrarSuscriptor: function (datos) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve({
            ok: true,
            codCliente: generarCodigoCliente(datos.razonSocial),
            usuario: 'admin',
            vence: sumarDias(new Date(), DIAS_PRUEBA),
            mensaje: 'Suscriptor creado en modo prueba.'
          });
        }, 900);
      });
    },

    /* [INTEGRACION] POST /api/leads  (o endpoint de Formspree)
       Decidido: el sitio es estatico, los leads van por un
       servicio externo tipo Formspree. */
    enviarLead: function (datos) {
      return Promise.resolve({ ok: true });
    }
  };

  /* ==========================================================
     3. UTILIDADES
     ========================================================== */

  /* Codigo de cliente provisional. El definitivo lo genera el
     backend: aqui solo sirve para que el prototipo muestre algo
     con la forma correcta. */
  function generarCodigoCliente(razonSocial) {
    var base = String(razonSocial || 'MDAM')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 4)
      .padEnd(4, 'X');
    var n = Math.floor(Math.random() * 9000) + 1000;
    return base + '-' + n;
  }

  function sumarDias(fecha, dias) {
    var d = new Date(fecha.getTime());
    d.setDate(d.getDate() + dias);
    return d;
  }

  function formatearFecha(d) {
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function formatearLimite(valor) {
    return valor === null || valor === undefined ? 'Ilimitado' : valor.toLocaleString('es-PE');
  }

  function precioSegunPeriodo(plan, periodo) {
    if (plan.precio === null) return null;
    return Math.round(plan.precio * (PERIODOS[periodo] || 1));
  }

  /* Sugiere el plan mas pequeño que cubre el tamaño declarado */
  function sugerirPlan(cantidad, campoLimite) {
    var n = parseInt(cantidad, 10);
    if (!n || n < 1) return null;
    for (var i = 0; i < PLANES.length; i++) {
      var tope = PLANES[i].limites[campoLimite];
      if (tope === null || n <= tope) return PLANES[i];
    }
    return PLANES[PLANES.length - 1];
  }

  /* ==========================================================
     4. EXPORTACION
     ========================================================== */
  window.MDAM = {
    PLANES: PLANES,
    VERTICALES: VERTICALES,
    PERIODOS: PERIODOS,
    DIAS_PRUEBA: DIAS_PRUEBA,
    api: MdamApi,
    util: {
      generarCodigoCliente: generarCodigoCliente,
      sumarDias: sumarDias,
      formatearFecha: formatearFecha,
      formatearLimite: formatearLimite,
      precioSegunPeriodo: precioSegunPeriodo,
      sugerirPlan: sugerirPlan
    }
  };

})(window);
