import React, { useEffect, useRef, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 19.766124583044522,
  lng: -97.24557469903733,
};

const parseLocation = (location) => {
  const [lat, lng] = location.split(' ').map(parseFloat);
  return { lat, lng };
};

// Necesitamos cargar las bibliotecas marker y advanced-markers
const libraries = ['marker', 'places'];

function ContainersMap({ containers }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyC0uhoLZk649N6IDans-HZnZgZ5mmpNa8k",
    libraries: libraries,
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (isLoaded && containers.length > 0) {
      // Inicializar el mapa solo cuando la API esté cargada
      initMap();
    }
    
    return () => {
      // Limpieza de marcadores cuando el componente se desmonta
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker) marker.map = null;
        });
        markersRef.current = [];
      }
    };
  }, [isLoaded, containers]);

  const initMap = () => {
    if (!mapRef.current) return;

    // Crear una nueva instancia del mapa
    const mapOptions = {
      center: center,
      zoom: 16,
      mapId: "21cb43ae6a21f04f"
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Crear bounds para ajustar el mapa a todos los marcadores
    const bounds = new window.google.maps.LatLngBounds();
    
    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => {
      if (marker) marker.map = null;
    });
    markersRef.current = [];

    // Añadir los marcadores avanzados
    containers.forEach((container) => {
      const position = parseLocation(container.ubicacion);
      bounds.extend(position);
      
      createAdvancedMarker(map, container, position);
    });

    // Ajustar el mapa para mostrar todos los marcadores
    map.fitBounds(bounds);
  };

  const createAdvancedMarker = (map, container, position) => {
    // Esperar a que el objeto AdvancedMarkerElement esté disponible
    if (window.google && window.google.maps && window.google.maps.marker) {
      const { AdvancedMarkerElement } = window.google.maps.marker;
      
      // Crear el elemento para el pin personalizado
      const pinElement = document.createElement('div');
      pinElement.className = 'custom-marker';
      pinElement.style.width = '20px';
      pinElement.style.height = '20px';
      pinElement.style.borderRadius = '50%';
      pinElement.style.backgroundColor = container.estadoRecoleccion ? '#4CAF50' : '#F44336';
      pinElement.style.border = '2px solid white';
      pinElement.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      pinElement.style.cursor = 'pointer';
      
      // Crear info window para mostrar al hacer clic
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div>
          <h3>Contenedor ID: ${container.contenedor_ID}</h3>
          <p>Estado: ${container.estadoRecoleccion ? 'Recolectado' : 'Pendiente'}</p>
        </div>`
      });
      
      // Crear el marcador avanzado
      const marker = new AdvancedMarkerElement({
        map,
        position,
        content: pinElement,
        title: `Contenedor ID: ${container.contenedor_ID}`
      });
      
      // Agregar evento de clic para mostrar info window
      marker.addListener('click', () => {
        infoWindow.close();
        infoWindow.open(map, marker);
      });
      
      // Guardar referencia al marcador para limpieza posterior
      markersRef.current.push(marker);
    }
  };

  return (
    <div>
      {isLoaded ? (
        <div ref={mapRef} style={containerStyle} />
      ) : (
        <div style={containerStyle}>Cargando mapa...</div>
      )}
    </div>
  );
}

export default React.memo(ContainersMap);
