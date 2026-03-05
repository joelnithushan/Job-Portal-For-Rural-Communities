import { useState, useEffect } from 'react';

export const useGeolocation = (options = {}) => {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setError(null);
                setLoading(false);
            },
            (error) => {
                setError(error.message);
                setLoading(false);
            },
            options
        );
    };

    return { coords, error, loading, getLocation };
};
