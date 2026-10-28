import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import "./Report.css";

const DEFAULT_CENTER = { lat: 28, lng: 84 };
const MAP_LIBRARIES = ["places", "marker"];
const MAP_ID = "DEMO_MAP_ID";

function Report() {
  // Keep the map libraries stable so the Maps script is not reloaded on render.
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES,
    version: "weekly",
  });

  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [position, setPosition] = useState(null);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const autocompleteContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Keep one marker in sync with the selected report position.
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    let cancelled = false;

    async function updateMarker() {
      const { AdvancedMarkerElement } =
        await window.google.maps.importLibrary("marker");

      if (cancelled || !mapRef.current) return;

      if (!position) {
        if (markerRef.current) {
          markerRef.current.map = null;
          markerRef.current = null;
        }
        return;
      }

      if (!markerRef.current) {
        markerRef.current = new AdvancedMarkerElement({
          map: mapRef.current,
          title: "Selected report location",
        });
      }

      markerRef.current.position = position;
      markerRef.current.map = mapRef.current;
    }

    updateMarker().catch((err) => {
      console.error("Marker initialization failed:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, position]);

  // Mount the Places autocomplete element and clean it up with the map.
  useEffect(() => {
    if (!isLoaded || !autocompleteContainerRef.current) return;

    let cancelled = false;
    let autocomplete = null;

    async function setupAutocomplete() {
      const { PlaceAutocompleteElement } =
        await window.google.maps.importLibrary("places");

      if (cancelled || !autocompleteContainerRef.current) return;

      autocomplete = new PlaceAutocompleteElement();
      autocomplete.placeholder = "Search for a location...";
      autocomplete.style.width = "100%";

      autocomplete.addEventListener("gmp-select", async (event) => {
        try {
          const place = event.placePrediction.toPlace();

          await place.fetchFields({
            fields: ["location", "formattedAddress", "displayName"],
          });

          if (!place.location) {
            setError("The selected place has no available coordinates.");
            return;
          }

          const selectedPosition = {
            lat: place.location.lat(),
            lng: place.location.lng(),
          };

          setPosition(selectedPosition);
          setError("");
          mapRef.current?.panTo(selectedPosition);
          mapRef.current?.setZoom(17);
        } catch (err) {
          console.error("Place search failed:", err);
          setError("Could not retrieve the selected location.");
        }
      });

      autocompleteContainerRef.current.replaceChildren(autocomplete);
    }

    setupAutocomplete().catch((err) => {
      console.error("Autocomplete initialization failed:", err);
      setError(
        "Location search could not load. Check your Google Places API configuration.",
      );
    });

    return () => {
      cancelled = true;
      autocomplete?.remove();
    };
  }, [isLoaded]);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;

    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }
  }, []);

  const handleMapClick = useCallback((event) => {
    if (!event.latLng) return;

    setPosition({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });

    setError("");
  }, []);

  const handleFindMyLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    setLocating(true);

    // Request the device location, then center the map on the result.
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const currentPosition = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        };

        setPosition(currentPosition);
        mapRef.current?.panTo(currentPosition);
        mapRef.current?.setZoom(17);
        setLocating(false);
      },
      (err) => {
        const messages = {
          1: "Location permission denied. Allow location access in your browser settings.",
          2: "Your location could not be determined. Check your device location settings.",
          3: "The location request timed out. Please try again.",
        };

        setError(messages[err.code] || "Could not retrieve your location.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setOutput(null);

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!position) {
      setError("Select a location before submitting your report.");
      return;
    }

    setLoading(true);

    try {
      // Send report details and the optional image as multipart form data.
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("latitude", String(position.lat));
      formData.append("longitude", String(position.lng));

      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post(
        "http://localhost:3000/api/reports/submit",
        formData,
      );

      setOutput(response.data);
    } catch (err) {
      console.error("Report submission failed:", err);

      setError(
        err.response?.data?.error ||
          "Could not submit the report. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="report-page">
      <div className="report-shell">
        <header className="report-heading">
          <span className="report-eyebrow">Report submission</span>
          <h1>Submit a report</h1>
          <p>
            Describe the problem, attach a photo if available, and select its
            location on the map.
          </p>
        </header>
        <form className="report-form" onSubmit={handleSubmit}>
          <div className="report-field">
            <label htmlFor="description">
              <span>01</span> Description
            </label>
            <textarea
              id="description"
              placeholder="Describe the incident..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </div>
          <div className="report-field">
            <label htmlFor="image">
              <span>02</span> Image <em>(optional)</em>
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="report-file-input"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </div>
          <div className="report-field">
            <label>
              <span>03</span> Location
            </label>
            <button
              type="button"
              onClick={handleFindMyLocation}
              disabled={locating || !isLoaded}
              className="report-location-button"
            >
              {locating
                ? "Finding your location..."
                : "Use my current location"}
            </button>
            <div className="report-map">
              {loadError && (
                <p className="report-error" role="alert">
                  Could not load Google Maps. Check your API key and Google
                  Cloud configuration.
                </p>
              )}
              {!isLoaded && !loadError && <p>Loading map...</p>}
              {isLoaded && (
                <>
                  <div className="report-map-search-wrap">
                    <div
                      ref={autocompleteContainerRef}
                      className="report-map-search-container"
                    />
                  </div>
                  <GoogleMap
                    mapContainerStyle={{ height: "100%", width: "100%" }}
                    center={position || DEFAULT_CENTER}
                    zoom={position ? 17 : 5}
                    onClick={handleMapClick}
                    onLoad={handleMapLoad}
                    onUnmount={handleMapUnmount}
                    options={{
                      mapId: MAP_ID,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                    }}
                  />
                </>
              )}
            </div>
            <p className="report-map-hint">
              {position
                ? "Location selected. Move the map pin or choose another place to update it."
                : "Search for a place, use your current location, or click the map."}
            </p>
          </div>
          <div className="report-form-footer">
            <span>Description and location are required.</span>
            <button
              type="submit"
              className="report-submit-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit report"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>
        {error && (
          <p className="report-error" role="alert">
            {error}
          </p>
        )}
        {output && (
          <section className="report-result" aria-live="polite">
            <div>
              <span className="report-result-label">Report submitted</span>
              <h2>Thanks, we received your report.</h2>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Report;
