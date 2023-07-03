"use client";

import { MapPin } from "lucide-react";
import ReactMapboxGl, { Marker } from "react-mapbox-gl";

const MapComponent = ReactMapboxGl({
  accessToken: process.env.NEXT_PUBLIC_MAP_API_KEY,
});

interface Props {
  coordinates: [number, number];
}

// TODO 추후 좀 더 자세히 알아보기
export default function Scene({ coordinates }: Props) {
  return (
    <MapComponent
      style="mapbox://styles/mapbox/streets-v9"
      className="w-96 h-96"
      center={coordinates}
      zoom={[14]}
    >
      {/* TODO 지도 관련해서 자세히 알아보고 버그 찾기 및 개선 */}
      {/* <Layer>
        <Feature coordinates={coordinates}></Feature>
      </Layer> */}
      <Marker coordinates={coordinates}>
        <MapPin color="white" fill="blue" cursor="pointer" />
      </Marker>
    </MapComponent>
  );
}
