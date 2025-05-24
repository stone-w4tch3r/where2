import { TileLayer } from "react-leaflet";

import { Marker, Popup } from "react-leaflet";

import { MapContainer } from "react-leaflet";

export const DevMap: React.FC<{ style?: React.CSSProperties }> = ({
  style,
}) => {
  const center: [number, number] = [56.838, 60.5975]; // Default: Yekaterinburg
  const zoom = 12;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={style}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};
