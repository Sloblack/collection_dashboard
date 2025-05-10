export default function getPageTitle(menu) {
    const titles = {
      dashboard: 'Panel Principal',
      users: 'Gestión de Usuarios',
      containers: 'Gestión de Contenedores',
      routes: 'Gestión de Rutas',
      collections: 'Gestión de Recolecciones',
      collectionPoints: 'Puntos de Recolección'
    };
    
    return titles[menu] || 'Panel Principal';
  }