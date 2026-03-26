/* ═══════════════════════════════════════════════════════════════
   SINGLE SOURCE OF TRUTH for product categories.
   Loaded via <script> in both index.html and admin.html before
   main.js / admin.js so CATEGORIES is available as a global.
   ═══════════════════════════════════════════════════════════════ */
var CATEGORIES = [
    { id: 'mesitas',      name: 'Mesitas de Luz',  icon: 'bed'            },
    { id: 'racks',        name: 'Racks TV',         icon: 'tv'             },
    { id: 'escritorios',  name: 'Escritorios',      icon: 'desk'           },
    { id: 'cocina',       name: 'Cocina',            icon: 'kitchen'        },
    { id: 'roperos',      name: 'Placards',          icon: 'door_sliding'   },
    { id: 'espejos',      name: 'Espejos',           icon: 'checkroom'      },
    { id: 'estanterias',  name: 'Estanterías',       icon: 'shelves'        },
    { id: 'vanitory',     name: 'Vanitorys',         icon: 'water_drop'     },
    { id: 'organizadores',name: 'Organizadores',     icon: 'view_agenda'    },
    { id: 'juegos',       name: 'Juegos',            icon: 'table_restaurant'},
];
