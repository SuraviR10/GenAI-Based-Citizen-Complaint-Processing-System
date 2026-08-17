import React, { useState } from 'react';
import { MapPin, Navigation, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export interface Step2LocationProps {
  area: string;
  onChangeArea: (value: string) => void;
  landmark: string;
  onChangeLandmark: (value: string) => void;
  address: string;
  onChangeAddress: (value: string) => void;
  latitude: number | null;
  longitude: number | null;
  onSetCoordinates: (lat: number, lng: number) => void;
  errors?: { area?: string; landmark?: string };
}

import { MYSORE_AREAS } from '../../lib/types';

const COMMON_AREAS = MYSORE_AREAS;

export const Step2Location: React.FC<Step2LocationProps> = ({
  area,
  onChangeArea,
  landmark,
  onChangeLandmark,
  address,
  onChangeAddress,
  latitude,
  longitude,
  onSetCoordinates,
  errors
}) => {
  const { t } = useLanguage();
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onSetCoordinates(lat, lng);
        setGeoLoading(false);
        setGeoMessage(`${t.step2GpsDetected} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        if (!area) {
          onChangeArea('Gokulam');
        }
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoMessage(t.locationPermissionPrompt);
        } else {
          setGeoMessage('Could not retrieve location. Please enter manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '4px' }}>
          {t.step2Title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {t.step2Subtitle}
        </p>
      </div>

      {/* Geolocation Button */}
      <div
        style={{
          padding: '12px 16px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} color="var(--color-accent-600)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-800)' }}>
            {t.step2GpsPrompt}
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRequestLocation}
          isLoading={geoLoading}
        >
          {latitude ? t.step2GpsDetected : t.step2GpsButton}
        </Button>
      </div>

      {geoMessage && (
        <div
          style={{
            fontSize: '0.8rem',
            color: latitude ? 'var(--color-success)' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {latitude ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{geoMessage}</span>
        </div>
      )}

      {/* Area / Ward input with suggestions */}
      <div>
        <Input
          label={t.step2AreaLabel}
          placeholder={t.step2AreaPlaceholder}
          value={area}
          onChange={(e) => onChangeArea(e.target.value)}
          error={errors?.area}
          isRequired
          leftIcon={<MapPin size={18} />}
        />
        {/* Quick Area Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
            Popular:
          </span>
          {COMMON_AREAS.slice(0, 6).map((commonArea) => (
            <button
              key={commonArea}
              type="button"
              onClick={() => onChangeArea(commonArea)}
              style={{
                background: area === commonArea ? 'var(--color-accent-100)' : 'var(--color-bg-subtle)',
                border: area === commonArea ? '1px solid var(--color-accent-500)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 8px',
                fontSize: '0.75rem',
                color: area === commonArea ? 'var(--color-accent-600)' : 'var(--color-text-secondary)',
                fontWeight: area === commonArea ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {commonArea}
            </button>
          ))}
        </div>
      </div>

      {/* Landmark Input */}
      <Input
        label={t.step2LandmarkLabel}
        placeholder={t.step2LandmarkPlaceholder}
        value={landmark}
        onChange={(e) => onChangeLandmark(e.target.value)}
        error={errors?.landmark}
        helperText={t.step2Subtitle}
      />

      {/* Optional Street Address */}
      <Input
        label={t.step2AddressLabel}
        placeholder={t.step2AddressPlaceholder}
        value={address}
        onChange={(e) => onChangeAddress(e.target.value)}
      />
    </div>
  );
};
