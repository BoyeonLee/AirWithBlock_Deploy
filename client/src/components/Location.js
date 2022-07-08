/*global kakao*/
import { useEffect } from "react";

const Location = ({ basicAddr }) => {
  useEffect(() => {
    var container = document.getElementById("map");

    var geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(basicAddr, function (result, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        var marker = new window.kakao.maps.Marker({
          map: map,
          position: coords,
        });
        var options = {
          center: new kakao.maps.LatLng(result[0].y, result[0].x),
          level: 3,
        };
        var map = new kakao.maps.Map(container, options);

        marker.setMap(map);
      }
    });
  }, [basicAddr]);

  return (
    <div>
      <div id="map" style={{ width: "24vw", height: "34vh" }}></div>
    </div>
  );
};

export default Location;
