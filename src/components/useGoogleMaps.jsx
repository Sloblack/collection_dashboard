import { useState, useEffect } from 'react';

const API_KEY = 'AIzaSyC0uhoLZk649N6IDans-HZnZgZ5mmpNa8k';

function useGoogleMaps(mapElementId, initialConfig = {}) {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [error, setError] = useState(null);
  
  // Configuración por defecto del mapa
  const defaultConfig = {
    zoom: 12,
    center: { lat: 19.4326, lng: -99.1332 }, // México
    mapTypeId: 'roadmap',
    ...initialConfig
  };
  
  // Cargar la API de Google Maps
  useEffect(() => {
    // Si la API ya está cargada, no hacemos nada
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    
    // Verificar si ya existe un script para la API
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) return;
    
    // Función de callback para cuando la API esté cargada
    window.initGoogleMaps = () => {
      setGoogleMapsLoaded(true);
    };
    
    // Crear y agregar el script al documento
    try {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } catch (e) {
      setError('Error al cargar la API de Google Maps: ' + e.message);
    }
    
    // Limpiar
    return () => {
      window.initGoogleMaps = null;
    };
  }, []);
  
  // Inicializar el mapa cuando la API esté cargada
  useEffect(() => {
    if (!googleMapsLoaded || map) return;
    
    try {
      const mapElement = document.getElementById(mapElementId);
      if (!mapElement) {
        setError(`Elemento con ID "${mapElementId}" no encontrado`);
        return;
      }
      
      const newMap = new window.google.maps.Map(mapElement, defaultConfig);
      setMap(newMap);
    } catch (e) {
      setError('Error al inicializar el mapa: ' + e.message);
    }
  }, [googleMapsLoaded, mapElementId, defaultConfig, map]);
  
  // Función para añadir marcadores al mapa
  const addMarkers = (markersData) => {
    if (!map || !googleMapsLoaded) return;
    
    // Limpiar marcadores existentes
    markers.forEach(marker => marker.setMap(null));
    
    try {
      const newMarkers = markersData.map(data => {
        const marker = new window.google.maps.Marker({
          map,
          ...data
        });
        
        // Si hay contenido para un infoWindow, crearlo
        if (data.infoContent) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: data.infoContent
          });
          
          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
        
        return marker;
      });
      
      setMarkers(newMarkers);
      
      // Ajustar el mapa para mostrar todos los marcadores
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
      }
      
      return newMarkers;
    } catch (e) {
      setError('Error al añadir marcadores: ' + e.message);
      return [];
    }
  };
  
  // Función para ajustar el centro y zoom del mapa
  const panTo = (position, zoom) => {
    if (!map) return;
    
    try {
      map.panTo(position);
      if (zoom) map.setZoom(zoom);
    } catch (e) {
      setError('Error al mover el mapa: ' + e.message);
    }
  };
  
  return {
    map,
    markers,
    isLoaded: googleMapsLoaded,
    error,
    addMarkers,
    panTo
  };
}

export default useGoogleMaps;